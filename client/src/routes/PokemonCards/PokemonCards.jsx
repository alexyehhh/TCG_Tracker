import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, Link } from 'react-router-dom';
import styles from './PokemonCards.module.css';
import PokemonBackground from '../../components/PokemonBackground/PokemonBackground';

function PokemonCards() {
	const [cards, setCards] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [totalPages, setTotalPages] = useState(1);
	const location = useLocation();
	const [currentPage, setCurrentPage] = useState(1);
	const cardsPerPage = 30;

	const query = new URLSearchParams(location.search);
	const searchQuery = query.get('name') || 'Pikachu';

	const parseSearchQuery = (query) => {
		const parts = query.trim().toLowerCase().split(' ');
		const nameParts = [];
		let number = '';

		parts.forEach((part) => {
			if (!number && /^tg\d+/.test(part)) {
				number = part.match(/tg\d+(\/\d+)?/i)[0];
			} else if (!number && /^\d+/.test(part)) {
				number = part.match(/^\d+/)[0].replace(/^0+/, ''); // Remove leading zeros
			} else {
				nameParts.push(part);
			}
		});

		const name = nameParts.join(' ');
		return { name, number };
	};

	const { name: pokemonName, number: cardNumber } =
		parseSearchQuery(searchQuery);

	const fetchCards = async (page) => {
		try {
			setLoading(true);
			const offset = (page - 1) * cardsPerPage; // calculates the offset
			let query;

			// check if the pokemon name ends with EX upper case or not
			if (pokemonName.toLowerCase().endsWith(' ex')) {
				// query that matches both EX and -EX suffixes
				const baseName = pokemonName.slice(0, -3).trim(); // remove EX from the end of the name
				query = `(name:"${baseName} EX" OR name:"${baseName}-EX")`;
			} else {
				// default query for other search terms
				query = `name:"${pokemonName}"`;
			}

			if (cardNumber) {
				if (cardNumber.includes('TG')) {
					query += ` (number:"${cardNumber}" OR number:"${
						cardNumber.split('/')[0]
					}")`;
				} else {
					query += ` number:"${cardNumber}"`;
				}
			}

			const response = await axios.get(
				`https://api.pokemontcg.io/v2/cards?q=${query}&pageSize=${cardsPerPage}&page=${page}`,
				{
					headers: { 'X-Api-Key': import.meta.env.VITE_POKEMON_KEY },
				}
			);
			setCards(response.data.data);
			setTotalPages(Math.ceil(response.data.totalCount / cardsPerPage)); // Dynamically calculate total pages
		} catch (err) {
			setError(`Failed to fetch cards. Error: ${err}`);
		} finally {
			setLoading(false);
		}
	};

	// fetch only when pokemonName, cardNumber, currentPage are changed
	useEffect(() => {
		fetchCards(currentPage);
	}, [pokemonName, cardNumber, currentPage]);

	const paginate = async (pageNumber) => {
		setError(null); // Reset error
		setCurrentPage(pageNumber);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const renderContent = () => {
		if (loading) {
			return <div className={styles.centerContent}><div className={styles.spinner}></div></div>;
		}

		if (error) {
			return (
				<h1 className={`${styles.centerContent} ${styles.errorMessage}`}>
					{error}
				</h1>
			);
		}

		return (
			<div
				className={
					cards.length > 0 ? styles.cardsGrid : styles.centerContainer
				}>
				{cards.length > 0 ? (
					cards.map((card) => (
						<Link
							to={`/card-detail/${card.id}`}
							key={card.id}
							className={styles.cardItem}>
							<h2>{card.name}</h2>
							<img src={card.images.large} alt={card.name} />
							<p>Set: {card.set.name}</p>
							<p>Rarity: {card.rarity ? card.rarity : 'N/A'}</p>
						</Link>
					))
				) : (
					<>
						<h5 className={styles.invalid}>
							No cards found for {pokemonName}.
						</h5>
						<Link to='/' className={styles.loginButton}>
							Back to Search
						</Link>
					</>
				)}
			</div>
		);
	};

	return (
		<div>
			<PokemonBackground />
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
				</ul>
			</nav>
			<div className={styles.pokemonCards}>
				{cards.length > 0 && <h1>Cards for {searchQuery}</h1>}
				{renderContent()}
				<div className={styles.pagination}>
					{!loading && (
						<>
							<button
								onClick={() => paginate(currentPage - 1)}
								disabled={currentPage === 1}>
								Previous
							</button>
							{Array.from({ length: totalPages }, (_, i) => (
								<button
									key={i + 1}
									onClick={() => paginate(i + 1)}
									className={currentPage === i + 1 ? styles.activePage : ''}>
									{i + 1}
								</button>
							))}
							<button
								onClick={() => paginate(currentPage + 1)}
								disabled={currentPage === totalPages}>
								Next
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	);
}

export default PokemonCards;
