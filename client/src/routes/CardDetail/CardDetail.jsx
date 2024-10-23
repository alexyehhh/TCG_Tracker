// ./routes/CardDetail/CardDetail.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
// import styles from './CardDetail.module.mss';

function CardDetail() {
    const { id } = useParams(); // Get the card ID from the URL
    const [card, setCard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
        console.log("Card ID:", id); // Log the ID to verify it's being captured correctly
    }, [id]);

    if (loading) return <p>Loading card details...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="card-detail">
            {card ? (
                <>
                    <h1>{card.name}</h1>
                    <img src={card.images.large} alt={card.name} />
                    <p>Set: {card.set.name}</p>
                    <p>HP: {card.hp}</p>
                    <p>Rarity: {card.rarity}</p>
                    {/* Add any other details you want to display */}
                </>
            ) : (
                <p>Card not found</p>
            )}
        </div>
    );
}

export default CardDetail;
