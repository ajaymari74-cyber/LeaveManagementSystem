function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'custom-toast';

  let iconHtml = '<i class="bi bi-info-circle text-primary"></i>';
  let borderStyle = 'border-left: 4px solid var(--primary);';

  if (type === 'success') {
    iconHtml = '<i class="bi bi-check-circle-fill" style="color: var(--status-approved);"></i>';
    borderStyle = 'border-left: 4px solid var(--status-approved);';
  } else if (type === 'danger' || type === 'error') {
    iconHtml = '<i class="bi bi-exclamation-circle-fill" style="color: var(--status-rejected);"></i>';
    borderStyle = 'border-left: 4px solid var(--status-rejected);';
  } else if (type === 'warning') {
    iconHtml = '<i class="bi bi-exclamation-triangle-fill" style="color: var(--status-pending);"></i>';
    borderStyle = 'border-left: 4px solid var(--status-pending);';
  }

  toast.style = borderStyle;
  toast.innerHTML = `
    <div style="font-size: 1.2rem; line-height: 1;">${iconHtml}</div>
    <div style="flex-grow: 1; font-weight: 500;">${message}</div>
    <button type="button" class="btn-close" style="font-size: 0.75rem;" aria-label="Close"></button>
  `;

  const closeBtn = toast.querySelector('.btn-close');
  closeBtn.addEventListener('click', () => toast.remove());

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }
  }, 4000);
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

function renderStatusBadge(status) {
  const s = String(status).toUpperCase();
  if (s === 'PENDING') {
    return `<span class="badge-pending"><i class="bi bi-clock-history"></i> Pending</span>`;
  } else if (s === 'APPROVED') {
    return `<span class="badge-approved"><i class="bi bi-check-circle-fill"></i> Approved</span>`;
  } else if (s === 'REJECTED') {
    return `<span class="badge-rejected"><i class="bi bi-x-circle-fill"></i> Rejected</span>`;
  }
  return `<span class="badge bg-secondary">${status}</span>`;
}

function setButtonLoading(button, isLoading, text = 'Processing...') {
  if (!button) return;
  if (isLoading) {
    button.dataset.originalHtml = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>${text}`;
  } else {
    button.disabled = false;
    if (button.dataset.originalHtml) {
      button.innerHTML = button.dataset.originalHtml;
    }
  }
}

function loadLottie(containerId, jsonPath, loop = true) {
  const container = document.getElementById(containerId);
  if (!container || typeof lottie === 'undefined') return null;
  
  container.innerHTML = '';
  return lottie.loadAnimation({
    container: container,
    renderer: 'svg',
    loop: loop,
    autoplay: true,
    path: jsonPath
  });
}
