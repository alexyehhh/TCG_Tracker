import { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './routes/HomePage/HomePage';
import SignUp from './routes/SignUp/SignUp';
import SignIn from './routes/SignIn/SignIn';
import BasicCard from './routes/BasicCard/BasicCard';
import CardDetail from './routes/CardDetail/CardDetail';
import PokemonCards from './routes/PokemonCards/PokemonCards';
function App() {
	return (
		<Router>
			<div className='App'>
				<Routes>
					<Route path='/' element={<HomePage />} />
					<Route path='/signin' element={<SignIn />} />
					<Route path='/signup' element={<SignUp />} />
					<Route path='/basic-card' element={<BasicCard />} />
					<Route path='/card-detail/:id' element={<CardDetail />} />
					<Route path='/pokemon-cards' element={<PokemonCards />} />
				</Routes>
			</div>
		</Router>
	);
}

export default App;
