import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import collectionReducer from './features/collection/collectionSlice';

const store = configureStore({
	reducer: {
		auth: authReducer,
		collection: collectionReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				// You can customize this to ignore specific paths or actions
				// For example, if 'addedAt' is a Timestamp object:
				// ignoredPaths: ['collection.cards.0.addedAt'] // This is too specific
				// A common approach is to convert Timestamps to ISO strings or numbers in your thunks.
				// If you've done that (as shown in the slice), this might not be strictly needed
				// or can be less aggressive.
				// For now, assuming conversion in slice, default serializableCheck is often fine.
				// If errors persist, you might need:
				ignoredActions: [
					'collection/fetchUserCollection/fulfilled',
					'collection/addCardToFirestore/fulfilled',
					'collection/updateCardInFirestore/fulfilled',
				],
				ignoredPaths: ['collection.cards'], // If cards array contains non-serializable deeply
			},
		}),
});

export default store;
