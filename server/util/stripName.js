const fs = require('fs');
const path = require('path'); 
const cardNames = require('./cards'); // load the list of valid Pokemon card names

// function to check if a word exists in the cardNames list
async function wordExistsInFile(word) {
    try {
        const lowerWord = word.toLowerCase(); // make lowercase
        
        // check if cardNames is an array and if it includes the specified word
        if (Array.isArray(cardNames) && cardNames.includes(lowerWord)) {
            return true; // word exists in cardNames
        } else {
            return false; // word does not exist in cardNames
        }
    } catch (err) {
        console.error('Error checking word in file:', err);
        return false; // return false if there was an error
    }
}

// function to clean the card name from OCR text
async function cleanName(name) {
    try {
        // special case for any card starting with ENERGY
        if (name[0].toLowerCase() === 'energy') {
            console.log("Energy card detected.");
            return 'energy'; // directly return energy for these cards
        }

        // set of words to exclude if they appear in the read line
        const exclude = new Set(["stage", "stage1", "stage2", "basic", "evolves", "ability", "trainer", "supporter", "item", "stadium", "energy"]);

        let cleaned = ""; //empty string to store the cleaned name

        // process each line from the OCR text
        for (let word of name) {
            const words = word.toLowerCase().split(/\s+/); // split the line into individual words

            // detect and fix cases like FGG30/GG70
            words.forEach((w, index) => {
                if (/^Fgg\d+/i.test(w)) {
                    words[index] = w.replace(/^F/i, '');
                }
            });

            // filter out excluded words but keep other words in the line
            let filteredWords = words.filter(word => !exclude.has(word));

            // special case for trainer card and detect if the current line contains the name
            if (word.toLowerCase().includes('trainer') || word.toLowerCase().includes('supporter')) {
                continue; // skip lines indicating card type
            }

            // join the remaining words back into a single string for the line
            let filteredWord = filteredWords.join(" ");

            // check each word in the filtered line to see if it exists in cardNames
            for (let word of filteredWords) {

                if (exclude.has(word)) continue;

                // remove trailing 'v' if V card but not smoliv and dolliv
                if (word.endsWith('v') && word !== 'smoliv' && word !== 'dolliv') {
                    word = word.slice(0, -1); // remove the 'v' at the end
                }

                // remove trailing 'ex' if ex is with pokemon name
                if (word.endsWith('ex') && word !== 'toxapex' && word !== 'calyrex') {
                    word = word.slice(0, -2); // remove the 'ex' at the end
                }

                // add the word to cleaned if it exists in cardNames
                if (await wordExistsInFile(word)) {
                    cleaned += word.trim() + " "; // append the word to the cleaned name string
                    break; // stop after finding the main name word
                }
            }
        }

        // if no match was found but Trainer is in the OCR then use the longest non-excluded line as a fallback
        if (!cleaned && name.some(line => line.toLowerCase().includes('trainer'))) {
            const fallbackLine = name.find(line => !exclude.has(line.toLowerCase()));
            cleaned = fallbackLine ? fallbackLine.trim() : '';
        }

        // trim extra spaces and split by whitespace and return the first matching word
        return cleaned.trim().split(/\s+/)[0];
    } catch (err) {
        console.error('Error reading file:', err);
        return ''; // return an empty string if there was an error
    }
}

module.exports = { cleanName };
