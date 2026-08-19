// Firebase Client SDK
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA_6H4F6PCPFP_IVKMJFCVAqUjru0emZjo",
  authDomain: "assure-8ert0.firebaseapp.com",
  projectId: "assure-8ert0",
  messagingSenderId: "198777774050",
  appId: "1:198777774050:web:36062eabdc5b055fc723bb"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
