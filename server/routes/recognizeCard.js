const { ImageAnnotatorClient } = require('@google-cloud/vision');
const pokemon = require('pokemontcgsdk');
const multer = require('multer');
const express = require('express');
const router = express.Router();
const { processCard } = require('../util/processCard'); // import the card processing function

// configure pokemonn TCG API with the API key from environment variables
pokemon.configure({ apiKey: process.env.POKEMON_KEY });

// file storage 
const upload = multer({ storage: multer.memoryStorage() }); // store files in memory as buffer

// define an API endpoint to recognize Pokémon cards
router.post('/api/recognizeCard', upload.single('file'), async (req, res) => {
    try {
        // call the core logic function to process the uploaded card image
        const result = await processCard(req.file.buffer);

        // check for errors in the processing result
        if (result.error) {
            return res.status(result.status).json({ error: result.error }); // respond with error and status code
        }

        // return successful results to the client
        res.json({
            matches: result.matches,        // array of matched cards used for testing
            searchQuery: result.searchQuery // the query used for matching was done in testing
        });

    } catch (error) {
        // handle server errors
        console.error("Error in request handler:", error);
        res.status(500).json({ error: 'Failed to process request.' });
    }
});

module.exports = router;
