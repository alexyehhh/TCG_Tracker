import React, { useState } from 'react';
import styles from './CollectionCard.module.css';
import { formatter } from '../../util/cardUtils';
import GradeIcon from '../GradeIcon/GradeIcon';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

const CollectionCard = ({
	card,
	onClick,
	removeCard,
	isSelected,
	showCheckbox,
}) => {
	const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

	const isEligibleForBulkDisplay =
		card.selectedPrice !== 'N/A' &&
		Number(card.selectedPrice) > 0 &&
		Number(card.selectedPrice) < 500 &&
		card.selectedGrade === 'ungraded';

	const handleRemoveClick = (e) => {
		e.preventDefault();
		if (showRemoveConfirm) {
			removeCard(card.id);
		} else {
			setShowRemoveConfirm(true);
		}
	};

	const handleMouseLeave = () => {
		setShowRemoveConfirm(false);
	};

	const handleCheckboxChange = () => {
		if (isEligibleForBulkDisplay && onClick) {
			onClick(card);
		}
	};

	return (
		<div className={styles.cardContainer} onMouseLeave={handleMouseLeave}>
			{showCheckbox && (
				<input
					type='checkbox'
					className={styles.cardCheckbox}
					id={`checkbox-${card.id}`}
					checked={isSelected}
					onChange={handleCheckboxChange}
					disabled={!isEligibleForBulkDisplay}
				/>
			)}

			{!showCheckbox && (
				<button
					onClick={handleRemoveClick}
					className={`${styles.removeButton} ${
						showRemoveConfirm ? styles.removeButtonConfirm : ''
					}`}
					aria-label='Remove card'>
					<X size={16} />
				</button>
			)}

			<Link
				to={`/card-detail/${card.id}`}
				className={styles.cardLink}
				onClick={(e) => showRemoveConfirm && e.preventDefault()}>
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
						{card.selectedPrice !== 'N/A' &&
						Number(card.selectedPrice) > 0
							? ` $${formatter.format(
									Number(card.selectedPrice)
							  )}`
							: ' N/A'}
					</p>
				</div>
			</Link>
		</div>
	);
};

export default CollectionCard;
