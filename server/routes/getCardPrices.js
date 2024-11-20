const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { getValidToken } = require('../util/ebayAuth.js');

router.get('/card-prices', async (req, res) => {
	console.log('Received price request:', req.query);
	const cardName = req.query.name;
	const cardGrade = req.query.grade;
	const cardNumber = parseInt(req.query.number);
	const cardTotal = parseInt(req.query.total);
	const cardSet = req.query.set;

	console.log('Card total:', cardTotal);
	console.log('Card number:', cardNumber);

	if (!cardName) {
		return res.status(400).json({ error: 'Card name is required' });
	}

	try {
		const token = await getValidToken();
		const formattedTotal =
			cardTotal < 100 && cardNumber > cardTotal ? `0${cardTotal}` : cardTotal;

		let searchQuery = `${cardName} ${cardSet} ${cardNumber}/${formattedTotal} ${
			cardGrade ? ` ${cardGrade}` : ''
		}`;

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
		const prices = data.itemSummaries
			? data.itemSummaries
					.map((item) => parseFloat(item.price.value))
					.filter((price) => !isNaN(price))
			: [];

		const averagePrice =
			prices.length > 0
				? (
						prices.reduce((acc, price) => acc + price, 0) / prices.length
				  ).toFixed(2)
				: 'N/A';

		res.json({
			cardName: cardName,
			grade: cardGrade || 'ungraded',
			averagePrice: averagePrice,
			numberOfPrices: prices.length,
		});
	} catch (error) {
		console.error('Error fetching card prices:', error);
		res.status(500).json({
			error: 'Failed to fetch card prices',
			details: error.message,
		});
	}
});

module.exports = router;
