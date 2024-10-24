// ./routes/PokemonCards/PokemonCards.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import styles from './PokemonCards.module.css';

function PokemonCards() {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    
    // Extract the Pokémon name from the query parameter
    const query = new URLSearchParams(location.search);
    const pokemonName = query.get('name') || 'Pikachu'; // pikachu is set to default 

    // obtain name for pokemon 

    useEffect(() => { 
        const fetchCards = async () => {
            try {
                const response = await axios.get(
                    `https://api.pokemontcg.io/v2/cards?q=name:"${pokemonName}"`,
                    {
                        headers: { 'X-Api-Key': import.meta.env.VITE_POKEMON_KEY },
                    }
                );
                setCards(response.data.data);
            } catch (err) {
                setError(`Failed to fetch cards. Error: ${err}`);
            } finally {
                setLoading(false);
            }
        };

        fetchCards();
    }, [pokemonName]); // "useEffect" runs when pokemonName changes (user searches for card)

    if (loading) return <p>Loading cards...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className={styles.pokemonCards}>
            <h1>Cards for {pokemonName}</h1>
            {/* grid container starts */}
            <div className={styles.cardsGrid}>
                {cards.length > 0 ? ( /* checking if there are cards in the array */
                    cards.map((card) => (
                        <div key={card.id} className={styles.cardItem}>
                            <h2>{card.name}</h2>
                            <img src={card.images.large} alt={card.name} />
                            <p>Set: {card.set.name}</p>
                            <p>Rarity: {card.rarity}</p>
                        </div>
                    ))
                ) : (
                    <p>No cards found for {pokemonName}.</p>
                )}
            </div>
            {/* end of grid */}
        </div>
    );
}

export default PokemonCards;
