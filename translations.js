const translations = {
  de: {
    hdng: "GTM & CMP Helper",
    option_hint: "Mit dem GTM & CMP Helper kannst du den Consent-Status von über 60 CMPs zurücksetzen, einen GTM-Container einfügen, ein dataLayer-Push Event ausführen oder extra JavaScript-Code einfügen.<br><b>Hinweis:</b> Einstellungen werden im localStorage der aktuellen Seite gespeichert.",
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
    badge_check: "check",
    detected_cmp: "CMP erkannt:",
    none_detected: "Keine CMP erkannt",
    advanced_settings: "Erweiterte Einstellungen",
    gtm_auth_label: "GTM Auth (Environment Token):",
    gtm_preview_label: "GTM Preview (ID):",
    gtm_position_label: "Injektions-Position:",
    pos_head: "Head (Standard)",
    pos_body: "Body",
    advanced_hint: "Nutze diese Parameter für GTM Umgebungen oder GA4 DebugView ohne Tag Assistant.",
    gtm_detect_title: "Erkannte Google-Tags & Container",
    "gtm_method_standard": "Standard (googletagmanager.com)",
    "gtm_method_first-party": "first-party (sGTM)",
    "gtm_method_custom-path": "Custom Path",
    "gtm_method_base64": "base64-Loader",
    "gtm_method_unknown": "unbekannt (inline?)"
  },
  en: {
    hdng: "GTM & CMP Helper",
    option_hint: "With GTM & CMP Helper you can reset the consent state for 60+ CMPs, inject a GTM container, perform a dataLayer-Push event or insert extra JavaScript code on the current page.<br><b>Note:</b> Settings are stored in the localStorage of the current page.",
    show_checkup_b: "GTM Container identified!",
    igtm_inspect: "GTM Container Checkup",
    igtm_active: "Inject GTM container",
    igtm_gtm_code_placeholder: "Paste complete container code (no script tags required) here",
    igtm_addinit: "Push into dataLayer",
    igtm_init_placeholder: 'Ex: {"Internal": true, "mode": "Test"}',
    igtm_addcode: "Inject extra script code",
    igtm_code_placeholder: "Ex: console.log('GTM injection active');",
    save_btn: "💾 Save & Reload",
    reset_consent_btn: "🗑️ Clear Consent",
    checkup_desc: "Inspect this container with Analytrix:",
    help_link: "Help",
    confirm_reset: "Delete all consent settings for this domain and reload page?",
    badge_active: "active",
    badge_check: "check",
    detected_cmp: "CMP detected:",
    none_detected: "None detected",
    advanced_settings: "Advanced Settings",
    gtm_auth_label: "GTM Auth (Environment Token):",
    gtm_preview_label: "GTM Preview (ID):",
    gtm_position_label: "Injection Position:",
    pos_head: "Head (Default)",
    pos_body: "Body",
    advanced_hint: "Use these parameters for GTM environments or GA4 DebugView without Tag Assistant.",
    gtm_detect_title: "Detected Google tags & containers",
    "gtm_method_standard": "standard (googletagmanager.com)",
    "gtm_method_first-party": "first-party (sGTM)",
    "gtm_method_custom-path": "custom path",
    "gtm_method_base64": "base64 loader",
    "gtm_method_unknown": "unknown (inline?)"
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
