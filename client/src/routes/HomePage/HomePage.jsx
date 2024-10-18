import React, { useEffect, useRef } from 'react';
import magnifyingGlass from '../../assets/images/magnifyingGlass.png';
import charizard from '../../assets/images/charizard.png';
import './HomePage.css';

export default function HomePage() {
	const cardRef = useRef(null);

	useEffect(() => {
		const card = cardRef.current;

		const handleMouseMove = (e) => {
			const rect = card.getBoundingClientRect();
			const xAxis = (rect.width / 2 - (e.clientX - rect.left)) / 15;
			const yAxis = (rect.height / 2 - (e.clientY - rect.top)) / 15;
			card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg) scale(1.05)`;
		};

		const handleMouseLeave = () => {
			card.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)';
		};

		card.addEventListener('mousemove', handleMouseMove);
		card.addEventListener('mouseleave', handleMouseLeave);

		// Cleanup on component unmount
		return () => {
			card.removeEventListener('mousemove', handleMouseMove);
			card.removeEventListener('mouseleave', handleMouseLeave);
		};
	}, []);
	return (
		<div className='homepage'>
			<div className='background-clip'></div>
			<div className='content-wrapper'>
				<header>
					<nav className='navbar'>
						<div className='navbar-left'></div>
						<ul className='nav-links'>
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
						<div className='navbar-right'>
							<a href='/signin' className='sign-in-btn'>
								Sign in &gt;
							</a>
						</div>
					</nav>
				</header>

				<main className='content-container'>
					<div className='left-content'>
						<h1 className='left-content-title'>
							Find your <br /> Pokémon <br /> Collection's Worth
						</h1>
						<p className='left-content-subtitle'>
							This will change the way you track the prices of your Pokemon
							cards. Search your card below.
						</p>
						<div className='search-bar'>
							<input type='text' placeholder='Search for your card...' />
							<button>
								<img src={magnifyingGlass} alt='Search' width='15px' />
							</button>
						</div>
					</div>

					<div className='right-content'>
						<div className='card' ref={cardRef}>
							<img
								src={charizard}
								alt='Charizard Card'
								className='card-image'
							/>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
