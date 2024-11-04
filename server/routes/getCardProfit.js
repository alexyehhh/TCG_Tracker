const express = require('express');
const router = express.Router();
// const fetch = require('node-fetch');
// const { getPokemonToken } = require('../util/pkmnAuth.js');

router.get('/card-profit', async (req, res) => {
	console.log('Received profit request:', req.query);
    const salePrice = req.query.salePrice; //float
    const pricePaid = req.query.pricePaid; //float
    const gmeMembership = req.query.pricePaid //bool

	if (!pricePaid) {
		return res.status(400).json({ error: 'Price Paid is required' });
	}

	try {
        const gmeAdditionalFees = 15.99 + (gmeMembership ? 0 : 4.99);
        const gmeProfit =  salePrice - (pricePaid + gmeAdditionalFees);

		res.json({
			gmeProfit: gmeProfit,
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
