// Function to get the last 10 sale prices for a specific card using the eBay Finding API
async function getLast10SoldPrices(cardName, cardNumber, cardGrade) {
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
      + `&itemFilter(1).name=Condition&itemFilter(1).value=${cardGrade}` // Add filter for grade
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

    // Extract sold prices from the response
    const items = data.findCompletedItemsResponse[0].searchResult[0].item.map(item => parseFloat(item.sellingStatus[0].currentPrice[0].__value__));

    // Calculate the average of the last 10 sold prices
    const averagePrice = items.length > 0 ? (items.reduce((acc, price) => acc + price, 0) / items.length).toFixed(2) : 0;

    console.log(`Average of last 10 sold prices for "${cardName} - ${cardNumber} - Grade: ${cardGrade}": $${averagePrice}`);

  } catch (error) {
    console.error('Error fetching sold card prices:', error);
  }
}

// Manually enter the Pokémon card name, number, and grade for testing
const cardName = 'Pikachu VMAX';  // Card name
const cardNumber = '188/185';     // Card number
const cardGrade = 'PSA 10';       // Card grade (example)

await getLast10SoldPrices(cardName, cardNumber, cardGrade);
