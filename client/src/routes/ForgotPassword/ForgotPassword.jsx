import React, { useState } from 'react';
import { auth } from '../../util/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import styles from './ForgotPassword.module.css';
import leftArrow from '../../assets/images/leftArrow.png';

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
							<img src={leftArrow} alt='Back' className={styles.backIcon} />
							Back
						</button>
					</div>
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
								onClick={() => navigate('/signin')}
								className={styles.returnToLoginButton}>
								Return to Login
							</button>
						</div>
					)}
				</div>

				<div className={styles.footer}>
					<a href='/signin' className={styles.rememberPassword}>
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
