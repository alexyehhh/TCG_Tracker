async function cleanName(name) {
    const exclude = ["stage", "stage1", "stage2", "basic"];
    const lower = name.map(x => x.toLowerCase());
    let cleaned = "";

    for (let i = 0; i < lower.length; i++) {
        if (!exclude.includes(lower[i])) {
            cleaned += lower[i] + " ";
        }
    }

    return cleaned.trim();
}

module.exports = { cleanName };

// // Test case 1: Basic Test Case
// console.log(cleanName(["stage", "basic", "Name", "stage2", "test"])); 
// // Expected output: "name test"

// // Test case 2: No words to exclude
// console.log(cleanName(["hello", "world", "foo", "bar"])); 
// // Expected output: "hello world foo bar"

// // Test case 3: All words are excluded
// console.log(cleanName(["stage", "stage1", "stage2", "basic"])); 
// // Expected output: ""

// // Test case 4: Mixed case input
// console.log(cleanName(["STAGE", "Basic", "Test", "hello"])); 
// // Expected output: "test hello" (case insensitive)

// console.log(cleanName(["Hello", "WORLD", "Stage", "BASIC"])); 
// // Expected output: "hello world"

// // Test case 5: Empty input list
// console.log(cleanName([])); 
// // Expected output: ""

// // Test case 6: Single word input, excluded
// console.log(cleanName(["stage"])); 
// // Expected output: ""

// // Test case 7: Single word input, not excluded
// console.log(cleanName(["Hello"])); 
// // Expected output: "hello"

