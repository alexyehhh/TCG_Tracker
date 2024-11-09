import React from 'react';
import { Link } from 'react-router-dom';
import PokemonBackground from '../PokemonBackground/PokemonBackground';
import styles from './PageLayout.module.css';

const PageLayout = ({ children, className }) => {
	return (
		<div className={styles.container}>
			<PokemonBackground color='white' />
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
			<div className={className}>{children}</div>
		</div>
	);
};

export default PageLayout;
