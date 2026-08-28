export const showToast = (message, type = 'success') => {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon" style="font-size: 1.2rem;">
      ${type === 'success' ? '<i class="fas fa-check-circle" style="color: var(--accent-success)"></i>' : '<i class="fas fa-exclamation-circle" style="color: var(--accent-danger)"></i>'}
    </div>
    <div class="toast-message" style="font-weight: 600;">${message}</div>
  `;
  
  container.appendChild(toast);

  // Trigger CSS transition animation
  setTimeout(() => toast.classList.add('show'), 10);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3000);
};
