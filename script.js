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

// Global Tab Switching Function
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

// Initialize Navigation Event Listeners
function setupNavigation() {
  document.querySelectorAll('.nav-tab').forEach(button => {
    button.addEventListener('click', () => {
      const target = button.getAttribute('data-target');
      window.switchTab(target);
    });
  });
}

// Run UI Setup immediately
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupNavigation);
} else {
  setupNavigation();
}

// Firebase Configuration & Initialization
const firebaseConfig = {
  apiKey: "AIzaSyAKsH40B0E-ytvtDBp5q0cCnAcrkfsDkxg",
  authDomain: "day-break-7a1d2.firebaseapp.com",
  projectId: "day-break-7a1d2",
  storageBucket: "day-break-7a1d2.firebasestorage.app",
  messagingSenderId: "374552344821",
  appId: "1:374552344821:web:eb18d503f6eca8d7722dbc",
  measurementId: "G-8YES7NF8D"
};

let app, auth;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (error) {
  console.warn("Firebase failed to initialize:", error);
}

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
  if (auth) {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        loginBtn.textContent = 'Logout';
        if (modal) modal.classList.remove('active');
      } else {
        loginBtn.textContent = 'Login';
      }
    });
  }

  // Open/Close Modal & Logout
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      if (auth && auth.currentUser) {
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
      if (!auth) {
        alert("Authentication service is currently unavailable.");
        return;
      }

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
      if (!auth) return alert("Authentication service unavailable.");
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
      if (!auth) return alert("Authentication service unavailable.");
      const provider = new FacebookAuthProvider();
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        alert(`Facebook Login Failed: ${error.message}`);
      }
    });
  }
});
