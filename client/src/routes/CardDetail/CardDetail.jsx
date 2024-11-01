import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import styles from './CardDetail.module.css';
import PokemonBackground from '../../components/PokemonBackground/PokemonBackground';
import TypeIcon from '../../components/TypeIcon/TypeIcon';
import {
	collection,
	addDoc,
	query,
	where,
	getDocs,
	doc,
	setDoc,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../util/firebase';

const CardDetail = () => {
	const { id } = useParams();
	const [card, setCard] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [pricePaid, setPricePaid] = useState('');
	const [isAdded, setIsAdded] = useState(false);

	const [userEmail, setUserEmail] = useState(null);
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

			setIsAdded(true);

			return {
				success: true,
				cardId: cardData.id,
				message: 'Card added to collection successfully',
			};
		} catch (error) {
			console.error('Error adding card to collection:', error);
			throw error;
		}
	};

	if (loading)
		return <div className={styles.container}>Loading card details...</div>;
	if (error) return <div className={styles.container}>{error}</div>;
	if (!card) return <div className={styles.container}>Card not found</div>;

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

			<h1 className={styles.cardName}>{card.name}</h1>
			<div className={styles.mainContent}>
				<div>
					<img
						src={card.images.large}
						alt={card.name}
						className={styles.cardImage}
					/>
					<button
						className={`${styles.addButton} ${isAdded ? styles.added : ''}`}
						onClick={() => addToCollection(userEmail, card)}>
						{isAdded ? 'Added to collection!' : 'Add to collection'}
					</button>
				</div>

				<div className={styles.cardDetails}>
					<div className={styles.section}>
						<h2 className={styles.sectionTitle}>Prices:</h2>
						<div className={styles.gradeButtons}>
							<button className={styles.gradeButton}>Ungraded</button>
							<button className={styles.gradeButton}>PSA 8</button>
							<button className={styles.gradeButton}>PSA 9</button>
							<button className={styles.gradeButton}>PSA 10</button>
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
							<button className={styles.actionButton}>
								See cards with this type
							</button>
						</div>
					</div>

					<div className={styles.sectionCustom}>
						<h2 className={styles.sectionTitle}>Set:</h2>
						<span>{card.set.name}</span>
						<div className={styles.typeContainer}>
							<button className={styles.actionButton}>
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
							<button className={styles.actionButton}>Calculate profit</button>
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
