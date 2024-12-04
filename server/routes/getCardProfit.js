const express = require('express');
const router = express.Router();

router.get('/card-profit', async (req, res) => {
	console.log('Received profit request:', req.query);
	const salePrice = parseFloat(req.query.salePrice);
	const pricePaid = parseFloat(req.query.pricePaid);
	const gmeMembership = req.query.gmeMembership === 'true';
	const expeditedTurnaround = req.query.expeditedTurnaround === 'true';

	// if salePrice or pricePaid is not a number, return an error
	if (pricePaid === undefined || isNaN(pricePaid)) {
		return res.status(400).json({ error: 'Price Paid is required' });
	}

	// if a user selects expedited turnaround, the sale price must be less than or equal to $500
	if (expeditedTurnaround && salePrice > 500) {
		return res
			.status(400)
			.json({
				error:
					'Expedited Turnaround is only available for cards with a sale price of $500 or less.',
			});
	}

	try {
		// GameStop Profit Calculation
		const gmeAdditionalFees = 15.99 + (gmeMembership ? 0 : 4.99); // If GME membership is not present, add $4.99 for shipping
		const gmeProfit = salePrice - (pricePaid + gmeAdditionalFees); // Formula to calculate GME profit

		// PSA Profit Calculation

		// Determine PSA grading cost based on sale price
		let psaGradingCost;
		if (salePrice <= 500) {
			psaGradingCost = expeditedTurnaround ? 39.99 : 24.99; // If expedited turnaround is selected, grading cost is $39.99, else $24.99
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

		// Formula to calculate PSA profit
		const psaProfit = salePrice - (pricePaid + psaGradingCost);
		
		// Bulk Grading Cost/Profit Calculation
		
		// Determine bulk grading cost based on sale price
		let bulkGradingCost;
		if (salePrice <= 200){
			bulkGradingCost = 14.99;
		}
		else if (salePrice <= 500){
			bulkGradingCost = 18.99;
		}

		const bulkGradingProfit = salePrice - (pricePaid + bulkGradingCost); // Formula to calculate bulk grading profit

		res.json({
			gmeProfit: gmeProfit,
			psaProfit: psaProfit,
			bulkGradingProfit: bulkGradingProfit,
			bulkGradingCost: bulkGradingCost,
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
