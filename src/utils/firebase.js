import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXfOEK1wSpDB-wLYDiDhl8JCOUupGzwnM",
  authDomain: "unit3quiz25.firebaseapp.com",
  projectId: "unit3quiz25",
  storageBucket: "unit3quiz25.firebasestorage.app",
  messagingSenderId: "963296508088",
  appId: "1:963296508088:web:78696ecfcc0d5f1acf5c4d",
  databaseURL: "https://unit3quiz25-default-rtdb.firebaseio.com/"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Firestore (keeping for backward compatibility if needed)
export const db = getFirestore(app)

// Initialize Realtime Database
export const realtimeDb = getDatabase(app)

export default app

