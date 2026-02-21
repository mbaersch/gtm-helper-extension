const translations = {
  de: {
    hdng: "GTM Helper",
    option_hint: "Mit dem GTM Helper kannst du auf der aktuellen Seite einen GTM-Container einfügen, ein dataLayer-Push Event ausführen oder extra JavaScript-Code einfügen.<br><b>Hinweis:</b> Einstellungen werden im localStorage der aktuellen Seite gespeichert.",
    show_checkup_b: "GTM Container identifiziert!",
    igtm_inspect: "GTM Container Checkup",
    igtm_active: "GTM-Container einfügen",
    igtm_gtm_code_placeholder: "Kompletten Container-Code (keine script Tags erforderlich) hier einfügen",
    igtm_addinit: "Push in dataLayer",
    igtm_init_placeholder: 'BSP: {"Internal": true, "mode": "Test"}',
    igtm_addcode: "Extra Script-Code einfügen",
    igtm_code_placeholder: "BSP: console.log('GTM Einfuegung aktiv');",
    save_btn: "💾 Speichern & neu laden",
    reset_consent_btn: "🗑️ Consent löschen",
    checkup_desc: "Untersuche diesen Container mit Analytrix:",
    help_link: "Hilfe",
    confirm_reset: "Alle Consent-Einstellungen für diese Domain löschen und Seite neu laden?",
    badge_active: "aktiv",
    badge_check: "check"
  },
  en: {
    hdng: "GTM Helper",
    option_hint: "With GTM Helper you can inject a GTM container, perform a dataLayer-Push event or insert extra JavaScript code on the current page.<br><b>Note:</b> Settings are stored in the localStorage of the current page.",
    show_checkup_b: "GTM Container identified!",
    igtm_inspect: "GTM Container Checkup",
    igtm_active: "Inject GTM container",
    igtm_gtm_code_placeholder: "Paste complete container code (no script tags required) here",
    igtm_addinit: "Push into dataLayer",
    igtm_init_placeholder: 'Ex: {"Internal": true, "mode": "Test"}',
    igtm_addcode: "Inject extra script code",
    igtm_code_placeholder: "Ex: console.log('GTM injection active');",
    save_btn: "💾 Save & reload",
    reset_consent_btn: "🗑️ Clear Consent",
    checkup_desc: "Inspect this container with Analytrix:",
    help_link: "Help",
    confirm_reset: "Delete all consent settings for this domain and reload page?",
    badge_active: "active",
    badge_check: "check"
  }
};

function getTranslation(lang, key) {
  const l = lang || 'de';
  return translations[l][key] || translations['de'][key] || key;
}

// Export für Node.js Tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { translations, getTranslation };
}
