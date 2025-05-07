function applyDarkMode(settings) {
  const styleId = 'custom-dark-mode-style';
  let styleTag = document.getElementById(styleId);
  if (styleTag) styleTag.remove();
  if (!settings.enabled) return;

  styleTag = document.createElement('style');
  styleTag.id = styleId;

  const themes = {
    classic: {
      bg: "#121212",
      fg: "#e0e0e0",
      link: "#90caf9"
    },
    midnight: {
      bg: "#0a0a0a",
      fg: "#b0b0b0",
      link: "#6ab7ff"
    },
    focus: {
      bg: "#1a150a",
      fg: "#f5eac2",
      link: "#ffd54f"
    },
    minimal: {
      bg: "#2b2b2b",
      fg: "#d0d0d0",
      link: "#a5d6a7"
    }
  };

  const theme = themes[settings.theme] || themes.classic;

  styleTag.textContent = `
    html {
      filter:
        brightness(${settings.brightness}%)
        contrast(${settings.contrast}%)
        hue-rotate(${settings.hue}deg);
    }
    html, body, div, section, article, main, header, footer, nav, aside {
      background-color: ${theme.bg} !important;
      color: ${theme.fg} !important;
    }
    * {
      background-color: transparent !important;
      border-color: #444 !important;
      color: ${theme.fg} !important;
    }
    a {
      color: ${theme.link} !important;
    }
    img, video {
      filter: brightness(90%) contrast(95%) !important;
    }
    ${settings.customCSS}
  `;
  document.head.appendChild(styleTag);
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "UPDATE_SETTINGS") {
    applyDarkMode(msg.settings);
  }
  if (msg.type === "UPDATE_CUSTOM_CSS") {
    applyDarkMode({ ...msg.settings, customCSS: msg.customCSS });
  }
});
