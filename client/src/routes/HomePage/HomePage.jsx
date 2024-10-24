import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import magnifyingGlass from '../../assets/images/magnifyingGlass.png';
import charizard from '../../assets/images/charizard.png';
import styles from './HomePage.module.css';

export default function HomePage() {
	const cardRef = useRef(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [user, setUser] = useState(null);
	const navigate = useNavigate();
	const auth = getAuth();

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) {
				setIsLoggedIn(true);
				setUser(user);
			} else {
				setIsLoggedIn(false);
				setUser(null);
			}
		});

		return () => unsubscribe();
	}, [auth]);

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
			navigate(`/pokemon-cards?name=${encodeURIComponent(searchTerm)}`);
		}
	};

	const handleKeyDown = (event) => {
		if (event.key === 'Enter') {
			handleSearch();
		}
	};

	const handleLogout = () => {
		// Clear authentication state
		localStorage.removeItem('token'); // Or however you store auth state
		setIsLoggedIn(false);
		navigate('/'); // Redirect to home page after logout
	};

	const handleAuthClick = () => {
		if (isLoggedIn) {
			handleLogout();
		} else {
			navigate('/signin');
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
							<button onClick={handleAuthClick} className={styles.signInBtn}>
								{isLoggedIn ? 'Log out >' : 'Sign in >'}
							</button>
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
								onKeyDown={handleKeyDown}
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
