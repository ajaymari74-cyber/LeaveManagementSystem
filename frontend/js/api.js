function getApiBase() {
  if (window.LMS_CONFIG && window.LMS_CONFIG.apiUrl) {
    return window.LMS_CONFIG.apiUrl;
  }
  const stored = localStorage.getItem('LMS_API_BASE');
  if (stored) {
    return stored;
  }
  return 'http://localhost:8080/api';
}

const API_BASE = getApiBase();

// Helper to switch backend API URL at runtime (e.g. from browser console when deployed on Vercel)
window.setBackendUrl = function(url) {
  if (!url) {
    localStorage.removeItem('LMS_API_BASE');
    console.log('Backend URL reset to default (http://localhost:8080/api)');
  } else {
    const cleanUrl = url.replace(/\/+$/, '');
    localStorage.setItem('LMS_API_BASE', cleanUrl);
    console.log('Backend URL set to:', cleanUrl);
  }
  window.location.reload();
};

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json'
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {})
    },
    credentials: 'include' // required for session cookie JSESSIONID
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data.message || data.error || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && String(err.message).toLowerCase().includes('fetch')) {
      const msg = `Unable to connect to backend server at ${API_BASE}. Please ensure Spring Boot is running.`;
      const netErr = new Error(msg);
      netErr.isNetworkError = true;
      throw netErr;
    }
    throw err;
  }
}

