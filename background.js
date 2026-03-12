chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['capture.js'],
  });

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['toolbar.js'],
  });
});

let savedWindowState = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'h2f-resize') {
    const { width, height } = message;
    const windowId = sender.tab.windowId;

    chrome.windows.get(windowId, (win) => {
      savedWindowState = {
        windowId,
        width: win.width,
        height: win.height,
        left: win.left,
        top: win.top,
      };

      chrome.windows.update(windowId, { width, height }, () => {
        setTimeout(() => sendResponse({ success: true }), 500);
      });
    });

    return true;
  }

  if (message.type === 'h2f-restore') {
    if (savedWindowState) {
      const s = savedWindowState;
      chrome.windows.update(s.windowId, {
        width: s.width,
        height: s.height,
        left: s.left,
        top: s.top,
      });
      savedWindowState = null;
    }
    sendResponse({ success: true });
  }
});
