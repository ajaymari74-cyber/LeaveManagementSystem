let currentLeave = null;
let activeAction = null;
let bsDecisionModal = null;

document.addEventListener('DOMContentLoaded', async () => {
  const admin = await requireAuth('ADMIN');
  if (!admin) return;

  const nameEl = document.getElementById('admin-display-name');
  const emailEl = document.getElementById('admin-display-email');
  if (nameEl) nameEl.textContent = admin.name;
  if (emailEl) emailEl.textContent = admin.email;

  const mobileToggle = document.getElementById('mobile-toggle');
  const sidebar = document.getElementById('sidebar');
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => sidebar.classList.toggle('show'));
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

  const modalEl = document.getElementById('decisionModal');
  if (modalEl && typeof bootstrap !== 'undefined') {
    bsDecisionModal = new bootstrap.Modal(modalEl);
  }

  const urlParams = new URLSearchParams(window.location.search);
  const leaveId = urlParams.get('id');

  if (!leaveId) {
    showToast('No leave ID specified', 'danger');
    setTimeout(() => window.location.replace('admin-dashboard.html'), 1000);
    return;
  }

  await loadLeaveDetails(leaveId);

  document.getElementById('detail-approve-btn').addEventListener('click', () => openModal('APPROVE'));
  document.getElementById('detail-reject-btn').addEventListener('click', () => openModal('REJECT'));
  document.getElementById('modalConfirmBtn').addEventListener('click', executeDecision);
});

async function loadLeaveDetails(id) {
  try {
    const res = await apiRequest(`/leaves/${id}`, { method: 'GET' });
    currentLeave = res.data;
    renderDetails(currentLeave);
  } catch (err) {
    showToast('Failed to load leave details: ' + err.message, 'danger');
  }
}

function renderDetails(leave) {
  document.getElementById('detail-id').textContent = leave.id;
  document.getElementById('detail-employee-name').textContent = leave.userName || 'Employee #' + leave.userId;
  document.getElementById('detail-employee-email').textContent = leave.userEmail || '-';
  document.getElementById('detail-leave-type').textContent = leave.leaveType;
  document.getElementById('detail-applied-at').textContent = formatDate(leave.appliedAt);
  document.getElementById('detail-from-date').textContent = formatDate(leave.fromDate);
  document.getElementById('detail-to-date').textContent = formatDate(leave.toDate);
  document.getElementById('detail-reason').textContent = leave.reason;

  const badgeContainer = document.getElementById('detail-status-badge');
  badgeContainer.innerHTML = renderStatusBadge(leave.status);

  const approveBtn = document.getElementById('detail-approve-btn');
  const rejectBtn = document.getElementById('detail-reject-btn');
  const decisionBox = document.getElementById('decision-info-box');

  if (leave.status === 'PENDING') {
    approveBtn.disabled = false;
    rejectBtn.disabled = false;
    decisionBox.classList.add('d-none');
  } else {
    // Disabled if not PENDING
    approveBtn.disabled = true;
    rejectBtn.disabled = true;
    approveBtn.title = 'Only pending requests can be approved';
    rejectBtn.title = 'Only pending requests can be rejected';

    decisionBox.classList.remove('d-none');
    document.getElementById('detail-decided-at').textContent = formatDate(leave.decidedAt);
    document.getElementById('detail-decided-by').textContent = leave.decidedByName || 'Administrator';

    const rejRow = document.getElementById('detail-rejection-row');
    const rejReason = document.getElementById('detail-rejection-reason');
    if (rejRow && rejReason) {
      if (leave.status === 'REJECTED' && leave.rejectionReason) {
        rejReason.textContent = leave.rejectionReason;
        rejRow.classList.remove('d-none');
      } else {
        rejRow.classList.add('d-none');
      }
    }
  }
}

function openModal(action) {
  if (!currentLeave || currentLeave.status !== 'PENDING') {
    showToast('Action not allowed. Request is already ' + (currentLeave ? currentLeave.status : 'decided'), 'warning');
    return;
  }

  activeAction = action;
  const promptEl = document.getElementById('decisionModalPrompt');
  const confirmBtn = document.getElementById('modalConfirmBtn');
  const reasonBox = document.getElementById('detail-reject-reason-box');
  const reasonInput = document.getElementById('detail-rejection-reason-input');

  if (action === 'APPROVE') {
    promptEl.textContent = `Approve leave request #${currentLeave.id} for ${currentLeave.userName}?`;
    confirmBtn.className = 'btn btn-success rounded-pill px-4';
    confirmBtn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Approve Leave';
    if (reasonBox) reasonBox.classList.add('d-none');
    if (reasonInput) reasonInput.value = '';
  } else {
    promptEl.textContent = `Please specify the rejection reason to reply to ${currentLeave.userName}:`;
    confirmBtn.className = 'btn btn-danger rounded-pill px-4';
    confirmBtn.innerHTML = '<i class="bi bi-x-lg me-1"></i>Reject Leave';
    if (reasonBox) reasonBox.classList.remove('d-none');
    if (reasonInput) {
      reasonInput.value = '';
      setTimeout(() => reasonInput.focus(), 300);
    }
  }

  if (bsDecisionModal) bsDecisionModal.show();
}

async function executeDecision() {
  if (!currentLeave || !activeAction) return;

  const reasonInput = document.getElementById('detail-rejection-reason-input');
  let reasonText = '';

  if (activeAction === 'REJECT') {
    reasonText = reasonInput ? reasonInput.value.trim() : '';
    if (!reasonText) {
      showToast('Please enter a rejection reason so the employee receives your reply.', 'warning');
      if (reasonInput) reasonInput.focus();
      return;
    }
  }

  const confirmBtn = document.getElementById('modalConfirmBtn');
  setButtonLoading(confirmBtn, true, 'Updating...');

  const endpoint = (activeAction === 'APPROVE')
    ? `/leaves/${currentLeave.id}/approve`
    : `/leaves/${currentLeave.id}/reject`;

  try {
    const options = { method: 'PUT' };
    if (activeAction === 'REJECT') {
      options.body = JSON.stringify({ reason: reasonText });
    }

    const res = await apiRequest(endpoint, options);
    if (bsDecisionModal) bsDecisionModal.hide();

    showToast(
      activeAction === 'APPROVE' 
        ? 'Leave request approved successfully' 
        : 'Leave request rejected and reply sent to employee',
      activeAction === 'APPROVE' ? 'success' : 'danger'
    );

    // Refresh display
    currentLeave = res.data;
    renderDetails(currentLeave);
  } catch (err) {
    showToast('Failed to update request: ' + err.message, 'danger');
  } finally {
    setButtonLoading(confirmBtn, false);
  }
}
