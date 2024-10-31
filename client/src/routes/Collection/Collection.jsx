import React, { useState, useEffect } from 'react';
import { db } from '../../util/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Link } from 'react-router-dom';
import styles from './Collection.module.css';
import PokemonBackground from '../../components/PokemonBackground/PokemonBackground';
import LoggedOutView from '../../components/LoggedOutView/LoggedOutView';
import magnifyingGlass from '../../assets/images/magnifyingGlass.png';
import cardSets from '../../util/cardSets.js';

const Collection = () => {
	const [user, setUser] = useState(null);
	const [cards, setCards] = useState([]);
	const auth = getAuth();
	const [hasCards, setHasCards] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');

	// Listen for user auth state changes
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setUser(user);
		});
		return () => unsubscribe();
	}, []);

	// Change input value of search
	const handleInputChange = (e) => {
		setSearchTerm(e.target.value);
	};

	// Handle search
	const handleSearchCollection = () => {
		if (searchTerm.trim() !== '') {
			console.log('Searching for:', searchTerm);
		}
	};

	// User presses Enter key to search
	const handleKeyDown = (event) => {
		if (event.key === 'Enter') {
			handleSearchCollection();
		}
	};

	// Fetch user by email from Firestore
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
			querySnapshot.forEach((doc) => {
				const cardData = doc.data();
				if (cardData.image) {
					cardsList.push(cardData);
				}
			});

			setCards(cardsList);
			setHasCards(cardsList.length > 0);
			return cardsList;
		} catch (error) {
			console.error('Error fetching cards:', error);
			throw error;
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

	const EmptyCollectionView = () => (
		<div className={styles.container} style={{ backgroundColor: '#fff4fc' }}>
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
						<Link to='/upload'>Upload</Link>
					</li>
				</ul>
			</nav>
			<div className={`${styles.mainContent} ${styles.emptyState}`}>
				<h1 className={styles.title}>Your Collection is Empty!</h1>
				<p className={styles.emptyMessage}>
					Looks like you haven't added any cards yet. Start building your
					collection by uploading your first card!
				</p>
				<Link to='/upload' className={styles.uploadButton}>
					Upload Your First Card
				</Link>
			</div>
		</div>
	);

	const LoggedInView = () =>
		hasCards ? (
			<div className={styles.container} style={{ backgroundColor: '#fff4fc' }}>
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
							<Link to='/upload'>Upload</Link>
						</li>
					</ul>
				</nav>
				<div className={styles.mainContent}>
					<h1 className={styles.title}>
						{user?.displayName || 'Your'}'s Collection
					</h1>

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
							<select className={styles.filterSelect}>
								<option value='Rarity'>Rarity</option>
								<option value='Amazing Rare'>Amazing Rare</option>
								<option value='Common'>Common</option>
								<option value='LEGEND'>LEGEND</option>
								<option value='Promo'>Promo</option>
								<option value='Rare'>Rare</option>
								<option value='Rare ACE'>Rare ACE</option>
								<option value='Rare BREAK'>Rare BREAK</option>
								<option value='Rare Holo'>Rare Holo</option>
								<option value='Rare Holo EX'>Rare Holo EX</option>
								<option value='Rare Holo GX'>Rare Holo GX</option>
								<option value='Rare Holo LV.X'>Rare Holo LV.X</option>
								<option value='Rare Holo Star'>Rare Holo Star</option>
								<option value='Rare Holo V'>Rare Holo V</option>
								<option value='Rare Holo VMAX'>Rare Holo VMAX</option>
								<option value='Rare Prime'>Rare Prime</option>
								<option value='Rare Prism Star'>Rare Prism Star</option>
								<option value='Rare Rainbow'>Rare Rainbow</option>
								<option value='Rare Secret'>Rare Secret</option>
								<option value='Rare Shining'>Rare Shining</option>
								<option value='Rare Shiny'>Rare Shiny</option>
								<option value='Rare Shiny GX'>Rare Shiny GX</option>
								<option value='Rare Ultra'>Rare Ultra</option>
								<option value='Uncommon'>Uncommon</option>
							</select>
							<select className={styles.filterSelect}>
								<option>Price</option>
								<option>$ 25</option>
								<option>$ 50</option>
								<option>$ 75</option>
								<option>$ 100</option>
								<option>$ 100</option>
								<option>$ 125</option>
								<option>$ 150</option>
								<option>$ 175</option>
								<option>$ 200</option>
							</select>
							<select className={styles.filterSelect}>
								<option>Type</option>
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
							<select className={styles.filterSelect}>
								{cardSets.map((set, index) => (
									<option key={index} value={set}>
										{set}
									</option>
								))}
							</select>
						</div>
					</div>

					<div className={styles.cardsGrid}>
						{cards.map((card, index) => (
							<img
								key={index}
								src={card.image}
								alt={`Pokemon Card - ${card.name || ''}`}
								className={styles.cardImage}
							/>
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
