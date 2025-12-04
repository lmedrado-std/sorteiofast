// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7bdUzAQQYSHcIe_0hXPHoFxWUlrDIqG8",
  authDomain: "supersorteios-d52d6.firebaseapp.com",
  projectId: "supersorteios-d52d6",
  storageBucket: "supersorteios-d52d6.appspot.com",
  messagingSenderId: "1057650151344",
  appId: "1:1057650151344:web:880c9c8557bf0d28625075"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
