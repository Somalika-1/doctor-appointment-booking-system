// utils/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBKHd-n9ScZbwNKflPmY8lYchCtG_ewAtw",
  authDomain: "doctor-appointment-9c6f8.firebaseapp.com",
  projectId: "doctor-appointment-9c6f8",
  storageBucket: "doctor-appointment-9c6f8.firebasestorage.app",
  messagingSenderId: "842761196573",
  appId: "1:842761196573:web:76e0212c6f41e513f022f4",
  measurementId: "G-YGPND56JMM",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { auth, firestore, storage };
