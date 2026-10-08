document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const errorAlert = document.getElementById('error-alert');
  const submitBtn = document.getElementById('submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorAlert.classList.add('d-none');
    errorAlert.textContent = '';

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      errorAlert.textContent = 'Please enter both email and password';
      errorAlert.classList.remove('d-none');
      return;
    }

    setButtonLoading(submitBtn, true, 'Signing in...');

    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (res && res.data) {
        setStoredUser(res.data);
        if (res.data.role === 'ADMIN') {
          showToast('Signed in as Administrator. Redirecting...', 'info');
          setTimeout(() => window.location.replace('admin-dashboard.html'), 500);
        } else {
          showToast('Login successful! Redirecting...', 'success');
          setTimeout(() => window.location.replace('employee-dashboard.html'), 500);
        }
      }
    } catch (err) {
      errorAlert.textContent = err.message || 'Invalid email or password';
      errorAlert.classList.remove('d-none');
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
});
