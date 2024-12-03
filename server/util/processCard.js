const express = require('express');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const pokemon = require('pokemontcgsdk');
const { cleanName } = require('../util/stripName.js');

// Configure Google Cloud Vision
const client = new ImageAnnotatorClient({
    keyFilename: './config/vision-key.json'
});

function cleanSetNumber(setNumber) {
    if (!setNumber) return null;

    // remove leading MF or F from GG numbers
    return setNumber
        .replace(/^MF/i, '') 
        .replace(/^F/i, '')
        .toUpperCase();
}

// 2. Core logic function
async function processCard(fileBuffer) {
    try {
        // OCR processing
        const [result] = await client.textDetection(fileBuffer);
        const detections = result.textAnnotations;

        if (!detections.length) {
            console.log("No text detected in image.");
            return { error: 'No text detected in the image.', status: 400 };
        }

        const ocrText = detections[0].description;

        // Parse and search Pokémon TCG API
        const name = await cleanName(ocrText.split('\n')); // Assuming the name is the first line
        const setNumberMatch = ocrText.match(/([A-Z]{0,3}\d{1,3}\/[A-Z]*\d{1,3})/i);
        let setNumber = setNumberMatch ? setNumberMatch[0] : null;

        // Clean the set number
        setNumber = cleanSetNumber(setNumber);


        if (!name || !setNumber) {
            return {
                matches: [],
                searchQuery: `${name} ${setNumber}`,
                foundName: name,
                fail: true
            };
        }

        const query = `name:"${name}" number:"${setNumber.split('/')[0]}"`; // Adjust query as needed
        const cards = await pokemon.card.all({ q: query });

        // No matches, return empty array
        if (cards.length === 0) {
            return {
                matches: [],
                searchQuery: `${name} ${setNumber}`,
                foundName: '',
                fail: false
            };
        }

        // Return the first matched card
        return {
            matches: cards,
            searchQuery: `${name} ${setNumber}`, // Pass the query for fallback
            foundName: name,
            fail: false
        };

    } catch (error) {
        console.error("Error processing card:", error);
        return { error: 'Failed to recognize card.', status: 500 };
    }
}

module.exports = { processCard };