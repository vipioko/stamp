// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7Zt5bErob58hnlafbZTTRzWzAZ_Agdmg",
  authDomain: "stamp-iokode.firebaseapp.com",
  projectId: "stamp-iokode",
  storageBucket: "stamp-iokode.firebasestorage.app",
  messagingSenderId: "1065350474534",
  appId: "1:1065350474534:web:4e3bd59b1178db8687afe7",
  measurementId: "G-3SXS705MRJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;