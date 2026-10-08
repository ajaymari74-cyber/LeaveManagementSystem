const AUTH_STORAGE_KEY = 'lms_user';

function getStoredUser() {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredUser(user) {
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

function clearStoredUser() {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

async function verifySession() {
  try {
    const res = await apiRequest('/auth/me', { method: 'GET' });
    if (res && res.data) {
      setStoredUser(res.data);
      return res.data;
    }
    return null;
  } catch {
    clearStoredUser();
    return null;
  }
}

async function requireAuth(expectedRole) {
  const stored = getStoredUser();
  if (!stored) {
    redirectToLogin(expectedRole);
    return null;
  }

  // Verify active session with backend
  const activeUser = await verifySession();
  if (!activeUser) {
    redirectToLogin(expectedRole);
    return null;
  }

  if (expectedRole && activeUser.role !== expectedRole) {
    if (activeUser.role === 'ADMIN') {
      window.location.replace('admin-dashboard.html');
    } else {
      window.location.replace('employee-dashboard.html');
    }
    return null;
  }

  return activeUser;
}

function redirectToLogin(role) {
  if (role === 'ADMIN') {
    window.location.replace('admin-login.html');
  } else {
    window.location.replace('employee-login.html');
  }
}

async function handleLogout() {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } catch (e) {
    // Continue local cleanup even if network fails
  }
  const user = getStoredUser();
  const role = user ? user.role : 'EMPLOYEE';
  clearStoredUser();
  redirectToLogin(role);
}
