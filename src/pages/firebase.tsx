// src/firebase.tsx
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDKZZA-SxSOJSu5g7dcHiIiCn7qVZzPFJA",
  authDomain: "iasproj-6b046.firebaseapp.com",
  projectId: "iasproj-6b046",
  storageBucket: "iasproj-6b046.appspot.com",
  messagingSenderId: "579886550931",
  appId: "1:579886550931:web:fbac2c3c082487fcc96266",
  measurementId: "G-TWWLMY39HV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app); // Initialize Authentication
const db = getFirestore(app); // Initialize Firestore

export { auth, db }; // Export Auth and Firestore instances
