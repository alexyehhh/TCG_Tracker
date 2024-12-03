import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../util/firebase';
import axios from 'axios';
import {
	collection,
	query,
	where,
	getDocs,
	doc,
	updateDoc,
	deleteDoc,
	getDoc,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Collection.module.css';
import PokemonBackground from '../../components/PokemonBackground/PokemonBackground';
import CollectionCard from '../../components/CollectionCard/CollectionCard';
import LoggedOutView from '../../components/LoggedOutView/LoggedOutView';
import EmptyCollectionView from '../../components/EmptyCollectionView/EmptyCollectionView';
import magnifyingGlass from '../../assets/images/magnifyingGlass.png';
import cardSets from '../../util/cardSets.js';
import cardRarities from '../../util/cardRarities.js';
import { getCachedPrice, setCachedPrice } from '../../util/cacheUtils.js';
import PriceHistoryGraph from '../../components/Graphs/GraphComponent.jsx';

const Collection = () => {
	const navigate = useNavigate();
	const [user, setUser] = useState(null);
	const [cards, setCards] = useState([]);
	const [filteredCards, setFilteredCards] = useState([]);
	const [prices, setPrices] = useState([]);
	const auth = getAuth();
	const [hasCards, setHasCards] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [loading, setLoading] = useState(true);
	const [selectedCards, setSelectedCards] = useState(new Set());
	const [filters, setFilters] = useState({
		rarity: '', // rarity filter value
		price: '', // price range filter value
		type: '', // type filter value
		set: '', // set filter value
	});
	const [showBulkEligible, setShowBulkEligible] = useState(false);
	const [selectedCardCount, setSelectedCardCount] = useState(0);
	const [price, setPrice] = useState(0);
	const [bulkSelectedCount, setBulkSelectedCount] = useState(0); // New state for counter
	const [displayedValue, setDisplayedValue] = useState(price);
	const [allSelected, setAllSelected] = useState(false); // New state to track "Select All"
	const [showGraph, setShowGraph] = useState(false); // State for showing the graph, set to false
	const [graphData, setGraphData] = useState([]);

	const alphabeticalCards = cards.sort((a, b) => {
		return b.addedAt.toDate() - a.addedAt.toDate();
	});

	const handleCardClick = async (card) => {
		try {
			const userData = await getUserByEmail(user.email);
			if (!userData) return;

			const cardRef = doc(db, `users/${userData.id}/cards/${card.id}`);
			const newSelected = new Set(selectedCards);
			const newSendBulk = !card.sendBulk;

			if (selectedCards.has(card.id)) {
				newSelected.delete(card.id);
			} else {
				newSelected.add(card.id);
			}

			// Update Firestore
			await updateDoc(cardRef, { sendBulk: newSendBulk });

			// Update local state
			setSelectedCards(newSelected);
			setSelectedCardCount(newSelected.size);

			// Recalculate displayed value for bulk-eligible cards if active
			if (showBulkEligible) {
				const bulkEligibleCount = filteredCards.filter((card) =>
					newSelected.has(card.id)
				).length;
				setBulkSelectedCount(bulkEligibleCount);
			}
		} catch (error) {
			console.error('Error updating card selection:', error);
		}
	};

	const toggleGraphView = () => {
		setShowGraph((prev) => !prev);
	};

	// Function to toggle between showing all cards and only bulk eligible cards
	const toggleBulkEligible = () => {
		setShowBulkEligible((prev) => !prev);

		if (!showBulkEligible) {
			// Filter to show only bulk-eligible cards
			const bulkEligibleCards = cards.filter(
				(card) =>
					card.selectedPrice !== 'N/A' &&
					Number(card.selectedPrice) > 0 &&
					Number(card.selectedPrice) < 500 &&
					card.selectedGrade === 'ungraded'
			);

			setFilteredCards(bulkEligibleCards);

			// Update bulk-selected count
			const bulkEligibleCount = bulkEligibleCards.filter((card) =>
				selectedCards.has(card.id)
			).length;
			setBulkSelectedCount(bulkEligibleCount);

			// Update displayed value
			const bulkValue = bulkEligibleCards.reduce(
				(total, card) =>
					selectedCards.has(card.id)
						? total + Number(card.selectedPrice)
						: total,
				0
			);

			setDisplayedValue(bulkValue.toFixed(2));
		} else {
			// Reset to show all cards
			setFilteredCards(cards);
			setBulkSelectedCount(0);
			setDisplayedValue(price);
		}
	};

	const sendBulk = () => {
		if (showBulkEligible) {
			navigate('/bulk-grading'); // Navigate to the bulk grading page if eligible
		} else {
			console.warn(
				'Send Bulk is disabled unless you are viewing eligible cards.'
			);
		}
	};

	const handleNext = () => {
		navigate('/bulk-grading');
	};

	// Listen for user auth state changes
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setUser(user);
		});
		return () => unsubscribe();
	}, []);

	// Change input value of search as you type
	const handleInputChange = (e) => {
		const value = e.target.value;
		setSearchTerm(value);

		if (value.trim() !== '') {
			const searchFiltered = cards.filter((card) =>
				card.name.toLowerCase().includes(value.toLowerCase())
			);
			setFilteredCards(searchFiltered);
		} else {
			setFilteredCards(alphabeticalCards); // Reset to full list if search term is empty
		}
	};

	// Handle search
	const handleSearchCollection = () => {
		const searchFiltered = cards.filter((card) =>
			card.name.toLowerCase().includes(searchTerm.toLowerCase())
		);

		const finalFiltered = showBulkEligible
			? searchFiltered.filter(
					(card) =>
						card.selectedPrice !== 'N/A' &&
						Number(card.selectedPrice) > 0 &&
						Number(card.selectedPrice) < 500 &&
						card.selectedGrade === 'ungraded'
			  )
			: searchFiltered;

		setFilteredCards(finalFiltered);
	};

	// User presses Enter key to search
	const handleKeyDown = (event) => {
		if (event.key === 'Enter') {
			handleSearchCollection();
		}
	};

	// Get user by email from Firestore
	async function getUserByEmail(email) {
		try {
			const usersRef = collection(db, 'users');
			const q = query(usersRef, where('email', '==', email));
			const querySnapshot = await getDocs(q);

			if (querySnapshot.empty) {
				console.log('No user found with this email');
				return null;
			}

			const userDoc = querySnapshot.docs[0];
			return {
				id: userDoc.id,
				...userDoc.data(),
			};
		} catch (error) {
			console.error('Error fetching user by email:', error);
			throw error;
		}
	}

	const fetchPrices = async (card) => {
		if (!card?.name) return;

		// const cachedPrices = getCachedPrice(card.id, card.setPrintedTotal);
		// if (cachedPrices) {
		// 	setLoading(false);
		// 	if (typeof cachedPrices === 'object') {
		// 		return cachedPrices[card.selectedGrade];
		// 	}
		// 	return cachedPrices;
		// }

		async function updatePriceHistory(cardId, price) {
			console.log('Updating price history for card', cardId);
			try {
				const currentDate = new Date().toISOString().slice(0, 10);

				const userDoc = await getUserByEmail(user.email);

				if (userDoc) {
					const cardDocRef = doc(db, 'users', userDoc.id, 'cards', cardId);
					const cardDoc = await getDoc(cardDocRef);

					await updateDoc(cardDocRef, {
						priceHistory: [
							{ [currentDate]: price },
							...(cardDoc.get('priceHistory') || []),
						],
					});
				}
			} catch (error) {
				console.log('Error updating price history', error);
			}
		}

		const fetchPriceForGrade = async (grade) => {
			try {
				const response = await axios.get(
					`${import.meta.env.VITE_API_URL}/card-prices`,
					{
						params: {
							name: card.name,
							number: card.number,
							total: card.setPrintedTotal,
							grade: grade === 'ungraded' ? '' : grade,
							set: card.setName,
						},
					}
				);
				setCachedPrice(
					card.id,
					card.setPrintedTotal,
					response.data.averagePrice
				);
				updatePriceHistory(card.id, response.data.averagePrice);
				return response.data.averagePrice;
			} catch (error) {
				console.error(`Error fetching ${grade} price:`, error);
				return null;
			}
		};

		try {
			const pricing = await fetchPriceForGrade(card.selectedGrade);
			return pricing;
		} catch (error) {
			console.error('Error fetching prices:', error);
		}
	};

	// fetch user's cards from Firestore and set within state
	async function fetchUserCards(userId) {
		try {
			const cardsRef = collection(db, `users/${userId}/cards`);
			const querySnapshot = await getDocs(cardsRef);

			const cardsList = [];
			// const priceList = [];
			const totalPricesByDate = {};
			let totalValue = 0;
			// const selectedCardIds = new Set();

			for (const doc of querySnapshot.docs) {
				const cardData = doc.data();
				if (cardData.image) {
					const card = { ...cardData, id: doc.id };
					cardsList.push(card);

					// add to totalValue if selectedPrice exists
					if (cardData.selectedPrice != 'N/A') {
						totalValue += parseFloat(cardData.selectedPrice);
					}

					// processing priceHistory:
					const priceHistory = card.priceHistory || [];
					for (const entry of priceHistory) {
						const [date, price] = Object.entries(entry)[0];
						const numericPrice = parseFloat(price);
						if (!isNaN(numericPrice)) {
							totalPricesByDate[date] = (totalPricesByDate[date] || 0) + numericPrice;
						}
					}

					// Wait for the result of fetchPrices
					// const res = await fetchPrices(card);
					// priceList.push(res);
				}
			}
			setPrice(totalValue.toFixed(2));

			// Convert totalsByDate into a sorted array of objects and calculate cumulative totals
			const sortedEntries = Object.entries(totalPricesByDate).sort(
				([dateA], [dateB]) => new Date(dateA) - new Date(dateB)
			);

			let cumulativeTotal = 0;
			const graphDataArray = sortedEntries.map(([date, dailyTotal]) => {
				cumulativeTotal += dailyTotal;
				return { date, total: cumulativeTotal }; // uses cumulative total
			});

			setGraphData(graphDataArray); // Update state for graph data
			setCards(cardsList);
			setFilteredCards(cardsList);
			setHasCards(cardsList.length > 0);

		} catch (error) {
			console.error('Error fetching cards:', error);
			throw error;
		} finally {
			setLoading(false);
		}
	}
	useEffect(() => {
		const loadUserCards = async () => {
			try {
				if (user && user.email) {
					const userData = await getUserByEmail(user.email);
					if (userData) {
						await fetchUserCards(userData.id);
					}
				}
			} catch (error) {
				console.error('Error loading user cards:', error);
			}
		};

		loadUserCards();
	}, [user]);

	// Hanldes refresh for graphData
	useEffect(() => {
		// recalculate graph data based on the updated cards array
		const totalPricesByDate = {};
	
		// Iterate through cards and aggregate total prices by date
		cards.forEach((card) => {
			const priceHistory = card.priceHistory || [];
			priceHistory.forEach((entry) => {
				const [date, price] = Object.entries(entry)[0];
				const numericPrice = parseFloat(price);
				if (!isNaN(numericPrice)) {
					totalPricesByDate[date] = (totalPricesByDate[date] || 0) + numericPrice;
				}
			});
		});
	
		// Convert totalsByDate into a sorted array of objects and calculate cumulative totals
		const sortedEntries = Object.entries(totalPricesByDate).sort(
			([dateA], [dateB]) => new Date(dateA) - new Date(dateB)
		);

		let cumulativeTotal = 0;
		const graphDataArray = sortedEntries.map(([date, dailyTotal]) => {
			cumulativeTotal += dailyTotal;
			return { date, total: cumulativeTotal };
		});

			
		// Update the graphData state
		setGraphData(graphDataArray);
	}, [cards]);

	// Handle filter change
	const handleFilterChange = (e) => {
		const { name, value } = e.target;
		setFilters((prevFilters) => ({
			...prevFilters,
			[name]: value, // Update the specific filter with the new value
		}));
	};

	const removeCard = async (cardId) => {
		console.log('cardId of card being removed: ', cardId);
		try {
			const userDoc = await getUserByEmail(user.email);
			if (!userDoc) {
				throw new Error('User not found');
			}
			const cardDocRef = doc(db, 'users', userDoc.id, 'cards', cardId);
			await deleteDoc(cardDocRef);

			const updatedCards = cards.filter((card) => card.id !== cardId);
			setCards(updatedCards);

			const updatedFilteredCards = showBulkEligible
				? updatedCards.filter(
						(card) =>
							card.selectedPrice !== 'N/A' &&
							Number(card.selectedPrice) > 0 &&
							Number(card.selectedPrice) < 500 &&
							card.selectedGrade === 'ungraded'
				  )
				: updatedCards;

			setFilteredCards(updatedFilteredCards);

			// Recalculate the total value of the collection
			const updatedTotalValue = updatedCards.reduce((total, card) => {
				return (
					total +
					(card.selectedPrice !== 'N/A' ? parseFloat(card.selectedPrice) : 0)
				);
			}, 0);
			setPrice(updatedTotalValue.toFixed(2));
		} catch (error) {
			console.error('Error removing card:', error);
		}
	};

	const handleSelectAll = async () => {
		try {
			const bulkEligibleCards = filteredCards.filter(
				(card) =>
					card.selectedPrice !== 'N/A' &&
					Number(card.selectedPrice) > 0 &&
					Number(card.selectedPrice) < 500 &&
					card.selectedGrade === 'ungraded'
			);

			if (!allSelected) {
				// Select all bulk-eligible cards
				const newSelectedCards = new Set(
					bulkEligibleCards.map((card) => card.id)
				);
				setSelectedCards(newSelectedCards);
				setSelectedCardCount(newSelectedCards.size);
				setBulkSelectedCount(bulkEligibleCards.length);

				// Update Firestore for each eligible card
				const userData = await getUserByEmail(user.email);
				if (!userData) return;

				const updatePromises = bulkEligibleCards.map((card) => {
					const cardRef = doc(db, `users/${userData.id}/cards/${card.id}`);
					return updateDoc(cardRef, { sendBulk: true });
				});

				await Promise.all(updatePromises);

				// Update bulk-selected counter
				// setBulkSelectedCount(newSelectedCards.size);
			} else {
				// Deselect all bulk-eligible cards
				const remainingSelectedCards = new Set(
					Array.from(selectedCards).filter(
						(id) => !bulkEligibleCards.map((card) => card.id).includes(id)
					)
				);
				setSelectedCards(remainingSelectedCards);
				setSelectedCardCount(remainingSelectedCards.size);
				setBulkSelectedCount(0);

				// Update Firestore to unselect cards
				const userData = await getUserByEmail(user.email);
				if (!userData) return;

				const updatePromises = bulkEligibleCards.map((card) => {
					const cardRef = doc(db, `users/${userData.id}/cards/${card.id}`);
					return updateDoc(cardRef, { sendBulk: false });
				});

				await Promise.all(updatePromises);

				// Reset bulk-selected counter
				// setBulkSelectedCount(0);
			}

			setAllSelected(!allSelected); // Toggle state
		} catch (error) {
			console.error('Error selecting all cards:', error);
		}
	};

	// Apply filters whenever filters change
	useEffect(() => {
		let filtered = [...alphabeticalCards];

		// Filter by rarity
		if (filters.rarity) {
			filtered = filtered.filter(
				(card) =>
					card.rarity &&
					card.rarity.toLowerCase() === filters.rarity.toLowerCase()
			);
		}

		// Filter by price range
		if (filters.price) {
			if (filters.price === '500+') {
				// Handle case for prices above 500
				filtered = filtered.filter((card) => Number(card.selectedPrice) > 500);
			} else {
				// Handle price ranges
				const [minPrice, maxPrice] = filters.price.split('-').map(Number);
				filtered = filtered.filter((card) => {
					const cardPrice = Number(card.selectedPrice || 0);
					return cardPrice >= minPrice && cardPrice <= maxPrice;
				});
			}
		}

		// Filter by type
		if (filters.type) {
			filtered = filtered.filter(
				(card) =>
					card.types &&
					card.types
						.map((type) => type.toLowerCase())
						.includes(filters.type.toLowerCase())
			);
		}

		// Filter by set name
		if (filters.set) {
			// Make sure the card setName matches the selected set exactly
			filtered = filtered.filter(
				(card) =>
					card.setName &&
					card.setName.toLowerCase() === filters.set.toLowerCase()
			);
		}

		setFilteredCards(filtered); // Update the list of displayed cards based on filters
	}, [filters, cards]);

	if (loading && user) {
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
				<h1 className={styles.centerContent}>Loading cards...</h1>;
			</div>
		);
	}

	const LoggedInView = () => {
		const displayedValue = useMemo(() => {
			const rawValue = showBulkEligible
				? Array.from(selectedCards).reduce((total, cardId) => {
					  const card = cards.find(
						  (c) => c.id === cardId && c.selectedPrice !== 'N/A'
					  );
					  return total + (card ? parseFloat(card.selectedPrice) : 0);
				  }, 0)
				: price;
	
			// Format the price with commas
			return parseFloat(rawValue).toLocaleString('en-US', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			});
		}, [selectedCards, cards, showBulkEligible, price]);
	
		return hasCards ? (
			<div className={styles.container} style={{ backgroundColor: '#fff4fc' }}>
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
						{user?.displayName || 'Your'}'s Collection
					</h1>
					<div className={styles.topIndicators}>
						{/* New Counter for Card Count */}
						<div className={styles.priceValuation}>
							Total Cards: {cards.length}
						</div>
	
						<div className={styles.priceValuation}>
							{showBulkEligible
								? 'Total Value of Selected Cards: '
								: 'Total Value: '}
							${displayedValue}
						</div>
	
						<button
							onClick={toggleBulkEligible}
							className={styles.bulkButtons}
							disabled={showGraph}>
							{showBulkEligible ? 'Show All Cards' : 'Show Bulk Eligible Cards'}
						</button>
	
						{showBulkEligible && (
							<>
								<button
									onClick={handleSelectAll}
									className={styles.bulkButtons}
									disabled={showGraph}>
									{allSelected ? 'Deselect All' : 'Select All'}
								</button>
								<div className={styles.priceValuation}>
									Selected for Bulk: {bulkSelectedCount}
								</div>
							</>
						)}
						<button
							onClick={
								showBulkEligible && selectedCardCount >= 20 ? sendBulk : null
							}
							className={styles.bulkButtons}
							disabled={
								!showBulkEligible || selectedCardCount < 20 || showGraph
							}>
							Send Bulk
						</button>
	
						<button
							onClick={toggleGraphView}
							className={`${styles.bulkButtons} ${
								showGraph
									? styles.toggleButtonActive
									: styles.toggleButtonInactive
							}`}>
							{showGraph ? 'Back to Collection' : 'View Graph'}
						</button>
					</div>	
					<div className={styles.searchContainer}>
						<div className={styles.searchBar}>
							<input
								type='text'
								placeholder='Search your collection...'
								value={searchTerm}
								onChange={handleInputChange}
								onKeyDown={handleKeyDown}
								className={styles.searchInput}
							/>
							<button
								onClick={handleSearchCollection}
								className={styles.searchButton}>
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
								value={filters.rarity}
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
								value={filters.price}
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
								value={filters.type}
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
								value={filters.set}
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
							{/* <h2>Collection Value Over Time</h2> */}
							<PriceHistoryGraph data={graphData} />
						</div>
					) : (
						<div className={styles.cardsGrid}>
							{filteredCards.map((card) => (
								<CollectionCard
									key={card.id}
									card={card}
									onClick={handleCardClick}
									removeCard={removeCard}
									isSelected={selectedCards.has(card.id)}
									showCheckbox={showBulkEligible}
									setBulkSelectedCount={setBulkSelectedCount}
								/>
							))}
						</div>
					)}
				</div>
			</div>
		) : (
			<EmptyCollectionView />
		);
	};

	return user ? <LoggedInView /> : <LoggedOutView />;
};

export default Collection;
