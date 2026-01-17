import React, { useState, useEffect, createContext, useContext } from "react";
import { initializeApp } from "firebase/app";
import {
    getAuth,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    sendPasswordResetEmail
} from 'firebase/auth';
import { getFirestore, doc, setDoc, addDoc, collection, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import api from "../api";

// Firebase configuration (env first, fallback to provided working config)
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyABR3v8snGSMCjYExOKVBka000ch1yjmUc",
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "zerith-732d1.firebaseapp.com",
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "zerith-732d1",
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "zerith-732d1.appspot.com",
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "637010138588",
    appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:637010138588:web:7c018dbc9d5504f4cfeb19",
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-X8V2NM0FYL",
};
const firebaseEnabled = Boolean(firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId);

// Initialize Firebase (or set placeholders if not enabled)
let firebaseApp = null;
let firebaseAuth = null;
let googleProvider = null;
let firestore = null;
let storage = null;
if (firebaseEnabled) {
    firebaseApp = initializeApp(firebaseConfig);
    firebaseAuth = getAuth(firebaseApp);
    googleProvider = new GoogleAuthProvider();
    firestore = getFirestore(firebaseApp);
    storage = getStorage(firebaseApp);
}
export { firebaseAuth, firestore };

// Create Context
const FirebaseContext = createContext(null);

export const useFirebase = () => {
    const firebase = useContext(FirebaseContext);
    if (!firebase) {
        throw new Error("useFirebase must be used within a FirebaseProvider");
    }
    return firebase;
}

export const FirebaseProvider = (props) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        // Retrieve the value from local storage on initial load
        return JSON.parse(localStorage.getItem('isLoggedIn')) || false;
    });

    useEffect(() => {
        if (!firebaseEnabled) return;
        const unsubscribe = onAuthStateChanged(firebaseAuth, user => {
            if (user) {
                setUser(user);
                setIsLoggedIn(true);
                localStorage.setItem('isLoggedIn', JSON.stringify(true));
            } else {
                setUser(null);
                setIsLoggedIn(false);
                localStorage.setItem('isLoggedIn', JSON.stringify(false));
            }
        });
        return () => unsubscribe();
    }, []);

    // Function to add a user to Firestore
    const addUser = async (CoalName, email, password) => {
        if (!firebaseEnabled) throw new Error('Auth disabled: Firebase env not configured');
        try {
            const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
            const loggedInUser = userCredential.user;

            const userDoc = {
                CoalName,
                email,
                userId: loggedInUser.uid,
            };

            const userDocRef = doc(firestore, 'users', loggedInUser.uid);
            await setDoc(userDocRef, userDoc);
            console.log('User document created with UID: ', loggedInUser.uid);

            onAuthStateChanged(firebaseAuth, (user) => {
                if (user) {
                    console.log('User is logged in:', user);
                } else {
                    console.log('No user is logged in');
                }
            });

        } catch (error) {
            console.error('Error creating user or setting authentication:', error);
        }
    };

    // Function to sign in with email and password
    const signinUserWithEmailAndPassword = async (email, password) => {
        if (!firebaseEnabled) throw new Error('Auth disabled: Firebase env not configured');
        try {
            const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
            return userCredential;
        } catch (error) {
            let errorMessage = 'An error occurred during sign-in.';
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address.';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password. Please try again.';
                    break;
                default:
                    errorMessage = 'Failed to sign in. Please check your credentials and try again.';
                    break;
            }
            throw new Error(errorMessage);
        }
    };

    // Function to sign in with Google
    const signinWithGoogle = () => {
        if (!firebaseEnabled) throw new Error('Auth disabled: Firebase env not configured');
        signInWithPopup(firebaseAuth, googleProvider);
    };

    // Function to send password reset email
    const sendPReset = (email) => {
        if (!firebaseEnabled) throw new Error('Auth disabled: Firebase env not configured');
        sendPasswordResetEmail(firebaseAuth, email);
    };

    // Function to log out the user
    const handleLogout = async () => {
        if (!firebaseEnabled) throw new Error('Auth disabled: Firebase env not configured');
        try {
            await signOut(firebaseAuth);
            localStorage.removeItem('isLoggedIn');
        } catch (error) {
            console.error('Error occurred during logout:', error);
        }
    };

    // Function to upload PDF to Firebase Storage and save metadata to Firestore
    const uploadPDFToFirebase = async (pdfBlob) => {
        // Force backend storage to avoid Firebase billing requirements
        if (!user) throw new Error("Login required before uploading PDF");
        const form = new FormData();
        form.append("file", pdfBlob, `emission-estimate-${Date.now()}.pdf`);
        const { data } = await api.post(`/upload_pdf`, form, {
            headers: { "Content-Type": "multipart/form-data" },
            params: { uid: user.uid },
        });
        return data?.public_url || data?.url;
    };

    // Function to fetch all PDFs for the logged-in user
    const fetchUserPDFs = async () => {
        if (!user) return [];
        // Try Firestore first when available
        if (firebaseEnabled && firestore) {
            try {
                const pdfsCollectionRef = collection(firestore, 'users', user.uid, 'pdfs');
                const pdfsSnapshot = await getDocs(pdfsCollectionRef);
                const pdfList = pdfsSnapshot.docs.map(d => d.data());
                if (pdfList.length > 0) return pdfList;
            } catch (err) {
                console.warn("Firestore fetch failed, using backend:", err);
            }
        }
        // Backend fallback
        const { data } = await api.get(`/fetch_pdfs`, { params: { uid: user.uid } });
        // Normalize to { url, createdAt }
        return (data || []).map(item => ({
            url: item.url || item.public_url || item.path,
            createdAt: item.created_at ? new Date(item.created_at) : new Date(),
        }));
    };

    return (
        <FirebaseContext.Provider value={{
            user,
            isLoggedIn,
            addUser,
            signinUserWithEmailAndPassword,
            signinWithGoogle,
            handleLogout,
            sendPReset,
            uploadPDFToFirebase,
            fetchUserPDFs
        }}>
            {props.children}
        </FirebaseContext.Provider>
    );
};