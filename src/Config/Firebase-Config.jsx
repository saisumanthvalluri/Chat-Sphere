import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "@firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBsieMdFZJXKAaG6rlYBOqqqwAqSYRp-qQ",
    authDomain: "chat-sphere-c5c9c.firebaseapp.com",
    projectId: "chat-sphere-c5c9c",
    storageBucket: "chat-sphere-c5c9c.appspot.com",
    messagingSenderId: "1071863719251",
    appId: "1:1071863719251:web:aabc56cdd278bab3152da6",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
