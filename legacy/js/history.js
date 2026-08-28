
    
document.addEventListener('DOMContentLoaded', () => {
  const history = Storage.get('history') || [];
  const tbody = document.getElementById('history-body');
  const table = document.getElementById('history-table');
  const emptyState = document.getElementById('empty-history');
  
  if (history.length === 0) {
    table.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }
  
  history.forEach((item, i) => {
    const tr = document.createElement('tr');
    tr.className = 'animate-fade-in';
    tr.style.animationDelay = `${i * 0.05}s`;
    
    let resClass = 'res-loss';
    let prefix = '-';
    if (item.result === 'Win') {
      resClass = 'res-win';
      prefix = '+';
    } else if (item.result === 'Reward') {
      resClass = 'res-reward';
      prefix = '+';
    }
    
    tr.innerHTML = `
      <td>${item.game}</td>
      <td class="${resClass}">${item.result}</td>
      <td class="${resClass}">${prefix}${item.amount.toLocaleString()} 🪙</td>
      <td class="text-muted">${item.date} ${new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
    `;
    
    tbody.appendChild(tr);
  });
});
