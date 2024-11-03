import express from 'express';
import cors from 'cors';
import cardPricesRoute from './getCardPrices.mjs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(cardPricesRoute);

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
