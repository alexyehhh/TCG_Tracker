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
		'What can I use this app for?',
		'How do I use the search bar to look up my card?',
		'How do I track the price of my collection?',
		'How can I store cards to my collection?',
		'How can I store how much I paid for a card?',
		'How can I see how much bulk grading would cost and my profit from it?',
		'How can I calculate the profit I would make if I had my card graded?',
		'How do I upload my Pokemon card?',
		'What are the pricing options for PSA?',
		'What are the pricing options for GameStop?',
	];
	
	const answers = [
		(
			<ul>
				<li>Search for Pokémon cards and view their current market value.</li>
				<li>Assess whether it’s worthwhile to get your cards graded.</li>
				<li>Add cards to a personal collection and track their value over time.</li>
			</ul>
		),
		(
			<div>
				<p>
					You can use the search bar to find your card by either entering the Pokémon's name to view all related results or by entering the Pokémon's name along with its card number to locate the exact card. For example, you can use the search bar to find your card in two ways:
				</p>
				<ul>
					<li>Enter the Pokémon's name (e.g., <strong>"Pikachu"</strong>) to view all related results.</li>
					<li>Enter the Pokémon's name and card number (e.g., <strong>"Pikachu 19/68"</strong>) to locate the exact card.</li>
				</ul>
			</div>
		),
		(
			<p>
				Navigate to the <strong>Collection</strong> tab. The total value of your collection, based on the latest data, will be displayed at the top of the page.
			</p>
		),
		(
			<ol>
				<li>Search for your card by name (with or without its number) or upload an image using the <strong>Upload</strong> feature.</li>
				<li>Select the card from the search results.</li>
				<li>Choose the card’s grade (default is ungraded).</li>
				<li>Enter the price you paid for the card (optional; default is $0 if left blank).</li>
				<li>Click the <strong>Add to Collection</strong> button located below the card image.</li>
			</ol>
		),
		(
			<p>
				After locating your card through the search or upload feature, enter the purchase price in the field provided on the bottom right of the card details page. Click the <strong>Add to Collection</strong> button to save it.
			</p>
		),
		(
			<ol>
				<li>Navigate to the <strong>Collection</strong> tab.</li>
				<li>Click <strong>Show Bulk Eligible Cards</strong> (ungraded cards with a value of $500 or less).</li>
				<li>Select a minimum of 20 cards.</li>
				<li>Click the <strong>Send Bulk</strong> button.</li>
				<li>Click the <strong>Calculate</strong> button to view the bulk grading cost and profit at the top of the page.</li>
			</ol>
		),
		(
			<ol>
				<li>Search for the card and view its details.</li>
				<li>Enter the purchase price of the card.</li>
				<li>Select <strong>PSA Expedited Turnaround</strong> and/or <strong>GameStop Pro</strong> if applicable.</li>
				<li>Click the <strong>Calculate Profit</strong> button to see profit calculations.</li>
			</ol>
		),
		(
			<ol>
				<li>Navigate to the <strong>Upload</strong> tab in the top navigation bar.</li>
				<li>Drag and drop an image of your card, or click to browse and select an image from your device.</li>
				<li>After the upload is complete, click the <strong>Search for Card</strong> button.</li>
				<li>Once processing is finished, the card results will be displayed. Select your card to view additional information.</li>
			</ol>
		),
		(
			<div>
				<p>
					If you are a member of the PSA Collectors Club, you can grade your cards in bulk under these options:
				</p>
				<ul>
					<li><strong>$14.99/card</strong> with a maximum insured value of $200 per card.</li>
					<li><strong>$18.99/card</strong> with a maximum insured value of $500 per card.</li>
				</ul>
				<p>If you are not a member of the PSA Collectors Club, the following pricing options are available:</p>
				<ul>
					<li><strong>Value</strong>: $24.99/card with a maximum insured value of $500.</li>
					<li><strong>Value Plus</strong>: $39.99/card with a maximum insured value of $500 (expedited turnaround).</li>
					<li><strong>Regular</strong>: $74.99/card with a maximum insured value of $1,500.</li>
					<li><strong>Express</strong>: $129.00/card with a maximum insured value of $2,500.</li>
					<li><strong>Super Express</strong>: $249.00/card with a maximum insured value of $5,000.</li>
					<li><strong>Walk-Through</strong>: $499.00/card with a maximum insured value of $10,000.</li>
				</ul>
				<p>
					For more details on PSA grading services, visit <a href="https://www.psacard.com/services/tradingcardgrading" target="_blank" rel="noopener noreferrer">PSA Trading Card Grading Services</a>.
				</p>
			</div>
		),
		(
			<div>
				<p>
					If you are a <strong>GameStop Pro</strong> member, you are eligible for free shipping. Otherwise, there is a flat shipping fee of <strong>$4.99 per order</strong>. The following grading options are available:
				</p>
				<ul>
					<li><strong>$15.99/card</strong> with a declared value of $200 per card.</li>
					<li><strong>$19.99/card</strong> with a declared value of $500 per card.</li>
				</ul>
				<p>
					For more information about GameStop grading services, visit <a href="https://www.gamestop.com/card-grading-service#card_grading_service_steps" target="_blank" rel="noopener noreferrer">GameStop Card Grading Service</a>.
				</p>
			</div>
		),
	];
	
	
	

	return (
		<div className={styles.container} style={{}}>
			<PokemonBackground color='#191143' />
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
