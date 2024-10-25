import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import magnifyingGlass from '../../assets/images/magnifyingGlass.png';
import charizard from '../../assets/images/charizard.png';
import styles from './HomePage.module.css';

const RightArrow = () => {
	return (
		<svg
			className={styles.rightArrow}
			viewBox='0 0 1024 1024'
			xmlns='http://www.w3.org/2000/svg'
			aria-label='Right Arrow Icon'>
			<path
				d='M170.666667 469.333333v85.333334h512l-234.666667 234.666666 60.586667 60.586667L846.506667 512l-337.92-337.92L448 234.666667 682.666667 469.333333H170.666667z'
				fill='currentColor'
			/>
		</svg>
	);
};

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
		signOut(auth);
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
								<Link to='/'>Search</Link>
							</li>
							<li>
								<Link to='/collection'>Collection</Link>
							</li>
							<li>
								<Link to='/upload'>Upload</Link>
							</li>
						</ul>
						<div className={styles.navbarRight}>
							<button onClick={handleAuthClick} className={styles.signInBtn}>
								{isLoggedIn ? (
									<h4>
										Sign out <RightArrow />
									</h4>
								) : (
									<h4>
										Sign in <RightArrow />
									</h4>
								)}
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
