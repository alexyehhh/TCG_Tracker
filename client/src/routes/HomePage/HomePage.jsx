import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import magnifyingGlass from '../../assets/images/magnifyingGlass.png';
import charizard from '../../assets/images/charizard.png';
import styles from './HomePage.module.css';

export default function HomePage() {
	const cardRef = useRef(null);
	const [searchTerm, setSearchTerm] = useState('');
	const navigate = useNavigate(); // For navigation

	useEffect(() => {
		const card = cardRef.current;

		const handleMouseMove = (e) => {
			const rect = card.getBoundingClientRect();
			const xAxis = (rect.width / 2 - (e.clientX - rect.left)) / 15;
			const yAxis = (rect.height / 2 - (e.clientY - rect.top)) / 15;
			card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg) scale(1.05)`;
		};

		const handleMouseLeave = () => {
			card.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)';
		};

		card.addEventListener('mousemove', handleMouseMove);
		card.addEventListener('mouseleave', handleMouseLeave);

		// Cleanup on component unmount
		return () => {
			card.removeEventListener('mousemove', handleMouseMove);
			card.removeEventListener('mouseleave', handleMouseLeave);
		};
	}, []);

	const handleSearch = () => {
		if (searchTerm.trim() !== '') {
			// Navigate to the PokemonCards page with the search term as a query parameter
			navigate(`/pokemon-cards?name=${encodeURIComponent(searchTerm)}`);
		}
	};

	return (
		<div className={styles.homepage}>
			<div className={styles.backgroundClip}></div>
			<div className={styles.contentWrapper}>
				<header>
					<nav className={styles.navbar}>
						<div className={styles.navbarLeft}></div>
						<ul className={styles.navLinks}>
							<li>
								<a href='#'>Search</a>
							</li>
							<li>
								<a href='#'>Collection</a>
							</li>
							<li>
								<a href='#'>Upload</a>
							</li>
						</ul>
						<div className={styles.navbarRight}>
							<a href='/signin' className={styles.signInBtn}>
								Sign in &gt;
							</a>
						</div>
					</nav>
				</header>

				<main className={styles.contentContainer}>
					<div className={styles.leftContent}>
						<h1 className={styles.leftContentTitle}>
							Find your <br /> Pokémon <br /> Collection's Worth
						</h1>
						<p className={styles.leftContentSubtitle}>
							This will change the way you track the prices of your Pokemon
							cards. Search your card below.
						</p>
						<div className={styles.searchBar}>
							<input
								type='text'
								placeholder='Search for your card...'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
							<button onClick={handleSearch}>
								<img src={magnifyingGlass} alt='Search' width='15px' />
							</button>
						</div>
					</div>

					<div className={styles.rightContent}>
						<div className={styles.card} ref={cardRef}>
							<img
								src={charizard}
								alt='Charizard Card'
								className={styles.cardImage}
							/>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
