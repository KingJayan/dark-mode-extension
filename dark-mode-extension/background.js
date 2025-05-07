 chrome.runtime.onInstalled.addListener(() => {
  chrome.commands.onCommand.addListener((command) => {
    if (command === "toggle-dark-mode") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { type: "TOGGLE_DARK_MODE" });
      });
    }
  });
});
