// Import Firebase modules
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, writeBatch } = require('firebase/firestore');

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAa2RF5LCzVy72eUxpTJuaKb4Rs3EmVsgA",
    authDomain: "subliva-d49ad.firebaseapp.com",
    projectId: "subliva-d49ad",
    storageBucket: "subliva-d49ad.appspot.com",
    messagingSenderId: "492294811440",
    appId: "1:492294811440:web:0f88286dba701708b822f5",
    measurementId: "G-L63LBYBP9T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Load your JSON file
const properties = require('./backend/database/properties.json');

// Function to import data
async function addProperties() {
    const batch = writeBatch(db); // Use writeBatch to create a batch instance

    properties.forEach((property) => {
        const propertyRef = doc(collection(db, "properties")); // Generate a unique document ID
        batch.set(propertyRef, property); // Add the property to the batch
    });

    try {
        await batch.commit(); // Commit all the writes in the batch
        console.log("Properties added successfully!");
    } catch (error) {
        console.error("Error adding properties: ", error);
    }
}

// Call the import function
addProperties();
