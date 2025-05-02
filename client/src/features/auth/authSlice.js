import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	isLoggedIn: false,
	user: null,
};

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		login: (state, action) => {
			state.isLoggedIn = true;
			state.user = action.payload;
		},
		logout: (state) => {
			state.isLoggedIn = false;
			state.user = null;
		},
	},
});

// Export action creators
export const { login, logout } = authSlice.actions;

// Export selectors
export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;
export const selectUser = (state) => state.auth.user;

// Export reducer
export default authSlice.reducer;
