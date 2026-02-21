# Chrome Extension Styleguide (Manifest V3)

## Architecture
- **Service Worker:** Ensure the background script is stateless and handles events asynchronously.
- **Content Scripts:** Keep interactions with the host page isolated and performant.
- **Message Passing:** Use asynchronous messaging for communication between components.

## Security
- **Content Security Policy (CSP):** Avoid inline scripts and `eval()` to comply with MV3.
- **Least Privilege:** Request only the minimum necessary permissions in `manifest.json`.
- **User Privacy:** Handle user data and cookies with care, ensuring transparent operations.

## UI/UX (Popup)
- **Grid Layout:** Use CSS Grid for a clean, responsive interface.
- **Immediate Feedback:** Provide visual indicators for all actions (e.g., successful CMP reset).
- **Sticky Headers:** Ensure the main controls are always accessible.

## Language Support
- **Internationalization (i18n):** Implement a bilingual (German/English) strategy for UI strings.
- **Bilingual Strategy:** Prioritize clarity in both languages for a broader user base.

## Performance
- **Resource Management:** Minimize memory footprint by avoiding unnecessary script execution.
- **Lazy Loading:** Load scripts and assets only when needed.
