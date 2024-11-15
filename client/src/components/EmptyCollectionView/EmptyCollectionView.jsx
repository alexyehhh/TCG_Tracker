import React from 'react';
import { Link } from 'react-router-dom';
import styles from './EmptyCollectionView.module.css';
import PokemonBackground from '../PokemonBackground/PokemonBackground';

const EmptyCollectionView = () => (
	<div className={styles.container} style={{ backgroundColor: '#fff4fc' }}>
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
			</ul>
		</nav>
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