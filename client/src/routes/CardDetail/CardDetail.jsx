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
import { useCardCache } from '../../util/cacheUtils';
import PageLayout from '../../components/PageLayout/PageLayout';
import { usePriceCache } from '../../util/cacheUtils';
import { formatter } from '../../util/cardUtils';

const CardDetail = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const auth = getAuth();
	const { getCachedData, setCachedData } = useCardCache(id);

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
	const [selectedGrade, setSelectedGrade] = useState('');
	const [profit, setProfit] = useState(null);
	const [PSA, setPSA] = useState(null);
	const [isCalculating, setIsCalculating] = useState(false);

	// Auth effect
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setUser(user);
			if (user) {
				setUserEmail(user.email);
			}
		});
		return () => unsubscribe();
	}, [auth]);

	// Card fetching effect
	useEffect(() => {
		const fetchCardDetail = async () => {
			try {
				// Check cache first
				const cachedCard = getCachedData();
				if (cachedCard) {
					setCard(cachedCard);
					if (cachedCard.types && cachedCard.types.length > 0) {
						setCurrentCardType(cachedCard.types[0]);
					}
				} else {
					const response = await axios.get(
						`https://api.pokemontcg.io/v2/cards/${id}`,
						{
							headers: {
								'X-Api-Key': import.meta.env.VITE_POKEMON_KEY,
							},
						}
					);
					const cardData = response.data.data;
					setCard(cardData);
					setCachedData(cardData);

					if (cardData.types && cardData.types.length > 0) {
						setCurrentCardType(cardData.types[0]);
					}
				}
			} catch (err) {
				setError(`Failed to fetch card details. Error: ${err}`);
			}
		};

		fetchCardDetail();
	}, [id, getCachedData, setCachedData]);

	useEffect(() => {
		const updateGrade = async () => {
			if (user && card) {
				try {
					const userId = await getUserByEmail(userEmail);
					if (!userId) return;

					const cardDocRef = doc(db, 'users', userId, 'cards', card.id);
					const cardSnapshot = await getDoc(cardDocRef);
					const fetchedGrade = cardSnapshot.data()?.selectedGrade || 'ungraded';

					if (fetchedGrade !== selectedGrade) setSelectedGrade(fetchedGrade);
				} catch (error) {
					console.error('Error updating grade:', error);
				} finally {
					setLoading(false);
				}
			}
		};

		updateGrade();
	}, [user, card, userEmail]);

	// Price fetching effect
	useEffect(() => {
		const fetchPrices = async () => {
			if (!card?.name) return;

			const fetchPriceForGrade = async (grade) => {
				const { getCachedPrice, setCachedPrice } = usePriceCache(
					card.name,
					grade
				);

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
								name: card.name,
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

			try {
				// Fetch all prices concurrently
				const [ungraded, psa8, psa9, psa10] = await Promise.all([
					fetchPriceForGrade('ungraded'),
					fetchPriceForGrade('PSA 8'),
					fetchPriceForGrade('PSA 9'),
					fetchPriceForGrade('PSA 10'),
				]);

				setCardPrices({
					ungraded,
					psa8,
					psa9,
					psa10,
				});
			} catch (error) {
				console.error('Error fetching prices:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchPrices();
	}, [card?.name]);

	// Collection check effect
	useEffect(() => {
		if (userEmail && card) {
			const checkCardInCollection = async () => {
				try {
					const userId = await getUserByEmail(userEmail);
					if (!userId) {
						throw new Error('User not found');
					}

					const cardDocRef = doc(db, 'users', userId, 'cards', card.id);
					const cardSnapshot = await getDoc(cardDocRef);

					setCollectionState(cardSnapshot.exists() ? 'added' : 'neutral');
				} catch (error) {
					console.error('Error checking card in collection:', error);
				}
			};

			checkCardInCollection();
		}
	}, [userEmail, card]);

	// Helper functions
	const getUserByEmail = async (email) => {
		try {
			const usersRef = collection(db, 'users');
			const q = query(usersRef, where('email', '==', email));
			const querySnapshot = await getDocs(q);

			if (querySnapshot.empty) {
				console.error('No user found with this email');
				return null;
			}

			return querySnapshot.docs[0].id;
		} catch (error) {
			console.error('Error fetching user:', error);
			throw error;
		}
	};

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
						expeditedTurnaround: document.getElementById('psa-sub').checked,
					},
				}
			);

			setProfit(response.data.gmeProfit);
			setPSA(response.data.psaProfit);
		} catch (error) {
			console.error('Error calculating profit:', error);
			setError('Failed to calculate profit');
		} finally {
			setIsCalculating(false);
		}
	};

	const addToCollection = async (userEmail, cardData) => {
		try {
			const userId = await getUserByEmail(userEmail);
			if (!userId) {
				throw new Error('User not found');
			}

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
				selectedPrice: cardPrices[selectedGrade] || 0,
				selectedGrade: selectedGrade,
			};

			const cardDocRef = doc(db, 'users', userId, 'cards', cardData.id);
			await setDoc(cardDocRef, cardToAdd);
			setCollectionState('added');
		} catch (error) {
			console.error('Error adding card to collection:', error);
		}
	};

	const removeFromCollection = async (userEmail, cardData) => {
		try {
			const userId = await getUserByEmail(userEmail);
			if (!userId) {
				throw new Error('User not found');
			}

			const cardDocRef = doc(db, 'users', userId, 'cards', cardData.id);
			await deleteDoc(cardDocRef);
			setCollectionState('removed');
		} catch (error) {
			console.error('Error removing card from collection:', error);
		}
	};

	const handleLogin = () => {
		navigate('/login');
	};

	const renderGradeButtons = () => (
		<div className={styles.gradeButtons}>
			{['ungraded', 'psa8', 'psa9', 'psa10'].map((grade) => (
				<button
					key={grade}
					className={`${styles.gradeButton} ${
						selectedGrade === grade ? styles.selectedGrade : ''
					}`}
					onClick={() => setSelectedGrade(grade)}
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
						{cardPrices[grade]
							? `$${formatter.format(Number(cardPrices[grade]))}`
							: 'Loading...'}
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
				<div className={styles.leftSide}>
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
					<p>NOTE: Expedited Turnaround only works for cards less than $500 </p>
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
									<label htmlFor='psa-sub'>PSA Expedited Turnaround</label>
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
							{PSA !== null && (
								<div
									className={styles.PSAResult}
									style={{ textAlign: 'right', marginTop: '10px' }}>
									<p
										style={{
											color: PSA >= 0 ? '#22c55e' : '#ef4444',
											fontWeight: 'bold',
										}}>
										PSA Grading Profit: ${PSA.toFixed(2)}
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CardDetail;
