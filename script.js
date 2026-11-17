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

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAKsH40B0E-ytvtDBp5q0cCnAcrkfsDkxg",
  authDomain: "day-break-7a1d2.firebaseapp.com",
  projectId: "day-break-7a1d2",
  storageBucket: "day-break-7a1d2.firebasestorage.app",
  messagingSenderId: "374552344821",
  appId: "1:374552344821:web:eb18d503f6eca8d7722dbc",
  measurementId: "G-8YES7NF8D"
};

// Global Tab Switching Function
window.switchTab = function(targetId) {
  const currentActive = document.querySelector('.tab-panel.active');
  const targetPanel = document.getElementById(targetId);
  const tabs = document.querySelectorAll('.nav-tab');

  if (!targetPanel || currentActive === targetPanel) return;

  tabs.forEach(tab => {
    if (tab.getAttribute('data-target') === targetId) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  if (currentActive) {
    currentActive.classList.remove('active');
  }

  targetPanel.classList.add('active');
};

// Tab Click Listeners
document.querySelectorAll('.nav-tab').forEach(button => {
  button.addEventListener('click', () => {
    const target = button.getAttribute('data-target');
    window.switchTab(target);
  });
});

// Initialize Firebase
let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.warn("Firebase initialization skipped or encountered network issue:", e);
}

// Global Auth Modal Handler
document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.querySelector('.btn-login');
  const modal = document.getElementById('login-modal');
  const closeBtn = document.getElementById('close-login');
  const loginForm = document.getElementById('login-form');
  const googleBtn = document.getElementById('google-login');
  const facebookBtn = document.getElementById('facebook-login');
  const toggleAuthBtn = document.getElementById('toggle-auth-btn');

  let isSignUpMode = false;

  if (toggleAuthBtn) {
    toggleAuthBtn.addEventListener('click', () => {
      isSignUpMode = !isSignUpMode;
      document.getElementById('modal-title').textContent = isSignUpMode ? 'Create an Account' : 'Welcome Back';
      document.getElementById('form-submit-btn').textContent = isSignUpMode ? 'Create Account' : 'Sign In';
      toggleAuthBtn.textContent = isSignUpMode ? 'Sign In' : 'Create one';
    });
  }

  if (auth) {
    onAuthStateChanged(auth, (user) => {
      if (loginBtn) {
        loginBtn.textContent = user ? 'Logout' : 'Login';
      }
      if (user && modal) modal.classList.remove('active');
    });
  }

  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      if (auth && auth.currentUser) {
        signOut(auth).then(() => alert('Successfully logged out.'));
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

  if (loginForm && auth) {
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
      } catch (err) {
        alert("Authentication Error: " + err.message);
      }
    });
  }

  if (googleBtn && auth) {
    googleBtn.addEventListener('click', async () => {
      try {
        await signInWithPopup(auth, new GoogleAuthProvider());
      } catch (err) {
        alert("Google Login Error: " + err.message);
      }
    });
  }

  if (facebookBtn && auth) {
    facebookBtn.addEventListener('click', async () => {
      try {
        await signInWithPopup(auth, new FacebookAuthProvider());
      } catch (err) {
        alert("Facebook Login Error: " + err.message);
      }
    });
  }

  // -------------------------------------------------------------
  // FIRESTORE COMMENTS & REACTIONS FOR LESSON PAGES
  // -------------------------------------------------------------
  const commentForm = document.getElementById('comment-form');
  const commentsList = document.getElementById('comments-list');

  if (db && commentsList) {
    // Dynamic Lesson ID detection
    const pagePath = window.location.pathname.split("/").pop().replace(".html", "") || "resurrection";
    const currentLessonId = pagePath.length > 0 ? pagePath : "resurrection";

    const commentsRef = collection(db, "lessons", currentLessonId, "comments");
    const q = query(commentsRef, orderBy("createdAt", "desc"));

    // Realtime Comments
    onSnapshot(q, (snapshot) => {
      commentsList.innerHTML = "";
      if (snapshot.empty) {
        commentsList.innerHTML = `<div class="empty-state"><p>No comments yet. Be the first to start the conversation!</p></div>`;
        return;
      }

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const dateStr = data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString(undefined, {
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }) : "Just now";

        const card = document.createElement('div');
        card.className = 'comment-card';
        card.innerHTML = `
          <div class="comment-avatar">${(data.userName || 'U')[0].toUpperCase()}</div>
          <div class="comment-content">
            <div class="comment-header">
              <span class="comment-author">${data.userName || 'Anonymous User'}</span>
              <span class="comment-date">${dateStr}</span>
            </div>
            <p class="comment-text">${data.text}</p>
          </div>
        `;
        commentsList.appendChild(card);
      });
    });

    // Submit Comment
    if (commentForm) {
      commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = auth ? auth.currentUser : null;

        if (!user) {
          alert("Please log in to share your thoughts.");
          if (modal) modal.classList.add('active');
          return;
        }

        const input = document.getElementById('comment-input');
        const text = input.value.trim();
        if (!text) return;

        try {
          await addDoc(commentsRef, {
            userId: user.uid,
            userName: user.displayName || user.email.split('@')[0],
            text: text,
            createdAt: serverTimestamp()
          });
          input.value = "";
        } catch (err) {
          alert("Could not post comment: " + err.message);
        }
      });
    }

    // Reactions Realtime & Clicks
    const reactionsRef = collection(db, "lessons", currentLessonId, "reactions");
    onSnapshot(reactionsRef, (snapshot) => {
      let counts = { amen: 0, heart: 0, insight: 0 };
      snapshot.forEach(docSnap => {
        const type = docSnap.data().type;
        if (counts[type] !== undefined) counts[type]++;
      });

      const amenEl = document.getElementById('count-amen');
      const heartEl = document.getElementById('count-heart');
      const insightEl = document.getElementById('count-insight');

      if (amenEl) amenEl.textContent = counts.amen;
      if (heartEl) heartEl.textContent = counts.heart;
      if (insightEl) insightEl.textContent = counts.insight;
    });

    document.querySelectorAll('.btn-reaction').forEach(btn => {
      btn.addEventListener('click', async () => {
        const user = auth ? auth.currentUser : null;
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
          alert("Reaction error: " + err.message);
        }
      });
    });
  }
});
// Global Copy Text Function
window.copyLessonText = function() {
  // Uses 'lesson-content' for new pages, but falls back to 'ministry-content' just in case!
  const content = document.getElementById("lesson-content") || document.getElementById("ministry-content");
  
  if (!content) {
    console.error("Could not find the content to copy.");
    return;
  }

  const clonedContent = content.cloneNode(true);
  const buttonToRemove = clonedContent.querySelector('#copy-btn');
  if (buttonToRemove) {
    buttonToRemove.parentElement.remove();
  }

  const textToCopy = clonedContent.innerText;

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(textToCopy)
      .then(showSuccess)
      .catch(() => fallbackCopy(textToCopy)); 
  } else {
    fallbackCopy(textToCopy);
  }

  function fallbackCopy(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.opacity = "0"; 
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      showSuccess();
    } catch (err) {
      alert("Your browser is blocking the copy function. Please select the text manually.");
    }
    document.body.removeChild(textArea);
  }

  function showSuccess() {
    const btn = document.getElementById("copy-btn");
    if (!btn) return;
    const originalText = "📋 Copy Text"; 
    btn.innerHTML = "✅ Copied!";
    btn.style.backgroundColor = "#10B981"; 
    
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.backgroundColor = ""; 
    }, 2000);
  }
};
function switchLanguage(index, btnElement) {
      // Move the track horizontally
      const track = document.getElementById('sliderTrack');
      track.style.transform = `translateX(-${index * 20}%)`;

      // Update button colors (active state)
      const buttons = document.querySelectorAll('.lang-btn');
      buttons.forEach(btn => btn.classList.remove('active'));
      if (btnElement) {
        btnElement.classList.add('active');
      }
    }
