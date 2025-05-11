import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Collection.module.css';

// Redux imports
import {
	fetchUserCollection,
	removeCardFromFirestore,
	updateCardInFirestore,
	clearCollection,
	selectAllCollectionCards,
	selectCollectionStatus,
	selectCollectionError,
	selectCollectionTotalValue,
	selectCollectionGraphData,
} from '../../features/collection/collectionSlice';
import { selectUser, selectIsLoggedIn } from '../../features/auth/authSlice';

// Component imports
import PokemonBackground from '../../components/PokemonBackground/PokemonBackground';
import CollectionCard from '../../components/CollectionCard/CollectionCard';
import LoggedOutView from '../../components/LoggedOutView/LoggedOutView';
import EmptyCollectionView from '../../components/EmptyCollectionView/EmptyCollectionView';
import PriceHistoryGraph from '../../components/Graphs/GraphComponent.jsx';

// Asset imports
import magnifyingGlass from '../../assets/images/magnifyingGlass.png';
import cardSets from '../../util/cardSets.js';
import cardRarities from '../../util/cardRarities.js';

const Collection = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	// Local UI state
	const [searchTerm, setSearchTerm] = useState('');
	const [currentFilters, setCurrentFilters] = useState({
		rarity: '',
		price: '',
		type: '',
		set: '',
	});
	const [showBulkEligibleOnly, setShowBulkEligibleOnly] = useState(false);
	const [selectedCardIdsForBulk, setSelectedCardIdsForBulk] = useState(
		new Set()
	);
	const [areAllBulkEligibleSelected, setAreAllBulkEligibleSelected] =
		useState(false);
	const [showGraph, setShowGraph] = useState(false);

	// Get data from Redux store
	const authUser = useSelector(selectUser);
	const isLoggedIn = useSelector(selectIsLoggedIn);
	const collectionCards = useSelector(selectAllCollectionCards);
	const collectionStatus = useSelector(selectCollectionStatus);
	const collectionError = useSelector(selectCollectionError);
	const totalCollectionValue = useSelector(selectCollectionTotalValue);
	const graphData = useSelector(selectCollectionGraphData);

	useEffect(() => {
		if (isLoggedIn && authUser?.uid) {
			if (collectionStatus === 'idle') {
				dispatch(fetchUserCollection(authUser.uid));
			}
		} else if (!isLoggedIn) {
			dispatch(clearCollection());
		}
	}, [isLoggedIn, authUser, collectionStatus, dispatch]);

	const handleCardClickForBulk = async (clickedCard) => {
		if (!authUser?.uid || !showBulkEligibleOnly) return;

		const newSelectedIds = new Set(selectedCardIdsForBulk);
		const isCurrentlySelected = newSelectedIds.has(clickedCard.id);
		const newSendBulkState = !clickedCard.sendBulk;

		if (isCurrentlySelected) {
			newSelectedIds.delete(clickedCard.id);
		} else {
			if (
				clickedCard.selectedPrice !== 'N/A' &&
				Number(clickedCard.selectedPrice) > 0 &&
				Number(clickedCard.selectedPrice) < 500 &&
				clickedCard.selectedGrade === 'ungraded'
			) {
				newSelectedIds.add(clickedCard.id);
			} else {
				console.warn(
					'Card not eligible for bulk selection or already handled by UI filter.'
				);
				return;
			}
		}

		setSelectedCardIdsForBulk(newSelectedIds);

		// Dispatch update to Firestore
		dispatch(
			updateCardInFirestore({
				userId: authUser.uid,
				cardId: clickedCard.id,
				updateData: { sendBulk: newSendBulkState },
			})
		);
	};

	const removeCard = async (cardIdToRemove) => {
		if (!authUser?.uid) return;
		dispatch(
			removeCardFromFirestore({
				userId: authUser.uid,
				cardId: cardIdToRemove,
			})
		);
		if (selectedCardIdsForBulk.has(cardIdToRemove)) {
			const newSelectedIds = new Set(selectedCardIdsForBulk);
			newSelectedIds.delete(cardIdToRemove);
			setSelectedCardIdsForBulk(newSelectedIds);
		}
	};

	// Memoized filtered cards
	const filteredAndSortedCards = useMemo(() => {
		let tempCards = [...collectionCards];

		if (showBulkEligibleOnly) {
			tempCards = tempCards.filter(
				(card) =>
					card.selectedPrice !== 'N/A' &&
					Number(card.selectedPrice) > 0 &&
					Number(card.selectedPrice) < 500 &&
					card.selectedGrade === 'ungraded'
			);
		}

		if (searchTerm.trim() !== '') {
			tempCards = tempCards.filter((card) =>
				card.name.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		if (currentFilters.rarity) {
			tempCards = tempCards.filter(
				(card) =>
					card.rarity &&
					card.rarity.toLowerCase() ===
						currentFilters.rarity.toLowerCase()
			);
		}
		if (currentFilters.price) {
			if (currentFilters.price === '500+') {
				tempCards = tempCards.filter(
					(card) => Number(card.selectedPrice) > 500
				);
			} else {
				const [minPrice, maxPrice] = currentFilters.price
					.split('-')
					.map(Number);
				tempCards = tempCards.filter((card) => {
					const cardPrice = Number(card.selectedPrice || 0);
					return cardPrice >= minPrice && cardPrice <= maxPrice;
				});
			}
		}
		if (currentFilters.type) {
			tempCards = tempCards.filter(
				(card) =>
					card.types &&
					card.types
						.map((type) => type.toLowerCase())
						.includes(currentFilters.type.toLowerCase())
			);
		}
		if (currentFilters.set) {
			tempCards = tempCards.filter(
				(card) =>
					card.setName &&
					card.setName.toLowerCase() ===
						currentFilters.set.toLowerCase()
			);
		}
		return tempCards;
	}, [collectionCards, searchTerm, currentFilters, showBulkEligibleOnly]);

	const handleInputChange = (e) => setSearchTerm(e.target.value);

	const handleFilterChange = (e) => {
		const { name, value } = e.target;
		setCurrentFilters((prev) => ({ ...prev, [name]: value }));
	};

	const toggleBulkEligibleView = () => {
		setShowBulkEligibleOnly((prev) => !prev);
		setSelectedCardIdsForBulk(new Set());
		setAreAllBulkEligibleSelected(false);
	};

	const handleSelectAllBulkEligible = async () => {
		if (!authUser?.uid || !showBulkEligibleOnly) return;

		const bulkEligibleOnScreen = filteredAndSortedCards;
		const newSelectionState = !areAllBulkEligibleSelected;
		const newSelectedIds = new Set();

		const updatePromises = [];

		if (newSelectionState) {
			bulkEligibleOnScreen.forEach((card) => newSelectedIds.add(card.id));
		}

		bulkEligibleOnScreen.forEach((card) => {
			if (card.sendBulk !== newSelectionState) {
				updatePromises.push(
					dispatch(
						updateCardInFirestore({
							userId: authUser.uid,
							cardId: card.id,
							updateData: { sendBulk: newSelectionState },
						})
					).unwrap()
				);
			}
		});

		try {
			await Promise.all(updatePromises);
			setSelectedCardIdsForBulk(newSelectedIds);
			setAreAllBulkEligibleSelected(newSelectionState);
		} catch (error) {
			console.error('Failed to update all cards for bulk:', error);
		}
	};

	const bulkSelectedCount = useMemo(() => {
		if (!showBulkEligibleOnly) return 0;
		return filteredAndSortedCards.filter((card) => card.sendBulk).length;
	}, [filteredAndSortedCards, showBulkEligibleOnly]);

	const totalEligibleCardsCount = useMemo(() => {
		if (!showBulkEligibleOnly) return collectionCards.length;
		return collectionCards.filter(
			(card) =>
				card.selectedPrice !== 'N/A' &&
				Number(card.selectedPrice) > 0 &&
				Number(card.selectedPrice) < 500 &&
				card.selectedGrade === 'ungraded'
		).length;
	}, [collectionCards, showBulkEligibleOnly]);

	const displayedValueString = useMemo(() => {
		let valueToDisplay = 0;
		if (showBulkEligibleOnly) {
			valueToDisplay = filteredAndSortedCards.reduce((total, card) => {
				return (
					total +
					(card.sendBulk &&
					card.selectedPrice &&
					card.selectedPrice !== 'N/A'
						? parseFloat(card.selectedPrice)
						: 0)
				);
			}, 0);
		} else {
			valueToDisplay = totalCollectionValue;
		}
		return parseFloat(valueToDisplay).toLocaleString('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
	}, [filteredAndSortedCards, showBulkEligibleOnly, totalCollectionValue]);

	if (!isLoggedIn) {
		return <LoggedOutView />;
	}

	if (collectionStatus === 'loading') {
		return (
			<div className={`${styles.container}`}>
				<PokemonBackground color='#2f213e' />
				<nav className={styles.navbar}>
					<ul className={styles.navLinks}>
						<li>
							<Link to='/'>Search</Link>
						</li>
						<li>
							<Link to='/collection'>Collection</Link>
						</li>
						<li>
							<Link to='/bulk-grading'>Bulk Grading</Link>
						</li>
						<li>
							<Link to='/upload'>Upload</Link>
						</li>
						<li>
							<Link to='/help'>Help</Link>
						</li>
					</ul>
				</nav>
				<h1 className={styles.centerContent}>
					Loading your collection...
				</h1>
			</div>
		);
	}

	if (collectionStatus === 'failed') {
		return (
			<div className={styles.centerContent}>
				Error loading collection: {collectionError}
			</div>
		);
	}

	if (
		collectionStatus === 'succeeded' &&
		collectionCards.length === 0 &&
		!searchTerm &&
		!Object.values(currentFilters).some((f) => f)
	) {
		return <EmptyCollectionView />;
	}

	return (
		<div
			className={styles.container}
			style={{ backgroundColor: '#fff4fc' }}>
			<PokemonBackground color='#2f213e' />
			<nav className={styles.navbar}>
				<div className={styles.navbarLeft}></div>
				<ul className={styles.navLinks}>
					<li>
						<Link to='/'>Search</Link>
					</li>
					<li>
						<Link to='/collection'>Collection</Link>
					</li>
					<li>
						<Link to='/bulk-grading'>Bulk Grading</Link>
					</li>
					<li>
						<Link to='/upload'>Upload</Link>
					</li>
					<li>
						<Link to='/help'>Help</Link>
					</li>
				</ul>
				<div className={styles.navbarRight}></div>
			</nav>
			<div className={styles.mainContent}>
				<h1 className={styles.title}>
					{authUser?.displayName || authUser?.email || 'Your'}'s
					Collection
				</h1>
				<div className={styles.topIndicators}>
					<div className={styles.priceValuation}>
						{showBulkEligibleOnly
							? 'Total Bulk Eligible: '
							: 'Total Cards: '}
						{totalEligibleCardsCount}
					</div>
					<div className={styles.priceValuation}>
						{showBulkEligibleOnly
							? 'Value of Selected for Bulk: '
							: 'Total Value: '}
						${displayedValueString}
					</div>

					{!showGraph && (
						<button
							onClick={toggleBulkEligibleView}
							className={styles.bulkButtons}>
							{showBulkEligibleOnly
								? 'Show All Cards'
								: 'Show Bulk Eligible Cards'}
						</button>
					)}

					{showBulkEligibleOnly && !showGraph && (
						<>
							<button
								onClick={handleSelectAllBulkEligible}
								className={styles.bulkButtons}>
								{areAllBulkEligibleSelected
									? 'Deselect All Displayed'
									: 'Select All Displayed'}
							</button>
							<div className={styles.priceValuation}>
								Selected for Bulk: {bulkSelectedCount}
							</div>
						</>
					)}
					{!showGraph && showBulkEligibleOnly && (
						<button
							onClick={() =>
								bulkSelectedCount >= 20 &&
								navigate('/bulk-grading')
							}
							className={styles.bulkButtons}
							disabled={bulkSelectedCount < 20}>
							Send Bulk ({bulkSelectedCount})
						</button>
					)}

					{!showBulkEligibleOnly && (
						<button
							onClick={() => setShowGraph((prev) => !prev)}
							className={`${styles.bulkButtons} ${
								showGraph
									? styles.toggleButtonActive
									: styles.toggleButtonInactive
							}`}>
							{showGraph ? 'Back to Collection' : 'View Graph'}
						</button>
					)}
				</div>
				<div className={styles.searchContainer}>
					<div className={styles.searchBar}>
						<input
							type='text'
							placeholder='Search your collection...'
							value={searchTerm}
							onChange={handleInputChange}
							className={styles.searchInput}
						/>
						<button className={styles.searchButton} disabled>
							{' '}
							<img
								src={magnifyingGlass}
								alt='Search'
								className={styles.magnifyingGlass}
							/>
						</button>
					</div>
					<div className={styles.filterContainer}>
						<select
							name='rarity'
							className={styles.filterSelect}
							value={currentFilters.rarity}
							onChange={handleFilterChange}>
							<option value=''>Rarity</option>
							{cardRarities.map((rarity, index) => (
								<option key={index} value={rarity}>
									{rarity}
								</option>
							))}
						</select>
						<select
							name='price'
							className={styles.filterSelect}
							value={currentFilters.price}
							onChange={handleFilterChange}>
							<option value=''>Price</option>
							<option value='0-25'>$ 0 - $ 25</option>
							<option value='25-50'>$ 25 - $ 50</option>
							<option value='50-75'>$ 50 - $ 75</option>
							<option value='75-100'>$ 75 - $ 100</option>
							<option value='100-125'>$ 100 - $ 125</option>
							<option value='125-150'>$ 125 - $ 150</option>
							<option value='150-175'>$ 150 - $ 175</option>
							<option value='175-200'>$ 175 - $ 200</option>
							<option value='200-250'>$ 200 - $ 250</option>
							<option value='250-300'>$ 250 - $ 300</option>
							<option value='300-350'>$ 300 - $ 350</option>
							<option value='350-400'>$ 350 - $ 400</option>
							<option value='400-450'>$ 400 - $ 450</option>
							<option value='450-500'>$ 450 - $ 500</option>
							<option value='500+'>$ 500+</option>
						</select>
						<select
							name='type'
							className={styles.filterSelect}
							value={currentFilters.type}
							onChange={handleFilterChange}>
							<option value=''>Type</option>
							<option value='Colorless'>Colorless</option>
							<option value='Darkness'>Darkness</option>
							<option value='Dragon'>Dragon</option>
							<option value='Fairy'>Fairy</option>
							<option value='Fighting'>Fighting</option>
							<option value='Fire'>Fire</option>
							<option value='Grass'>Grass</option>
							<option value='Lightning'>Lightning</option>
							<option value='Metal'>Metal</option>
							<option value='Psychic'>Psychic</option>
							<option value='Water'>Water</option>
						</select>
						<select
							name='set'
							className={styles.filterSelect}
							value={currentFilters.set}
							onChange={handleFilterChange}>
							<option value=''>Set</option>
							{cardSets.map((set, index) => (
								<option key={index} value={set}>
									{set}
								</option>
							))}
						</select>
					</div>
				</div>
				{showGraph ? (
					<div className={styles.graphPlaceholder}>
						{graphData.length > 0 ? (
							<PriceHistoryGraph data={graphData} />
						) : (
							<p>No price history data to display.</p>
						)}
					</div>
				) : (
					<div className={styles.cardsGrid}>
						{filteredAndSortedCards.map((card) => (
							<CollectionCard
								key={card.id}
								card={card}
								onClick={() => handleCardClickForBulk(card)}
								removeCard={removeCard}
								isSelected={
									!!card.sendBulk && showBulkEligibleOnly
								}
								showCheckbox={showBulkEligibleOnly}
							/>
						))}
						{filteredAndSortedCards.length === 0 &&
							collectionCards.length > 0 && (
								<p className={styles.centerContent}>
									No cards match your current filters or
									search term.
								</p>
							)}
					</div>
				)}
			</div>
		</div>
	);
};

export default Collection;
