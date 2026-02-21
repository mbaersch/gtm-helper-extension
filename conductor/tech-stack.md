# Technology Stack: GTM Helper

## Core Architecture
- **Chrome Extension (Manifest V3):** Using modern extension APIs for better security and performance.
- **Vanilla JavaScript:** No dependencies or external libraries for the core logic.
- **CSS Grid:** Modern layout system for the user interface.

## Components
- **Background Service Worker:** For managing long-running tasks and cookie management.
- **Content Scripts:** For interacting with the DOM of web pages (e.g., GTM Injection, Script Execution).
- **Popup Interface:** For user interaction and triggering functions.

## Capabilities
- **Scripting API:** For dynamic script execution on host pages.
- **Cookies API:** For managing and clearing CMP-related storage.
- **Tabs API:** For interacting with the active browser tab.

## Development Standards
- **ES6+ Features:** Utilizing modern JavaScript syntax and features.
- **Security:** Strict adherence to Chrome's security policies (CSP).
- **Performance:** Minimizing browser resource consumption.
