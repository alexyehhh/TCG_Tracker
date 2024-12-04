import React from 'react';
import styles from './GradeIcon.module.css';

// Function to format the grade for displaying in the Collection Page
// Converts the grade to uppercase, if the grade is "UNGRADED", return "U"
// Removes the prefix "PSA" if it exists in the grade

const GradeIcon = ({ grade }) => {
	const getDisplayGrade = (grade) => {
		const gradeUpper = grade.toUpperCase(); // Converts grade to uppercase
		if (gradeUpper === 'UNGRADED') return 'U'; 
		return gradeUpper.replace('PSA', '');
	};

	// Display the formatted grade in a styled div
	return <div className={styles.gradeIcon}>{getDisplayGrade(grade)}</div>;
};

export default GradeIcon;
