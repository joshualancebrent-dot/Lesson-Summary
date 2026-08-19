function switchTab(targetId) {
  const currentActive = document.querySelector('.tab-panel.active');
  const targetPanel = document.getElementById(targetId);
  const tabs = document.querySelectorAll('.nav-tab');

  if (currentActive === targetPanel) return;

  // Update navigation active states
  tabs.forEach(tab => {
    if (tab.getAttribute('data-target') === targetId) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Slide current panel out
  if (currentActive) {
    currentActive.classList.remove('active');
    currentActive.classList.add('exit-left');
    setTimeout(() => {
      currentActive.classList.remove('exit-left');
    }, 400);
  }

  // Slide new panel in
  targetPanel.classList.add('active');
}

// Event Listeners for Navigation Buttons
document.querySelectorAll('.nav-tab').forEach(button => {
  button.addEventListener('click', () => {
    const target = button.getAttribute('data-target');
    switchTab(target);
  });
});
document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.querySelector('.btn-login');
  const modal = document.getElementById('login-modal');
  const closeBtn = document.getElementById('close-login');
  const loginForm = document.getElementById('login-form');

  // Open Modal
  loginBtn.addEventListener('click', () => {
    if (loginBtn.textContent === 'Logout') {
      // Handle Logout State
      loginBtn.textContent = 'Login';
      alert('You have been logged out.');
      return;
    }
    modal.classList.add('active');
  });

  // Close Modal
  closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  // Handle Form Submission
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;

    // Toggle to Logged In state UI
    loginBtn.textContent = 'Logout';
    modal.classList.remove('active');
    loginForm.reset();

    alert(`Successfully signed in as ${email}`);
  });
});
document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.querySelector('.btn-login');
  const modal = document.getElementById('login-modal');
  const closeBtn = document.getElementById('close-login');
  const loginForm = document.getElementById('login-form');
  
  const googleBtn = document.getElementById('google-login');
  const facebookBtn = document.getElementById('facebook-login');

  // Listen to Authentication State (Updates UI automatically when user signs in/out)
  window.onAuthStateChanged(window.auth, (user) => {
    if (user) {
      // User is signed in
      loginBtn.textContent = 'Logout';
      modal.classList.remove('active');
      console.log('User logged in:', user.email || user.displayName);
    } else {
      // User is signed out
      loginBtn.textContent = 'Login';
    }
  });

  // Toggle Modal / Handle Logout
  loginBtn.addEventListener('click', () => {
    if (window.auth.currentUser) {
      // Perform actual logout
      window.signOut(window.auth).then(() => {
        alert('You have logged out.');
      });
    } else {
      modal.classList.add('active');
    }
  });

  // Modal Close Handlers
  closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  // Real Email/Password Login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      await window.signInWithEmailAndPassword(window.auth, email, password);
      loginForm.reset();
    } catch (error) {
      alert(`Login Failed: ${error.message}`);
    }
  });

  // Real Google Sign-In (Popup)
  googleBtn.addEventListener('click', async () => {
    const provider = new window.GoogleAuthProvider();
    try {
      await window.signInWithPopup(window.auth, provider);
    } catch (error) {
      alert(`Google Login Failed: ${error.message}`);
    }
  });

  // Real Facebook Sign-In (Popup)
  facebookBtn.addEventListener('click', async () => {
    const provider = new window.FacebookAuthProvider();
    try {
      await window.signInWithPopup(window.auth, provider);
    } catch (error) {
      alert(`Facebook Login Failed: ${error.message}`);
    }
  });
});
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKsH40B0E-ytvtDBp5q0cCnAcrkfsDkxg",
  authDomain: "day-break-7a1d2.firebaseapp.com",
  projectId: "day-break-7a1d2",
  storageBucket: "day-break-7a1d2.firebasestorage.app",
  messagingSenderId: "374552344821",
  appId: "1:374552344821:web:eb18d503f6eca8d7722dbc",
  measurementId: "G-8YES7NF8D"
};
