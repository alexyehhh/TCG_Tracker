// CollectionCard.jsx
import React from 'react';
import styles from './CollectionCard.module.css';

const CollectionCard = ({ card, onClick }) => {
	return (
		<div className={styles.cardContainer}>
			<img
				src={card.image || ''}
				alt={`Pokemon Card - ${card.name || 'Unknown'}`}
				className={styles.cardImage}
				onClick={onClick}
			/>
			<div className={styles.cardInfo}>
				<p className={styles.gradeText}>
					Grade: {card.selectedGrade.toUpperCase() || 'N/A'}
				</p>
				<p className={styles.priceText}>
					Price: $
					{card.selectedPrice ? Number(card.selectedPrice).toFixed(2) : 'N/A'}
				</p>
			</div>
		</div>
	);
};

export default CollectionCard;
