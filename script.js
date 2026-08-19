import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKsH40B0E-ytvtDBp5q0cCnAcrkfsDkxg",
  authDomain: "day-break-7a1d2.firebaseapp.com",
  projectId: "day-break-7a1d2",
  storageBucket: "day-break-7a1d2.firebasestorage.app",
  messagingSenderId: "374552344821",
  appId: "1:374552344821:web:eb18d503f6eca8d7722dbc",
  measurementId: "G-8YES7NF8D"
};

// Initialize Firebase & Auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Tab Navigation Logic
window.switchTab = function(targetId) {
  const currentActive = document.querySelector('.tab-panel.active');
  const targetPanel = document.getElementById(targetId);
  const tabs = document.querySelectorAll('.nav-tab');

  if (currentActive === targetPanel) return;

  tabs.forEach(tab => {
    if (tab.getAttribute('data-target') === targetId) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  if (currentActive) {
    currentActive.classList.remove('active');
    currentActive.classList.add('exit-left');
    setTimeout(() => currentActive.classList.remove('exit-left'), 400);
  }

  if (targetPanel) {
    targetPanel.classList.add('active');
  }
};

document.querySelectorAll('.nav-tab').forEach(button => {
  button.addEventListener('click', () => {
    const target = button.getAttribute('data-target');
    window.switchTab(target);
  });
});

// Authentication & Modal Handlers
document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.querySelector('.btn-login');
  const modal = document.getElementById('login-modal');
  const closeBtn = document.getElementById('close-login');
  const loginForm = document.getElementById('login-form');
  const googleBtn = document.getElementById('google-login');
  const facebookBtn = document.getElementById('facebook-login');

  const modalTitle = document.getElementById('modal-title');
  const modalSubtitle = document.getElementById('modal-subtitle');
  const formSubmitBtn = document.getElementById('form-submit-btn');
  const toggleAuthBtn = document.getElementById('toggle-auth-btn');
  const toggleText = document.getElementById('toggle-text');

  let isSignUpMode = false;

  // Toggle between Sign In and Sign Up UI
  if (toggleAuthBtn) {
    toggleAuthBtn.addEventListener('click', () => {
      isSignUpMode = !isSignUpMode;

      if (isSignUpMode) {
        modalTitle.textContent = 'Create an Account';
        modalSubtitle.textContent = 'Sign up to start saving your progress and notes.';
        formSubmitBtn.textContent = 'Create Account';
        toggleText.textContent = 'Already have an account?';
        toggleAuthBtn.textContent = 'Sign In';
      } else {
        modalTitle.textContent = 'Welcome Back';
        modalSubtitle.textContent = 'Sign in to access your saved lessons and notes.';
        formSubmitBtn.textContent = 'Sign In';
        toggleText.textContent = "Don't have an account?";
        toggleAuthBtn.textContent = 'Create one';
      }
    });
  }

  // Monitor Authentication State
  onAuthStateChanged(auth, (user) => {
    if (user) {
      loginBtn.textContent = 'Logout';
      if (modal) modal.classList.remove('active');
    } else {
      loginBtn.textContent = 'Login';
    }
  });

  // Open/Close Modal & Logout
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      if (auth.currentUser) {
        signOut(auth).then(() => alert('You have logged out.'));
      } else if (modal) {
        modal.classList.add('active');
      }
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  // Email Sign In OR Sign Up Form Handler
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        if (isSignUpMode) {
          await createUserWithEmailAndPassword(auth, email, password);
          alert('Account created successfully!');
        } else {
          await signInWithEmailAndPassword(auth, email, password);
        }
        loginForm.reset();
      } catch (error) {
        alert(`Authentication Error: ${error.message}`);
      }
    });
  }

  // Google Sign-In
  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        alert(`Google Login Failed: ${error.message}`);
      }
    });
  }

  // Facebook Sign-In
  if (facebookBtn) {
    facebookBtn.addEventListener('click', async () => {
      const provider = new FacebookAuthProvider();
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        alert(`Facebook Login Failed: ${error.message}`);
      }
    });
  }
});
// Recommended Production Rule
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Anyone can read comments and reactions
    match /lessons/{lessonId}/{document=**} {
      allow read: if true;
      // Only logged-in users can write or comment
      allow write: if request.auth != null;
    }
  }
}
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKsH40B0E-ytvtDBp5q0cCnAcrkfsDkxg",
  authDomain: "day-break-7a1d2.firebaseapp.com",
  projectId: "day-break-7a1d2",
  storageBucket: "day-break-7a1d2.firebasestorage.app",
  messagingSenderId: "374552344821",
  appId: "1:374552344821:web:eb18d503f6eca8d7722dbc",
  measurementId: "G-8YES7NF8D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const currentLessonId = "lesson-1"; // ID for current lesson

