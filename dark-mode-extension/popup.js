const toggle = document.getElementById('toggle');
const brightness = document.getElementById('brightness');
const contrast = document.getElementById('contrast');
const hue = document.getElementById('hue');
const theme = document.getElementById('theme');
const customCSS = document.getElementById('customCSS');
const brightnessVal = document.getElementById('brightnessVal');
const contrastVal = document.getElementById('contrastVal');
const hueVal = document.getElementById('hueVal');
const exportButton = document.getElementById('export');
const importButton = document.getElementById('import');
const resetButton = document.getElementById('reset');
const applyCSSButton = document.getElementById('applyCSS');
const toggleCSSButton = document.getElementById('toggleCSS');
const shortcutInput = document.getElementById('shortcutInput');

let currentHost = '';
let debounceTimeout = null;
let currentShortcut = 'Ctrl+Shift+G';

// Update UI
function updateUI(settings) {
  toggle.checked = settings.enabled;
  brightness.value = settings.brightness;
  contrast.value = settings.contrast;
  hue.value = settings.hue;
  theme.value = settings.theme;
  customCSS.value = settings.customCSS || '';
  brightnessVal.textContent = settings.brightness;
  contrastVal.textContent = settings.contrast;
  hueVal.textContent = settings.hue;
}

// Save settings to storage
function saveSettings(settings) {
  chrome.storage.sync.set({ [currentHost]: settings });
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: "UPDATE_SETTINGS", settings });
  });
}

// Get settings for the current site
function getSettingsForSite(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    try {
      const url = new URL(tabs[0].url);
      currentHost = url.hostname + url.pathname;
      chrome.storage.sync.get([currentHost], (result) => {
        callback(result[currentHost] || {
          enabled: false,
          brightness: 100,
          contrast: 100,
          hue: 0,
          theme: "classic",
          customCSS: ''
        });
      });
    } catch (e) {
      console.error("Invalid URL");
    }
  });
}

getSettingsForSite(updateUI);

// Handle input changes
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
  debounceTimeout = setTimeout(() => saveSettings(settings), 300); // debounce
}

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
customCSS.addEventListener('input', updateAndSaveDebounced);

// Apply custom CSS
applyCSSButton.addEventListener('click', () => {
  const settings = {
    enabled: toggle.checked,
    brightness: parseInt(brightness.value),
    contrast: parseInt(contrast.value),
    hue: parseInt(hue.value),
    theme: theme.value,
    customCSS: customCSS.value
  };
  saveSettings(settings);
});

// Reset settings
resetButton.addEventListener('click', () => {
  const resetSettings = {
    enabled: toggle.checked, // keep current enabled state
    brightness: 100,
    contrast: 100,
    hue: 0,
    theme: "classic",
    customCSS: '' // Reset custom CSS as well
  };
  updateUI(resetSettings);
  saveSettings(resetSettings);
});

// Toggle collapsible CSS section
toggleCSSButton.addEventListener('click', () => {
  const cssSection = document.getElementById('cssSection');
  cssSection.classList.toggle('collapsed');
  toggleCSSButton.textContent = cssSection.classList.contains('collapsed') ? 'Show Custom CSS' : 'Hide Custom CSS';
});

// Export settings
exportButton.addEventListener('click', () => {
  chrome.storage.sync.get([currentHost], (result) => {
    const settings = result[currentHost];
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentHost}-settings.json`;
    link.click();
  });
});

// Import settings
importButton.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const importedSettings = JSON.parse(event.target.result);
      saveSettings(importedSettings);
      updateUI(importedSettings);
    };
    reader.readAsText(file);
  }
});

// Handle keyboard shortcut input
shortcutInput.addEventListener('input', () => {
  currentShortcut = shortcutInput.value;
  chrome.storage.sync.set({ shortcut: currentShortcut });
  updateKeyboardShortcut(currentShortcut);
});

// Update the keyboard shortcut for toggling dark mode
function updateKeyboardShortcut(shortcut) {
  chrome.commands.update({
    command: 'toggle-dark-mode',
    shortcut: shortcut
  });
}

// Get and set keyboard shortcut
chrome.storage.sync.get('shortcut', (result) => {
  currentShortcut = result.shortcut || 'Ctrl+Shift+G';
  shortcutInput.value = currentShortcut;
  updateKeyboardShortcut(currentShortcut);
});
