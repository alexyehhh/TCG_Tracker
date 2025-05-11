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
	setBulkSelectedCount,
}) => {
	// State to toggle confirmation for removing a card
	const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

	// Determines if the card is eligible for bulk grading: 
	// If the price is 'N/A' (not available), the card is not eligible.
	// Converts the price (card.selectedPrice) to a number and checks if it is greater than 0
	// For < 500: cards with a price of 500 or more are not eligible for bulk grading.
	const isEligibleForBulk =
		card.selectedPrice !== 'N/A' &&
		Number(card.selectedPrice) > 0 &&
		Number(card.selectedPrice) < 500 &&
		card.selectedGrade === 'ungraded';

    //  Handles click on the remove button.
    //  If confirmation is shown, remove the card; otherwise, show confirmation.

	const handleRemoveClick = (e) => {
		e.preventDefault(); // Prevent link navigation
		if (showRemoveConfirm) {
			removeCard(card.id); // Removes card from the collection
			if (isSelected) {
				setBulkSelectedCount((x) => x - 1); // Decrements the bulk selection count
			}
		} else {
			setShowRemoveConfirm(true); // Shows the "red x" confirmation
		}
	};

	// Hides the remove confirmation when the mouse leaves the card
	const handleMouseLeave = () => {
		setShowRemoveConfirm(false);
	};

	// Set the CSS class for the card container to a variable "cardStyles"
	const cardStyles = `${styles.cardContainer}`;

	return (
		<div className={cardStyles} onMouseLeave={handleMouseLeave}>
			{/* Checkbox functionality in bulk selection */}
			{showCheckbox && (
				<input
					type='checkbox'
					className={styles.cardCheckbox}
					id={`checkbox-${card.id}`}
					checked={isSelected}
					onChange={(e) =>
						isEligibleForBulk &&
						onClick &&
						onClick(card) &&
						setBulkSelectedCount((prevCount) =>
							e.target.checked ? prevCount + 1 : prevCount - 1
						)
					}
				/>
			)}

			{/* Remove button when checkbox is not shown */}
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

			{
			/* Links to card detail page, its wrapped around the card alongside 
			the details of the Grade and Value of the card underneath */
			}
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
