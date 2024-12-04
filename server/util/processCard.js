const express = require('express');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const pokemon = require('pokemontcgsdk');
const { cleanName } = require('../util/stripName.js'); // utility function to clean OCR card names

// api key for google vision
const client = new ImageAnnotatorClient({
    keyFilename: './config/vision-key.json' // google cloud vision API credentials
});

// helper function to clean set numbers extracted from OCR
function cleanSetNumber(setNumber) {
    if (!setNumber) return null;

    // remove unwanted prefixes like MF and F which was appearing in certain cards and make uppercase
    return setNumber
        .replace(/^MF/i, '') // remove MF prefix 
        .replace(/^F/i, '')  // remove F prefix
        .toUpperCase();      //  make uppercase
}

// core function to process a pokemon card image
async function processCard(fileBuffer) {
    try {
        // Step 1 is to perform OCR on the image file
        // the filebuffer is a binary representation of the uploaded image
        const [result] = await client.textDetection(fileBuffer); // analyze image and extract text
        const detections = result.textAnnotations; // array containing all the text detected by the Google Vision API from the image

        // check if any text was detected
        if (!detections.length) {
            console.log("No text detected in image.");
            return { error: 'No text detected in the image.', status: 400 }; // return error if no text found
        }

        // extract the full OCR-detected text
        const ocrText = detections[0].description; //description contains the full unprocessed text detected by the Vision API

        // Step 2 is to extract card name and set number from OCR text
        const name = await cleanName(ocrText.split('\n')); // clean the name in this case assumes the name is the first line
        const setNumberMatch = ocrText.match(/([A-Z]{0,3}\d{1,3}\/[A-Z]*\d{1,3})/i); // regex to find set number
        let setNumber = setNumberMatch ? setNumberMatch[0] : null;

        // clean the extracted set number
        setNumber = cleanSetNumber(setNumber);

        // if name or set number is missing then return early with no matches was used for testing
        if (!name || !setNumber) {
            return {
                matches: [],
                searchQuery: `${name} ${setNumber}`, // include parsed query for debugging
                foundName: name,
                fail: true 
            };
        }

        // query the Pokémon TCG API with the extracted data was used in testing
        const query = `name:"${name}" number:"${setNumber.split('/')[0]}"`; // constructructed query for the API
        const cards = await pokemon.card.all({ q: query }) || []; // fetch matching cards or default to empty array

        // if no cards are found then return an empty matches array used in testing
        if (cards.length === 0) {
            return {
                matches: [],
                searchQuery: `${name} ${setNumber}`,
                foundName: '',
                fail: false 
            };
        }

        // Step 3 is to return the matched cards and additional details which the details are sent to the search 
        return {
            matches: cards, // list of matched cards used for testing
            searchQuery: `${name} ${setNumber}`, // the constructed query that is used in our search page 
            foundName: name, // detected card name
            fail: false 
        };

    } catch (error) {
        // catch and log any errors during processing
        console.error("Error processing card:", error);
        return { error: 'Failed to recognize card.', status: 500 }; // return generic error response
    }
}

module.exports = { processCard }; // export the function for external use