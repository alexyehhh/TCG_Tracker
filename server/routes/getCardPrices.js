const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { getValidToken } = require('../util/ebayAuth.js');

router.get('/card-prices', async (req, res) => {
	console.log('Received price request:', req.query);

	const cardName = req.query.name;
	const cardGrade = req.query.grade;
	const cardNumber = req.query.number;
	const cardTotal = req.query.total;
	const cardSet = req.query.set;

	console.log('Card total:', cardTotal);
	console.log('Card number:', cardNumber);

	if (!cardName) {
		return res.status(400).json({ error: 'Card name is required' });
	}

	try {
		const token = await getValidToken();
		let formattedTotal;

		// If both numbers are integers
		if (
			Number.isInteger(parseInt(cardTotal)) &&
			Number.isInteger(parseInt(cardNumber))
		) {
			formattedTotal =
				// If the card total is less than 100 and the card number is greater than the total
				parseInt(cardTotal) < 100 && parseInt(cardNumber) > parseInt(cardTotal)
					? `0${cardTotal}`
					: cardTotal;
		} else {
			// Handle special cases for card numbers that start with 'GG'
			if (cardNumber.substring(0, 2) == 'GG') {
				formattedTotal = `GG${cardTotal}`;
			} else {
				formattedTotal = cardTotal;
			}
		}

		let searchQuery = `${cardName} ${cardSet} ${cardNumber}/${formattedTotal} ${
			cardGrade ? ` ${cardGrade}` : ''
		}`;

		// Search query for 10 most recent listings
		console.log('Search query:', searchQuery);

		const ebayApiUrl =
			'https://api.ebay.com/buy/browse/v1/item_summary/search?' +
			`q=${encodeURIComponent(searchQuery)}` +
			`&limit=10`;

		const response = await fetch(ebayApiUrl, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
				'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
			},
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Failed to fetch from eBay API: ${errorText}`);
		}

		const data = await response.json();
		let prices = [];
		let filteredListings = [];

		// If we have any items, extract prices
		if (data.itemSummaries && data.itemSummaries.length > 0) {
			data.itemSummaries.forEach((item) => {
				const price = parseFloat(item.price.value);
				if (!isNaN(price)) {
					prices.push(price);
				}
			});

			// Calculate median price
			const sortedPrices = [...prices].sort((a, b) => a - b);
			const median =
				sortedPrices.length % 2 === 0
					? (sortedPrices[sortedPrices.length / 2 - 1] +
							sortedPrices[sortedPrices.length / 2]) /
					  2
					: sortedPrices[Math.floor(sortedPrices.length / 2)];

			// Filter out outliers and collect filtered listings
			data.itemSummaries.forEach((item, index) => {
				const price = parseFloat(item.price.value);
				const percentDiff = Math.abs(((price - median) / median) * 100);
				if (percentDiff <= 50) {
					filteredListings.push({
						title: item.title,
						price: price,
						url: item.itemWebUrl,
					});
				} else {
				}
			});

			// Calculate average from filtered prices
			const filteredPrices = filteredListings.map((item) => item.price);
			const averagePrice =
				filteredPrices.length > 0
					? (
							filteredPrices.reduce((acc, price) => acc + price, 0) /
							filteredPrices.length
					  ).toFixed(2)
					: 'N/A';

			console.log(`\nMedian price: $${median.toFixed(2)}`);
			console.log(`Filtered average price: $${averagePrice}`);
			console.log(
				`Listings used: ${filteredPrices.length} out of ${prices.length}`
			);

			res.json({
				cardName: cardName,
				grade: cardGrade || 'ungraded',
				averagePrice: averagePrice,
				numberOfPrices: filteredPrices.length,
				totalListings: prices.length,
				medianPrice: median.toFixed(2),
				listings: filteredListings,
			});
		} else {
			// Handle case where no items were found
			res.json({
				cardName: cardName,
				grade: cardGrade || 'ungraded',
				averagePrice: 'N/A',
				numberOfPrices: 0,
				totalListings: 0,
				medianPrice: 'N/A',
				listings: [],
			});
		}
	} catch (error) {
		console.error('Error fetching card prices:', error);
		res.status(500).json({
			error: 'Failed to fetch card prices',
			details: error.message,
		});
	}
});

module.exports = router;
