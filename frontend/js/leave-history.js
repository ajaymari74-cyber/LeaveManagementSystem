let allLeaves = [];
let currentFilter = 'ALL';

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

  setupFilterChips();
  await loadLeaveHistory();
});

async function loadLeaveHistory() {
  try {
    const res = await apiRequest('/leaves/my', { method: 'GET' });
    allLeaves = res.data || [];
    updateCounts();
    renderFilteredLeaves();
  } catch (err) {
    showToast('Failed to load leave history: ' + err.message, 'danger');
  }
}

function updateCounts() {
  let pending = 0, approved = 0, rejected = 0;
  allLeaves.forEach(l => {
    if (l.status === 'PENDING') pending++;
    else if (l.status === 'APPROVED') approved++;
    else if (l.status === 'REJECTED') rejected++;
  });

  document.getElementById('count-all').textContent = allLeaves.length;
  document.getElementById('count-pending').textContent = pending;
  document.getElementById('count-approved').textContent = approved;
  document.getElementById('count-rejected').textContent = rejected;
}

function setupFilterChips() {
  const chips = document.querySelectorAll('#filter-chips .filter-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.getAttribute('data-filter');
      renderFilteredLeaves();
    });
  });
}

function renderFilteredLeaves() {
  const tbody = document.getElementById('history-tbody');
  const emptyState = document.getElementById('empty-state');
  const tableContainer = document.getElementById('table-container');

  const filtered = (currentFilter === 'ALL')
    ? allLeaves
    : allLeaves.filter(l => l.status === currentFilter);

  if (filtered.length === 0) {
    tableContainer.classList.add('d-none');
    emptyState.classList.remove('d-none');
    loadLottie('empty-lottie', 'assets/lottie/empty-state.json', true);
  } else {
    emptyState.classList.add('d-none');
    tableContainer.classList.remove('d-none');
    tbody.innerHTML = '';

    filtered.forEach(leave => {
      const hasRejection = leave.status === 'REJECTED' && leave.rejectionReason;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td data-label="Leave Type"><span class="fw-semibold">${leave.leaveType}</span></td>
        <td data-label="From">${formatDate(leave.fromDate)}</td>
        <td data-label="To">${formatDate(leave.toDate)}</td>
        <td data-label="Reason" style="max-width: 280px;" class="text-break">
          <div>${escapeHtml(leave.reason)}</div>
          ${hasRejection ? `
            <div class="mt-2 p-2 rounded-2" style="background-color: #FFF2F2; color: #DC2626; border: 1px solid #FECACA; font-size: 12px; line-height: 1.4;">
              <div class="fw-bold d-flex align-items-center gap-1 mb-1">
                <i class="bi bi-chat-left-dots-fill"></i> Admin Rejection Reply:
              </div>
              <div>${escapeHtml(leave.rejectionReason)}</div>
            </div>
          ` : ''}
        </td>
        <td data-label="Applied On" class="text-muted-custom small">${formatDate(leave.appliedAt)}</td>
        <td data-label="Status">${renderStatusBadge(leave.status)}</td>
      `;
      tbody.appendChild(tr);
    });
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
