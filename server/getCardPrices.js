app.get('/api/card-prices', async (req, res) => {
    const cardName = req.query.name;
    const cardGrade = req.query.grade; // Get the grade from query parameters

    if (!cardName) {
        return res.status(400).json({ error: 'Card name is required' });
    }

    try {
        // Get OAuth token
        const token = await getEBayAccessToken();
        
        // eBay Browse API to search for items
        const ebayApiUrl = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(cardName)}&filter=conditionIds:{1000|1500}&limit=10${cardGrade ? `&filter=grade:${encodeURIComponent(cardGrade)}` : ''}`;

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
        const prices = data.itemSummaries.map(item => parseFloat(item.price.value));

        // Calculate the average of the last 10 prices
        const averagePrice = prices.length > 0 ? (prices.reduce((acc, price) => acc + price, 0) / prices.length).toFixed(2) : 0;

        res.json({ cardName: cardName, averagePrice: averagePrice });
    } catch (error) {
        console.error('Error fetching card prices:', error);
        res.status(500).json({ error: 'Failed to fetch card prices' });
    }
});
