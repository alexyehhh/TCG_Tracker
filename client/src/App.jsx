import { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './routes/HomePage/HomePage';
import SignUp from './routes/SignUp/SignUp'; // http://localhost:5173/signup
import SignIn from './routes/SignIn/SignIn'; // http://localhost:5173/signin
import BasicCard from './routes/BasicCard/BasicCard'; // http://localhost:5173/basic-card
import CardDetail from './routes/CardDetail/CardDetail'; // ex for card detail: http://localhost:5173/card-detail/base1-2
import PokemonCards from './routes/PokemonCards/PokemonCards'; // http://localhost:5173/pokemon-cards -> sends to pikachu for default
import ForgotPassword from './routes/ForgotPassword/ForgotPassword'; // http://localhost:5173/forgot-password
// search bar works, and redirects to PokemonCards

function App() {
	return (
		<Router>
			<div className='App'>
				<Routes>
					<Route path='/' element={<HomePage />} />
					<Route path='/signin' element={<SignIn />} />
					<Route path='/signup' element={<SignUp />} />
					{/* <Route path='/forgot-password' element={<ForgotPassword />} /> */}
					<Route path='/basic-card' element={<BasicCard />} />
					<Route path='/card-detail/:id' element={<CardDetail />} />
					<Route path='/pokemon-cards' element={<PokemonCards />} />
				</Routes>
			</div>
		</Router>
	);
}

export default App;
