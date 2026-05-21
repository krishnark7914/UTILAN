import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if credentials are placeholders or empty
const isConfigValid = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'YOUR_PROJECT_ID';

let app = null;
let auth = null;
let db = null;
let isFirebaseEnabled = false;

if (isConfigValid) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseEnabled = true;
    console.log('Firebase initialized successfully. Sync enabled.');
  } catch (error) {
    console.error('Firebase initialization failed:', error);
  }
} else {
  console.warn('Firebase is not configured or is using placeholder credentials. Running in local Guest Mode.');
}

export { auth, db, isFirebaseEnabled };

export async function registerUser(email, password) {
  if (!isFirebaseEnabled) throw new Error('Firebase is not configured.');
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function loginUser(email, password) {
  if (!isFirebaseEnabled) throw new Error('Firebase is not configured.');
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function logoutUser() {
  if (!isFirebaseEnabled) return;
  await signOut(auth);
}

export async function saveUserData(uid, data) {
  if (!isFirebaseEnabled) return;
  const userDocRef = doc(db, 'users', uid);
  await setDoc(userDocRef, {
    ...data,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

export function subscribeUserData(uid, callback) {
  if (!isFirebaseEnabled) return () => {};
  const userDocRef = doc(db, 'users', uid);
  return onSnapshot(userDocRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error in user data subscription:', error);
  });
}
