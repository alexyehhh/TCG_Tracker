const express = require('express');
const router = express.Router();

router.get('/card-profit', async (req, res) => {
	console.log('Received profit request:', req.query);
	const salePrice = parseFloat(req.query.salePrice);
	const pricePaid = parseFloat(req.query.pricePaid);
	const gmeMembership = req.query.gmeMembership === 'true';
	const expeditedTurnaround = req.query.expeditedTurnaround === 'true';

	if (pricePaid === undefined || isNaN(pricePaid)) {
		return res.status(400).json({ error: 'Price Paid is required' });
	}

	if (expeditedTurnaround && salePrice > 500) {
		return res
			.status(400)
			.json({
				error:
					'Expedited Turnaround is only available for cards with a sale price of $500 or less.',
			});
	}

	try {
		// GME Profit Calculation
		const gmeAdditionalFees = 15.99 + (gmeMembership ? 0 : 4.99);
		const gmeProfit = salePrice - (pricePaid + gmeAdditionalFees);

		// PSA Profit Calculation
		let psaGradingCost;
		if (salePrice <= 500) {
			psaGradingCost = expeditedTurnaround ? 39.99 : 24.99;
		} else if (salePrice <= 1500) {
			psaGradingCost = 74.99;
		} else if (salePrice <= 2500) {
			psaGradingCost = 129.0;
		} else if (salePrice <= 5000) {
			psaGradingCost = 249.0;
		} else if (salePrice <= 10000) {
			psaGradingCost = 499.0;
		} else {
			psaGradingCost = 0; // Assuming no grading cost for cards over $10,000
		}

		const psaProfit = salePrice - (pricePaid + psaGradingCost);

		res.json({
			gmeProfit: gmeProfit,
			psaProfit: psaProfit,
		});
	} catch (error) {
		console.error('Error fetching card profit:', error);
		res.status(500).json({
			error: 'Failed to fetch card profit',
			details: error.message,
		});
	}
});

module.exports = router;
