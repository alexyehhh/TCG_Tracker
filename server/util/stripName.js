const fs = require('fs');
const path = require('path');  // For handling file paths
const cardNames = require('./cards'); 

async function wordExistsInFile(word) {
    try {
        const lowerWord = word.toLowerCase();
        
        // Ensure cardNames is an array and includes works
        if (Array.isArray(cardNames) && cardNames.includes(lowerWord)) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.error('Error checking word in file:', err);
        return false;
    }
}


async function cleanName(name) {
    try {
        // // Define the file path (adjust if necessary)
        // const filePath = path.join(__dirname, 'pnames.txt');
        
        // // Read the file content
        // const data = await fs.promises.readFile(filePath, 'utf8');
        
        // Create a Set from the file data (each line as an individual word)
        // const s = new Set(data.split('\n').map(line => line.trim().toLowerCase()));

        // Define the words to exclude
        const exclude = new Set(["stage", "stage1", "stage2", "basic", "evolves", "ability"]);

        // console.log(name)

        // Process the input name array
        let cleaned = "";
        for (let word of name) {
            const lowerWord = word.toLowerCase();
            // console.log(lowerWord); // Debug log to see what word is being checked
    
            // Split lowerWord into individual words (if it contains spaces) and check for exclusion
            const wordsInLowerWord = lowerWord.split(/\s+/); // Split by spaces or other whitespace
    
            // Check if any word in the lowerWord is in the exclude set
            const isExcluded = wordsInLowerWord.some(w => exclude.has(w));
    
            // If none of the words in lowerWord are excluded and the word exists in the file, add to cleaned
            for (let lowerWord of wordsInLowerWord) {
                if (lowerWord.endsWith('v') && lowerWord !== 'smoliv' && lowerWord !== 'dolliv') {
                    lowerWord = lowerWord.slice(0, -1); // Remove the last 'v'
                }
    
                // Now check for exclusions and word existence in file
                if (!isExcluded && await wordExistsInFile(lowerWord)) {
                    cleaned += lowerWord + " ";
                }
            }
        }

        return cleaned.trim().split(/\s+/)[0];
    } catch (err) {
        console.error('Error reading file:', err);
        return '';
    }
}

// Example of calling getName

async function testCleanName() {
    // const result = await cleanName(["Stage", 'VMAX Sylveon', "Evolves", "Charmander", "Basic", "fire dragon"])
    const result = await cleanName([
        'PikachuV',
        'dolliv',
        'smoliv',
        '310',
        'RAPID',
        'STRIKE',
        'Precious Touch',
        'Attach an Energy card from your hand to I of your',
        'Benched Pokémon. If you do, heal 120 damage from that',
        'Pokémon.',
        'Max Harmony',
        '70+',
        'This attack does 30 more damage for each different type',
        'of Pokémon on your Bench.',
        'weakness x2 resistance',
        'illus. Ryota Murayama',
        '? 211/203⭑',
        'VMAX rule',
        'retreat',
        'When your Pokémon VMAX',
        'is Knocked Out, your opponent takes 3 Prize cards.',
        '02021 Pokémon/Nintendo/Creatures/GAME FREAK',
        'Evolves'
      ]);
    console.log(result);  // Output should be "pikachu charmander" (if those names are in the 'pnames.txt' file)
}

testCleanName();

module.exports = { cleanName };