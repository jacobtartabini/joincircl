chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Try sending the toggle message
    chrome.tabs.sendMessage(tab.id, { toggle: 'sidebar' }, (response) => {
      if (chrome.runtime.lastError) {
        // If content script isn't there, inject it
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['inject.js'],
        }, () => {
          // Try again after injecting
          chrome.tabs.sendMessage(tab.id, { toggle: 'sidebar' });
        });
      }
    });
  } catch (err) {
    console.error('Failed to inject sidebar:', err);
  }
});
