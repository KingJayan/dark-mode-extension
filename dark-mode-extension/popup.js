 const toggle = document.getElementById('toggle');
const brightness = document.getElementById('brightness');
const contrast = document.getElementById('contrast');
const brightnessVal = document.getElementById('brightnessVal');
const contrastVal = document.getElementById('contrastVal');

let currentHost = '';

function updateUI(settings) {
  toggle.checked = settings.enabled;
  brightness.value = settings.brightness;
  contrast.value = settings.contrast;
  brightnessVal.textContent = settings.brightness;
  contrastVal.textContent = settings.contrast;
}

function saveSettings(settings) {
  chrome.storage.sync.set({ [currentHost]: settings });
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: "UPDATE_SETTINGS", settings });
  });
}

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  try {
    const url = new URL(tabs[0].url);
    currentHost = url.hostname;
    chrome.storage.sync.get([currentHost], (result) => {
      const settings = result[currentHost] || { enabled: false, brightness: 100, contrast: 100 };
      updateUI(settings);
    });
  } catch (e) {
    console.error("Invalid URL");
  }
});

toggle.addEventListener('change', () => {
  saveSettings({
    enabled: toggle.checked,
    brightness: parseInt(brightness.value),
    contrast: parseInt(contrast.value)
  });
});

[brightness, contrast].forEach(input => {
  input.addEventListener('input', () => {
    brightnessVal.textContent = brightness.value;
    contrastVal.textContent = contrast.value;
    saveSettings({
      enabled: toggle.checked,
      brightness: parseInt(brightness.value),
      contrast: parseInt(contrast.value)
    });
  });
});
