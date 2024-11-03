import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

async function getEBayAccessToken() {
	const clientId = process.env.EBAY_CLIENT_ID;
	const clientSecret = process.env.EBAY_CLIENT_SECRET;

	try {
		const response = await fetch(
			'https://api.ebay.com/identity/v1/oauth2/token',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					Authorization: `Basic ${Buffer.from(
						`${clientId}:${clientSecret}`
					).toString('base64')}`,
				},
				body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope',
			}
		);

		if (!response.ok) {
			const errorText = await response.text();
			let errorData;
			try {
				errorData = JSON.parse(errorText);
			} catch (e) {
				errorData = errorText;
			}
			console.error('Error fetching access token:', response.status, errorData);
			throw new Error(`Failed to fetch token: ${JSON.stringify(errorData)}`);
		}

		const data = await response.json();

		if (!data.access_token) {
			console.error('Access token not found in the response:', data);
			throw new Error('Access token not found in response');
		}

		const expiresAt = Date.now() + data.expires_in * 1000;
		return {
			token: data.access_token,
			expiresAt,
		};
	} catch (error) {
		console.error('Error getting eBay access token:', error);
		throw error;
	}
}

let tokenCache = null;

async function getValidToken() {
	if (tokenCache && Date.now() < tokenCache.expiresAt - 60000) {
		return tokenCache.token;
	}

	const newToken = await getEBayAccessToken();
	tokenCache = newToken;
	return newToken.token;
}

router.get('/card-prices', async (req, res) => {
	console.log('Received price request:', req.query);
	const cardName = req.query.name;
	const cardGrade = req.query.grade;

	if (!cardName) {
		return res.status(400).json({ error: 'Card name is required' });
	}

	try {
		const token = await getValidToken();

		let searchQuery = `${cardName}${cardGrade ? ` ${cardGrade}` : ''}`;
		const ebayApiUrl = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(
			searchQuery
		)}&filter=conditionIds:{1000|1500}&limit=10`;

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

export default router;
