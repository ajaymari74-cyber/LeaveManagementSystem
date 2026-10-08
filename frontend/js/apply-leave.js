document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAuth('EMPLOYEE');
  if (!user) return;

  const nameEl = document.getElementById('user-display-name');
  const emailEl = document.getElementById('user-display-email');
  if (nameEl) nameEl.textContent = user.name;
  if (emailEl) emailEl.textContent = user.email;

  const mobileToggle = document.getElementById('mobile-toggle');
  const sidebar = document.getElementById('sidebar');
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => sidebar.classList.toggle('show'));
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

  const form = document.getElementById('apply-leave-form');
  const leaveTypeSelect = document.getElementById('leaveType');
  const fromDateInput = document.getElementById('fromDate');
  const toDateInput = document.getElementById('toDate');
  const reasonInput = document.getElementById('reason');
  const charCounter = document.getElementById('char-counter');
  const submitBtn = document.getElementById('submit-btn');
  const formErrorAlert = document.getElementById('form-error-alert');
  const successBox = document.getElementById('success-box');

  // Set default min date to today
  const today = new Date().toISOString().split('T')[0];
  fromDateInput.min = today;
  toDateInput.min = today;

  // Live char counter
  reasonInput.addEventListener('input', () => {
    charCounter.textContent = `${reasonInput.value.length} / 500`;
  });

  // From date change updates toDate min
  fromDateInput.addEventListener('change', () => {
    if (fromDateInput.value) {
      toDateInput.min = fromDateInput.value;
      if (toDateInput.value && toDateInput.value < fromDateInput.value) {
        toDateInput.value = fromDateInput.value;
      }
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formErrorAlert.classList.add('d-none');
    formErrorAlert.textContent = '';

    // Clear validation styling
    [leaveTypeSelect, fromDateInput, toDateInput, reasonInput].forEach(el => el.classList.remove('is-invalid'));

    let hasError = false;

    if (!leaveTypeSelect.value) {
      leaveTypeSelect.classList.add('is-invalid');
      hasError = true;
    }

    if (!fromDateInput.value) {
      fromDateInput.classList.add('is-invalid');
      hasError = true;
    }

    if (!toDateInput.value) {
      toDateInput.classList.add('is-invalid');
      hasError = true;
    }

    if (fromDateInput.value && toDateInput.value && toDateInput.value < fromDateInput.value) {
      toDateInput.classList.add('is-invalid');
      formErrorAlert.textContent = 'To Date must be on or after From Date.';
      formErrorAlert.classList.remove('d-none');
      hasError = true;
    }

    if (!reasonInput.value.trim()) {
      reasonInput.classList.add('is-invalid');
      hasError = true;
    }

    if (hasError) return;

    setButtonLoading(submitBtn, true, 'Submitting...');

    try {
      const payload = {
        leaveType: leaveTypeSelect.value,
        fromDate: fromDateInput.value,
        toDate: toDateInput.value,
        reason: reasonInput.value.trim()
      };

      const res = await apiRequest('/leaves', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      // Show success feedback
      form.classList.add('d-none');
      successBox.classList.remove('d-none');
      loadLottie('success-lottie', 'assets/lottie/success-check.json', false);

      showToast('Leave request submitted successfully!', 'success');

      // Redirect after 1.5s
      setTimeout(() => {
        window.location.replace('leave-history.html');
      }, 1500);

    } catch (err) {
      formErrorAlert.textContent = err.message || 'Failed to submit leave request. Please check inputs.';
      formErrorAlert.classList.remove('d-none');
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
});
