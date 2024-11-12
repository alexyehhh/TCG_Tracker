import React from 'react';
import styles from './GradeIcon.module.css';

const GradeIcon = ({ grade }) => {
	const getDisplayGrade = (grade) => {
		const gradeUpper = grade.toUpperCase();
		if (gradeUpper === 'UNGRADED') return 'U';
		return gradeUpper.replace('PSA', '');
	};

	return <div className={styles.gradeIcon}>{getDisplayGrade(grade)}</div>;
};

export default GradeIcon;
