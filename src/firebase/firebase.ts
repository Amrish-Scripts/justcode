
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
	apiKey: "AIzaSyDYEglrt3QNU0T1VYeMBcBikfHxddO-l7A",
	authDomain: "replit-7b5a6.firebaseapp.com",
	projectId: "replit-7b5a6",
	storageBucket: "replit-7b5a6.firebasestorage.app",
	messagingSenderId: "729209667822",
	appId: "1:729209667822:web:d6ebe57377deb074ec33ff"
};

const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore, app };
