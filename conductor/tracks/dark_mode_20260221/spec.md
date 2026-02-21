# Specification: Dark Mode by Default (Engineering Aesthetic Dark)

## Goal
Make Dark Mode the default theme for the extension, honoring its original design while maintaining the new Engineering Aesthetic (Orange/Green theme).

## Requirements
- **Theme Variables:** Update `:root` variables in `popup.css` to use dark background and light text colors.
- **Contrast:** Ensure Orange (#C44E00) and Green (#005141) are adjusted if necessary for better visibility on dark backgrounds.
- **Component Styling:** 
  - Sections/Boxes should use dark grey/anthracite backgrounds.
  - Borders should be subtle.
  - Overlays and Info Boxes need to be adapted.
- **Dynamic Support:** Keep the ability to support light mode via media query `prefers-color-scheme: light` (optional but recommended for completeness).

## Success Criteria
- [ ] Extension opens in Dark Mode by default.
- [ ] Text is highly readable.
- [ ] Engineering Aesthetic (Orange/Green) is preserved and looks professional.
