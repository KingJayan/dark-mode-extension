 function applyDarkMode(settings) {
  const styleId = 'custom-dark-mode-style';
  let styleTag = document.getElementById(styleId);

  if (styleTag) styleTag.remove();
  if (!settings.enabled) return;

  styleTag = document.createElement('style');
  styleTag.id = styleId;
  styleTag.textContent = `
    html {
      filter: brightness(${settings.brightness}%) contrast(${settings.contrast}%);
      background: #121212 !important;
      color: #e0e0e0 !important;
    }
    img, video {
      filter: brightness(90%) contrast(95%) !important;
    }
  `;
  document.head.appendChild(styleTag);
}

function getSettings(callback) {
  const url = location.hostname;
  chrome.storage.sync.get([url], (result) => {
    callback(result[url] || { enabled: false, brightness: 100, contrast: 100 });
  });
}

getSettings(applyDarkMode);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "UPDATE_SETTINGS") {
    applyDarkMode(msg.settings);
  }
});
