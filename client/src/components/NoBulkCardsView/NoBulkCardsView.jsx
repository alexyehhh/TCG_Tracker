import React from 'react';
import styles from './NoBulkCardsView.module.css';
import { Link } from 'react-router-dom';

const NoBulkCardsView = () => {
	return (
		<div className={styles.content}>
			<h1 className={styles.heading}>No Cards Selected for Grading!</h1>
			<p className={styles.text}>
				You haven't selected any cards for bulk grading yet. Go to your
				collection and select the cards you'd like to grade!
			</p>
			<div className={styles.buttonContainer}>
				<Link to='/collection' className={styles.button}>
					Go to Collection
				</Link>
			</div>
		</div>
	);
};

export default NoBulkCardsView;
