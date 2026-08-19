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
  setDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKsH40B0E-ytvtDBp5q0cCnAcrkfsDkxg",
  authDomain: "day-break-7a1d2.firebaseapp.com",
  projectId: "day-break-7a1d2",
  storageBucket: "day-break-7a1d2.firebasestorage.app",
  messagingSenderId: "374552344821",
  appId: "1:374552344821:web:eb18d503f6eca8d7722dbc",
  measurementId: "G-8YES7NF8D"
};

// 2. Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 3. Dynamically detect page/lesson ID
const pagePath = window.location.pathname.split("/").pop().replace(".html", "") || "home";
const currentLessonId = pagePath.length > 0 ? pagePath : "resurrection";

document.addEventListener('DOMContentLoaded', () => {

  // =============================================================
  // 4. TAB NAVIGATION LOGIC (Fixes Tabs on index.html)
  // =============================================================
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabPanels = document.querySelectorAll('.tab-panel');

  navTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const targetId = tab.getAttribute('data-target') || tab.getAttribute('data-tab');
      
      // If navigating to another page (e.g. index.html from a lesson), skip tab code
      if (!targetId && tab.hasAttribute('href')) return;

      e.preventDefault();

      navTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      tabPanels.forEach(panel => {
        if (panel.id === targetId) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });
    });
  });

  // =============================================================
  // 5. AUTHENTICATION & MODAL HANDLERS
  // =============================================================
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

  if (toggleAuthBtn) {
    toggleAuthBtn.addEventListener('click', () => {
      isSignUpMode = !isSignUpMode;
      if (isSignUpMode) {
        modalTitle.textContent = 'Create an Account';
        modalSubtitle.textContent = 'Sign up to participate in discussions.';
        formSubmitBtn.textContent = 'Create Account';
        toggleText.textContent = 'Already have an account?';
        toggleAuthBtn.textContent = 'Sign In';
      } else {
        modalTitle.textContent = 'Welcome Back';
        modalSubtitle.textContent = 'Sign in to access discussions and save progress.';
        formSubmitBtn.textContent = 'Sign In';
        toggleText.textContent = "Don't have an account?";
        toggleAuthBtn.textContent = 'Create one';
      }
    });
  }

  // Observe Auth State
  onAuthStateChanged(auth, (user) => {
    if (user && loginBtn) {
      loginBtn.textContent = 'Logout';
      if (modal) modal.classList.remove('active');
    } else if (loginBtn) {
      loginBtn.textContent = 'Login';
    }
  });

  // Login Button Click
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
  }

  // Submit Login/Signup Form
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        if (isSignUpMode) {
          await createUserWithEmailAndPassword(auth, email, password);
        } else {
          await signInWithEmailAndPassword(auth, email, password);
        }
        loginForm.reset();
      } catch (error) {
        alert(`Auth Error: ${error.message}`);
      }
    });
  }

  // Social Logins
  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      try {
        await signInWithPopup(auth, new GoogleAuthProvider());
      } catch (error) {
        alert(`Google Login Failed: ${error.message}`);
      }
    });
  }

  if (facebookBtn) {
    facebookBtn.addEventListener('click', async () => {
      try {
        await signInWithPopup(auth, new FacebookAuthProvider());
      } catch (error) {
        alert(`Facebook Login Failed: ${error.message}`);
      }
    });
  }

  // =============================================================
  // 6. REAL-TIME COMMENTS & REACTIONS (FIRESTORE)
  // =============================================================
  const commentForm = document.getElementById('comment-form');
  const commentInput = document.getElementById('comment-input');
  const commentsList = document.getElementById('comments-list');
  const reactionBtns = document.querySelectorAll('.btn-reaction');

  // Load Real-time Comments
  if (commentsList) {
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

    // Post Comment
    if (commentForm) {
      commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = auth.currentUser;

        if (!user) {
          alert("Please log in to leave a comment.");
          if (modal) modal.classList.add('active');
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
  }

  // Real-time Reactions
  if (reactionBtns.length > 0) {
    const reactionsRef = collection(db, "lessons", currentLessonId, "reactions");

    onSnapshot(reactionsRef, (snapshot) => {
      let counts = { amen: 0, heart: 0, insight: 0 };

      snapshot.forEach(docSnap => {
        const type = docSnap.data().type;
        if (counts[type] !== undefined) counts[type]++;
      });

      if (document.getElementById('count-amen')) document.getElementById('count-amen').textContent = counts.amen;
      if (document.getElementById('count-heart')) document.getElementById('count-heart').textContent = counts.heart;
      if (document.getElementById('count-insight')) document.getElementById('count-insight').textContent = counts.insight;
    });

    reactionBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const user = auth.currentUser;
        if (!user) {
          alert("Please log in to react.");
          if (modal) modal.classList.add('active');
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
  }

});
