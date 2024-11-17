import React from 'react';
import { describe, test, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Provides context for useNavigate and other routing-related hooks
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';

describe('Basic Jest Test', () => {
	test('adds 1 + 2 to equal 3', () => {
		expect(1 + 2).toBe(3);
	});
});

test('renders the correct text on the homepage', () => {
	render(
		<MemoryRouter>
			<HomePage />
		</MemoryRouter>
	);

	const displayedText = screen.getByText(
		/This will change the way you track the prices of your Pokemon cards. Search your card below./i
	);

	expect(displayedText).toBeInTheDocument();
});
