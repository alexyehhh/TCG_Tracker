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
    const searchQuery = query.get('name') || 'Pikachu'; // pikachu is set to default 

    // obtain name for pokemon 

    // Function to parse user input into name and number
    const parseSearchQuery = (query) => {
        const parts = query.trim().split(' ');
        const nameParts = [];
        let number = '';

        parts.forEach(part => {
            if (!number && /^\d+/.test(part)) { // Check if part starts with a number
                number = part.match(/^\d+/)[0]; // Extract only the initial numeric part (e.g., "2" from "2/122")
            } else {
                nameParts.push(part);
            }
        });

        const name = nameParts.join(' ');
        return { name, number };
    };

    // Destructure parsed name and number from searchQuery
    const { name: pokemonName, number: cardNumber } = parseSearchQuery(searchQuery);

    useEffect(() => { 
        const fetchCards = async () => {
            try {
                // construct the query based on the parsed name and optional card number
                let query = `name:"${pokemonName}"`;
                
                if (cardNumber) {
                    query += ` number:"${cardNumber}"`; // add card number to the query if provided
                }

                const response = await axios.get(
                    `https://api.pokemontcg.io/v2/cards?q=${query}`,
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
    }, [pokemonName, cardNumber]); // "useEffect" runs when either name or card number changes

    if (loading) return <p>Loading cards...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className={styles.pokemonCards}>
            <h1>Cards for {searchQuery}</h1>
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
