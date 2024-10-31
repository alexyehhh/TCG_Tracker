import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Collection.module.css';
import PokemonBackground from '../../components/PokemonBackground/PokemonBackground';
import magnifyingGlass from '../../assets/images/magnifyingGlass.png';
import charizardex151 from '../../assets/images/charizardex151.png';
import celebiFusion from '../../assets/images/celebiFusion.png';
import lugiaSilverT from '../../assets/images/lugiaSilverT.png';
import moonbreon from '../../assets/images/moonbreon.jpg';
import venuEX151 from '../../assets/images/venuEX151.png';

const Collection = () => {
	const [user, setUser] = useState(null);
	const auth = getAuth();
	const [searchTerm, setSearchTerm] = useState('');
	const navigate = useNavigate();

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setUser(user);
		});
		return () => unsubscribe();
	}, []);

	const handleLogin = () => {
		navigate('/login');
	};

	const handleInputChange = (e) => {
		setSearchTerm(e.target.value);
	};

	const handleSearch = () => {
		if (searchTerm.trim() !== '') {
			// navigate(`/pokemon-cards?name=${encodeURIComponent(searchTerm)}`);
			console.log('Searching for:', searchTerm);
		}
	};

	const handleKeyDown = (event) => {
		if (event.key === 'Enter') {
			handleSearch();
		}
	};

	const LoggedOutView = () => (
		<div
			className={styles.container}
			style={{
				backgroundColor: user ? '#fff4fc' : '#8874b4',
			}}>
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
						<Link to='/upload'>Upload</Link>
					</li>
				</ul>
			</nav>

			<div className={styles.loggedOutContent}>
				<div className={styles.previewGrid}>
					<img
						src={venuEX151}
						alt='Venusaur Card'
						className={styles.cardImage}
					/>
					<img
						src={lugiaSilverT}
						alt='Lugia Card'
						className={styles.cardImage}
					/>
					<img
						src={charizardex151}
						alt='Charizard Card'
						className={styles.cardImage}
					/>
					<img
						src={moonbreon}
						alt='Dark Pokemon Card'
						className={styles.cardImage}
					/>
					<img
						src={celebiFusion}
						alt='Celebi Card'
						className={styles.cardImage}
					/>
				</div>

				<h2 className={styles.loginMessage}>Log in to view your collection.</h2>
				<button className={styles.loginButton} onClick={handleLogin}>
					Log in
				</button>
				<p className={styles.signupText}>
					Don't have an account?{' '}
					<a href='/signup' className={styles.signupLink}>
						Sign up now!
					</a>
				</p>
			</div>
		</div>
	);

	const LoggedInView = () => (
		<div className={styles.container}>
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
						<Link to='/upload'>Upload</Link>
					</li>
				</ul>
			</nav>

			<div className={styles.mainContent}>
				<h1 className={styles.title}>
					{user?.displayName || 'Your'}'s Collection
				</h1>

				<div className={styles.searchContainer}>
					<div className={styles.searchBar}>
						<input
							type='text'
							placeholder='Search your collection...'
							value={searchTerm}
							onChange={handleInputChange}
							onKeyDown={handleKeyDown}
							className={styles.searchInput}
							autoFocus
						/>
						<button onClick={handleSearch} className={styles.searchButton}>
							<img
								src={magnifyingGlass}
								alt='Search'
								className={styles.magnifyingGlass}
							/>
						</button>
					</div>

					<div className={styles.filterContainer}>
						<select className={styles.filterSelect}>
							<option>Name</option>
						</select>
						<select className={styles.filterSelect}>
							<option>Rarity</option>
						</select>
						<select className={styles.filterSelect}>
							<option>Price</option>
						</select>
						<select className={styles.filterSelect}>
							<option>Recent</option>
						</select>
						<select className={styles.filterSelect}>
							<option>Type</option>
						</select>
						<select className={styles.filterSelect}>
							<option>Set</option>
						</select>
					</div>
				</div>

				<div className={styles.cardsGrid}>
					<img
						src={venuEX151}
						alt='Pokemon Card'
						className={styles.cardImage}
					/>
					<img
						src={lugiaSilverT}
						alt='Pokemon Card'
						className={styles.cardImage}
					/>
					<img
						src={charizardex151}
						alt='Pokemon Card'
						className={styles.cardImage}
					/>
					<img
						src={moonbreon}
						alt='Pokemon Card'
						className={styles.cardImage}
					/>
					<img
						src={celebiFusion}
						alt='Pokemon Card'
						className={styles.cardImage}
					/>
					<img
						src={venuEX151}
						alt='Pokemon Card'
						className={styles.cardImage}
					/>
					<img
						src={lugiaSilverT}
						alt='Pokemon Card'
						className={styles.cardImage}
					/>
					<img
						src={charizardex151}
						alt='Pokemon Card'
						className={styles.cardImage}
					/>
					<img
						src={moonbreon}
						alt='Pokemon Card'
						className={styles.cardImage}
					/>
				</div>
			</div>
		</div>
	);

	return user ? <LoggedInView /> : <LoggedOutView />;
};

export default Collection;
