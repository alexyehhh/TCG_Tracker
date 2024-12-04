import React from 'react';
import styles from './NoBulkCardsView.module.css';
import { Link } from 'react-router-dom';


// This component displays when no cards are selected for bulk grading
// A message and a link is provided to redirect the user to the collection page
 
const NoBulkCardsView = () => {
	return (
		<div className={styles.content}>
			{/* Main heading for the message */}
			<h1 className={styles.heading}>No Cards Selected for Grading!</h1>

			{/* Description text for the user */}
			<p className={styles.text}>
				You haven't selected any cards for bulk grading yet. Go to your
				collection and select the cards you'd like to grade!
			</p>
			
			{/* Button to navigate to the collection page */}
			<div className={styles.buttonContainer}>
				<Link to='/collection' className={styles.button}>
					Go to Collection
				</Link>
			</div>
		</div>
	);
};

export default NoBulkCardsView;
