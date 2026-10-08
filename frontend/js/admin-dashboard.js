let allRequests = [];
let currentFilter = 'ALL';
let activeModalLeave = null;
let activeModalAction = null; // 'APPROVE' or 'REJECT'
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

  // Initialize Bootstrap Modal
  const modalEl = document.getElementById('decisionModal');
  if (modalEl && typeof bootstrap !== 'undefined') {
    bsDecisionModal = new bootstrap.Modal(modalEl);
  }

  const modalConfirmBtn = document.getElementById('modalConfirmBtn');
  if (modalConfirmBtn) {
    modalConfirmBtn.addEventListener('click', handleConfirmDecision);
  }

  setupFilterChips();
  await loadAdminRequests();
});

async function loadAdminRequests() {
  try {
    const res = await apiRequest('/leaves', { method: 'GET' });
    allRequests = res.data || [];
    updateAdminStats();
    renderFilteredRequests();
  } catch (err) {
    showToast('Failed to load leave requests: ' + err.message, 'danger');
  }
}

function updateAdminStats() {
  let pending = 0, approved = 0, rejected = 0;
  allRequests.forEach(r => {
    if (r.status === 'PENDING') pending++;
    else if (r.status === 'APPROVED') approved++;
    else if (r.status === 'REJECTED') rejected++;
  });

  document.getElementById('admin-stat-total').textContent = allRequests.length;
  document.getElementById('admin-stat-pending').textContent = pending;
  document.getElementById('admin-stat-approved').textContent = approved;
  document.getElementById('admin-stat-rejected').textContent = rejected;
}

function setupFilterChips() {
  const chips = document.querySelectorAll('#admin-filter-chips .filter-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.getAttribute('data-filter');
      renderFilteredRequests();
    });
  });
}

function renderFilteredRequests() {
  const tbody = document.getElementById('admin-requests-tbody');
  const emptyState = document.getElementById('admin-empty-state');
  const tableContainer = document.getElementById('admin-table-container');

  const filtered = (currentFilter === 'ALL')
    ? allRequests
    : allRequests.filter(r => r.status === currentFilter);

  if (filtered.length === 0) {
    tableContainer.classList.add('d-none');
    emptyState.classList.remove('d-none');
    loadLottie('empty-lottie', 'assets/lottie/empty-state.json', true);
  } else {
    emptyState.classList.add('d-none');
    tableContainer.classList.remove('d-none');
    tbody.innerHTML = '';

    filtered.forEach(req => {
      const tr = document.createElement('tr');
      const isPending = req.status === 'PENDING';

      let actionHtml = '';
      if (isPending) {
        actionHtml = `
          <div class="d-flex align-items-center justify-content-end gap-2">
            <button class="btn btn-sm btn-success py-1 px-3 rounded-pill approve-btn" data-id="${req.id}">
              <i class="bi bi-check-lg me-1"></i>Approve
            </button>
            <button class="btn btn-sm btn-danger py-1 px-3 rounded-pill reject-btn" data-id="${req.id}">
              <i class="bi bi-x-lg me-1"></i>Reject
            </button>
            <a href="leave-details.html?id=${req.id}" class="btn btn-sm btn-outline-secondary py-1 px-3 rounded-pill" title="Details">
              <i class="bi bi-eye"></i>
            </a>
          </div>
        `;
      } else {
        actionHtml = `
          <div class="d-flex align-items-center justify-content-end gap-2">
            <span class="text-muted-custom small me-1">Decided</span>
            <a href="leave-details.html?id=${req.id}" class="btn btn-sm btn-outline-secondary py-1 px-3 rounded-pill">
              <i class="bi bi-eye me-1"></i>Details
            </a>
          </div>
        `;
      }

      const hasRejection = req.status === 'REJECTED' && req.rejectionReason;
      tr.innerHTML = `
        <td data-label="Employee">
          <div class="fw-semibold">${escapeHtml(req.userName || 'Employee')}</div>
          <div class="text-muted-custom small" style="font-size: 12px;">${escapeHtml(req.userEmail || '')}</div>
        </td>
        <td data-label="Leave Type"><span class="fw-semibold">${req.leaveType}</span></td>
        <td data-label="Dates">${formatDate(req.fromDate)} &rarr; ${formatDate(req.toDate)}</td>
        <td data-label="Reason">
          <div class="text-truncate" style="max-width: 220px;" title="${escapeHtml(req.reason)}">${escapeHtml(req.reason)}</div>
          ${hasRejection ? `
            <div class="mt-1 small p-1 px-2 rounded-2" style="background-color: #FFF2F2; color: #DC2626; border: 1px solid #FECACA; font-size: 11px; max-width: 220px; word-break: break-word;">
              <i class="bi bi-chat-left-dots-fill me-1"></i><strong>Reply:</strong> ${escapeHtml(req.rejectionReason)}
            </div>
          ` : ''}
        </td>
        <td data-label="Applied On" class="text-muted-custom small">${formatDate(req.appliedAt)}</td>
        <td data-label="Status">${renderStatusBadge(req.status)}</td>
        <td data-label="Action" class="text-end">${actionHtml}</td>
      `;

      tbody.appendChild(tr);
    });

    // Wire up buttons
    document.querySelectorAll('.approve-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        openDecisionModal(id, 'APPROVE');
      });
    });

    document.querySelectorAll('.reject-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        openDecisionModal(id, 'REJECT');
      });
    });
  }
}

