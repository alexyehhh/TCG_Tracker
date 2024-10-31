import React, { useState, useEffect } from 'react';
import { auth, googleProvider, db } from '../../util/firebase';
import {
	getFirestore,
	doc,
	setDoc,
	collection,
	query,
	where,
	getDocs,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate, Link, useFetcher } from 'react-router-dom';
import styles from './Collection.module.css';
import PokemonBackground from '../../components/PokemonBackground/PokemonBackground';
import LoggedOutView from '../../components/LoggedOutView/LoggedOutView';
import magnifyingGlass from '../../assets/images/magnifyingGlass.png';
import charizardex151 from '../../assets/images/charizardex151.png';
import celebiFusion from '../../assets/images/celebiFusion.png';
import lugiaSilverT from '../../assets/images/lugiaSilverT.png';
import moonbreon from '../../assets/images/moonbreon.jpg';
import venuEX151 from '../../assets/images/venuEX151.png';

const Collection = () => {
	const [user, setUser] = useState(null);
	const auth = getAuth();
	const [hasCards, setHasCards] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setUser(user);
		});
		return () => unsubscribe();
	}, []);

	const handleInputChange = (e) => {
		setSearchTerm(e.target.value);
	};

	const handleSearch = () => {
		if (searchTerm.trim() !== '') {
			// navigate(`/pokemon-cards?name=${encodeURIComponent(searchTerm)}`);
			console.log('Searching for:', searchTerm);
		}
	};

	const handleKeyDown = (event) => {
		if (event.key === 'Enter') {
			handleSearch();
		}
	};

	// Get the user by email for their specific doc
	async function getUserByEmail(email) {
		try {
			const usersRef = collection(db, 'users');
			console.log('usersRef:', usersRef);

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

	// search a user's subcollection by userId for the cards subcollection
	async function checkUserCollectionByEmail(email, collectionName) {
		try {
			const user = await getUserByEmail(email);

			if (!user) {
				console.log('User not found');
				return false;
			}

			const subCollectionRef = collection(
				db,
				`users/${user.id}/${collectionName}`
			);
			const querySnapshot = await getDocs(subCollectionRef);

			if (!querySnapshot.empty) {
				setHasCards(true);
				return true;
			} else {
				setHasCards(false);
				return false;
			}
		} catch (error) {
			console.error('Error checking collection:', error);
			throw error;
		}
	}

	useEffect(() => {
		const checkUser = async () => {
			try {
				if (user && user.email) {
					console.log('Current User Email:', user.email);
					await checkUserCollectionByEmail(user.email, 'cards');
				}
			} catch (error) {
				console.error('Error checking user collection:', error);
			}
		};

		checkUser();
	}, [user]);

	const LoggedInView = () => (
		<div
			className={styles.container}
			style={{
				backgroundColor: '#fff4fc',
			}}>
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
						<button onClick={handleSearch} className={styles.searchButton}>
							<img
								src={magnifyingGlass}
								alt='Search'
								className={styles.magnifyingGlass}
							/>
						</button>
					</div>

					<div className={styles.filterContainer}>
						<select className={styles.filterSelect}>
							<option>Name</option>
						</select>
						<select className={styles.filterSelect}>
							<option>Rarity</option>
						</select>
						<select className={styles.filterSelect}>
							<option>Price</option>
						</select>
						<select className={styles.filterSelect}>
							<option>Recent</option>
						</select>
						<select className={styles.filterSelect}>
							<option>Type</option>
						</select>
						<select className={styles.filterSelect}>
							<option>Set</option>
						</select>
					</div>
				</div>

				<div className={styles.cardsGrid}>
					<img
						src={venuEX151}
						alt='Pokemon Card'
						className={styles.cardImage}
					/>
					<img
						src={lugiaSilverT}
						alt='Pokemon Card'
						className={styles.cardImage}
					/>
					<img
						src={charizardex151}
						alt='Pokemon Card'
						className={styles.cardImage}
					/>
					<img
						src={moonbreon}
						alt='Pokemon Card'
						className={styles.cardImage}
					/>
					<img
						src={celebiFusion}
						alt='Pokemon Card'
						className={styles.cardImage}
					/>
					<img
						src={venuEX151}
						alt='Pokemon Card'
						className={styles.cardImage}
					/>
					<img
						src={lugiaSilverT}
						alt='Pokemon Card'
						className={styles.cardImage}
					/>
					<img
						src={charizardex151}
						alt='Pokemon Card'
						className={styles.cardImage}
					/>
					<img
						src={moonbreon}
						alt='Pokemon Card'
						className={styles.cardImage}
					/>
				</div>
			</div>
		</div>
	);

	return user ? <LoggedInView /> : <LoggedOutView />;
};

export default Collection;
