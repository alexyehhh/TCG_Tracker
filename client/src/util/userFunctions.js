import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../util/firebase';

export const createDocument = async (user) => {
	try {
		const userDocRef = doc(db, 'users', user.uid);
		const userDoc = await getDoc(userDocRef);

		if (!userDoc.exists()) {
			await setDoc(userDocRef, {
				email: user.email,
				name: user.displayName || email.split('@')[0],
				createdAt: new Date(),
			});
			console.log('New user document created');
		} else {
			console.log('User document already exists');
		}
	} catch (error) {
		console.error('Error handling user document:', error.message);
	}
};
