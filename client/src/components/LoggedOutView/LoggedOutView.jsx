import React from 'react';
import styles from './LoggedOutView.module.css';
import PokemonBackground from '../../components/PokemonBackground/PokemonBackground';
import charizardex151 from '../../assets/images/charizardex151.png';
import celebiFusion from '../../assets/images/celebiFusion.png';
import lugiaSilverT from '../../assets/images/lugiaSilverT.png';
import moonbreon from '../../assets/images/moonbreon.jpg';
import venuEX151 from '../../assets/images/venuEX151.png';
import { useNavigate, Link } from 'react-router-dom';

export default function LoggedOutView() {
	const navigate = useNavigate();

	const handleLogin = () => {
		navigate('/login');
	};

	return (
		<div
			className={styles.container}
			style={{
				backgroundColor: '#8874b4',
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
						<Link to='/bulk-grading'>Bulk Grading</Link>
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
}
