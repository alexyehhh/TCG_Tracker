import React from 'react';
import { Link } from 'react-router-dom';
import PokemonBackground from '../PokemonBackground/PokemonBackground';
import styles from './PageLayout.module.css';

// This component gives a general layout component for our pages
// Includes a navigation bar and background, w/ content passed as children

const PageLayout = ({ children, className }) => {
	return (
		<div className={styles.container}>
			{/* Pokeball background component */}
			<PokemonBackground color='white' />
			
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
				</ul>
			</nav>
			{/* Renders child components w/ additional styling if provided */}
			<div className={className}>{children}</div>
		</div>
	);
};

export default PageLayout;
