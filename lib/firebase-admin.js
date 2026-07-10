import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let app = null;
let authInstance = null;

function getApp() {
  if (!app) {
    if (getApps().length === 0) {
      app = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      app = getApps()[0];
    }
  }
  return app;
}

export function getAdminAuth() {
  if (!authInstance) {
    authInstance = getAuth(getApp());
  }
  return authInstance;
}

export default getApp;
