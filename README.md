# GTM & CMP Helper - Chrome Extension

[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-Install-blue?logo=google-chrome&logoColor=white)](https://chromewebstore.google.com/detail/gtm-helper/kbnbkogeeackdjiibllebnpdccbmepil)
[![Version](https://img.shields.io/badge/version-3.0-blue.svg)](#)

GTM & CMP Helper is a Chrome Extension for resetting Consent Management Platform (CMP) data, injecting Google Tag Manager containers, and managing data during development and debugging.

---

## Installation

### Primary Method (Recommended)
**[Install via Chrome Web Store](https://chromewebstore.google.com/detail/gtm-helper/kbnbkogeeackdjiibllebnpdccbmepil)**

### For Developers
To load the extension manually from this repository:
1. Download or clone this repository.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **"Developer mode"**.
4. Click **"Load unpacked"** and select the project folder.

---

## Features

### 1. GTM Container Injection
Injects GTM container code into the current page.
- **Advanced Parameters:** Supports `gtm_auth` and `gtm_preview` environment tokens.
- **GA4 Debugging:** Allows using GA4 DebugView by providing preview tokens without the official Tag Assistant.
- **Positioning:** Options for injection in `<head>` or `<body>`.

### 2. CMP Detection & Reset
Identifies the active Consent Management Platform on a website.
- **Specific Reset:** Clears cookies and storage keys for the identified CMP.
- **Global Reset:** Option to clear all known consent-related data (supports 60+ CMPs).

### 3. User Interface
- **Theme:** Dark mode by default with an optional light mode toggle.
- **Language:** Available in English and German.
- **Architecture:** Built with CSS Grid and modern extension standards (Manifest V3).

---

## Usage

1. **GTM Injection:** Enter the container code in the text area, enable the checkbox, and click **Save & Reload**.
2. **Advanced Settings:** Open the accordion to enter environment-specific tokens.
3. **Consent Reset:** Use the **CMP Reset** link in the detection box or the **Clear Consent** button in the footer.

---

## Links

- **Documentation:** [analytrix.de/gtm-helper](https://www.analytrix.de/gtm-helper-chrome-extension.html)
- **Checkup Tool:** Integrated shortcut to the Analytrix GTM Checkup.

---

*Developed by [Analytrix](https://www.analytrix.de).*
