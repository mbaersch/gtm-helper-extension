# Specification: Identify and Display Active CMP based on Cookies and Storage

## Goal
Enable the extension to identify the currently active Consent Management Platform (CMP) on a website by checking for specific cookie names, localStorage keys, and sessionStorage keys already defined in the cleanup lists.

## Requirements
- **Data Restructuring:** Refactor the existing flat arrays for cookies and storage in `popup.js` into an object-based mapping that links keys to CMP names (e.g., `{ "cookiefirst-consent": "CookieFirst" }`).
- **Identification Logic:** Implement a function that scans the active tab's cookies and storage against the mapping and identifies potential matches.
- **UI Enhancement:**
  - Add a "Detected CMP" display in the popup (DE: "Erkannte CMP", EN: "Detected CMP").
  - Ensure the display is bilingual.
  - Position it prominently (e.g., near the "Clear Consent" button or in the header).
- **Maintainability:** Keep the mapping structure clean so the user can easily add new CMPs/keys.

## Success Criteria
- [ ] Active CMP is correctly identified and displayed in the popup.
- [ ] Identification works for cookies, localStorage, and sessionStorage.
- [ ] The UI remains clean and follows the Engineering Aesthetic.
- [ ] Bilingual support for the detection labels.
