function applyDarkMode(settings) {
  const styleId = 'custom-dark-mode-style';
  let styleTag = document.getElementById(styleId);

  // Remove previous style if it exists
  if (styleTag) styleTag.remove();

  // Don't apply dark mode if disabled
  if (!settings.enabled) return;

  // Create and apply new style
  styleTag = document.createElement('style');
  styleTag.id = styleId;
  styleTag.textContent = `
    html {
      filter: brightness(${settings.brightness}%) contrast(${settings.contrast}%);
    }
    html, body, div, section, article, main, header, footer, nav, aside {
      background-color: #121212 !important;
      color: #e0e0e0 !important;
    }
    * {
      background-color: transparent !important;
      border-color: #444 !important;
      color: #e0e0e0 !important;
    }
    a {
      color: #90caf9 !important;
    }
    img, video {
      filter: brightness(90%) contrast(95%) !important;
    }
  `;
  document.head.appendChild(styleTag);
}

// Retrieve settings for the current site
function getSettings(callback) {
  const url = location.hostname;
  chrome.storage.sync.get([url], (result) => {
    callback(result[url] || { enabled: false, brightness: 100, contrast: 100 });
  });
}

// Apply settings on page load
getSettings(applyDarkMode);

// Listen for updates from popup.js
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "UPDATE_SETTINGS") {
    applyDarkMode(msg.settings);
  }
});
