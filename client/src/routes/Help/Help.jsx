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
		<div className={styles.container} style={{}}>
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
									{openIndex === index ? (
										<svg
											width='24'
											height='14'
											viewBox='0 0 24 14'
											fill='none'
											xmlns='http://www.w3.org/2000/svg'>
											<path
												fill-rule='evenodd'
												clip-rule='evenodd'
												d='M0.477287 11.0329L10.8477 0.662456C11.4841 0.0260736 12.5159 0.0260736 13.1523 0.662456L23.5227 11.0329C24.1591 11.6693 24.1591 12.7011 23.5227 13.3374C22.8863 13.9738 21.8546 13.9738 21.2182 13.3374L12 4.11927L2.78183 13.3374C2.14545 13.9738 1.11367 13.9738 0.477287 13.3374C-0.159096 12.7011 -0.159096 11.6693 0.477287 11.0329Z'
												fill='black'
											/>
										</svg>
									) : (
										<svg
											width='24'
											height='14'
											viewBox='0 0 24 14'
											fill='none'
											xmlns='http://www.w3.org/2000/svg'>
											<path
												fill-rule='evenodd'
												clip-rule='evenodd'
												d='M23.5227 2.96705L13.1523 13.3375C12.5159 13.9739 11.4841 13.9739 10.8477 13.3375L0.477287 2.96705C-0.159096 2.33067 -0.159096 1.29889 0.477287 0.662505C1.11367 0.0261222 2.14545 0.0261223 2.78183 0.662505L12 9.88068L21.2182 0.662505C21.8546 0.0261231 22.8863 0.0261232 23.5227 0.662506C24.1591 1.29889 24.1591 2.33067 23.5227 2.96705Z'
												fill='black'
											/>
										</svg>
									)}
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
