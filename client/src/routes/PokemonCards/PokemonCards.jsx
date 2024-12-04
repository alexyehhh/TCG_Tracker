import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, Link } from 'react-router-dom';
import styles from './PokemonCards.module.css';
import PokemonBackground from '../../components/PokemonBackground/PokemonBackground';
import cardSets from '../../util/cardSets';

function PokemonCards() {
	const [cards, setCards] = useState([]); // array to store pokemon card data
	const [loading, setLoading] = useState(true); // loading state for API requests
	const [error, setError] = useState(null); // error state for user feedback
	const [totalPages, setTotalPages] = useState(1); // total number of pages for pagination
	const location = useLocation(); // hook to access the current URL and query parameters
	const [currentPage, setCurrentPage] = useState(1); // current page for pagination
	const cardsPerPage = 32; // number of cards displayed per page
	const query = new URLSearchParams(location.search); // parse the query parameters from the URL
	const searchQuery = query.get('name') || 'Pikachu'; // default to Pikachu if no search query is provided

	// function to parse the search query for pokemon name and card number
	const parseSearchQuery = (query) => {
		const parts = query.trim().toLowerCase().split(' '); // split the query into parts
		const nameParts = []; // array to collect the name parts
		let number = ''; // variable to store the card number

		// go over each part of the query
		parts.forEach((part) => {
		if (!number && /^(gg|tg)\d+/i.test(part)) {
			// match for special cases like GG (galarian gallery) or TG (trainer gallery) numbers
			number = part.match(/^(gg|tg)\d+/i)[0];
		} else if (!number && /^\d+/.test(part)) {
			// match for regular numbers and remove leading zeros
			number = part.match(/^\d+/)[0].replace(/^0+/, '');
		} else {
			// if not treat the part as part of the pokemon name
			nameParts.push(part);
		}
		});

		const name = nameParts.join(' '); // join the name parts into a single string
		return { name, number }; // return the parsed name and number
	};

	// parse the search query into pokemon name and card number
	const { name: pokemonName, number: cardNumber } = parseSearchQuery(searchQuery);

	const searchSet = query.get('set'); // get the set filter from the query string

		// fucntion to fetch Pokemon cards from the Pokemon TCG API
		const fetchCards = async (page) => {
			try {
			setLoading(true); // start loading state
			const offset = (page - 1) * cardsPerPage; // calculate the offset for pagination
			let query; // the query variable

			if (searchSet) {
				// get cards by set name if the set filter is provided
				query = `set.name:"${searchSet}"`;
			} else if (pokemonName) {
				// check if the pokemon name matches a set name in the cardSets array
				const isSetName = cardSets.some(
				(set) => set.toLowerCase() === pokemonName.toLowerCase()
				);

				if (isSetName) {
				// if the pokemon name is a set name then search by set
				query = `set.name:"${pokemonName}"`;
				} else {
				// in other cases query by pokemon card name
				if (pokemonName.toLowerCase().endsWith(' ex')) {
					// handle EX and ex cards
					const baseName = pokemonName.slice(0, -3).trim(); // remove EX suffix
					query = `name:"${baseName} EX" OR name:"${baseName}-EX"`;
				} else if (pokemonName.toLowerCase().endsWith(' gx')) {
					// handle GX and gx cards
					const baseName = pokemonName.slice(0, -3).trim(); // remove GX suffix
					query = `name:"${baseName} GX" OR name:"${baseName}-GX"`;
				} else {
					// general case for searching by pokemon name
					query = `name:"${pokemonName}"`;
				}

				// add card number to the query if provided
				if (cardNumber) {
					// hangle cases like GG numbers
					if (cardNumber.includes('GG')) {
					query += ` number:"${cardNumber}"`;
					} else if (cardNumber.includes('TG')) {
					// hangle cases like TG numbers
					query += ` (number:"${cardNumber}" OR number:"${
						cardNumber.split('/')[0]
					}")`;
					} else {
					query += ` number:"${cardNumber}"`;
					}
				}
				}
			}

			// make the API request to fetch cards based on the query
			const response = await axios.get(
				`https://api.pokemontcg.io/v2/cards?q=${query}&pageSize=${cardsPerPage}&page=${page}`,
				{
				headers: { 'X-Api-Key': import.meta.env.VITE_POKEMON_KEY }, // use API key from environment variables
				}
			);

			// sort the fetched cards by their set number in ascending order
			const sortedCards = response.data.data.sort((a, b) => {
				const numA = parseInt(a.number, 10); // parse card numbers as integers
				const numB = parseInt(b.number, 10);
				return numA - numB; // sort in ascending order
			});

			setCards(sortedCards); // update the cards state
			setTotalPages(Math.ceil(response.data.totalCount / cardsPerPage)); // calculate the total number of pages
			} catch (err) {
			// handle errors from the API request
			setError(`Failed to fetch cards. Error: ${err}`);
			} finally {
			setLoading(false); // end loading state
			}
		};

		// fetch cards whenever the pokemon name, card number, or current page changes
		useEffect(() => {
			fetchCards(currentPage); // fetch cards for the current page
		}, [pokemonName, cardNumber, currentPage]); // dependencies that trigger the effect

		// fucntion to handle pagination
		const paginate = async (pageNumber) => {
			setError(null); // reset any existing error
			setCurrentPage(pageNumber); // update the current page
			window.scrollTo({ top: 0, behavior: 'smooth' }); // scroll to the top of the page
		};

	// fucntion to render the content based on the loading state
	const renderContent = () => {
		if (loading) {
			return (
				<div className={styles.centerContent}>
					<div className={styles.spinner}></div>
				</div>
			);
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
					<li>
						<Link to='/help'>Help</Link>
					</li>
				</ul>
			</nav>
			<div className={styles.pokemonCards}>
				{searchSet ? (
					<h1>Cards for {searchSet}</h1> // dynamically render the set name
				) : (
					<h1>Cards for {searchQuery}</h1> // Fallback to pokemon name
				)}
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
