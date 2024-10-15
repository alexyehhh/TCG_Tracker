// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: process.env.FIREBASE_API_KEY,
	authDomain: 'tcg-tracker-e9d96.firebaseapp.com',
	projectId: 'tcg-tracker-e9d96',
	storageBucket: 'tcg-tracker-e9d96.appspot.com',
	messagingSenderId: '36623944359',
	appId: '1:36623944359:web:29d55d62ebab034bf26982',
	measurementId: 'G-8E8ZXKD70T',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db };