document.addEventListener('DOMContentLoaded', () => {
  const commentForm = document.getElementById('comment-form');
  const commentInput = document.getElementById('comment-input');
  const commentsList = document.getElementById('comments-list');
  const reactionBtns = document.querySelectorAll('.btn-reaction');

  // -------------------------------------------------------------
  // 1. REAL-TIME COMMENTS LISTENER
  // -------------------------------------------------------------
  const commentsRef = collection(db, "lessons", currentLessonId, "comments");
  const q = query(commentsRef, orderBy("createdAt", "desc"));

  onSnapshot(q, (snapshot) => {
    commentsList.innerHTML = "";
    if (snapshot.empty) {
      commentsList.innerHTML = "<p class='loading-text'>No comments yet. Be the first to start the conversation!</p>";
      return;
    }

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const dateStr = data.createdAt ? new Date(data.createdAt.toDate()).toLocaleString() : "Just now";

      const card = document.createElement('div');
      card.className = 'comment-card';
      card.innerHTML = `
        <div class="comment-header">
          <span class="comment-author">${data.userName}</span>
          <span class="comment-date">${dateStr}</span>
        </div>
        <p class="comment-text">${data.text}</p>
      `;
      commentsList.appendChild(card);
    });
  });

  // -------------------------------------------------------------
  // 2. SUBMIT A NEW COMMENT
  // -------------------------------------------------------------
  if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = auth.currentUser;

      if (!user) {
        alert("Please log in to leave a comment.");
        document.getElementById('login-modal').classList.add('active');
        return;
      }

      const text = commentInput.value.trim();
      if (!text) return;

      try {
        await addDoc(commentsRef, {
          userId: user.uid,
          userName: user.displayName || user.email.split('@')[0],
          text: text,
          createdAt: serverTimestamp()
        });
        commentInput.value = "";
      } catch (err) {
        alert("Could not post comment: " + err.message);
      }
    });
  }

  // -------------------------------------------------------------
  // 3. REAL-TIME REACTIONS LISTENER & CLICK HANDLER
  // -------------------------------------------------------------
  const reactionsRef = collection(db, "lessons", currentLessonId, "reactions");

  onSnapshot(reactionsRef, (snapshot) => {
    let counts = { amen: 0, heart: 0, insight: 0 };

    snapshot.forEach(docSnap => {
      const type = docSnap.data().type;
      if (counts[type] !== undefined) counts[type]++;
    });

    document.getElementById('count-amen').textContent = counts.amen;
    document.getElementById('count-heart').textContent = counts.heart;
    document.getElementById('count-insight').textContent = counts.insight;
  });

  reactionBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const user = auth.currentUser;
      if (!user) {
        alert("Please log in to react.");
        document.getElementById('login-modal').classList.add('active');
        return;
      }

      const type = btn.getAttribute('data-type');
      const userReactionDoc = doc(db, "lessons", currentLessonId, "reactions", user.uid);

      try {
        await setDoc(userReactionDoc, {
          type: type,
          userId: user.uid,
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        alert("Reaction failed: " + err.message);
      }
    });
  });
});
