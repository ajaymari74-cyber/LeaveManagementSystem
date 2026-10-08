document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAuth('EMPLOYEE');
  if (!user) return;

  // Set user info
  const nameEl = document.getElementById('user-display-name');
  const emailEl = document.getElementById('user-display-email');
  const welcomeEl = document.getElementById('welcome-name');
  if (nameEl) nameEl.textContent = user.name;
  if (emailEl) emailEl.textContent = user.email;
  if (welcomeEl) welcomeEl.textContent = user.name;

  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const sidebar = document.getElementById('sidebar');
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('show');
    });
  }

  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  // Load employee leaves
  try {
    const res = await apiRequest('/leaves/my', { method: 'GET' });
    const leaves = res.data || [];

    // Calculate stats
    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;

    leaves.forEach(l => {
      if (l.status === 'PENDING') pendingCount++;
      else if (l.status === 'APPROVED') approvedCount++;
      else if (l.status === 'REJECTED') rejectedCount++;
    });

    document.getElementById('stat-total').textContent = leaves.length;
    document.getElementById('stat-pending').textContent = pendingCount;
    document.getElementById('stat-approved').textContent = approvedCount;
    document.getElementById('stat-rejected').textContent = rejectedCount;

    const emptyState = document.getElementById('empty-state');
    const tableContainer = document.getElementById('table-container');
    const tbody = document.getElementById('recent-leaves-body');

    if (leaves.length === 0) {
      tableContainer.classList.add('d-none');
      emptyState.classList.remove('d-none');
      loadLottie('empty-lottie', 'assets/lottie/empty-state.json', true);
    } else {
      emptyState.classList.add('d-none');
      tableContainer.classList.remove('d-none');
      tbody.innerHTML = '';

      // Take first 5 recent
      const recent = leaves.slice(0, 5);
      recent.forEach(leave => {
        const hasRejection = leave.status === 'REJECTED' && leave.rejectionReason;
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td data-label="Type"><span class="fw-semibold">${leave.leaveType}</span></td>
          <td data-label="Duration">${formatDate(leave.fromDate)} &rarr; ${formatDate(leave.toDate)}</td>
          <td data-label="Applied On" class="text-muted-custom small">${formatDate(leave.appliedAt)}</td>
          <td data-label="Reason">
            <div class="text-truncate" style="max-width: 220px;" title="${escapeHtml(leave.reason)}">${escapeHtml(leave.reason)}</div>
            ${hasRejection ? `
              <div class="mt-1 small p-1 px-2 rounded-2" style="background-color: #FFF2F2; color: #DC2626; border: 1px solid #FECACA; font-size: 11.5px; max-width: 260px; word-break: break-word;">
                <i class="bi bi-chat-left-dots-fill me-1"></i><strong>Admin Reply:</strong> ${escapeHtml(leave.rejectionReason)}
              </div>
            ` : ''}
          </td>
          <td data-label="Status">${renderStatusBadge(leave.status)}</td>
        `;
        tbody.appendChild(tr);
      });
    }
  } catch (err) {
    showToast('Failed to load leave records: ' + err.message, 'danger');
  }
});

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
