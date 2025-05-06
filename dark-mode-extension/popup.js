const toggle = document.getElementById('toggle');
const brightness = document.getElementById('brightness');
const contrast = document.getElementById('contrast');
const hue = document.getElementById('hue');
const theme = document.getElementById('theme');

const brightnessVal = document.getElementById('brightnessVal');
const contrastVal = document.getElementById('contrastVal');
const hueVal = document.getElementById('hueVal');

let currentHost = '';

function updateUI(settings) {
  toggle.checked = settings.enabled;
  brightness.value = settings.brightness;
  contrast.value = settings.contrast;
  hue.value = settings.hue;
  theme.value = settings.theme;

  brightnessVal.textContent = settings.brightness;
  contrastVal.textContent = settings.contrast;
  hueVal.textContent = settings.hue;
}

function saveSettings(settings) {
  chrome.storage.sync.set({ [currentHost]: settings });
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: "UPDATE_SETTINGS", settings });
  });
}

function getSettingsForSite(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    try {
      const url = new URL(tabs[0].url);
      currentHost = url.hostname;
      chrome.storage.sync.get([currentHost], (result) => {
        callback(result[currentHost] || {
          enabled: false,
          brightness: 100,
          contrast: 100,
          hue: 0,
          theme: "classic"
        });
      });
    } catch (e) {
      console.error("Invalid URL");
    }
  });
}

getSettingsForSite(updateUI);

function updateAndSave() {
  const settings = {
    enabled: toggle.checked,
    brightness: parseInt(brightness.value),
    contrast: parseInt(contrast.value),
    hue: parseInt(hue.value),
    theme: theme.value
  };
  updateUI(settings);
  saveSettings(settings);
}

[toggle, brightness, contrast, hue, theme].forEach(el => {
  el.addEventListener('input', updateAndSave);
});
