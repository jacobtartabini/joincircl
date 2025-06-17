const iframe = document.createElement('iframe');
iframe.src = chrome.runtime.getURL('content/sidebar.html');
iframe.style.position = 'fixed';
iframe.style.top = '0';
iframe.style.right = '0';
iframe.style.width = '0';
iframe.style.height = '100%';
iframe.style.zIndex = '9999';
iframe.style.border = 'none';
iframe.style.transition = 'width 0.3s ease';
iframe.id = 'circlSidebar';

document.body.appendChild(iframe);

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.toggle === 'sidebar') {
    iframe.style.width = iframe.style.width === '0px' ? '350px' : '0';
  }
});
