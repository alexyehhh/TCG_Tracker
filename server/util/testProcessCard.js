// run()
const axios = require('axios');
const fs = require('fs');
const path = require('path'); // If you still need it for other purposes
const { processCard } = require('../util/processCard.js'); // Update the path accordingly
const pokemon = require('pokemontcgsdk');

let mismatchCount = 0;
let failureCount = 0;

async function clearFile() {
    const filePath = path.join(__dirname, 'search_results.txt');
    
    try {
        // Clear the file (overwrite with an empty string)
        fs.writeFileSync(filePath, '');
        // console.log('File cleared successfully.');
    } catch (error) {
        console.error("Error clearing the file:", error.message);
    }
}

// Function to append results to a file
async function writeToFile(cardName, cardId, searchQuery, img, name, fail) {
    const filePath = path.join(__dirname, 'search_results.txt'); // File path to write the data

    // Check if cardName and name are different (case-insensitive)
    // const mismatchPrefix = cardName.trim().toLowerCase() !== name.trim().toLowerCase() ? "MISMATCH: " : "";
    const failure = fail == true ? "Image could not be processed! " : "";

    // If there is a mismatch, increment the mismatch counter
    // if (mismatchPrefix) {
    //     mismatchCount++;
    // }

    if (failure) {
        failureCount++;
    }

    // Construct the data string
    const data = `${failure}Name: ${cardName}, ID: ${cardId}, Search Query: ${searchQuery}, Img: ${img}\n`;

    try {
        // Use fs.promises.appendFile() to append data asynchronously
        await fs.promises.appendFile(filePath, data);
    } catch (error) {
        console.error("Error writing to file:", error.message);
    }
}

// async function appendMismatchCount(numCards) {
//     const filePath = path.join(__dirname, 'search_results.txt');
//     const mismatchData = `\nTotal Mismatches: ${mismatchCount}/${numCards} cards checked\n`;

//     try {
//         // Append the mismatch count at the end of the file
//         await fs.promises.appendFile(filePath, mismatchData);
//         console.log('Mismatch count appended to file.');
//     } catch (error) {
//         console.error("Error appending mismatch count to file:", error.message);
//     }
// }

async function appendFailureCount(numCards) {
    const filePath = path.join(__dirname, 'search_results.txt');
    const mismatchData = `\nTotal Failures: ${failureCount}/${numCards} cards checked\n`;

    try {
        // Append the mismatch count at the end of the file
        await fs.promises.appendFile(filePath, mismatchData);
        console.log('Failure count appended to file.');
    } catch (error) {
        console.error("Error appending failure count to file:", error.message);
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
            // console.log("Search Query:", result.searchQuery);         

            // Write the result to a file
            await writeToFile(cardName, cardId, result.searchQuery, imageUrl, result.foundName, result.fail);
        }
    } catch (error) {
        console.error("Error processing image:", error.message);
    }
}

async function run() {
    try {
        await clearFile();
        console.log("Tests begin")

        const randomPageNumber = Math.floor(Math.random() * 100) + 1;
        const pSize = 100;
        const result = await pokemon.card.where({ pageSize: pSize, page: randomPageNumber });
        const cardDetails = result.data.slice(0, pSize).map(card => ({
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
        // await appendMismatchCount(pSize);
        await appendFailureCount(pSize);

        console.log("All images have been processed.");
    } catch (error) {
        console.error("Error in run function:", error.message);
    }
}

run();
