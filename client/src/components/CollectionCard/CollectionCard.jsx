import React from 'react';
import styles from './CollectionCard.module.css';
import { formatter } from '../../util/cardUtils';

const GradeIcon = ({ grade }) => {
	const getDisplayGrade = (grade) => {
		const gradeUpper = grade.toUpperCase();
		if (gradeUpper === 'UNGRADED') return 'U';
		return gradeUpper.replace('PSA', '');
	};

	return <div className={styles.gradeIcon}>{getDisplayGrade(grade)}</div>;
};

const CollectionCard = ({ card, onClick, isSelected }) => {
	const isEligibleForBulk =
		card.selectedPrice !== 'N/A' &&
		Number(card.selectedPrice) > 0 &&
		Number(card.selectedPrice) < 500;

	const cardStyles = `${styles.cardContainer} 
        ${isSelected ? styles.selectedCard : ''} 
        ${!isEligibleForBulk ? styles.ineligibleCard : ''}
        ${card.sendBulk ? styles.bulkCard : ''}`;

	return (
		<div
			className={cardStyles}
			onClick={() => isEligibleForBulk && onClick && onClick(card)}>
			<img
				src={card.image || ''}
				alt={`Pokemon Card - ${card.name || 'Unknown'}`}
				className={styles.cardImage}
			/>
			<div className={styles.cardInfo}>
				<div className={styles.gradeText}>
					<span>Grade:</span>
					<GradeIcon grade={card.selectedGrade} />
				</div>
				<p className={styles.priceText}>
					Value:
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
