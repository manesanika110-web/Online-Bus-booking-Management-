// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZ9i3oCUDAtpAB689xqFR3F_dFpjY_8F0",
  authDomain: "bus-12324.firebaseapp.com",
  projectId: "bus-12324",
  storageBucket: "bus-12324.firebasestorage.app",
  messagingSenderId: "510156946904",
  appId: "1:510156946904:web:a68ea30eca123908a4c6ad"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);