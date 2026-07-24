/**
 * Authentication Logic for Login & Signup Pages
 */

const getAuthApiUrl = () => {
  if (window.location.protocol.startsWith('http') && window.location.port === '5000') {
    return `${window.location.origin}/auth`;
  }
  const host = (window.location.hostname && window.location.hostname !== 'null') ? window.location.hostname : 'localhost';
  return `http://${host}:5000/auth`;
};

const AUTH_API_URL = getAuthApiUrl();

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  checkLoggedInRedirect();
  setupPasswordToggles();
  setupAuthForms();
});

function checkLoggedInRedirect() {
  const userStr = localStorage.getItem('sms_user');
  const token = localStorage.getItem('sms_token');

  if (userStr && token) {
    try {
      const user = JSON.parse(userStr);
      if (user && user.name) {
        window.location.href = 'index.html';
      }
    } catch (e) {
      // Invalid user JSON
    }
  }
}

function initTheme() {
  const currentTheme = localStorage.getItem('sms_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
}

function setupPasswordToggles() {
  document.querySelectorAll('.toggle-password-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;

      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
      }
    });
  });
}

function setupAuthForms() {
  // Login Form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Signup Form
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }
}

// Handle Login
async function handleLogin(e) {
  e.preventDefault();

  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const submitBtn = document.getElementById('loginSubmitBtn');

  const email = emailInput ? emailInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value : '';

  if (!email || !password) {
    showToast('Please enter both email and password.', 'error');
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
  }

  try {
    const res = await fetch(`${AUTH_API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Invalid email or password.');
    }

    // Save JWT token + session user
    if (data.token) localStorage.setItem('sms_token', data.token);
    localStorage.setItem('sms_user', JSON.stringify(data.user));
    showToast('Login successful! Redirecting...', 'success');

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);

  } catch (err) {
    showToast(err.message, 'error');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Sign In <i class="fas fa-arrow-right"></i>';
    }
  }
}

// Handle Signup
async function handleSignup(e) {
  e.preventDefault();

  const nameInput = document.getElementById('signupName');
  const emailInput = document.getElementById('signupEmail');
  const courseInput = document.getElementById('signupCourse');
  const passwordInput = document.getElementById('signupPassword');
  const confirmPasswordInput = document.getElementById('signupConfirmPassword');
  const submitBtn = document.getElementById('signupSubmitBtn');

  const name = nameInput ? nameInput.value.trim() : '';
  const email = emailInput ? emailInput.value.trim() : '';
  const course = courseInput ? courseInput.value : 'Computer Science';
  const password = passwordInput ? passwordInput.value : '';
  const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';

  if (!name || !email || !password || !confirmPassword) {
    showToast('Please fill out all required fields.', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showToast('Passwords do not match.', 'error');
    return;
  }

  if (password.length < 6) {
    showToast('Password must be at least 6 characters.', 'error');
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
  }

  try {
    const res = await fetch(`${AUTH_API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, course, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to create account.');
    }

    // Save JWT token + session user & redirect
    if (data.token) localStorage.setItem('sms_token', data.token);
    localStorage.setItem('sms_user', JSON.stringify(data.user));
    showToast('Account created successfully! Redirecting...', 'success');

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1200);

  } catch (err) {
    showToast(err.message, 'error');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Create Account <i class="fas fa-arrow-right"></i>';
    }
  }
}

// Toast Notifications Helper
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let iconClass = 'fa-info-circle';
  if (type === 'success') iconClass = 'fa-check-circle';
  if (type === 'error') iconClass = 'fa-exclamation-circle';

  toast.innerHTML = `
    <i class="fas ${iconClass}"></i>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