function openDecisionModal(leaveId, action) {
  const req = allRequests.find(r => r.id === leaveId);
  if (!req) return;

  activeModalLeave = req;
  activeModalAction = action;

  const modalPrompt = document.getElementById('decisionModalPrompt');
  const confirmBtn = document.getElementById('modalConfirmBtn');

  document.getElementById('modal-employee-name').textContent = req.userName || 'Employee #' + req.userId;
  document.getElementById('modal-leave-type').textContent = req.leaveType;
  document.getElementById('modal-leave-duration').textContent = `${formatDate(req.fromDate)} to ${formatDate(req.toDate)}`;
  document.getElementById('modal-leave-reason').textContent = req.reason;

  const reasonBox = document.getElementById('admin-reject-reason-box');
  const reasonInput = document.getElementById('admin-rejection-reason');

  if (action === 'APPROVE') {
    modalPrompt.textContent = 'Are you sure you want to approve this leave request?';
    confirmBtn.className = 'btn btn-success rounded-pill px-4';
    confirmBtn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Approve Leave';
    if (reasonBox) reasonBox.classList.add('d-none');
    if (reasonInput) reasonInput.value = '';
  } else {
    modalPrompt.textContent = 'Please specify the rejection reason to reply to the employee:';
    confirmBtn.className = 'btn btn-danger rounded-pill px-4';
    confirmBtn.innerHTML = '<i class="bi bi-x-lg me-1"></i>Reject Leave';
    if (reasonBox) reasonBox.classList.remove('d-none');
    if (reasonInput) {
      reasonInput.value = '';
      setTimeout(() => reasonInput.focus(), 300);
    }
  }

  if (bsDecisionModal) {
    bsDecisionModal.show();
  }
}

async function handleConfirmDecision() {
  if (!activeModalLeave || !activeModalAction) return;

  const reasonInput = document.getElementById('admin-rejection-reason');
  let reasonText = '';

  if (activeModalAction === 'REJECT') {
    reasonText = reasonInput ? reasonInput.value.trim() : '';
    if (!reasonText) {
      showToast('Please enter a rejection reason so the employee receives your reply.', 'warning');
      if (reasonInput) reasonInput.focus();
      return;
    }
  }

  const confirmBtn = document.getElementById('modalConfirmBtn');
  setButtonLoading(confirmBtn, true, 'Updating...');

  const endpoint = activeModalAction === 'APPROVE'
    ? `/leaves/${activeModalLeave.id}/approve`
    : `/leaves/${activeModalLeave.id}/reject`;

  try {
    const options = { method: 'PUT' };
    if (activeModalAction === 'REJECT') {
      options.body = JSON.stringify({ reason: reasonText });
    }

    const res = await apiRequest(endpoint, options);
    if (bsDecisionModal) bsDecisionModal.hide();
    
    showToast(
      activeModalAction === 'APPROVE' 
        ? 'Leave request approved successfully' 
        : 'Leave request rejected and reason sent to employee',
      activeModalAction === 'APPROVE' ? 'success' : 'danger'
    );

    // Refresh list
    await loadAdminRequests();
  } catch (err) {
    showToast('Failed to update leave: ' + err.message, 'danger');
  } finally {
    setButtonLoading(confirmBtn, false);
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
