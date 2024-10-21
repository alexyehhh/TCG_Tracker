// To run: node testCardPrices.mjs

import dotenv from 'dotenv';
import fetch from 'node-fetch';  // Use standard ES module import

dotenv.config();  // Load environment variables from .env

// Function to get the last 10 sale prices for a specific card using the eBay Finding API
async function getLast10SoldPrices(cardName, cardNumber) {
  try {
    const clientId = process.env.EBAY_CLIENT_ID;
    const token = process.env.EBAY_AUTH_TOKEN;

    // Construct search query for exact match with card name and number
    const searchQuery = `${encodeURIComponent(cardName)} ${encodeURIComponent(cardNumber)}`;

    // eBay Finding API endpoint for completed listings (includes sold items)
    const ebayApiUrl = `https://svcs.ebay.com/services/search/FindingService/v1`
      + `?OPERATION-NAME=findCompletedItems`
      + `&SERVICE-VERSION=1.0.0`
      + `&SECURITY-APPNAME=${clientId}`
      + `&RESPONSE-DATA-FORMAT=JSON`
      + `&REST-PAYLOAD`
      + `&categoryId=183454`
      + `&keywords=${searchQuery}`
      + `&itemFilter(0).name=SoldItemsOnly&itemFilter(0).value=true`
      + `&sortOrder=EndTimeSoonest`
      + `&paginationInput.entriesPerPage=10`;

    const response = await fetch(ebayApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from eBay API: ${response.statusText}`);
    }

    const data = await response.json();

    // Extract sold prices and URLs from the response
    const items = data.findCompletedItemsResponse[0].searchResult[0].item.map(item => ({
      title: item.title[0],
      price: item.sellingStatus[0].currentPrice[0].__value__,
      url: item.viewItemURL[0],
      soldDate: item.listingInfo[0].endTime[0]  // Optional: show the sold date
    }));

    console.log(`Last 10 sold prices for "${cardName} - ${cardNumber}":`);
    items.forEach((item, index) => {
      console.log(`Sale ${index + 1}: ${item.title} - $${item.price} - Sold on: ${item.soldDate} - URL: ${item.url}`);
    });

  } catch (error) {
    console.error('Error fetching sold card prices:', error);
  }
}

// Manually enter the Pokémon card name and number for testing
const cardName = 'Pikachu VMAX';  // Card name
const cardNumber = '188/185';     // Card number

await getLast10SoldPrices(cardName, cardNumber);
