document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('admin-login-form');
  const errorAlert = document.getElementById('error-alert');
  const submitBtn = document.getElementById('submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorAlert.classList.add('d-none');
    errorAlert.textContent = '';

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      errorAlert.textContent = 'Please enter email and password';
      errorAlert.classList.remove('d-none');
      return;
    }

    setButtonLoading(submitBtn, true, 'Verifying admin access...');

    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (res && res.data) {
        if (res.data.role !== 'ADMIN') {
          throw new Error('Access denied: You do not have administrator privileges');
        }
        setStoredUser(res.data);
        showToast('Admin authenticated successfully!', 'success');
        setTimeout(() => window.location.replace('admin-dashboard.html'), 500);
      }
    } catch (err) {
      errorAlert.textContent = err.message || 'Invalid admin credentials';
      errorAlert.classList.remove('d-none');
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
});
