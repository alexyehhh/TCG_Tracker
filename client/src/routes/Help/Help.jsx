import React, { useState } from 'react';
import styles from './Help.module.css';
import PokemonBackground from '../../components/PokemonBackground/PokemonBackground';
import cardGuideImage from '../../assets/faq/cardinformation.png';
import bulkEligible from '../../assets/faq/bulkEligible.png';
import bulkCostProfit from '../../assets/faq/bulkCostProfit.png';
import collectionImage from '../../assets/faq/collection.png';
import CollectionValueOverTime from '../../assets/faq/CollectionValueOverTime.png';
import profitCalculation from '../../assets/faq/profitCalculation.png';
import noCardPicture from '../../assets/faq/noCardPicture.png';
const demoVideo = '/assets/TCG-Tracker-Demo-Video.mp4';
import { useNavigate, Link } from 'react-router-dom';

export default function Help() {
	const [openIndex, setOpenIndex] = useState(null);

	// Toggle the accordion
	const handleToggle = (index) => {
		setOpenIndex(openIndex === index ? null : index);
	};

	// Questions for faq accordion
	const questions = [
		'What can I use TCG Tracker for?',
		'How does TCG Tracker determine the prices for Pokémon cards in each grade?',
		'How often are card prices updated?',
		'How do I use the search bar to look up my card?',
		'How can I calculate the profit I would make if I had my card graded?',
		'How do I track the value of my collection?',
		'How can I store cards to my collection?',
		'How can I store how much I paid for a card?',
		'What options are available for filtering or searching cards in my collection?',
		'How can I see how much bulk grading would cost and my profit from it?',
		'How do I upload my Pokemon card?',
		'Why isn’t my card found when I upload a picture of it?',
		'What are the pricing options for PSA?',
		'What are the pricing options for GameStop?',
		'Why do some search results not include a picture?',
		'Why do some card prices display as N/A?',
	];

	// Answers for faq accordion that correspond to the questions above
	const answers = [
		<ul>
			<li>Search for Pokémon cards and view their current market value.</li>
			<li>Assess whether it’s worthwhile to get your cards graded.</li>
			<li>
				Add cards to a personal collection and track their value over time.
			</li>
		</ul>,
		<p>
			TCG Tracker retrieves pricing data using the eBay API by analyzing recent
			sales listings. The top 10 sales are selected, and outliers differing by
			more than 50% from the median are filtered out. The average of the
			remaining values is then calculated to provide the most accurate and
			reliable price estimate for each grade.
		</p>,
		<p>
			{' '}
			Card prices are refreshed every 24 hours to ensure the data reflects the
			most recent market trends and sales activity.
		</p>,
		<div>
			<p>
				You can use the search bar to find your card by either entering the
				Pokémon's name to view all related results or by entering the Pokémon's
				name along with its card number to locate the exact card. For example,
				you can use the search bar to find your card in two ways:
			</p>
			<ul>
				<li>
					Enter the Pokémon's name (e.g., <strong>"Pikachu"</strong>) to view
					all related results.
				</li>
				<li>
					Enter the Pokémon's name and card number (e.g.,{' '}
					<strong>"Pikachu 19/68"</strong>) to locate the exact card.
				</li>
			</ul>
		</div>,
		<ol>
			<li>Search for the card and view its details.</li>
			<li>Enter the purchase price of the card.</li>
			<li>
				Select <strong>PSA Expedited Turnaround</strong> and/or{' '}
				<strong>GameStop Pro</strong> if applicable (cards worth $500 or less).
			</li>
			<li>
				Click the <strong>Calculate Profit</strong> button to see profit
				calculations.
			</li>
			<img
				src={profitCalculation}
				alt='A helpful guide showing how to calculate the profit of grading your card'
			/>
		</ol>,
		<p>
			Navigate to the <strong>Collection</strong> tab. The total value of your
			collection, updated every 24 hours with the latest market data, will be
			displayed at the top of the page. To view a historical overview of your
			collection's value, click the <strong>View Graph</strong> button.
			<img
				src={collectionImage}
				alt='A helpful guide showing how to view the value of your collection'
			/>
			*Note: Not all cards in the collection are displayed in the image above
			<img
				src={CollectionValueOverTime}
				alt='A helpful guide showing how to view the value of your collection over time'
			/>
		</p>,
		<ol>
			<li>
				Search for your card by name (with or without its number) or upload an
				image using the <strong>Upload</strong> feature.
			</li>
			<li>Select the card from the search results.</li>
			<li>Choose the card’s grade (default is ungraded).</li>
			<li>
				Enter the price you paid for the card (optional; default is $0 if left
				blank).
			</li>
			<li>
				Click the <strong>Add to Collection</strong> button located below the
				card image.
			</li>
			<img
				src={cardGuideImage}
				alt='A helpful guide showing how to add a card to your collection'
			/>
		</ol>,
		<p>
			After locating your card through the search or upload feature, enter the
			purchase price in the field provided on the bottom right of the card
			details page. Click the <strong>Add to Collection</strong> button to save
			it.
		</p>,
		<p>
			You can filter your collection by rarity, price, type, or set to narrow
			down your results. Additionally, you can search for a specific card by
			name. Please note that when using the search bar, you will need to enter
			one letter at a time and reselect the search bar after each entry.
		</p>,
		<ol>
			<li>
				Navigate to the <strong>Collection</strong> tab.
			</li>
			<li>
				Click <strong>Show Bulk Eligible Cards</strong> (ungraded cards with a
				value of $500 or less).
			</li>
			<li>Select a minimum of 20 cards.</li>
			<li>
				Click the <strong>Send Bulk</strong> button.
			</li>
			<li>
				Click the <strong>Calculate</strong> button to view the bulk grading
				cost and profit at the top of the page.
			</li>
			<img
				src={bulkEligible}
				alt='A helpful guide showing how to view bulk eligible cards'
			/>
			<img
				src={bulkCostProfit}
				alt='A helpful guide showing how to calculate bulk grading cost and profit'
			/>
			*Note: Not all cards in the collection are displayed in the images above
		</ol>,
		<ol>
			<li>
				Navigate to the <strong>Upload</strong> tab in the top navigation bar.
			</li>
			<li>
				Drag and drop an image of your card, or click to browse and select an
				image from your device.
			</li>
			<li>
				After the upload is complete, click the <strong>Search for Card</strong>{' '}
				button.
			</li>
			<li>
				Once processing is finished, the card results will be displayed. Select
				your card to view additional information.
			</li>
		</ol>,
		<p>
			If your card is not found, it may be because the algorithm was unable to
			recognize it. In this case, you can manually search for the card using its
			name and number.
		</p>,
		<div>
			<p>
				If you are a member of the PSA Collectors Club, you can grade your cards
				in bulk under these options:
			</p>
			<ul>
				<li>
					<strong>$14.99/card</strong> with a maximum insured value of $200 per
					card.
				</li>
				<li>
					<strong>$18.99/card</strong> with a maximum insured value of $500 per
					card.
				</li>
			</ul>
			<p>
				If you are not a member of the PSA Collectors Club, the following
				pricing options are available:
			</p>
			<ul>
				<li>
					<strong>Value</strong>: $24.99/card with a maximum insured value of
					$500.
				</li>
				<li>
					<strong>Value Plus</strong>: $39.99/card with a maximum insured value
					of $500 (expedited turnaround).
				</li>
				<li>
					<strong>Regular</strong>: $74.99/card with a maximum insured value of
					$1,500.
				</li>
				<li>
					<strong>Express</strong>: $129.00/card with a maximum insured value of
					$2,500.
				</li>
				<li>
					<strong>Super Express</strong>: $249.00/card with a maximum insured
					value of $5,000.
				</li>
				<li>
					<strong>Walk-Through</strong>: $499.00/card with a maximum insured
					value of $10,000.
				</li>
			</ul>
			<p>
				For more details on PSA grading services, visit{' '}
				<a
					href='https://www.psacard.com/services/tradingcardgrading'
					target='_blank'
					rel='noopener noreferrer'>
					PSA Trading Card Grading Services
				</a>
				.
			</p>
		</div>,
		<div>
			<p>
				If you are a <strong>GameStop Pro</strong> member, you are eligible for
				free shipping. Otherwise, there is a flat shipping fee of{' '}
				<strong>$4.99 per order</strong>. The following grading options are
				available:
			</p>
			<ul>
				<li>
					<strong>$15.99/card</strong> with a declared value of $200 per card.
				</li>
				<li>
					<strong>$19.99/card</strong> with a declared value of $500 per card.
				</li>
			</ul>
			<p>
				For more information about GameStop grading services, visit{' '}
				<a
					href='https://www.gamestop.com/card-grading-service#card_grading_service_steps'
					target='_blank'
					rel='noopener noreferrer'>
					GameStop Card Grading Service
				</a>
				.
			</p>
		</div>,
		<p>
			Some search results may not include a picture because the Pokémon TCG API,
			which provides the images and other card details, does not have an image
			available for those specific cards.
			<img
				src={noCardPicture}
				alt='A helpful guide showing some cards may not have a picture'
			/>
		</p>,
		<p>
			Prices may display as "N/A" if the eBay API does not have any listings
			available for the specified grade of the card.
		</p>,
	];

	<video
		width='100%'
		height='auto'
		controls
		style={{
			marginTop: '20px',
			border: '1px solid #ccc',
			borderRadius: '8px',
		}}>
		<source src={demoVideo} type='video/mp4' />
		Your browser does not support the video tag.
	</video>;

	return (
		<div className={styles.container}>
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
												fillRule='evenodd'
												clipRule='evenodd'
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
												fillRule='evenodd'
												clipRule='evenodd'
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

				{/* Demo Video */}
				<div className={styles.videoContainer}>
					<h3>Watch the TCG Tracker Demo Video</h3>
					<video
						width='100%'
						height='auto'
						controls
						style={{
							marginTop: '20px',
							border: '1px solid #ccc',
							borderRadius: '8px',
						}}>
						<source src={demoVideo} type='video/mp4' />
						Your browser does not support the video tag.
					</video>
				</div>
			</div>
		</div>
	);
}
