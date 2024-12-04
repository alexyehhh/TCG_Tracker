const { ImageAnnotatorClient } = require('@google-cloud/vision');
const pokemon = require('pokemontcgsdk');
const multer = require('multer');
const express = require('express');
const router = express.Router();
const { processCard } = require('../util/processCard');

// Configure Pokémon TCG API
pokemon.configure({ apiKey: process.env.POKEMON_KEY });

// Set up multer for handling file uploads
const upload = multer({ storage: multer.memoryStorage() });

// 1. Express request handler
router.post('/api/recognizeCard', upload.single('file'), async (req, res) => {
    try {
        // Call core logic for processing the card recognition
        const result = await processCard(req.file.buffer);

        // Return result to the client
        if (result.error) {
            return res.status(result.status).json({ error: result.error });
        }

        res.json({
            matches: result.matches,
            searchQuery: result.searchQuery
        });

    } catch (error) {
        console.error("Error in request handler:", error);
        res.status(500).json({ error: 'Failed to process request.' });
    }
});

module.exports = router;
