import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Configuration (Replace with your actual keys from Firebase Console)
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Helper function to fetch lesson data dynamically from Firestore
export async function getLessonById(lessonId) {
  try {
    const docRef = doc(db, "lessons", lessonId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error("Error fetching lesson:", error);
    return null;
  }
}

// Helper function to save a new or updated lesson to Firestore
export async function saveLesson(lessonId, lessonData) {
  const docRef = doc(db, "lessons", lessonId);
  await setDoc(docRef, lessonData, { merge: true });
}
