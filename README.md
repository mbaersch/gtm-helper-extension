# GTM & CMP Helper - Chrome Extension

[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-Install-blue?logo=google-chrome&logoColor=white)](https://chromewebstore.google.com/detail/gtm-helper/kbnbkogeeackdjiibllebnpdccbmepil)
[![Version](https://img.shields.io/badge/version-3.5-blue.svg)](#)

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
- **Global Reset:** Option to clear all known consent-related data (supports 130+ CMPs).

### 3. Google Tag & Container Detection
Automatically detects Google tags loaded on the current page — always on, no configuration, no extra permissions.
- **What:** GTM containers and gtag.js tags (GA4, Google Ads, etc.), identified via `window.google_tag_manager` and resource timings.
- **How:** Classifies the load method — `standard` (googletagmanager.com), `first-party` (server-side GTM / Google Tag Gateway), `custom-path`, or `base64` tunnel.
- **Where:** Container count on the toolbar badge, a "Detected Google tags & containers" popup section (ID · method · host), and a console log per new detection.

### 4. GTM Interface Comfort
Display and usability helpers on `tagmanager.google.com` — no extra permissions, no access to container data.
- **Pinned navigation:** the section navigation stays visible while scrolling long lists instead of scrolling out of view.
- **Pinnable search bar:** a toggle in the title bar of the tag, trigger, and variable lists keeps title, search, and buttons at the top while scrolling (default: off).
- **Sorting for parameter tables:** lookup tables, event parameters, and comparable key/value lists can be sorted alphabetically in both directions — by input or output column, custom templates included. The control only appears on tables that can be sorted without data loss.
- **Hide built-in variables:** a switch permanently collapses the rarely needed list so the user-defined variables are reachable without scrolling.
- **Submit dialog warning:** colors the submit button orange whenever the selected action only creates a version instead of publishing.

The toggles remember their state; their labels follow the language of the GTM interface.

### 5. User Interface
- **Theme:** Dark mode by default with an optional light mode toggle.
- **Language:** Available in English and German.
- **Architecture:** Built with CSS Grid and modern extension standards (Manifest V3).

---

## Usage

1. **GTM Injection:** Enter the container code in the text area, enable the checkbox, and click **Save & Reload**.
2. **Advanced Settings:** Open the accordion to enter environment-specific tokens.
3. **Consent Reset:** Use the **CMP Reset** link in the detection box or the **Clear Consent** button in the footer.

---

## Changelog

> Available on the Chrome Web Store since 2019; this changelog covers the 3.x refactor onwards.

### 3.5
- **New — GTM interface comfort:** permanently visible section navigation, optionally pinned title and search bar in the tag, trigger, and variable lists, alphabetical sorting for parameter tables (lookup tables, event parameters, custom templates), and a switch to hide the built-in variables. No new permissions.
- **Note on sorting:** it only appears on tables whose cells contain nothing but text fields. If a column holds anything else — a dropdown, for instance — the control stays away: such a value would not travel along when reordering and would be torn out of its row. Sorting only writes into the input fields anyway; nothing is applied until you save in GTM.

### 3.4
- **New — increased CMP coverage:** the reset now knows about 130 CMPs (previously 70+), including CookieAdmin, DSGVO-Pixelmate, Ezoic, clickskeks, Pressidium, Sellwerk, KookieTool, Cookie Cracker, LWD Cookie Master, several TYPO3 consent tools, and many more. ♥️ **h/t:** The source was a list of CMPs that Joachim Nickel kindly extracted from his tool [exatics](https://www.exatics.de/).

### 3.3
- **New — GTM submit-dialog warning:** on `tagmanager.google.com`, a CSS-only hint colors the submit button orange and tints the selected "Create Version" option whenever the chosen action only creates a version instead of publishing — making it obvious when changes will not go live (e.g. with approve-but-not-publish permissions), where the button caption reads just "Submit" either way. No new permissions.
- **Change:** the "Detected Google tags & containers" popup section now uses blue (matching the toolbar badge count) instead of warning-orange, so it reads as information rather than a warning and stays distinct from the orange Checkup hint.

### 3.2
- **Fix:** the full CMP reset ("clear everything") no longer aborts before deleting cookies. `window.close()` was firing synchronously while the asynchronous delete chain was still running, tearing down the popup context before the cookies were removed (a timing-dependent race). The popup now closes only after the chain completes, and the reset works reliably regardless of the detected CMP.

### 3.1
- **New — Google Tag & Container Detection:** always-on detection of loaded GTM containers and gtag.js tags with load-method classification (standard, first-party/sGTM, custom-path, base64), surfaced via toolbar badge, popup section, and console log. No new permissions.
- **Fix:** badge text now follows the selected UI language.

### 3.0
- Refactor & rename to "GTM & CMP Helper": reworked UI, GTM container injection (with `gtm_auth`/`gtm_preview` tokens), CMP detection & reset for 60+ CMPs, dark/light theme, English/German UI.

---

## Links

- **Documentation:** [Extension Homepage (German)](https://www.markus-baersch.de/gtm-cmp-helper-extension.html)
- **Checkup Tool:** Integrated shortcut to the [Analytrix GTM Checkup](https://www.analytrix.de/gtm-checkup-helper.html) (German).
