// Check if sidebar already exists to avoid duplicates
if (!document.getElementById('circlSidebar')) {
  const iframe = document.createElement('iframe');
  iframe.src = chrome.runtime.getURL('content/sidebar.html');
  iframe.style.position = 'fixed';
  iframe.style.top = '0';
  iframe.style.right = '0';
  iframe.style.width = '0px';
  iframe.style.height = '100%';
  iframe.style.zIndex = '999999';
  iframe.style.border = 'none';
  iframe.style.transition = 'width 0.3s ease-in-out';
  iframe.id = 'circlSidebar';
  document.body.appendChild(iframe);
}

// Listener for toggle message
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.toggle === 'sidebar') {
    const sidebar = document.getElementById('circlSidebar');
    if (sidebar) {
      const currentWidth = sidebar.style.width;
      sidebar.style.width = currentWidth === '0px' ? '350px' : '0px';
    }
  }
});
