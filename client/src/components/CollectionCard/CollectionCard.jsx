// CollectionCard.jsx
import React from 'react';
import styles from './CollectionCard.module.css';
import { formatter } from '../../util/cardUtils';

const GradeIcon = ({ grade }) => {
	// Convert grade to display format
	const getDisplayGrade = (grade) => {
		const gradeUpper = grade.toUpperCase();
		if (gradeUpper === 'UNGRADED') return 'U';
		// Extract number from PSA grade (e.g., "PSA8" -> "8")
		return gradeUpper.replace('PSA', '');
	};

	return <div className={styles.gradeIcon}>{getDisplayGrade(grade)}</div>;
};

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
				<div className={styles.gradeText}>
					<span>Grade:</span>
					<GradeIcon grade={card.selectedGrade} />
				</div>
				<p className={styles.priceText}>
					Price:
					{card.selectedPrice !== 'N/A'
						? Number(card.selectedPrice) > 0
							? ` $${formatter.format(Number(card.selectedPrice))}`
							: ' N/A'
						: ' N/A'}
				</p>
			</div>
		</div>
	);
};

export default CollectionCard;
