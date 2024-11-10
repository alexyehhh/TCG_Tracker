import React, { useState, useEffect } from 'react';
import { db } from '../../util/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import styles from './BulkGrading.module.css';
import PokemonBackground from '../../components/PokemonBackground/PokemonBackground';
import CollectionCard from '../../components/CollectionCard/CollectionCard';
import LoggedOutView from '../../components/LoggedOutView/LoggedOutView';
import magnifyingGlass from '../../assets/images/magnifyingGlass.png';
import cardSets from '../../util/cardSets.js';
import cardRarities from '../../util/cardRarities.js';

const Collection = () => {
	const [gradingCost, setGradingCost] = useState(0);
	const [gradingProfit, setGradingProfit] = useState(0);
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

	const handleBack = () => {
		navigate(-1);
	};

	const alphabeticalCards = cards.sort((a, b) => {
		return b.addedAt.toDate() - a.addedAt.toDate();
	});

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

	// handle filter change
	const handleFilterChange = (e) => {
		const { name, value } = e.target;
		setFilters((prevFilters) => ({
			...prevFilters,
			[name]: value, // update the specific filter with the new value
		}));
	};

	// apply filters whenever filters change
	useEffect(() => {
		let filtered = [...alphabeticalCards];

		// filter by rarity
		if (filters.rarity) {
			filtered = filtered.filter(
				(card) =>
					card.rarity &&
					card.rarity.toLowerCase() === filters.rarity.toLowerCase()
			);
		}

		// filter by price range
		if (filters.price) {
			const [minPrice, maxPrice] = filters.price.split('-').map(Number);
			filtered = filtered.filter((card) => {
				const cardPrice = parseInt(card.price);
				return cardPrice >= minPrice && cardPrice <= maxPrice;
			});
		}

		//filter by type
		if (filters.type) {
			filtered = filtered.filter(
				(card) =>
					card.types &&
					card.types
						.map((type) => type.toLowerCase())
						.includes(filters.type.toLowerCase())
			);
		}

		//filter by set name
		if (filters.set) {
			// make sure the card setName matches the selected set exactly
			filtered = filtered.filter(
				(card) =>
					card.setName &&
					card.setName.toLowerCase() === filters.set.toLowerCase()
			);
		}

		setFilteredCards(filtered); // update the list of displayed cards based on filters
	}, [filters, cards]);

	if (loading && user) {
		return (
			<div className={`${styles.container}`}>
				<PokemonBackground color='#2f213e' />
				<nav className={styles.navbar}>
					<div className={styles.navbarLeft}>
						<button onClick={handleBack} className={styles.backButton}>
							<svg
								className={styles.backIcon}
								viewBox='0 0 1024 1024'
								version='1.1'
								xmlns='http://www.w3.org/2000/svg'>
								<path
									d='M853.333333 469.333333v85.333334H341.333333l234.666667 234.666666-60.586667 60.586667L177.493333 512l337.92-337.92L576 234.666667 341.333333 469.333333h512z'
									fill=''
								/>
							</svg>
							Back
						</button>
					</div>
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

	const EmptyCollectionView = () => (
		<div className={styles.container} style={{ backgroundColor: '#fff4fc' }}>
			<PokemonBackground color='#2f213e' />
			<nav className={styles.navbar}>
				<div className={styles.navbarLeft}>
					<button onClick={handleBack} className={styles.backButton}>
						<svg
							className={styles.backIcon}
							viewBox='0 0 1024 1024'
							version='1.1'
							xmlns='http://www.w3.org/2000/svg'>
							<path
								d='M853.333333 469.333333v85.333334H341.333333l234.666667 234.666666-60.586667 60.586667L177.493333 512l337.92-337.92L576 234.666667 341.333333 469.333333h512z'
								fill=''
							/>
						</svg>
						Back
					</button>
				</div>
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
			<div className={`${styles.mainContent} ${styles.emptyState}`}>
				<h1 className={styles.title}>Your Collection is Empty!</h1>
				<p className={styles.emptyMessage}>
					Looks like you haven't added any cards yet. Start building your
					collection by uploading your first card!
				</p>
				<div className={styles.notloggedInBtns}>
					<Link to='/' className={styles.uploadButton}>
						Search a Card
					</Link>
					<Link to='/upload' className={styles.uploadButton}>
						Upload Your First Card
					</Link>
				</div>
			</div>
		</div>
	);

	const LoggedInView = () =>
		hasCards ? (
			<div className={styles.container} style={{ backgroundColor: '#fff4fc' }}>
				<PokemonBackground color='#2f213e' />
				<nav className={styles.navbar}>
					<div className={styles.navbarLeft}>
						<button onClick={handleBack} className={styles.backButton}>
							<svg
								className={styles.backIcon}
								viewBox='0 0 1024 1024'
								version='1.1'
								xmlns='http://www.w3.org/2000/svg'>
								<path
									d='M853.333333 469.333333v85.333334H341.333333l234.666667 234.666666-60.586667 60.586667L177.493333 512l337.92-337.92L576 234.666667 341.333333 469.333333h512z'
									fill=''
								/>
							</svg>
							Add more cards
						</button>
					</div>
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
								autoFocus
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
							<div className={styles.priceValuation}>Remove Selected</div>
							<div className={styles.priceValuation}>Clear Selected</div>
							<div className={styles.priceValuation}>Calculate</div>
							<div className={styles.grading}>Grading cost: {gradingCost}</div>
							<div className={styles.grading}>
								Grading profit: {gradingProfit}
							</div>
						</div>
					</div>

					<div className={styles.cardsGrid}>
						{filteredCards
							.filter((card) => card.sendBulk)
							.map((card) => (
								<Link
									key={card.id}
									to={`/card-detail/${card.id}`}
									style={{ textDecoration: 'none' }}>
									<img
										src={card.image || ''}
										alt={`Pokemon Card - ${card.name || 'Unknown'}`}
										className={styles.cardImage}
									/>
								</Link>
							))}
					</div>
				</div>
			</div>
		) : (
			<EmptyCollectionView />
		);

	return user ? <LoggedInView /> : <LoggedOutView />;
};

export default Collection;
