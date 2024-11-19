const express = require('express');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const pokemon = require('pokemontcgsdk');
const multer = require('multer');
const router = express.Router();
const { cleanName } = require('../util/stripName.js');

// Configure Google Cloud Vision
const client = new ImageAnnotatorClient({
    keyFilename: './config/vision-key.json'
});

// Configure Pokémon TCG API
pokemon.configure({ apiKey: process.env.POKEMON_KEY });

// Set up multer for handling file uploads
const upload = multer({ storage: multer.memoryStorage() });

router.post('/api/recognizeCard', upload.single('file'), async (req, res) => {
    try {
        console.log("Received file:", req.file);

        // OCR processing
        const [result] = await client.textDetection(req.file.buffer);
        const detections = result.textAnnotations;
        
        if (!detections.length) {
            console.log("No text detected in image.");
            return res.status(400).json({ error: 'No text detected in the image.' });
        }

        const ocrText = detections[0].description;
        console.log("OCR Text:", ocrText);

        // Parse and search Pokémon TCG API
        const name = await cleanName(ocrText.split('\n').slice(0,4)); // Assuming the name is the first line
        const setNumberMatch = ocrText.match(/\d+\/\d+/);
        const setNumber = setNumberMatch ? setNumberMatch[0] : null;

        if (!name || !setNumber) {
            console.log("Failed to parse card name or set number.");
            return res.status(400).json({ error: 'Could not parse card name or set number from image.' });
        }
        
        console.log("Parsed Name:", name);
        console.log("Parsed Set Number:", setNumber);

        const query = `name:"${name}" number:"${setNumber.split('/')[0]}"`; // Adjust query as needed
        const cards = await pokemon.card.all({ q: query }); 

        console.log("Cards found:", cards);

        // no matches, 0 cards found
        if (cards.length === 0) {
            return res.status(200).json({
                matches: [],
                searchQuery: `${name} ${setNumber}`
            });
        }

        const matchedCard = cards[0]; // Take the first match
        res.json({
            matches: cards, // Return all matches for debugging or future features
            searchQuery: `${name} ${setNumber}` // Pass the query for fallback
        });

    } catch (error) {
        console.error("Error processing card:", error);
        res.status(500).json({ error: 'Failed to recognize card.' });
    }
});

module.exports = router;