/**
 * Core Authentication Utility
 * Implements password hashing, validation, session management, and persistence.
 */

// 1. Password Hashing using SHA-256 via the Web Crypto API
async function hashPassword(password) {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// 2. LocalStorage User CRUD
function getUsers() {
  const users = localStorage.getItem('auth_users');
  return users ? JSON.parse(users) : {};
}

function saveUsers(users) {
  localStorage.setItem('auth_users', JSON.stringify(users));
}

// 3. Password Strength Checker
function validatePassword(password) {
  return {
    minLength: password.length >= 8,
    hasNumber: /\d/.test(password)
  };
}

// 4. Registration Handling
async function registerUser(usernameOrEmail, password) {
  const normalizedKey = usernameOrEmail.toLowerCase().trim();
  const users = getUsers();

  if (users[normalizedKey]) {
    throw new Error('An account with this username or email already exists.');
  }

  const { minLength, hasNumber } = validatePassword(password);
  if (!minLength || !hasNumber) {
    throw new Error('Password does not meet the security requirements.');
  }

  const passwordHash = await hashPassword(password);
  users[normalizedKey] = {
    username: usernameOrEmail.trim(),
    passwordHash: passwordHash,
    createdAt: new Date().toISOString()
  };

  saveUsers(users);
  return users[normalizedKey];
}

// 5. Login Handling
async function loginUser(usernameOrEmail, password) {
  const normalizedKey = usernameOrEmail.toLowerCase().trim();
  const users = getUsers();
  const user = users[normalizedKey];

  if (!user) {
    throw new Error('Incorrect username/email or password.');
  }

  const inputHash = await hashPassword(password);
  if (user.passwordHash !== inputHash) {
    throw new Error('Incorrect username/email or password.');
  }

  // Create session
  const session = {
    username: user.username,
    loginTime: new Date().toISOString()
  };
  sessionStorage.setItem('auth_session', JSON.stringify(session));
  return user;
}

// 6. Route Protection & Session Check
function checkSession(redirectIfInvalid = true) {
  const sessionData = sessionStorage.getItem('auth_session');
  if (!sessionData) {
    if (redirectIfInvalid) {
      window.location.href = 'index.html?error=session_expired';
    }
    return null;
  }
  return JSON.parse(sessionData);
}

// 7. Logout
function logout() {
  sessionStorage.removeItem('auth_session');
  window.location.href = 'index.html?status=logged_out';
}

// 8. Shared UI Alert Helper
function showAlert(alertContainer, message, type = 'error') {
  if (!alertContainer) return;
  
  // Choose SVG icon based on alert type
  const icon = type === 'success' 
    ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
       </svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
       </svg>`;

  alertContainer.className = `alert alert-${type}`;
  alertContainer.innerHTML = `
    ${icon}
    <span>${message}</span>
  `;
  alertContainer.classList.remove('hidden');
}

function hideAlert(alertContainer) {
  if (alertContainer) {
    alertContainer.classList.add('hidden');
  }
}

// 9. Input Password Toggle Utility
function setupPasswordToggle(inputFieldId, buttonId) {
  const passwordInput = document.getElementById(inputFieldId);
  const toggleButton = document.getElementById(buttonId);
  
  if (!passwordInput || !toggleButton) return;

  toggleButton.addEventListener('click', (e) => {
    e.preventDefault();
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Toggle icon state
    if (type === 'text') {
      toggleButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
        </svg>
      `;
    } else {
      toggleButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      `;
    }
  });
}
