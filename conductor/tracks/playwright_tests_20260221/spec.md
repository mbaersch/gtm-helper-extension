# Specification: Implement Automated E2E Testing with Playwright

## Goal
Set up Playwright to automate end-to-end testing of the Chrome Extension and generate screenshots for documentation (help page and web store).

## Requirements
- **Environment:** Install Node.js dependencies for Playwright.
- **Extension Loading:** Configure Playwright to launch Chromium with the `gtm-helper-extension` loaded as an unpacked extension.
- **Screenshot Automation:**
  - Capture the popup in Dark Mode (DE & EN).
  - Capture the popup in Light Mode (DE & EN).
  - Capture the Advanced Settings section (expanded).
  - Capture the CMP Detection box when a CMP is present.
- **Functional Testing:** Verify that clicking buttons triggers the expected actions (e.g., opening the help page, triggering reset confirmations).

## Success Criteria
- [ ] Playwright is successfully installed and configured.
- [ ] A script `generate-screenshots.js` exists and produces high-quality images.
- [ ] Functional tests pass in a headless/headed browser environment.
