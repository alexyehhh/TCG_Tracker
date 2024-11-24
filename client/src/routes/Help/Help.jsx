import React, { useState } from 'react';
import styles from './Help.module.css';
import PokemonBackground from '../../components/PokemonBackground/PokemonBackground';
import { useNavigate, Link } from 'react-router-dom';

export default function Help() {
	const navigate = useNavigate();
	const [openIndex, setOpenIndex] = useState(null);

	const handleToggle = (index) => {
		setOpenIndex(openIndex === index ? null : index);
	};

	const questions = [
		'How do I use this app?',
		'How do I upload my Pokemon card?',
		'How can I store cards to my collection?',
		'How can I store how much I paid for a card?',
		'How do I track the price of my collection?',
	];

	const answers = [
		'Instructions for using the app...',
		'Steps to upload a Pokemon card...',
		'Ways to store cards in your collection...',
		'How to record purchase prices for cards...',
		'Guidance on tracking collection prices...',
	];

	return (
		<div className={styles.container} style={{ backgroundColor: '#8874b4' }}>
			<PokemonBackground color='#2f213e' />
			<nav className={styles.navbar}>
				<ul className={styles.navLinks}>
					<li>
						<Link to='/'>Search</Link>
					</li>
					<li>
						<Link to='/collection'>Collection</Link>
					</li>
					<li>
						<Link to='/bulk-grading'>Bulk Grading</Link>
					</li>
					<li>
						<Link to='/upload'>Upload</Link>
					</li>
					<li>
						<Link to='/help'>Help</Link>
					</li>
				</ul>
			</nav>

			<div className={styles.loggedOutContent}>
				<h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
				<div className={styles.faqAccordion}>
					{questions.map((question, index) => (
						<div key={index} className={styles.faqItem}>
							<div
								className={styles.faqQuestion}
								onClick={() => handleToggle(index)}>
								{question}
								<span className={styles.arrow}>
									{openIndex === index ? '▲' : '▼'}
								</span>
							</div>
							{openIndex === index && (
								<div className={styles.faqAnswer}>{answers[index]}</div>
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
