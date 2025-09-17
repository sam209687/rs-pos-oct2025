// test-bcrypt.ts
const bcrypt = require('bcryptjs');

async function runTest() {
    const rawPassword = 'Joseph1520@'; // The password from your latest login attempt
    const saltRounds = 10;

    console.log(`--- bcryptjs Standalone Test ---`);
    console.log(`Raw password to hash: "${rawPassword}"`);
    console.log(`Raw password char codes: [${[...rawPassword].map(char => char.charCodeAt(0)).join(', ')}]`);
    console.log(`Salt rounds: ${saltRounds}`);

    try {
        // 1. Test with a freshly generated hash (should always be TRUE)
        const generatedHash = await bcrypt.hash(rawPassword, saltRounds);
        console.log(`Generated hash: "${generatedHash}"`);
        const compareResult1 = await bcrypt.compare(rawPassword, generatedHash);
        console.log(`Compare (raw vs generated hash): ${compareResult1 ? 'SUCCESS (TRUE)' : 'FAILURE (FALSE)'}`);

        // 2. Test with the hash that your AUTHORIZE function RETRIEVED from DB
        const authorizeRetrievedHash = '$2b$10$7Xudl/HBHP43pUY8FtkMxuBGkRpNjvFBitk0SbQyZJ1AQCBgQMZjW'; // <--- HASH FROM LATEST LOGIN LOGS
        console.log(`\nTesting with Authorize-Retrieved hash: "${authorizeRetrievedHash}"`);
        const compareResult2 = await bcrypt.compare(rawPassword, authorizeRetrievedHash);
        console.log(`Compare (raw vs Authorize-Retrieved hash): ${compareResult2 ? 'SUCCESS (TRUE)' : 'FAILURE (FALSE)'}`);

        // 3. Test with the hash that is CURRENTLY in your MongoDB COMPASS/ATLAS for anit6222@rs.com
        const actualDbHash = '$2b$10$s47kufRkngMDZlrKtY36duEj5ZtbZm4J.R0tuFIom5AUn3i4i5MOC'; // <--- HASH FROM YOUR LATEST MONGODB DOCUMENT
        console.log(`\nTesting with ACTUAL DB hash from MongoDB: "${actualDbHash}"`);
        const compareResult3 = await bcrypt.compare(rawPassword, actualDbHash);
        console.log(`Compare (raw vs ACTUAL DB hash): ${compareResult3 ? 'SUCCESS (TRUE)' : 'FAILURE (FALSE)'}`);

    } catch (error) {
        console.error("An error occurred during bcrypt test:", error);
    }
}

runTest();