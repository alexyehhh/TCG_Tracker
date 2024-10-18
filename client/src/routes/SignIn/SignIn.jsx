// SignIn.jsx
import React, { useState } from 'react';
import { auth, googleProvider } from '../../util/firebase';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const navigate = useNavigate();

	const handleGoogleSignIn = async () => {
		try {
			await signInWithPopup(auth, googleProvider);
			console.log('Signed In with google');
			navigate('/');
		} catch (error) {
			console.error('Google Sign-In Error:', error.message);
		}
	};

	const handleLogin = async () => {
		try {
			await signInWithEmailAndPassword(auth, email, password);
			console.log('Signed In with user and pass');
			navigate('/');
		} catch (error) {
			console.error('Login Error:', error.message);
		}
	};

	return (
		<div style={{ textAlign: 'center', marginTop: '50px' }}>
			<h2>Sign In</h2>
			<input
				type='email'
				placeholder='Email'
				value={email}
				onChange={(e) => setEmail(e.target.value)}
			/>
			<input
				type='password'
				placeholder='Password'
				value={password}
				onChange={(e) => setPassword(e.target.value)}
			/>
			<button onClick={handleLogin}>Log In</button>
			<button onClick={handleGoogleSignIn}>Sign In with Google</button>
			<p>
				Don't have an account? <a href='/signup'>Sign Up</a>
			</p>
		</div>
	);
};

export default SignIn;
