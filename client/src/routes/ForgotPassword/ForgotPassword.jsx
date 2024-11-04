import React, { useState } from 'react';
import { auth } from '../../util/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import styles from './ForgotPassword.module.css';

const ForgotPassword = () => {
	const [email, setEmail] = useState('');
	const [isEmailSent, setIsEmailSent] = useState(false);
	const navigate = useNavigate();

	const handleResetPassword = async (e) => {
		e.preventDefault();
		try {
			await sendPasswordResetEmail(auth, email);
			setIsEmailSent(true);
		} catch (error) {
			console.error('Password Reset Error:', error.message);
		}
	};

	const handleBack = () => {
		navigate(-1);
	};

	return (
		<div className={styles.container}>
			<header>
				<nav className={styles.navbar}>
					<div className={styles.navbarLeft}>
						<button onClick={handleBack} className={styles.backButton}>
							<svg
								className={styles.backIcon}
								viewBox='0 0 1024 1024'
								version='1.1'
								xmlns='http://www.w3.org/2000/svg'>
								<path
									d='M853.333333 469.333333v85.333334H341.333333l234.666667 234.666666-60.586667 60.586667L177.493333 512l337.92-337.92L576 234.666667 341.333333 469.333333h512z'
									fill=''
								/>
							</svg>
							Back
						</button>
					</div>
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
					<div className={styles.navbarRight}></div>
				</nav>
			</header>

			<main className={styles.mainContent}>
				<h1 className={styles.mainTitle}>Reset Password</h1>

				<div className={styles.formContainer}>
					{!isEmailSent ? (
						<>
							<p className={styles.resetInstructions}>
								Enter your email address and we'll send you instructions to
								reset your password.
							</p>
							<form onSubmit={handleResetPassword} className={styles.resetForm}>
								<div className={styles.inputGroup}>
									<label htmlFor='email'>Email address</label>
									<input
										id='email'
										type='email'
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
									/>
								</div>

								<button type='submit' className={styles.resetButton}>
									Send Reset Link
								</button>
							</form>
						</>
					) : (
						<div className={styles.successMessage}>
							<h2>Check your email</h2>
							<p>
								We've sent password reset instructions to{' '}
								<strong>{email}</strong>
							</p>
							<button
								onClick={() => navigate('/login')}
								className={styles.returnToLoginButton}>
								Return to Login
							</button>
						</div>
					)}
				</div>

				<div className={styles.footer}>
					<a href='/login' className={styles.rememberPassword}>
						Remember your password?
					</a>
					<p className={styles.recaptchaText}>
						Secure Password Reset with reCAPTCHA subject to Google{' '}
						<a
							href='https://policies.google.com/terms'
							target='_blank'
							rel='noopener noreferrer'
							className={styles.underline}>
							Terms
						</a>{' '}
						&{' '}
						<a
							href='https://policies.google.com/privacy'
							target='_blank'
							rel='noopener noreferrer'
							className={styles.underline}>
							Privacy
						</a>
					</p>
				</div>
			</main>
		</div>
	);
};

export default ForgotPassword;
