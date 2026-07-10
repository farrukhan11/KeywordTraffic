import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const requiredFirebaseConfig = {
  NEXT_PUBLIC_FIREBASE_API_KEY: firebaseConfig.apiKey,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: firebaseConfig.authDomain,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: firebaseConfig.projectId,
  NEXT_PUBLIC_FIREBASE_APP_ID: firebaseConfig.appId,
};

let app;
let auth;
let db;

function validateFirebaseConfig() {
  const missingVariables = Object.entries(requiredFirebaseConfig)
    .filter(([, value]) => !value || value.trim() === "")
    .map(([key]) => key);

  if (missingVariables.length > 0) {
    throw new Error(
      `Firebase is not configured. Add these variables to .env.local and restart the Next.js server: ${missingVariables.join(
        ", "
      )}`
    );
  }

  if (
    firebaseConfig.apiKey === "your-api-key" ||
    firebaseConfig.apiKey === "undefined"
  ) {
    throw new Error(
      "Firebase API key is a placeholder. Copy the real Firebase web app configuration into .env.local and restart the Next.js server."
    );
  }
}

function getApp() {
  if (!app) {
    validateFirebaseConfig();

    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
  }

  return app;
}

export function getFirebaseAuth() {
  if (!auth) {
    auth = getAuth(getApp());
  }

  return auth;
}

export function getFirebaseDb() {
  if (!db) {
    db = getFirestore(getApp());
  }

  return db;
}

export { getApp as firebaseApp };
