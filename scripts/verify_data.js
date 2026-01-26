const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Attempt to use default credentials or check if we can list without explicit admin sdk json in this env
// NOTE: In this environment, we might rely on the client SDK or need to use the already initialized client logic if admin sdk isn't set up.
// However, since we are in a dev environment with `firebase login`, we might try using the client SDK in a node script if we have the config.

// actually, let's use the client SDK logic adapted for node to quick check, 
// OR just use the client app's firebase.config.js if we can import it. 
// But importing ES modules in node script can be tricky without package.json "type": "module".
// Let's write a simple script that uses the existing `lib/firebase.ts` concept but standalone with `firebase/firestore` packages if node environment supports it.

// Simpler approach: Create a temporary TS file to run with `ts-node` or `next` if possible, 
// OR just inspect it via the application logs by adding a temporary log in the `processChat` action.

// Since I already added logs in `processChat`, I will check those logs via the user's run.
// BUT the user said "no funciona", implying the logs might have shown empty data or errors.
// Let's create a robust check script using the CLIENT SDK to run strictly for verification.

const firebase = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Mock env vars if missing (user might not have .env.local loaded in this script execution context)
// We will try to read .env.local directly if process.env is empty
const fs = require('fs');
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    try {
        const envConfig = require('dotenv').parse(fs.readFileSync('.env.local'));
        for (const k in envConfig) {
            process.env[k] = envConfig[k];
        }
    } catch (e) {
        console.log("Could not load .env.local");
    }
}

// Re-assign config
firebaseConfig.apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
firebaseConfig.authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
firebaseConfig.projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (!firebaseConfig.apiKey) {
    console.error("Missing API KEY. content of .env.local:");
    console.log(fs.readFileSync('.env.local', 'utf8'));
    process.exit(1);
}

const app = firebase.initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkCollections() {
    const collections = ['hero_s1', 'features_s2', 'about_s3'];
    console.log("Checking collections...");

    for (const colName of collections) {
        try {
            const snap = await getDocs(collection(db, colName));
            console.log(`Collection '${colName}': ${snap.size} documents found.`);
            if (!snap.empty) {
                console.log(`Sample doc (${colName}):`, JSON.stringify(snap.docs[0].data(), null, 2).slice(0, 100) + "...");
            }
        } catch (e) {
            console.error(`Error checking '${colName}':`, e.message);
        }
    }
}

checkCollections().then(() => process.exit(0)).catch(e => console.error(e));
