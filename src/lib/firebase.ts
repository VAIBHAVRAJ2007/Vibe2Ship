import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, onSnapshot, query, orderBy, serverTimestamp, updateDoc, doc, getDoc, arrayUnion } from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); // Use specific DB ID for this applet
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export { collection, addDoc, getDocs, onSnapshot, query, orderBy, serverTimestamp, updateDoc, doc, getDoc, arrayUnion, ref, uploadBytes, getDownloadURL, onAuthStateChanged, signInWithPopup, signOut };
