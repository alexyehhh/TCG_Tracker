const express = require('express');
const cors = require('cors');
require('dotenv').config();
const cardPricesRoute = require('./routes/getCardPrices.js');
const cardProfit = require('./routes/getCardProfit.js');
const recognizeCardRoute = require('./routes/recognizeCard.js');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use('/', cardPricesRoute);
app.use('/', cardProfit);
app.use('/', recognizeCardRoute);

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
