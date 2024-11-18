const fs = require('fs');
const path = require('path');  // For handling file paths

async function wordExistsInFile(word) {
    try {
        // Define the file path (adjust if necessary)
        const filePath = path.join(__dirname, 'pnames.txt');  // Replace 'pnames.txt' with your file name
        
        // Read the file content
        const data = await fs.promises.readFile(filePath, 'utf8');
        
        // Split the content into lines or words
        const words = data.split('\n').map(line => line.trim().toLowerCase()); // Assuming each word is on a new line
        
        // Check if the word exists in the content (case-insensitive check)
        if (words.includes(word)) {
            // console.log(`The word "${word}" exists in the file.`);
            return true;
        } else {
            // console.log(`The word "${word}" does NOT exist in the file.`);
            return false;
        }
    } catch (err) {
        console.error('Error reading file:', err);
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
                if (isExcluded) {
                    break
                } else if (await wordExistsInFile(lowerWord)) {
                    cleaned += lowerWord + " ";
                }
            }
        }

        return cleaned.trim();
    } catch (err) {
        console.error('Error reading file:', err);
        return '';
    }
}

// Example of calling getName

// async function testCleanName() {
//     // const result = await cleanName(["Stage", 'VMAX Sylveon', "Evolves", "Charmander", "Basic", "fire dragon"])
//     const result = await cleanName([
//         'VMAX Sylveon VMAX',
//         'Evolves from Sylveon V',
//         'Dynamax',
//         '310',
//         'RAPID',
//         'STRIKE',
//         'Precious Touch',
//         'Attach an Energy card from your hand to I of your',
//         'Benched Pokémon. If you do, heal 120 damage from that',
//         'Pokémon.',
//         'Max Harmony',
//         '70+',
//         'This attack does 30 more damage for each different type',
//         'of Pokémon on your Bench.',
//         'weakness x2 resistance',
//         'illus. Ryota Murayama',
//         '? 211/203⭑',
//         'VMAX rule',
//         'retreat',
//         'When your Pokémon VMAX',
//         'is Knocked Out, your opponent takes 3 Prize cards.',
//         '02021 Pokémon/Nintendo/Creatures/GAME FREAK',
//         'Evolves'
//       ]);
//     console.log(result);  // Output should be "pikachu charmander" (if those names are in the 'pnames.txt' file)
// }

// testCleanName();

module.exports = { cleanName };