chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  // Inject capture.js into the active tab
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['capture.js'],
  });

  // Show the capture mode selection toolbar (full page / select element)
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['toolbar.js'],
  });
});
