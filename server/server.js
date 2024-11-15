const express = require('express');
const cors = require('cors');
require('dotenv').config();
const cardPricesRoute = require('./routes/getCardPrices.js');
const cardProfit = require('./routes/getCardProfit.js');
const recognizeCardRoute = require('./routes/recognizeCard.js'); // Import the new route


const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use('/', cardPricesRoute);
app.use('/', cardProfit);
app.use('/', recognizeCardRoute); // Add the route for card recognition

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
