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
import cardSets from '../../util/cardSets.js'; // list of card sets for filtering
import cardRarities from '../../util/cardRarities.js';
// import { getCachedPrice, setCachedPrice } from '../../util/cacheUtils.js'; // Should use getCachedPrice too
import { setCachedPrice } from '../../util/cacheUtils.js';
import PriceHistoryGraph from '../../components/Graphs/GraphComponent.jsx';

const Collection = () => {
	const navigate = useNavigate();
	const [user, setUser] = useState(null);
	const [cards, setCards] = useState([]);
	const [filteredCards, setFilteredCards] = useState([]); // Cards filtered by search or filters
	const auth = getAuth();
	const [hasCards, setHasCards] = useState(false);
	const [searchTerm, setSearchTerm] = useState(''); // Search term for filtering cards
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
	const [allSelected, setAllSelected] = useState(false); // New state to track "Select All"
	const [showGraph, setShowGraph] = useState(false); // State for showing the graph, set to false
	const [graphData, setGraphData] = useState([]);

	// sort cards by date added so newest first
	const alphabeticalCards = cards.sort((a, b) => {
		return b.addedAt.toDate() - a.addedAt.toDate();
	});

	// Function to handle card click
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

	// Function to toggle between showing the graph and the card collection
	const toggleGraphView = () => {
		setShowGraph((prev) => !prev);
	};

	// function to toggle between showing all cards and only bulk eligible cards
	const toggleBulkEligible = () => {
		setShowBulkEligible((prev) => !prev);

		if (!showBulkEligible) {
			// filter to show only bulk-eligible cards
			const bulkEligibleCards = cards.filter(
				(card) =>
					card.selectedPrice !== 'N/A' &&
					Number(card.selectedPrice) > 0 &&
					Number(card.selectedPrice) < 500 &&
					card.selectedGrade === 'ungraded'
			);
			setFilteredCards(bulkEligibleCards);
		} else {
			// reset to show all cards
			setFilteredCards(cards);
		}
	};

	// Function to send bulk grading
	const sendBulk = () => {
		if (showBulkEligible) {
			navigate('/bulk-grading'); // navigate to the bulk grading page if eligible
		} else {
			console.warn(
				'Send Bulk is disabled unless you are viewing eligible cards.'
			);
		}
	};

	const handleNext = () => {
		navigate('/bulk-grading');
	};

	// listen for user auth state changes
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setUser(user);
		});
		return () => unsubscribe();
	}, []);

	// handle search input change and update filtered cards in real-time
	const handleInputChange = (e) => {
		const value = e.target.value;
		setSearchTerm(value); // update the search term state

		const sourceCards = showBulkEligible
			? cards.filter(
					(card) =>
						card.selectedPrice !== 'N/A' &&
						Number(card.selectedPrice) > 0 &&
						Number(card.selectedPrice) < 500 &&
						card.selectedGrade === 'ungraded'
			  )
			: cards;

		if (value.trim() !== '') {
			 // filter cards matching the search term
			const searchFiltered = sourceCards.filter((card) =>
				card.name.toLowerCase().includes(value.toLowerCase())
			);
			setFilteredCards(searchFiltered);
		} else {
			setFilteredCards(sourceCards);  // reset to all cards
		}
	};

	// handle search functionality
	const handleSearchCollection = () => {
	// If "showBulkEligible" is true, filter cards to include only those that meet bulk-eligibility criteria:
	const sourceCards = showBulkEligible
		? cards.filter(
			(card) =>
			card.selectedPrice !== 'N/A' && // exclude cards with no price
			Number(card.selectedPrice) > 0 && // include cards with a price greater than 0
			Number(card.selectedPrice) < 500 && // include cards with a price less than 500
			card.selectedGrade === 'ungraded' // include only ungraded cards
		)
		: cards; // if not showing bulk-eligible cards then use the entire card collection

	// filter the cards from the selected source based on the search term
	const searchFiltered = sourceCards.filter((card) =>
		// check if the card name includes the search term
		card.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	// update the state with the filtered list of cards
	// this will make the UI to display only the cards that match the search criteria
	setFilteredCards(searchFiltered);
	};

	// trigger search when the user presses Enter in the search input
	const handleKeyDown = (event) => {
		if (event.key === 'Enter') {
			handleSearchCollection();
		}
	};

	// get user by email from Firestore
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

	// Fetch user's cards from Firestore and set within state
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
							totalPricesByDate[date] =
								(totalPricesByDate[date] || 0) + numericPrice;
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

	// Fetch prices for a card
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

	// Handles refresh for graphData
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
					totalPricesByDate[date] =
						(totalPricesByDate[date] || 0) + numericPrice;
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

	// handle changes to filter inputs and applies filters to cards
	const handleFilterChange = (e) => {
		const { name, value } = e.target; // get filter name and value
		setFilters((prevFilters) => ({
		...prevFilters,
		[name]: value, // update the relevant filter value
		}));
	};

	// Function to remove a card from the collection
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

	// Function to handle bulk select/deselect
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

	// filter cards based on the selected filters whenever filters or the card list change
	useEffect(() => {
		// start with a copy of the sorted cards in alphabetical order
		let filtered = [...alphabeticalCards]; 
	
		// apply the rarity filter if a rarity is selected
		if (filters.rarity) {
		filtered = filtered.filter(
			(card) =>
			card.rarity && //make surethe card has a rarity field
			card.rarity.toLowerCase() === filters.rarity.toLowerCase() // check if the card's rarity matches the selected rarity
		);
		}
	
		// apply the price range filter if a price range is selected
		if (filters.price) {
		if (filters.price === '500+') {
			// special case for prices above 500
			filtered = filtered.filter((card) => Number(card.selectedPrice) > 500); // include only cards with prices greater than 500
		} else {
			// handle cases for specific price ranges
			const [minPrice, maxPrice] = filters.price.split('-').map(Number); // split the price range into minimum and maximum values
			filtered = filtered.filter((card) => {
			const cardPrice = Number(card.selectedPrice || 0); // parse the card's price
			return cardPrice >= minPrice && cardPrice <= maxPrice; // include cards within the selected price range
			});
		}
		}
	
		// apply the type filter if a type is selected
		if (filters.type) {
		filtered = filtered.filter(
			(card) =>
			card.types && // ensure the card has a types field
			card.types
				.map((type) => type.toLowerCase()) // convert all types to lowercase for comparison
				.includes(filters.type.toLowerCase()) // check if the card's types include the selected type
		);
		}
	
		// apply the set filter if a set name is selected
		if (filters.set) {
		filtered = filtered.filter(
			(card) =>
			card.setName && //ensure the card has a setName field
			card.setName.toLowerCase() === filters.set.toLowerCase() // check if the card's set name matches the selected set name
		);
		}
	
		// update the filtered cards state which will be used to render the card list in the UI
		setFilteredCards(filtered); 
	}, [filters, cards]); // run this effect whenever the filters or the cards array changes

	// If user is not logged in, show the logged out view
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

	// If user is logged in, show the logged in view
	const LoggedInView = () => {
		// Calculate the total card count dynamically based on the `showBulkEligible` state
		const totalCardCount = useMemo(() => {
			return showBulkEligible
				? cards.filter(
						(card) =>
							card.selectedPrice !== 'N/A' &&
							Number(card.selectedPrice) > 0 &&
							Number(card.selectedPrice) < 500 &&
							card.selectedGrade === 'ungraded'
				  ).length
				: cards.length;
		}, [cards, showBulkEligible]);

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
						{/* Updated Counter for Card Count */}
						<div className={styles.priceValuation}>
							{showBulkEligible
								? 'Total Cards Bulk Eligible: '
								: 'Total Cards: '}
							{totalCardCount}
						</div>

						<div className={styles.priceValuation}>
							{showBulkEligible
								? 'Total Value of Selected Cards: '
								: 'Total Value: '}
							${displayedValue}
						</div>

						{!showGraph && (
							<button
								onClick={toggleBulkEligible}
								className={styles.bulkButtons}
								// disabled={showGraph}
							>
								{showBulkEligible
									? 'Show All Cards'
									: 'Show Bulk Eligible Cards'}
							</button>
						)}

						{showBulkEligible && !showGraph && (
							<>
								<button
									onClick={handleSelectAll}
									className={styles.bulkButtons}
									// disabled={showGraph}
								>
									{allSelected ? 'Deselect All' : 'Select All'}
								</button>
								<div className={styles.priceValuation}>
									Selected for Bulk: {bulkSelectedCount}
								</div>
							</>
						)}
						{!showGraph && (
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
						)}

						{!showBulkEligible && (
							<button
								onClick={toggleGraphView}
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
