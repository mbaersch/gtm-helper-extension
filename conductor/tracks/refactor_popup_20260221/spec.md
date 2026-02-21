# Specification: Refactor Popup for Engineering Aesthetic and Bilingual Support

## Goal
Refactor the existing `popup.html` and `popup.js` to align with the project's visual identity and support both German and English languages.

## Requirements
- **Visual Identity:** 
  - Primary color: Orange (#C44E00)
  - Secondary color: Green (#005141)
  - Sticky header with inline SVGs.
  - Layout using CSS Grid without frameworks.
  - System fonts.
- **Bilingual Support:**
  - Structure the UI to support German and English strings.
  - Implement a mechanism to switch languages or detect preference.
- **Functionality:**
  - Preserve all existing functions (CMP Reset, GTM Injection, Script Execution).
  - Add a shortcut for the GTM Workspace Checkup.
- **Consistency:**
  - Follow the `chrome-extension.md` styleguide.

## Success Criteria
- [ ] UI matches the 'Engineering Aesthetic' design concept.
- [ ] Interface is fully bilingual (DE/EN).
- [ ] Existing features work as before.
- [ ] Code is clean and modular (Vanilla JS).
