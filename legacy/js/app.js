// Global App Utilities

// Toast Notification System
window.Toast = {
  show(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';

    toast.innerHTML = `
      <i class="fas ${icon}"></i>
      <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after 3s
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
};

// Set Active Nav Item
function setActiveNav() {
  const path = window.location.pathname;
  const page = path.split('/').pop() || 'index.html';
  
  document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(link => {
    if (link.getAttribute('href') === page || link.getAttribute('href') === './' + page) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
});
