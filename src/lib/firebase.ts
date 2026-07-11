// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBT-aL7AP0FHwjcV_iix-c0KU0eWSISC-4",
  authDomain: "phonezlap.firebaseapp.com",
  projectId: "phonezlap",
  storageBucket: "phonezlap.firebasestorage.app",
  messagingSenderId: "334966452603",
  appId: "1:334966452603:web:1c68325d680d2aed648dde",
  measurementId: "G-CCTBPPL8Y7"
};

// Initialize Firebase (safeguarded against duplicate initializations during hot-reloads)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);

// Initialize Analytics safely on client side
let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, analytics };