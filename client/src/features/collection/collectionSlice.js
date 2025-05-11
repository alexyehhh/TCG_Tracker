import {
	createSlice,
	createAsyncThunk,
	createSelector,
} from '@reduxjs/toolkit';
import { db } from '../../util/firebase';
import {
	collection,
	query,
	where,
	getDocs,
	doc,
	updateDoc,
	deleteDoc,
	setDoc,
	getDoc,
} from 'firebase/firestore';

const initialState = {
	cards: [],
	status: 'idle',
	error: null,
};

// Async thunk to fetch the user's card collection
export const fetchUserCollection = createAsyncThunk(
	'collection/fetchUserCollection',
	async (userId, { rejectWithValue }) => {
		// userId here should be the Firebase Auth UID, assuming your Firestore is structured as /users/{uid}/cards
		if (!userId) {
			return rejectWithValue('No user ID provided');
		}
		try {
			const cardsRef = collection(db, `users/${userId}/cards`);
			const querySnapshot = await getDocs(cardsRef);
			const cardsList = [];
			querySnapshot.forEach((docSnapshot) => {
				const cardData = docSnapshot.data();
				// Convert Firestore Timestamps to ISO strings or milliseconds
				const addedAt = cardData.addedAt?.toDate
					? cardData.addedAt.toDate().toISOString()
					: null;
				const lastUpdated = cardData.lastUpdated?.toDate
					? cardData.lastUpdated.toDate().toISOString()
					: null;

				cardsList.push({
					id: docSnapshot.id,
					...cardData,
					addedAt, // Store as serializable format
					lastUpdated, // Store as serializable format
				});
			});
			// Sort by date added, newest first
			cardsList.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
			return cardsList;
		} catch (error) {
			console.error('Error fetching collection:', error);
			return rejectWithValue(error.message);
		}
	}
);

// Async thunk to add a card to the collection (will be used by CardDetail page)
export const addCardToFirestore = createAsyncThunk(
	'collection/addCardToFirestore',
	async ({ userId, cardId, cardData }, { rejectWithValue }) => {
		if (!userId) return rejectWithValue('No user ID');
		try {
			const cardDocRef = doc(db, `users/${userId}/cards/${cardId}`);
			// Ensure addedAt and lastUpdated are serializable if they are Timestamps
			const serializableCardData = {
				...cardData,
				addedAt: cardData.addedAt?.toDate
					? cardData.addedAt.toDate().toISOString()
					: new Date().toISOString(),
				lastUpdated: cardData.lastUpdated?.toDate
					? cardData.lastUpdated.toDate().toISOString()
					: new Date().toISOString(),
			};
			await setDoc(cardDocRef, serializableCardData);
			return { id: cardId, ...serializableCardData };
		} catch (error) {
			console.error('Error adding card:', error);
			return rejectWithValue(error.message);
		}
	}
);

// Async thunk to remove a card from the collection
export const removeCardFromFirestore = createAsyncThunk(
	'collection/removeCardFromFirestore',
	async ({ userId, cardId }, { rejectWithValue }) => {
		if (!userId) return rejectWithValue('No user ID');
		try {
			const cardDocRef = doc(db, `users/${userId}/cards/${cardId}`);
			await deleteDoc(cardDocRef);
			return cardId; // Return the ID of the removed card for optimistic update
		} catch (error) {
			console.error('Error removing card:', error);
			return rejectWithValue(error.message);
		}
	}
);

// Async thunk to update a card in the collection
export const updateCardInFirestore = createAsyncThunk(
	'collection/updateCardInFirestore',
	async ({ userId, cardId, updateData }, { rejectWithValue }) => {
		if (!userId) return rejectWithValue('No user ID');
		try {
			const cardDocRef = doc(db, `users/${userId}/cards/${cardId}`);
			const serializableUpdateData = {
				...updateData,
				lastUpdated: new Date().toISOString(), // Always update lastUpdated timestamp
			};
			await updateDoc(cardDocRef, serializableUpdateData);
			return { cardId, updatedFields: serializableUpdateData };
		} catch (error) {
			console.error('Error updating card:', error);
			return rejectWithValue(error.message);
		}
	}
);

