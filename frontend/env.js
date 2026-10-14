// Runtime environment configuration for Leave Management System
// Overridden dynamically in production by /api/env when BACKEND_URL is set in Vercel.
window.LMS_CONFIG = window.LMS_CONFIG || {};
if (!window.LMS_CONFIG.apiUrl) {
  window.LMS_CONFIG.apiUrl = 'http://localhost:8080/api';
}
