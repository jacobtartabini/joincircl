// Check for authentication token on script load
const token = localStorage.getItem("authToken");
if (!token) {
  // Redirect to login if token missing
  window.location.href = "./content/login.html";
} else {
  // Optional: validate token or fetch user profile here
  console.log("Authenticated with token:", token);
}

// Basic debounce helper
function debounce(fn, delay = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

// Setup sidebar after DOM loads
document.addEventListener('DOMContentLoaded', () => {
  // Example initial data load
  chrome.storage.sync.get(['actions', 'contacts', 'keystones'], (res) => {
    window.appData = {
      actions: res.actions || [],
      contacts: res.contacts || [],
      keystones: res.keystones || [],
    };
    renderResults(); // Initially render actions list
  });

  // Search input with debounce
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', debounce(() => {
    renderResults();
  }, 200));
});

// Renders results based on current input and data
function renderResults() {
  const q = document.getElementById('searchInput').value.toLowerCase().trim();
  const container = document.getElementById('resultsContainer');
  container.innerHTML = '';

  if (!q) {
    window.appData.actions.forEach(renderAction);
    return;
  }

  // Filter
  window.appData.actions.filter(a =>
    (a.label + ' ' + (a.description || '') + ' ' + (a.category || '')).toLowerCase().includes(q)
  ).forEach(renderAction);

  window.appData.contacts.filter(c =>
    [c.name, c.company_name, c.personal_email, c.job_title].join(' ')
      .toLowerCase().includes(q)
  ).forEach(renderContact);

  window.appData.keystones.filter(k =>
    [k.title, k.category, k.notes].join(' ')
      .toLowerCase().includes(q)
  ).forEach(renderKeystone);
}

// Render helpers
function renderAction(a) {
  const div = document.createElement('div');
  div.className = 'result-item';
  div.innerHTML = `
    <span class="icon">${a.icon}</span>
    <span class="label">${a.label}</span>
  `;
  div.onclick = () => a.handler && a.handler();
  document.getElementById('resultsContainer').appendChild(div);
}

function renderContact(c) {
  const div = document.createElement('div');
  div.className = 'result-item';
  div.textContent = `👥 ${c.name}`;
  div.onclick = () => console.log('Selected contact', c.id);
  document.getElementById('resultsContainer').appendChild(div);
}

function renderKeystone(k) {
  const div = document.createElement('div');
  div.className = 'result-item';
  div.textContent = `📅 ${k.title}`;
  div.onclick = () => console.log('Selected keystone', k.id);
  document.getElementById('resultsContainer').appendChild(div);
}

// Logout function to clear token and redirect to login
function logout() {
  localStorage.removeItem("authToken");
  window.location.href = "./content/login.html";
}
