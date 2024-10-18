// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const firebaseAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const firebaseProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const firebaseStorageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;

const firebaseConfig = {
	apiKey: firebaseApiKey,
	authDomain: firebaseAuthDomain,
	projectId: firebaseProjectId,
	storageBucket: firebaseStorageBucket,
	messagingSenderId: '36623944359',
	appId: '1:36623944359:web:29d55d62ebab034bf26982',
	measurementId: 'G-8E8ZXKD70T',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
