import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXfOEK1wSpDB-wLYDiDhl8JCOUupGzwnM",
  authDomain: "unit3quiz25.firebaseapp.com",
  projectId: "unit3quiz25",
  storageBucket: "unit3quiz25.firebasestorage.app",
  messagingSenderId: "963296508088",
  appId: "1:963296508088:web:78696ecfcc0d5f1acf5c4d"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)
export default app

