import React, { useState, useEffect } from 'react';
import { db } from '../../util/firebase';
import {
	collection,
	query,
	where,
	getDocs,
	doc,
	updateDoc,
	deleteDoc,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import styles from './BulkGrading.module.css';
import PokemonBackground from '../../components/PokemonBackground/PokemonBackground';
import LoggedOutView from '../../components/LoggedOutView/LoggedOutView';
import magnifyingGlass from '../../assets/images/magnifyingGlass.png';
import NoBulkCardsView from '../../components/NoBulkCardsView/NoBulkCardsView';
import EmptyCollectionView from '../../components/EmptyCollectionView/EmptyCollectionView';
import axios from 'axios';
import { X } from 'lucide-react';

const BulkGrading = () => {
	// const [gradingCost, setGradingCost] = useState(0);
	const [gradingProfit, setGradingProfit] = useState(0);
	const [gradingCost, setGradingCost] = useState(0);
	const [user, setUser] = useState(null);
	const [cards, setCards] = useState([]);
	const [filteredCards, setFilteredCards] = useState([]);
	const auth = getAuth();
	const [hasCards, setHasCards] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [loading, setLoading] = useState(true);
	const [filters, setFilters] = useState({
		rarity: '', // rarity filter value
		price: '', // price range filter value
		type: '', // type filter value
		set: '', // set filter value
	});
	const [price, setPrice] = useState(0);
	const navigate = useNavigate();
	const [selectedCards, setSelectedCards] = useState(new Set()); // for tracking selected cards
	const [showRemoveConfirm, setShowRemoveConfirm] = useState(null); // Track which card is showing remove confirmation

	// Handle removing a single card
	const handleRemoveCard = async (cardId) => {
		try {
			if (!user || !user.email) {
				console.error('No user logged in');
				return;
			}

			const userData = await getUserByEmail(user.email);
			if (!userData) {
				console.error('User data not found');
				return;
			}

			const cardRef = doc(db, `users/${userData.id}/cards/${cardId}`);
			await deleteDoc(cardRef);

			// Update local state
			const updatedCards = cards.map((card) =>
				card.id === cardId ? { ...card, sendBulk: false } : card
			);
			setCards(updatedCards);
			setFilteredCards(updatedCards);
			setShowRemoveConfirm(null);
		} catch (error) {
			console.error('Error removing card:', error);
		}
	};

	const handleRemoveClick = (e, cardId) => {
		e.preventDefault(); // Prevent navigation
		if (showRemoveConfirm === cardId) {
			handleRemoveCard(cardId);
		} else {
			setShowRemoveConfirm(cardId);
		}
	};

	const handleMouseLeave = () => {
		setShowRemoveConfirm(null);
	};

	const handleBack = () => {
		navigate(-1);
	};

	const alphabeticalCards = cards.sort((a, b) => {
		return b.addedAt.toDate() - a.addedAt.toDate();
	});

	const calculateCosts = async () => {
		const selectedCards = filteredCards.filter((card) => card.sendBulk); // get selected cards
		if (selectedCards.length < 20) {
			// if less than 20 cards selected
			const confirmClear = window.confirm(
				'You need at least 20 cards to proceed.' // prompt user to select at least 20 cards
			);
			if (!confirmClear) {
				// if user cancels, return
				return;
			}
		} else {
			let total_profit = 0; // initialize total profit
			let total_cost = 0; // initialize total cost

			for (const card of selectedCards) {
				// loop through selected cards
				const response = await axios.get(
					// make request to server
					`${import.meta.env.VITE_API_URL}/card-profit`,
					{
						params: {
							salePrice: card.selectedPrice, // pass in selected price
							pricePaid: card.pricePaid, // pass in price paid
						},
					}
				);
				if (response.status === 200 && response.data) {
					// if response is successful
					total_cost += response.data.bulkGradingCost; // add cost to total
					total_profit += response.data.bulkGradingProfit; // add profit to total
				}
			}
			console.log(total_cost); // log total cost
			console.log(total_profit); // log total profit
			setGradingCost(total_cost.toFixed(2)); // set grading cost
			setGradingProfit(total_profit.toFixed(2)); // set grading profit
		}
	};

	// Listen for user auth state changes
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setUser(user);
		});
		return () => unsubscribe();
	}, []);

	// change input value of search as you type
	const handleInputChange = (e) => {
		const value = e.target.value;
		setSearchTerm(value);

		if (value.trim() !== '') {
			const searchFiltered = cards.filter((card) =>
				card.name.toLowerCase().includes(value.toLowerCase())
			);
			setFilteredCards(searchFiltered);
		} else {
			setFilteredCards(alphabeticalCards); // reset to full list if search term is empty
		}
	};

	// handle search
	const handleSearchCollection = () => {
		if (searchTerm.trim() !== '') {
			const searchFiltered = cards.filter((card) =>
				card.name.toLowerCase().includes(searchTerm.toLowerCase())
			);
			setFilteredCards(searchFiltered);
		} else {
			setFilteredCards(alphabeticalCards); // reset to full list if search term is empty
		}
	};

	// user presses Enter key to search
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

	// fetch user's cards from Firestore and set within state
	async function fetchUserCards(userId) {
		try {
			const cardsRef = collection(db, `users/${userId}/cards`);
			const querySnapshot = await getDocs(cardsRef);

			const cardsList = [];
			let totalValue = 0;
			querySnapshot.forEach((doc) => {
				const cardData = doc.data();
				if (cardData.image) {
					cardsList.push({ ...cardData, id: doc.id }); // add `id` from `doc.id`
				}
				// console.log(cardData);
				if (cardData.selectedPrice != 'N/A') {
					totalValue += parseFloat(cardData.selectedPrice);
				}
			});
			setPrice(totalValue.toFixed(2));
			setCards(cardsList);
			setCards(cardsList);
			setHasCards(cardsList.length > 0);
			return cardsList;
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

	// apply filters whenever filters change
	useEffect(() => {
		let filtered = [...alphabeticalCards];

		setFilteredCards(filtered); // update the list of displayed cards based on filters
	}, [filters, cards]);

	const clearAll = async () => {
		try {
			const confirmClear = window.confirm(
				'Are you sure you want to remove all cards from the bulk collection?'
			);
			if (!confirmClear) {
				// if the user cancels, abort
				return;
			}

			if (!user || !user.email) {
				console.error('No user logged in');
				return;
			}

			const userData = await getUserByEmail(user.email);
			if (!userData) {
				console.error('User data not found');
				return;
			}

			const updatePromises = cards.map(async (card) => {
				const cardRef = doc(db, `users/${userData.id}/cards/${card.id}`);
				return updateDoc(cardRef, { sendBulk: false });
			});

			await Promise.all(updatePromises);

			const updatedCards = cards.map((card) => ({
				...card,
				sendBulk: false,
			}));

			setCards(updatedCards);
			setFilteredCards(updatedCards);
			setSelectedCards(new Set());

			console.log('Successfully cleared all bulk selections');
		} catch (error) {
			console.error('Error clearing bulk selections:', error);
			throw error;
		}
	};

	// handles checkbox change -> keeps track of state of checkbox
	const handleCheckboxChange = (cardId) => {
		setSelectedCards((prevSelected) => {
			const updatedSelected = new Set(prevSelected);
			if (updatedSelected.has(cardId)) {
				updatedSelected.delete(cardId); // unselect if selected
			} else {
				updatedSelected.add(cardId); // select if not already selected
			}
			return updatedSelected;
		});
	};

	// Handle removing selected cards
	const handleRemoveSelected = async () => {
		try {
			if (!user || !user.email) {
				console.error('No user logged in');
				return;
			}

			const userData = await getUserByEmail(user.email);
			if (!userData) {
				console.error('User data not found');
				return;
			}

			const removePromises = [...selectedCards].map(async (cardId) => {
				const cardRef = doc(db, `users/${userData.id}/cards/${cardId}`);
				await updateDoc(cardRef, { sendBulk: false }); // updating Firestore
			});

			await Promise.all(removePromises);

			// filter out removed cards from the state
			const updatedCards = cards.filter((card) => !selectedCards.has(card.id));
			setCards(updatedCards);
			setFilteredCards(updatedCards);
			setSelectedCards(new Set()); // reset selected cards

			console.log('Selected cards removed successfully');
		} catch (error) {
			console.error('Error removing selected cards:', error);
		}
	};

	if (loading && user) {
		return (
			<div className={`${styles.container}`}>
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
					</ul>
					<div className={styles.navbarRight}></div>
				</nav>
				<h1 className={styles.centerContent}>Loading cards...</h1>;
			</div>
		);
	}

	const LoggedInView = () =>
		hasCards ? (
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
					</ul>
					<div className={styles.navbarRight}></div>
				</nav>
				<div className={styles.mainContent}>
					<h1 className={styles.title}>To Grade Collection</h1>

					<div className={styles.searchContainer}>
						<div className={styles.searchBar}>
							<input
								type='text'
								placeholder='Search your collection...'
								value={searchTerm}
								onChange={handleInputChange}
								onKeyDown={handleKeyDown}
								className={styles.searchInput}
								// autoFocus
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

						<div className={styles.gradeButtons}>
							<button
								className={styles.removeSelected}
								onClick={handleRemoveSelected}>
								Remove Selected
							</button>
							<button className={styles.clearAll} onClick={clearAll}>
								Clear All
							</button>
							<button
								className={styles.calculateCosts}
								onClick={calculateCosts}>
								Calculate
							</button>
							{/* <div className={styles.grading}>Grading cost: {gradingCost}</div> */}
							<div className={styles.grading}>
								Bulk Grading Cost: ${gradingCost}
							</div>
							<div className={styles.grading}>
								Bulk Grading Profit: ${gradingProfit}
							</div>
						</div>
					</div>

					<div className={styles.cardsGrid}>
						{filteredCards
							.filter((card) => card.sendBulk)
							.map((card) => (
								<div
									key={card.id}
									className={styles.cardContainer}
									onMouseLeave={handleMouseLeave}>
									<input
										type='checkbox'
										className={styles.cardCheckbox}
										id={`checkbox-${card.id}`}
										checked={selectedCards.has(card.id)}
										onChange={() => handleCheckboxChange(card.id)}
									/>
									<button
										onClick={(e) => handleRemoveClick(e, card.id)}
										className={`${styles.removeButton} ${
											showRemoveConfirm === card.id
												? styles.removeButtonConfirm
												: ''
										}`}
										aria-label='Remove card'>
										<X size={16} />
									</button>
									<Link
										key={card.id}
										to={`/card-detail/${card.id}`}
										style={{ textDecoration: 'none' }}
										onClick={(e) =>
											showRemoveConfirm === card.id && e.preventDefault()
										}>
										<img
											src={card.image || ''}
											alt={`Pokemon Card - ${card.name || 'Unknown'}`}
											className={styles.cardImage}
										/>
									</Link>
								</div>
							))}
					</div>
				</div>
				{filteredCards.filter((card) => card.sendBulk).length == 0 && (
					<NoBulkCardsView />
				)}
			</div>
		) : (
			<EmptyCollectionView />
		);

	return user ? <LoggedInView /> : <LoggedOutView />;
};

export default BulkGrading;
