import React from 'react';
import { Link } from 'react-router-dom';
import styles from './EmptyCollectionView.module.css';
import PokemonBackground from '../PokemonBackground/PokemonBackground';

// This component displays when the user's collection is empty.
// This provides options to search for or upload cards.

const EmptyCollectionView = () => (
	<div className={styles.container} style={{ backgroundColor: '#fff4fc' }}>
		{/* Pokeball Background color */}
		<PokemonBackground color='#2f213e' />
		{/* Navigation bar */}
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

		{/* Main content for Empty Collection */}
		<div className={`${styles.mainContent} ${styles.emptyState}`}>
			<h1 className={styles.title}>Your Collection is Empty!</h1>
			<p className={styles.emptyMessage}>
				Looks like you haven't added any cards yet. Start building your
				collection by uploading your first card!
			</p>
			<div className={styles.notloggedInBtns}>
				<Link to='/' className={styles.uploadButton}>
					Search a Card
				</Link>
				<Link to='/upload' className={styles.uploadButton}>
					Upload Your First Card
				</Link>
			</div>
		</div>
	</div>
);

export default EmptyCollectionView;
