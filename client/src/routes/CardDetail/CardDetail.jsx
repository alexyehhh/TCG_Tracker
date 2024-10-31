import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import styles from './CardDetail.module.css';
import PokemonBackground from '../../components/PokemonBackground/PokemonBackground';

const CardDetail = () => {
	const { id } = useParams();
	const [card, setCard] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [pricePaid, setPricePaid] = useState('');

	useEffect(() => {
		const fetchCardDetail = async () => {
			try {
				const response = await axios.get(
					`https://api.pokemontcg.io/v2/cards/${id}`,
					{
						headers: { 'X-Api-Key': import.meta.env.VITE_POKEMON_KEY },
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
					<button className={styles.addButton}>Add to collection</button>
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

					<div className={styles.section}>
						<h2 className={styles.sectionTitle}>Type:</h2>
						<div className={styles.typeContainer}>
							<div className={styles.typeIcons}>
								{card.types?.map((type) => (
									<span key={type} className={styles.typeIcon} />
								))}
							</div>
							<button className={styles.actionButton}>
								See cards with this type
							</button>
						</div>
					</div>

					<div className={styles.section}>
						<h2 className={styles.sectionTitle}>Set:</h2>
						<div className={styles.typeContainer}>
							<span>{card.set.name}</span>
							<button className={styles.actionButton}>
								See cards from this set
							</button>
						</div>
					</div>

					<div className={styles.priceProfit}>
						<div className={styles.section}>
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
							<p>GameStop grading: [price]</p>
							<p>PSA grading: [price]</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CardDetail;
