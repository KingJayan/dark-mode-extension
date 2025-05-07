const toggle = document.getElementById('toggle');
const brightness = document.getElementById('brightness');
const contrast = document.getElementById('contrast');
const hue = document.getElementById('hue');
const theme = document.getElementById('theme');

const brightnessVal = document.getElementById('brightnessVal');
const contrastVal = document.getElementById('contrastVal');
const hueVal = document.getElementById('hueVal');
const customCSS = document.getElementById('customCSS');
const shortcutInput = document.getElementById('shortcut');
const resetButton = document.getElementById('reset');
const applyButton = document.getElementById('apply');

let currentHost = '';
let debounceTimeout = null;
let currentShortcut = 'Ctrl+Shift+G';

function updateUI(settings) {
  toggle.checked = settings.enabled;
  brightness.value = settings.brightness;
  contrast.value = settings.contrast;
  hue.value = settings.hue;
  theme.value = settings.theme;

  brightnessVal.textContent = settings.brightness;
  contrastVal.textContent = settings.contrast;
  hueVal.textContent = settings.hue;
  customCSS.value = settings.customCSS || '';
}

function saveSettings(settings) {
  chrome.storage.sync.set({ [currentHost]: settings });
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: "UPDATE_SETTINGS", settings })
      .catch((error) => {
        console.warn("Could not send message to content script:", error.message);
      });
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
          theme: "classic",
          customCSS: ""
        });
      });
    } catch (e) {
      console.error("Invalid URL");
    }
  });
}

getSettingsForSite(updateUI);

function updateAndSaveDebounced() {
  const settings = {
    enabled: toggle.checked,
    brightness: parseInt(brightness.value),
    contrast: parseInt(contrast.value),
    hue: parseInt(hue.value),
    theme: theme.value,
    customCSS: customCSS.value
  };

  updateUI(settings);

  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => saveSettings(settings), 300); // wait 300ms after last change
}

// Add event listeners for input change and save settings
toggle.addEventListener('change', updateAndSaveDebounced);
theme.addEventListener('change', updateAndSaveDebounced);
brightness.addEventListener('input', () => {
  brightnessVal.textContent = brightness.value;
  updateAndSaveDebounced();
});
contrast.addEventListener('input', () => {
  contrastVal.textContent = contrast.value;
  updateAndSaveDebounced();
});
hue.addEventListener('input', () => {
  hueVal.textContent = hue.value;
  updateAndSaveDebounced();
});

// Handle reset to default
resetButton.addEventListener('click', () => {
  const resetSettings = {
    enabled: toggle.checked,
    brightness: 100,
    contrast: 100,
    hue: 0,
    theme: "classic",
    customCSS: ""
  };
  updateUI(resetSettings);
  saveSettings(resetSettings);
  customCSS.value = ''; // Reset custom CSS field
});

// Handle apply custom CSS
applyButton.addEventListener('click', () => {
  const settings = {
    enabled: toggle.checked,
    brightness: parseInt(brightness.value),
    contrast: parseInt(contrast.value),
    hue: parseInt(hue.value),
    theme: theme.value,
    customCSS: customCSS.value
  };
  saveSettings(settings);
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: "UPDATE_CUSTOM_CSS", customCSS: customCSS.value });
  });
});

// Handle keyboard shortcut input
shortcutInput.value = currentShortcut;
shortcutInput.addEventListener('input', () => {
  const newShortcut = shortcutInput.value.trim();
  if (newShortcut) {
    currentShortcut = newShortcut;
    chrome.commands.update({
      name: 'toggle-dark-mode',
      shortcut: currentShortcut
    });
    console.log(`Shortcut updated to: ${currentShortcut}`);
  }
});

// Handling keyboard shortcuts with commands API
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-dark-mode') {
    // Toggle dark mode based on the current host's settings
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      chrome.storage.sync.get([tab.url], (result) => {
        const settings = result[tab.url] || {
          enabled: false,
          brightness: 100,
          contrast: 100,
          hue: 0,
          theme: "classic",
          customCSS: ""
        };
        settings.enabled = !settings.enabled; // Toggle dark mode on/off
        saveSettings(settings);
        chrome.tabs.sendMessage(tab.id, { type: "UPDATE_SETTINGS", settings });
      });
    });
  }
});
