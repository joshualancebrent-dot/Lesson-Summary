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
