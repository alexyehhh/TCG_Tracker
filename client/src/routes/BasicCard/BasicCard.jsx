import { useState, useEffect } from 'react';
import axios from 'axios';
function BasicCard() {
	const [card, setCard] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	useEffect(() => {
		const fetchCard = async () => {
			try {
				const response = await axios.get(
					'https://api.pokemontcg.io/v2/cards/base1-4', // Sample card ID
					{
						headers: { 'X-Api-Key': import.meta.env.VITE_POKEMON_KEY }, // Optional: API key if required
					}
				);
				setCard(response.data.data); // Store card data
			} catch (err) {
				setError(`Failed to fetch card data. Error ${err}`);
			} finally {
				setLoading(false);
			}
		};

		fetchCard(); // Call the async function
	}, []); // Empty dependency array means it runs only once
	if (loading) return <p>Loading...</p>;
	if (error) return <p>{error}</p>;
	return (
		<div>
			<h1>{card.name}</h1>
			<img src={card.images.large} alt={card.name} />
			<p>
				<strong>Set:</strong> {card.set.name}
			</p>
			<p>
				<strong>Type:</strong> {card.types.join(', ')}
			</p>
			<p>
				<strong>HP:</strong> {card.hp}
			</p>
		</div>
	);
}

export default BasicCard;
