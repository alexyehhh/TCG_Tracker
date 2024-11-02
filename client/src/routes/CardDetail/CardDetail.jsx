import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styles from './CardDetail.module.css';
import PokemonBackground from '../../components/PokemonBackground/PokemonBackground';
import TypeIcon from '../../components/TypeIcon/TypeIcon';
import {
	collection,
	addDoc,
	deleteDoc,
	query,
	where,
	getDocs,
	doc,
	setDoc,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../util/firebase';
import typeColors from '../../util/typeColors';

const CardDetail = () => {
	const { id } = useParams();
	const [card, setCard] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [pricePaid, setPricePaid] = useState('');
	const [collectionState, setCollectionState] = useState('neutral'); // collection state for'added', 'removed', 'neutral'
	const [userEmail, setUserEmail] = useState(null);
	const [currentCardType, setCurrentCardType] = useState('');
	const [user, setUser] = useState(null);
	const auth = getAuth();

	const navigate = useNavigate();

	const handleLogin = () => {
		navigate('/login');
	};

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setUser(user);
		});
		return () => unsubscribe();
	}, []);

	useEffect(() => {
		const auth = getAuth();
		onAuthStateChanged(auth, (user) => {
			if (user) {
				setUserEmail(user.email);
			} else {
				console.error('User is not logged in');
			}
		});
	}, []);

	useEffect(() => {
		const fetchCardDetail = async () => {
			try {
				const response = await axios.get(
					`https://api.pokemontcg.io/v2/cards/${id}`,
					{
						headers: {
							'X-Api-Key': import.meta.env.VITE_POKEMON_KEY,
							// 'User-Agent':
							// 	'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0',
						},
					}
				);
				setCard(response.data.data);

				if (response.data.data.types && response.data.data.types.length > 0) {
					setCurrentCardType(response.data.data.types[0]); // Just take the first type for simplicity
				}
			} catch (err) {
				setError(`Failed to fetch card details. Error: ${err}`);
			} finally {
				setLoading(false);
			}
		};

		fetchCardDetail();
	}, [id]);

	// Get user document ID by email
	const getUserByEmail = async (email) => {
		try {
			const usersRef = collection(db, 'users');
			const q = query(usersRef, where('email', '==', email));
			const querySnapshot = await getDocs(q);

			if (querySnapshot.empty) {
				console.error('No user found with this email');
				return null;
			}

			const userDoc = querySnapshot.docs[0];
			return userDoc.id;
		} catch (error) {
			console.error('Error fetching user:', error);
			throw error;
		}
	};

	// Add card to user's collection
	// use setDoc instead of addDoc so that we can specify the id
	// addDoc will generate a random id
	const addToCollection = async (userEmail, cardData) => {
		try {
			// First get the user's document ID
			const userId = await getUserByEmail(userEmail);

			if (!userId) {
				throw new Error('User not found');
			}

			// Prepare card data with required fields based on the API response structure
			const cardToAdd = {
				averageSellPrice: cardData.cardmarket?.prices?.averageSellPrice || 0,
				image: cardData.images.large,
				name: cardData.name,
				number: cardData.number,
				rarity: cardData.rarity,
				setId: cardData.set.id,
				setName: cardData.set.name,
				setPrintedTotal: cardData.set.printedTotal,
				setSeries: cardData.set.series,
				types: cardData.types || [],
				addedAt: new Date(),
				lastUpdated: new Date(),
			};

			// Use the card's `id` as the document ID instead of an auto-generated ID
			const cardDocRef = doc(db, 'users', userId, 'cards', cardData.id);

			// Set the document with the card data
			await setDoc(cardDocRef, cardToAdd);

			setCollectionState('added');
			// setIsAdded(true);

			// return {
			// 	success: true,
			// 	cardId: cardData.id,
			// 	message: 'Card added to collection successfully',
			// };
		} catch (error) {
			console.error('Error adding card to collection:', error);
			// throw error;
		}
	};

	const removeFromCollection = async (userEmail, cardData) => {
		try {
			// get the user's document ID first
			const userId = await getUserByEmail(userEmail);
			if (!userId) {
			throw new Error('User not found');
			}
		
			// reference specific card document in Firebase
			const cardDocRef = doc(db, 'users', userId, 'cards', cardData.id);
			
			// delete the card document
			await deleteDoc(cardDocRef);
		
			// update the state to show the card was removed
			// setIsRemoved(true);
			// setIsAdded(false);
			setCollectionState('removed');
		} catch (error) {
			console.error('Error removing card from collection:', error);
			// throw error;
		}
	};

	if (loading) {
		return (
			<div className={styles.container}>
				<PokemonBackground color='white' />
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
				<h1 className={styles.centerContent}>Loading card details...</h1>;
			</div>
		);
	}
	if (error) {
		return (
			<div className={styles.container}>
				<PokemonBackground color='white' />
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
				<div className={`${styles.centerContent} ${styles.errorMessage}`}>
					{error}
				</div>
			</div>
		);
	}
	if (!card)
		return (
			<div className={styles.container}>
				<PokemonBackground color='white' />
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
				<div className={styles.container}>Card not found</div>
			</div>
		);

	return (
		<div
			className={styles.container}
			style={{
				backgroundColor:
					typeColors[currentCardType]?.backgroundColor || '#fb923c',
			}}>
			<PokemonBackground color='white' />
			<nav
				className={styles.navbar}
				style={{
					backgroundColor:
						typeColors[currentCardType]?.backgroundColor || '#fb923c',
				}}>
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

			<h1
				className={styles.cardName}
				style={{
					color: typeColors[currentCardType]?.buttonColor || '#fb923c',
				}}>
				{card.name}
			</h1>
			<div className={styles.mainContent}>
				<div>
					<img
						src={card.images.large}
						alt={card.name}
						className={`${styles.cardImage} `}
					/>
					<button
					className={`${styles.actionButton} ${
						collectionState === 'added'
						? styles.removeButton
						: collectionState === 'removed'
						? styles.removedButton
						: styles.addButton
					}`}
					style={{
						backgroundColor: typeColors[currentCardType]?.buttonColor || '#fb923c',
						borderColor: typeColors[currentCardType]?.borderColor || '#f97316',
					}}
					onClick={
						user
						? () => {
							if (collectionState === 'added') {
								removeFromCollection(userEmail, card);
							} else {
								addToCollection(userEmail, card);
							}
							}
						: () => handleLogin()
					}
					>
					{collectionState === 'added'
						? 'Remove from collection'
						: collectionState === 'removed'
						? 'Add to collection'
						: user
						? 'Add to collection'
						: 'Log in to add to collection'}
					</button>
				</div>

				<div className={styles.cardDetails}>
					<div className={styles.section}>
						<h2 className={`${styles.sectionTitle} ${styles.prices}`}>
							Prices:
						</h2>
						<div className={styles.gradeButtons}>
							<button
								className={styles.gradeButton}
								style={{
									backgroundColor:
										typeColors[currentCardType]?.buttonColor || '#fb923c',
									borderColor:
										typeColors[currentCardType]?.borderColor || '#f97316',
								}}>
								Ungraded
							</button>
							<button
								className={styles.gradeButton}
								style={{
									backgroundColor:
										typeColors[currentCardType]?.buttonColor || '#fb923c',
									borderColor:
										typeColors[currentCardType]?.borderColor || '#f97316',
								}}>
								PSA 8
							</button>
							<button
								className={styles.gradeButton}
								style={{
									backgroundColor:
										typeColors[currentCardType]?.buttonColor || '#fb923c',
									borderColor:
										typeColors[currentCardType]?.borderColor || '#f97316',
								}}>
								PSA 9
							</button>
							<button
								className={styles.gradeButton}
								style={{
									backgroundColor:
										typeColors[currentCardType]?.buttonColor || '#fb923c',
									borderColor:
										typeColors[currentCardType]?.borderColor || '#f97316',
								}}>
								PSA 10
							</button>
						</div>
					</div>

					<div className={styles.sectionCustom}>
						<div>
							<h2 className={styles.sectionTitle}>Type:</h2>
						</div>
						<div className={styles.typeIcons}>
							{card.types?.map((type) => (
								<TypeIcon key={type} type={type} />
							))}
						</div>
						<div className={styles.typeContainer}>
							<button
								className={styles.actionButton}
								style={{
									backgroundColor:
										typeColors[currentCardType]?.buttonColor || '#fb923c',
									borderColor:
										typeColors[currentCardType]?.borderColor || '#f97316',
								}}>
								See cards with this type
							</button>
						</div>
					</div>

					<div className={styles.sectionCustom}>
						<h2 className={styles.sectionTitle}>Set:</h2>
						<span>{card.set.name}</span>
						<div className={styles.typeContainer}>
							<button
								className={styles.actionButton}
								style={{
									backgroundColor:
										typeColors[currentCardType]?.buttonColor || '#fb923c',
									borderColor:
										typeColors[currentCardType]?.borderColor || '#f97316',
								}}>
								See cards from this set
							</button>
						</div>
					</div>

					<div className={styles.priceProfit}>
						<div className={styles.sectionSpecial}>
							<input
								type='number'
								placeholder='Price paid for card'
								value={pricePaid}
								onChange={(e) => setPricePaid(e.target.value)}
								className={styles.priceInput}
							/>
							<div className={styles.checkboxGroup}>
								<div className={styles.checkboxContainer}>
									<input
										type='checkbox'
										id='psa-sub'
										className={styles.checkbox}
									/>
									<label htmlFor='psa-sub'>PSA Subscription</label>
								</div>
								<div className={styles.checkboxContainer}>
									<input
										type='checkbox'
										id='bulk-grading'
										className={styles.checkbox}
									/>
									<label htmlFor='bulk-grading'>Bulk Grading</label>
								</div>
								<div className={styles.checkboxContainer}>
									<input
										type='checkbox'
										id='gamestop-pro'
										className={styles.checkbox}
									/>
									<label htmlFor='gamestop-pro'>GameStop Pro</label>
								</div>
							</div>
						</div>

						<div className={styles.gradingPrices}>
							<button
								className={styles.actionButton}
								style={{
									backgroundColor:
										typeColors[currentCardType]?.buttonColor || '#fb923c',
									borderColor:
										typeColors[currentCardType]?.borderColor || '#f97316',
								}}>
								Calculate profit
							</button>
							<p className={styles.gamestop}>GameStop grading: [price]</p>
							<p>PSA grading: [price]</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CardDetail;
