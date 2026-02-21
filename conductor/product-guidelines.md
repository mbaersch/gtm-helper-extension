# Product Guidelines: GTM Helper

## Core Principles
- **Clarity & Precision:** The user should always understand what actions are being performed (e.g., which cookies are deleted).
- **Instructional Tone:** The extension should be helpful and explanatory, guiding users through debugging and configuration tasks.
- **Engineering Aesthetic:** Stick to the defined design (System fonts, Orange #C44E00, Green #005141) with sticky headers and inline SVGs.

## UX & UI Guidelines
- **User Interface:** Clean, Grid-based layout (CSS Grid) without frameworks. 
- **Sticky Headers:** Ensure headers remain visible for quick navigation.
- **Language Strategy:** Transition to a bilingual approach (German/English). 
  - UI labels and messages should ideally support both languages.
  - Documentation and links can remain in German for now.
- **Feedback:** Provide immediate visual feedback for all user interactions (e.g., successful CMP reset, script execution).

## Technical Standards
- **Vanilla JS:** Use pure JavaScript for all extension logic to ensure maximum control and performance.
- **Chrome V3 Manifest:** Strictly adhere to the latest Manifest V3 standards for security and reliability.
- **Performance:** Optimize for low memory usage and fast execution to avoid slowing down the user's browser.
- **Code Style:** No frameworks for layouts. Use standard CSS and modern JS features.

## Content & Tone
- **Tone of Voice:** Professional, helpful, and technically accurate.
- **Error Handling:** Clear, precise error messages that help the user resolve issues independently.
