// Import Firebase modules
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, getDocs, updateDoc } = require('firebase/firestore');

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

// Map of full state names to abbreviations
const stateAbbreviations = {
    "Alabama": "AL",
    "Alaska": "AK",
    "Arizona": "AZ",
    "Arkansas": "AR",
    "California": "CA",
    "Colorado": "CO",
    "Connecticut": "CT",
    "Delaware": "DE",
    "Florida": "FL",
    "Georgia": "GA",
    "Hawaii": "HI",
    "Idaho": "ID",
    "Illinois": "IL",
    "Indiana": "IN",
    "Iowa": "IA",
    "Kansas": "KS",
    "Kentucky": "KY",
    "Louisiana": "LA",
    "Maine": "ME",
    "Maryland": "MD",
    "Massachusetts": "MA",
    "Michigan": "MI",
    "Minnesota": "MN",
    "Mississippi": "MS",
    "Missouri": "MO",
    "Montana": "MT",
    "Nebraska": "NE",
    "Nevada": "NV",
    "New Hampshire": "NH",
    "New Jersey": "NJ",
    "New Mexico": "NM",
    "New York": "NY",
    "North Carolina": "NC",
    "North Dakota": "ND",
    "Ohio": "OH",
    "Oklahoma": "OK",
    "Oregon": "OR",
    "Pennsylvania": "PA",
    "Rhode Island": "RI",
    "South Carolina": "SC",
    "South Dakota": "SD",
    "Tennessee": "TN",
    "Texas": "TX",
    "Utah": "UT",
    "Vermont": "VT",
    "Virginia": "VA",
    "Washington": "WA",
    "West Virginia": "WV",
    "Wisconsin": "WI",
    "Wyoming": "WY"
};

// Function to update state field for all properties
async function updateStateField() {
    try {
        const propertiesRef = collection(db, "properties");
        const snapshot = await getDocs(propertiesRef);

        if (snapshot.empty) {
            console.log("No properties found in the collection.");
            return;
        }

        let updateCount = 0;

        const updates = snapshot.docs.map(async (docSnapshot) => {
            const data = docSnapshot.data();

            // Check if `state` field exists and convert to abbreviation if possible
            if (data.state && stateAbbreviations[data.state]) {
                const abbreviatedState = stateAbbreviations[data.state];
                console.log(`Updating document ${docSnapshot.id} - state: "${data.state}" to "${abbreviatedState}"`);

                // Update the state field in Firestore
                await updateDoc(docSnapshot.ref, {
                    state: abbreviatedState
                });

                updateCount++;
            } else if (data.state) {
                console.log(`State "${data.state}" not found in abbreviation map for document ${docSnapshot.id}.`);
            }
        });

        await Promise.all(updates);
        console.log(`Update completed. ${updateCount} documents updated.`);
    } catch (error) {
        console.error("Error updating state field: ", error);
    }
}

// Call the function
updateStateField();
