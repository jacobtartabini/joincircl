function switchTab(tab) {
  const content = document.getElementById('content');
  if (tab === 'contacts') {
    content.innerHTML = '<h2>Your Circles</h2><p>[List Contacts Here]</p>';
  } else if (tab === 'events') {
    content.innerHTML = '<h2>Keystones</h2><p>[Events Timeline]</p>';
  } else if (tab === 'career') {
    content.innerHTML = '<h2>Career Hub</h2><p>[Resources, Jobs]</p>';
  } else if (tab === 'arlo') {
    content.innerHTML = '<h2>Arlo</h2><p>[Chat Assistant Placeholder]</p>';
  } else if (tab === 'add') {
    content.innerHTML = `
      <h2>Add New Record</h2>
      <form>
        <input type="text" placeholder="Title" /><br />
        <textarea placeholder="Details"></textarea><br />
        <button type="submit">Save</button>
      </form>
    `;
  }
}
