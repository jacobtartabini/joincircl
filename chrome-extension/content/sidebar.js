// Load user data from Chrome storage
chrome.storage.sync.get(['userData'], function(result) {
  const user = result.userData;
  if (user) {
    // Simulated Circles & Keystones rendering
    renderList('circlesList', user.circles || []);
    renderList('keystonesList', user.keystones || []);
  } else {
    document.getElementById('sidebar').innerHTML = '<p>Please sign in to view your Circl dashboard.</p>';
  }
});

function renderList(containerId, items) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'card';
    div.textContent = item.name || item.title;
    container.appendChild(div);
  });
}

// Optional handlers
document.getElementById('addContactBtn').addEventListener('click', () => {
  alert('Add Contact clicked!');
});

document.getElementById('addEventBtn').addEventListener('click', () => {
  alert('Add Event clicked!');
});
