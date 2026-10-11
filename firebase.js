import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCW3NpvCX4wv2JhvAMeLovvBCpybxloGno",
  authDomain: "cloudattendance-system.firebaseapp.com",
  projectId: "cloudattendance-system",
  storageBucket: "cloudattendance-system.firebasestorage.app",
  messagingSenderId: "658781653180",
  appId: "1:658781653180:web:e8dcb01abd30da6bb3a8b9",
  measurementId: "G-XXF401CMRB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
