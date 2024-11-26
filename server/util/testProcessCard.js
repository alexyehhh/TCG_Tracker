// const axios = require('axios');
// const fs = require('fs');
// const path = require('path');  // If you still need it for other purposes
// const { processCard } = require('../util/processCard.js');  // Update the path accordingly
// const pokemon = require('pokemontcgsdk');

// async function testImageProcessing(imageUrl) {
//     try {
//         // Fetch the image from the URL
//         const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });

//         // Get the image buffer
//         const imageBuffer = Buffer.from(response.data);

//         // Run the image processing function
//         const result = await processCard(imageBuffer);

//         // Check the result
//         if (result.error) {
//             console.error("Error:", result.error);
//         } else {
//             // console.log("Matches:", result.matches);
//             console.log("Search Query:", result.searchQuery);
//         }
//     } catch (error) {
//         console.error("Error processing image:", error.message);
//     }
// }

// // testImageProcessing('https://images.pokemontcg.io/xy0/9_hires.png');

// async function run(){
//     pokemon.card.where({ pageSize: 10, page: 3 })
//         .then(result => {
//             const cardDetails = result.data.slice(0, 10).map(card => ({
//             name: card.name,
//             id: card.id,
//             imageUrl: card.images.large
//             }));
        
//         for (let i = 0; i < cardDetails.length; i++) {
//         const card = cardDetails[i];
        
//         // Call processCard with the imageUrl
//         testImageProcessing(card.imageUrl);
        
//         // Output the card name
//         // console.log(card.name);
//       }
    
//     // console.log(cardDetails); // You can inspect the array of paired data
//   });
// }

// run()
const axios = require('axios');
const fs = require('fs');
const path = require('path'); // If you still need it for other purposes
const { processCard } = require('../util/processCard.js'); // Update the path accordingly
const pokemon = require('pokemontcgsdk');

async function clearFile() {
    const filePath = path.join(__dirname, 'search_results.txt');
    
    try {
        // Clear the file (overwrite with an empty string)
        fs.writeFileSync(filePath, '');
        console.log('File cleared successfully.');
    } catch (error) {
        console.error("Error clearing the file:", error.message);
    }
}

// Function to append results to a file
async function writeToFile(cardName, cardId, searchQuery, img) {
    const filePath = path.join(__dirname, 'search_results.txt'); // File path to write the data
    const data = `Name: ${cardName}, ID: ${cardId}, Search Query: ${searchQuery}, Img: ${img}\n`;
    
    try {
        // Append the data to the file
        fs.appendFileSync(filePath, data);
    } catch (error) {
        console.error("Error writing to file:", error.message);
    }
}

async function testImageProcessing(imageUrl, cardName, cardId) {
    try {
        // Fetch the image from the URL
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });

        // Get the image buffer
        const imageBuffer = Buffer.from(response.data);

        // Run the image processing function
        const result = await processCard(imageBuffer);

        // Check the result
        if (result.error) {
            console.error("Error:", result.error);
        } else {
            console.log("Search Query:", result.searchQuery);

            // Write the result to a file
            await writeToFile(cardName, cardId, result.searchQuery, imageUrl);
        }
    } catch (error) {
        console.error("Error processing image:", error.message);
    }
}

async function run() {
    try {
        await clearFile();

        const randomPageNumber = Math.floor(Math.random() * 100) + 1;
        const result = await pokemon.card.where({ pageSize: 10, page: randomPageNumber });
        const cardDetails = result.data.slice(0, 10).map(card => ({
            name: card.name,
            id: card.id,
            imageUrl: card.images.large
        }));

        // Create an array of promises to process all cards
        const processingPromises = cardDetails.map(card => {
            return testImageProcessing(card.imageUrl, card.name, card.id); // Pass name and ID to the function
        });

        // Wait for all image processing tasks to complete
        await Promise.all(processingPromises);

        console.log("All images have been processed.");
    } catch (error) {
        console.error("Error in run function:", error.message);
    }
}

run();
