const express = require('express');
const cors = require('cors');
require('dotenv').config();
const cardPricesRoute = require('./routes/getCardPrices.js');
const cardProfit = require('./routes/getCardProfit.js');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use('/', cardPricesRoute);
app.use('/', cardProfit);

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
