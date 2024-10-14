// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAGH9wgo6QdUbapOC6Jgo_CxEmdgcN8GuY",
  authDomain: "financialapptracker.firebaseapp.com",
  projectId: "financialapptracker",
  storageBucket: "financialapptracker.appspot.com",
  messagingSenderId: "279132279583",
  appId: "1:279132279583:web:51e87ca00d247ff8ec162a",
  measurementId: "G-FR977JGZYG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // Commenting this out for now
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { db, auth, provider, doc, setDoc };