const collectionSlice = createSlice({
	name: 'collection',
	initialState,
	reducers: {
		// Action to clear collection on logout
		clearCollection: (state) => {
			state.cards = [];
			state.status = 'idle';
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			// Fetch Collection
			.addCase(fetchUserCollection.pending, (state) => {
				state.status = 'loading';
				state.error = null;
			})
			.addCase(fetchUserCollection.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.cards = action.payload;
			})
			.addCase(fetchUserCollection.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload;
			})
			// Add Card
			.addCase(addCardToFirestore.fulfilled, (state, action) => {
				// Add card and re-sort, or simply refetch. For now, add and assume client-side sort is okay.
				state.cards.unshift(action.payload); // Add to beginning
				state.cards.sort(
					(a, b) => new Date(b.addedAt) - new Date(a.addedAt)
				);
				state.status = 'succeeded'; // if it was pending from another op
			})
			.addCase(addCardToFirestore.rejected, (state, action) => {
				state.error = action.payload; // Handle error for adding card
			})
			// Remove Card
			.addCase(removeCardFromFirestore.fulfilled, (state, action) => {
				state.cards = state.cards.filter(
					(card) => card.id !== action.payload
				);
				state.status = 'succeeded';
			})
			.addCase(removeCardFromFirestore.rejected, (state, action) => {
				state.error = action.payload;
			})
			// Update Card
			.addCase(updateCardInFirestore.fulfilled, (state, action) => {
				const index = state.cards.findIndex(
					(card) => card.id === action.payload.cardId
				);
				if (index !== -1) {
					state.cards[index] = {
						...state.cards[index],
						...action.payload.updatedFields,
					};
				}
				state.status = 'succeeded';
			})
			.addCase(updateCardInFirestore.rejected, (state, action) => {
				state.error = action.payload;
			});
	},
});

export const { clearCollection } = collectionSlice.actions;

// Basic Selectors
const selectCollectionSlice = (state) => state.collection; // Select the whole slice

export const selectAllCollectionCards = createSelector(
	[selectCollectionSlice],
	(collectionState) => collectionState.cards // Gets cards from the slice
);

export const selectCollectionStatus = createSelector(
	[selectCollectionSlice],
	(collectionState) => collectionState.status
);

export const selectCollectionError = createSelector(
	[selectCollectionSlice],
	(collectionState) => collectionState.error
);

// Memoized selector for total collection value
export const selectCollectionTotalValue = createSelector(
	[selectAllCollectionCards], // Input selector: depends only on the cards array
	(cards) => {
		// Result function: re-runs only if 'cards' reference changes
		console.log('Calculating total value...');
		return cards.reduce((total, card) => {
			return (
				total +
				(card.selectedPrice && card.selectedPrice !== 'N/A'
					? parseFloat(card.selectedPrice)
					: 0)
			);
		}, 0);
	}
);

// Memoized selector for graph data
export const selectCollectionGraphData = createSelector(
	[selectAllCollectionCards], // Input selector: depends only on the cards array
	(cards) => {
		// Result function: re-runs only if 'cards' reference changes
		console.log('Calculating graph data...'); // For debugging: see when it runs
		const totalPricesByDate = {};
		cards.forEach((card) => {
			const priceHistory = card.priceHistory || [];
			priceHistory.forEach((entry) => {
				if (
					entry &&
					typeof entry === 'object' &&
					Object.keys(entry).length > 0
				) {
					const [date, price] = Object.entries(entry)[0];
					const numericPrice = parseFloat(price);
					if (!isNaN(numericPrice)) {
						totalPricesByDate[date] =
							(totalPricesByDate[date] || 0) + numericPrice;
					}
				}
			});
		});

		const sortedEntries = Object.entries(totalPricesByDate).sort(
			([dateA], [dateB]) => new Date(dateA) - new Date(dateB)
		);

		let cumulativeTotal = 0;
		return sortedEntries.map(([date, dailyTotal]) => {
			cumulativeTotal += dailyTotal;
			return { date, total: cumulativeTotal };
		});
	}
);

export default collectionSlice.reducer;
