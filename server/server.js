// server.js (backend file)
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 3001;

// Function to get OAuth token from eBay API using client ID and secret
async function getEBayAccessToken() {
    const clientId = process.env.EBAY_CLIENT_ID;
    const clientSecret = process.env.EBAY_CLIENT_SECRET;
    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${authString}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope'
    });

    if (!response.ok) {
        throw new Error(`Failed to get OAuth token: ${response.statusText}`);
    }

    const tokenData = await response.json();
    return tokenData.access_token;
}

// Endpoint to get the last 10 sales of a Pokémon card
app.get('/api/card-prices', async (req, res) => {
    const cardName = req.query.name;

    if (!cardName) {
        return res.status(400).json({ error: 'Card name is required' });
    }

    try {
        // Get OAuth token
        const token = await getEBayAccessToken();
        
        // eBay Browse API to search for items
        const ebayApiUrl = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(cardName)}&filter=conditionIds:{1000|1500}&limit=10`;

        const response = await fetch(ebayApiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch from eBay API: ${response.statusText}`);
        }

        const data = await response.json();

        // Extract prices from the response
        const prices = data.itemSummaries.map(item => item.price.value);

        res.json({ cardName: cardName, prices: prices });
    } catch (error) {
        console.error('Error fetching card prices:', error);
        res.status(500).json({ error: 'Failed to fetch card prices' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
