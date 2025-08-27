// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyApK-BsDf9I0ec3Z0DuoqwF9XKX2bSJoZs",
  authDomain: "business-extractor-39069.firebaseapp.com",
  projectId: "business-extractor-39069",
  storageBucket: "business-extractor-39069.firebasestorage.app",
  messagingSenderId: "622707814279",
  appId: "1:622707814279:web:c0ceaab0ab80b585aa6d22",
  measurementId: "G-K0516V18T9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;