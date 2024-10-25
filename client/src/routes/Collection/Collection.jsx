import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Search } from 'lucide-react';
import styles from './Collection.module.css';

const Collection = () => {
	const [user, setUser] = useState(null);
	const auth = getAuth();

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setUser(user);
		});
		return () => unsubscribe();
	}, []);

	const LoggedOutView = () => (
		<div className={styles.container}>
			<nav className={styles.navbar}>
				<ul className={styles.navLinks}>
					<li>
						<a href='/search'>Search</a>
					</li>
					<li>
						<a href='/collection'>Collection</a>
					</li>
					<li>
						<a href='/upload'>Upload</a>
					</li>
				</ul>
			</nav>

			<div className={styles.loggedOutContent}>
				<div className={styles.previewGrid}>
					<img
						src='/api/placeholder/200/280'
						alt='Venusaur Card'
						className={styles.cardImage}
					/>
					<img
						src='/api/placeholder/200/280'
						alt='Lugia Card'
						className={styles.cardImage}
					/>
					<img
						src='/api/placeholder/200/280'
						alt='Charizard Card'
						className={styles.cardImage}
					/>
					<img
						src='/api/placeholder/200/280'
						alt='Dark Pokemon Card'
						className={styles.cardImage}
					/>
					<img
						src='/api/placeholder/200/280'
						alt='Celebi Card'
						className={styles.cardImage}
					/>
				</div>

				<h2 className={styles.loginMessage}>Log in to view your collection.</h2>
				<button className={styles.loginButton}>Log in</button>
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
			<nav className={styles.navbar}>
				<ul className={styles.navLinks}>
					<li>
						<a href='/search'>Search</a>
					</li>
					<li>
						<a href='/collection'>Collection</a>
					</li>
					<li>
						<a href='/upload'>Upload</a>
					</li>
				</ul>
			</nav>

			<div className={styles.mainContent}>
				<h1 className={styles.title}>
					{user?.displayName || 'Your'}'s Collection
				</h1>

				<div className={styles.searchContainer}>
					<div className={styles.searchWrapper}>
						<input
							type='text'
							placeholder='Search your collection...'
							className={styles.searchInput}
						/>
						<Search className={styles.searchIcon} size={20} />
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
					</div>
				</div>

				<div className={styles.cardsGrid}>
					<img
						src='/api/placeholder/280/400'
						alt='Pokemon Card'
						className={styles.cardImage}
					/>
					<img
						src='/api/placeholder/280/400'
						alt='Pokemon Card'
						className={styles.cardImage}
					/>
					<img
						src='/api/placeholder/280/400'
						alt='Pokemon Card'
						className={styles.cardImage}
					/>
					<img
						src='/api/placeholder/280/400'
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
