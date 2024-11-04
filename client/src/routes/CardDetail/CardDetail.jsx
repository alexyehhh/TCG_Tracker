import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styles from './CardDetail.module.css';
import PokemonBackground from '../../components/PokemonBackground/PokemonBackground';
import TypeIcon from '../../components/TypeIcon/TypeIcon';
import {
	collection,
	deleteDoc,
	query,
	where,
	getDocs,
	getDoc,
	doc,
	setDoc,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../util/firebase';
import typeColors from '../../util/typeColors';
import { useCardCache, usePriceCache } from '../../util/cacheUtils';
import PageLayout from '../../components/PageLayout/PageLayout';

const CardDetail = () => {
	const { id } = useParams();
	const [card, setCard] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [pricePaid, setPricePaid] = useState('');
	const [collectionState, setCollectionState] = useState('neutral');
	const [userEmail, setUserEmail] = useState(null);
	const [currentCardType, setCurrentCardType] = useState('');
	const [user, setUser] = useState(null);
	const [cardPrices, setCardPrices] = useState({
		ungraded: null,
		psa8: null,
		psa9: null,
		psa10: null,
	});
	const [selectedGrade, setSelectedGrade] = useState('ungraded');
	const [profit, setProfit] = useState(null);
	const [isCalculating, setIsCalculating] = useState(false);
	const auth = getAuth();
	const navigate = useNavigate();
	const { getCachedData, setCachedData, getCacheMetadata } = useCardCache(id);

	const calculateProfit = async () => {
		if (!pricePaid || !cardPrices[selectedGrade]) {
			return;
		}

		setIsCalculating(true);
		try {
			const response = await axios.get(
				`${import.meta.env.VITE_API_URL}/card-profit`,
				{
					params: {
						salePrice: cardPrices[selectedGrade],
						pricePaid: parseFloat(pricePaid),
						gmeMembership: document.getElementById('gamestop-pro').checked,
					},
				}
			);

			setProfit(response.data.gmeProfit);
		} catch (error) {
			console.error('Error calculating profit:', error);
			setError('Failed to calculate profit');
		} finally {
			setIsCalculating(false);
		}
	};

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
						},
					}
				);
				setCard(response.data.data);

				if (response.data.data.types && response.data.data.types.length > 0) {
					setCurrentCardType(response.data.data.types[0]); // First type
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

	useEffect(() => {
		if (userEmail && card) {
			const checkCardInCollection = async () => {
				try {
					const userId = await getUserByEmail(userEmail);
					if (!userId) {
						throw new Error('User not found');
					}

					// check if the card exists in the user's collection
					const cardDocRef = doc(db, 'users', userId, 'cards', card.id);
					const cardSnapshot = await getDoc(cardDocRef);

					if (cardSnapshot.exists()) {
						setCollectionState('added');
					} else {
						setCollectionState('neutral');
					}
				} catch (error) {
					console.error('Error checking card in collection:', error);
				}
			};

			checkCardInCollection();
		}
	}, [userEmail, card]);

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

			setCollectionState('removed');
		} catch (error) {
			console.error('Error removing card from collection:', error);
			// throw error;
		}
	};

	const fetchPriceForGrade = async (cardName, grade) => {
		const { getCachedPrice, setCachedPrice } = usePriceCache(cardName, grade);

		// Check cache first
		const cachedPrice = getCachedPrice();
		if (cachedPrice !== null) {
			return cachedPrice;
		}

		try {
			const response = await axios.get(
				`${import.meta.env.VITE_API_URL}/card-prices`,
				{
					params: {
						name: cardName,
						grade: grade === 'ungraded' ? '' : grade,
					},
				}
			);
			const price = response.data.averagePrice;
			setCachedPrice(price);
			return price;
		} catch (error) {
			console.error(`Error fetching ${grade} price:`, error);
			return null;
		}
	};

	useEffect(() => {
		const fetchCardDetailAndPrices = async () => {
			try {
				// Check cache first
				const cachedCard = getCachedData();
				if (cachedCard) {
					setCard(cachedCard);
					if (cachedCard.types && cachedCard.types.length > 0) {
						setCurrentCardType(cachedCard.types[0]);
					}
				} else {
					// Fetch from API if not in cache
					const response = await axios.get(
						`https://api.pokemontcg.io/v2/cards/${id}`,
						{
							headers: {
								'X-Api-Key': import.meta.env.VITE_POKEMON_KEY,
							},
						}
					);
					setCard(response.data.data);
					setCachedData(response.data.data);

					if (response.data.data.types && response.data.data.types.length > 0) {
						setCurrentCardType(response.data.data.types[0]);
					}
				}

				// Fetch prices for all grades
				const cardName = cachedCard?.name || card?.name;
				if (cardName) {
					const prices = {
						ungraded: await fetchPriceForGrade(cardName, 'ungraded'),
						psa8: await fetchPriceForGrade(cardName, 'PSA 8'),
						psa9: await fetchPriceForGrade(cardName, 'PSA 9'),
						psa10: await fetchPriceForGrade(cardName, 'PSA 10'),
					};
					setCardPrices(prices);
				}
			} catch (err) {
				setError(`Failed to fetch card details. Error: ${err}`);
			} finally {
				setLoading(false);
			}
		};

		fetchCardDetailAndPrices();
	}, [id]);

	const renderGradeButtons = () => (
		<div className={styles.gradeButtons}>
			{['ungraded', 'psa8', 'psa9', 'psa10'].map((grade) => (
				<button
					key={grade}
					className={`${styles.gradeButton} ${
						selectedGrade === grade ? styles.selectedGrade : ''
					}`}
					onClick={() => setSelectedGrade(grade)}
					// If we want one button to be highlighted at a time
					style={{
						backgroundColor:
							selectedGrade === grade
								? typeColors[currentCardType]?.buttonColor || '#fb923c'
								: 'transparent',
						borderColor: typeColors[currentCardType]?.borderColor || '#f97316',
						color:
							selectedGrade === grade
								? 'white'
								: typeColors[currentCardType]?.buttonColor || '#fb923c',
					}}>
					{grade === 'ungraded' ? 'Ungraded' : `PSA ${grade.slice(3)}`}
					<div className={styles.price}>
						{cardPrices[grade] ? `$${cardPrices[grade]}` : 'Loading...'}
					</div>
				</button>
			))}
		</div>
	);

	if (loading) {
		return (
			<PageLayout>
				<h1 className={styles.centerContent}>Loading card details...</h1>
			</PageLayout>
		);
	}

	if (error) {
		return (
			<PageLayout>
				<div className={`${styles.centerContent} ${styles.errorMessage}`}>
					{error}
				</div>
			</PageLayout>
		);
	}

	if (!card) {
		return (
			<PageLayout>
				<div className={styles.container}>Card not found</div>
			</PageLayout>
		);
	}

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
							backgroundColor:
								typeColors[currentCardType]?.buttonColor || '#fb923c',
							borderColor:
								typeColors[currentCardType]?.borderColor || '#f97316',
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
						}>
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
							Market Prices:
						</h2>
						{renderGradeButtons()}
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
								onClick={calculateProfit}
								disabled={
									!pricePaid || !cardPrices[selectedGrade] || isCalculating
								}
								style={{
									backgroundColor:
										typeColors[currentCardType]?.buttonColor || '#fb923c',
									borderColor:
										typeColors[currentCardType]?.borderColor || '#f97316',
									opacity: !pricePaid || !cardPrices[selectedGrade] ? 0.5 : 1,
								}}>
								{isCalculating ? 'Calculating...' : 'Calculate profit'}
							</button>

							{profit !== null && (
								<div
									className={styles.profitResult}
									style={{ textAlign: 'right', marginTop: '10px' }}>
									<p
										style={{
											color: profit >= 0 ? '#22c55e' : '#ef4444',
											fontWeight: 'bold',
										}}>
										GameStop Grading Profit: ${profit.toFixed(2)}
									</p>
								</div>
							)}
							<p>PSA grading: [price]</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CardDetail;
