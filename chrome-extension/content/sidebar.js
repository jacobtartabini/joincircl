async function login() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  document.getElementById('login-error').style.display = 'none';

  try {
    const res = await fetch('https://app.joincircl.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    chrome.storage.local.set({ circl_token: data.token }, () => {
      loadUserData();
    });
  } catch (err) {
    document.getElementById('login-error').innerText = err.message;
    document.getElementById('login-error').style.display = 'block';
  }
}

function logout() {
  chrome.storage.local.remove('circl_token', () => {
    document.getElementById('user-card').style.display = 'none';
    document.getElementById('login-card').style.display = 'flex';
  });
}

async function loadUserData() {
  chrome.storage.local.get('circl_token', async (result) => {
    const token = result.circl_token;
    if (!token) return;

    try {
      const res = await fetch('https://app.joincircl.com/api/user/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const user = await res.json();
      if (!res.ok) throw new Error('Session expired');

      document.getElementById('login-card').style.display = 'none';
      document.getElementById('user-card').style.display = 'flex';
      document.getElementById('welcome-msg').innerText = `Welcome, ${user.name || user.email}`;
      document.getElementById('user-email').innerText = user.email;
    } catch (err) {
      chrome.storage.local.remove('circl_token', () => {
        document.getElementById('user-card').style.display = 'none';
        document.getElementById('login-card').style.display = 'flex';
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', loadUserData);
