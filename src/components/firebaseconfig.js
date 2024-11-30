// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

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

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app, 'gs://subliva-d49ad.firebasestorage.app');
const functions = getFunctions(app);
// Export the initialized services
export { auth, db, storage,functions };
