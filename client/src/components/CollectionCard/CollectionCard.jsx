import React from 'react';
import styles from './CollectionCard.module.css';
import { formatter } from '../../util/cardUtils';
import GradeIcon from '../GradeIcon/GradeIcon';
import { Link } from 'react-router-dom';

const CollectionCard = ({ card, onClick, isSelected }) => {
	const isEligibleForBulk =
		card.selectedPrice !== 'N/A' &&
		Number(card.selectedPrice) > 0 &&
		Number(card.selectedPrice) < 500 &&
		card.selectedGrade === 'ungraded';

	const cardStyles = `${styles.cardContainer} 
        ${!isEligibleForBulk ? styles.ineligibleCard : ''}
        `;

	return (
		<div className={cardStyles}>
			<input
				type='checkbox'
				className={styles.cardCheckbox}
				id={`checkbox-${card.id}`}
				checked={isSelected}
				onChange={() => isEligibleForBulk && onClick && onClick(card)}
			/>
			<Link
				to={`/card-detail/${card.id}`}
				style={{ textDecoration: 'none' }}
				className={styles.cardLink}
				key={card.id}>
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
			</Link>
		</div>
	);
};

export default CollectionCard;
