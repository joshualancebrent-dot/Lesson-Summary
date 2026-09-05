import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Replaced placeholders with your actual Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKsH40B0E-ytvtDBp5q0cCnAcrkfsDkxg",
  authDomain: "day-break-7a1d2.firebaseapp.com",
  projectId: "day-break-7a1d2",
  storageBucket: "day-break-7a1d2.firebasestorage.app",
  messagingSenderId: "374552344821",
  appId: "1:374552344821:web:eb18d503f6eca8d7722dbc",
  measurementId: "G-8YES7NF8D"
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
