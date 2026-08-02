const translations = {
  de: {
    hdng: "GTM & CMP Helper",
    option_hint: "Mit dem GTM & CMP Helper kannst du den Consent-Status von über 60 CMPs zurücksetzen, einen GTM-Container einfügen, ein dataLayer-Push Event ausführen oder extra JavaScript-Code einfügen.<br><b>Hinweis:</b> Einstellungen werden im localStorage der aktuellen Seite gespeichert.",
    show_checkup_b: "GTM Container identifiziert!",
    igtm_inspect: "GTM Container Checkup",
    igtm_active: "GTM-Container einfügen",
    igtm_gtm_code_placeholder: "GTM-xxxx ID oder kompletten Container-Code (keine script Tags erforderlich) einfügen",
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
    gtmui_active: "GTM-Oberfläche verbessern",
    gtmui_hint: "GTM & CMP Helper bietet optionale Verbesserungen zur effizienteren Bearbeitung von Google Tag Manager Containern.",
    gtmui_feat_nav: "Bereichsnavigation beim Scrollen fixieren",
    gtmui_feat_pin: "Titelbalken der Listen fixierbar",
    gtmui_feat_builtin: "Integrierte Variablen ausblendbar",
    gtmui_feat_submit: "Hinweis im Sende-Dialog",
    gtmui_feat_chips: "Variablen aus Eingabefeldern bearbeiten",
    gtmui_feat_sort: "Parametertabellen sortieren",
    gtmui_note: "Diese Einstellungen lassen sich nur ändern, während ein Tab mit tagmanager.google.com aktiv ist.",
    "gtm_method_standard": "Standard (googletagmanager.com)",
    "gtm_method_first-party": "first-party (sGTM)",
    "gtm_method_custom-path": "Custom Path",
    "gtm_method_base64": "base64-Loader",
    "gtm_method_unknown": "unbekannt (inline?)",
    gtm_ui_pin_on: "Suchleiste beim Scrollen fixieren",
    gtm_ui_pin_off: "Suchleiste wieder mitscrollen lassen",
    gtm_ui_sort_asc: "Tabelle nach „{col}“ aufsteigend sortieren",
    gtm_ui_sort_desc: "Tabelle nach „{col}“ absteigend sortieren",
    gtm_ui_sort_column: "Spalte {n}",
    gtm_ui_builtin_hide: "Integrierte Variablen ausblenden",
    gtm_ui_builtin_show: "Integrierte Variablen einblenden",
    gtm_ui_var_edit: "Variable „{name}“ bearbeiten",
    gtm_ui_var_builtin: "„{name}“ ist eine integrierte Variable und hat keine Konfiguration",
    gtm_ui_var_missing: "„{name}“ steht nicht in der Variablenliste",
    gtm_ui_var_failed: "Variable „{name}“ konnte nicht geöffnet werden"
  },
  en: {
    hdng: "GTM & CMP Helper",
    option_hint: "With GTM & CMP Helper you can reset the consent state for 60+ CMPs, inject a GTM container, perform a dataLayer-Push event or insert extra JavaScript code on the current page.<br><b>Note:</b> Settings are stored in the localStorage of the current page.",
    show_checkup_b: "GTM Container identified!",
    igtm_inspect: "GTM Container Checkup",
    igtm_active: "Inject GTM container",
    igtm_gtm_code_placeholder: "Paste GTM-xxxx container ID or complete container code (no script tags required)",
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
    gtmui_active: "Enhance the GTM interface",
    gtmui_hint: "GTM & CMP Helper offers optional improvements for working with Google Tag Manager containers more efficiently.",
    gtmui_feat_nav: "Keep the section navigation visible while scrolling",
    gtmui_feat_pin: "Pinnable list title bars",
    gtmui_feat_builtin: "Built-in variables can be hidden",
    gtmui_feat_submit: "Warning in the submit dialog",
    gtmui_feat_chips: "Edit variables straight from input fields",
    gtmui_feat_sort: "Sort parameter tables",
    gtmui_note: "These settings can only be changed while a tagmanager.google.com tab is active.",
    "gtm_method_standard": "standard (googletagmanager.com)",
    "gtm_method_first-party": "first-party (sGTM)",
    "gtm_method_custom-path": "custom path",
    "gtm_method_base64": "base64 loader",
    "gtm_method_unknown": "unknown (inline?)",
    gtm_ui_pin_on: "Keep the search bar visible while scrolling",
    gtm_ui_pin_off: "Let the search bar scroll away",
    gtm_ui_sort_asc: "Sort table by “{col}” in ascending order",
    gtm_ui_sort_desc: "Sort table by “{col}” in descending order",
    gtm_ui_sort_column: "Column {n}",
    gtm_ui_builtin_hide: "Hide built-in variables",
    gtm_ui_builtin_show: "Show built-in variables",
    gtm_ui_var_edit: "Edit variable “{name}”",
    gtm_ui_var_builtin: "“{name}” is a built-in variable and has no configuration",
    gtm_ui_var_missing: "“{name}” is not in the variable list",
    gtm_ui_var_failed: "Could not open variable “{name}”"
  }
};

function getTranslation(lang, key) {
  const l = lang || 'de';
  return translations[l][key] || translations['de'][key] || key;
}

/*
 * Sprache der GTM-Oberfläche — für alles, was in deren Seite hineingeschrieben wird.
 *
 * Beschriftungen in einer fremden Seite folgen deren Sprache, nicht der im Popup
 * gewählten: Ein deutscher Tooltip neben englischen GTM-Schaltflächen wäre verkehrt,
 * und die Popup-Einstellung ist aus einem Content-Script dort ohnehin nicht
 * erreichbar.
 *
 * `<html lang>` taugt dafür nicht — auf tagmanager.google.com ist das Attribut leer.
 * Maßgeblich ist `preloadData.currentLocale`, das im Seitencode steht und den
 * `hl`-Parameter der URL bereits abbildet. Erreichbar ist es nur als Text: In der
 * ISOLATED world, in der die Content-Scripts laufen, ist `window.preloadData`
 * unsichtbar. Deshalb wird der Inline-Code gelesen statt das Objekt.
 *
 * Deutsch, wenn die Locale mit "de" beginnt (`de`, `de_DE`, `de-AT`), sonst
 * Englisch — die Extension kennt nur diese beiden Sprachen.
 *
 * Das Ergebnis wird gemerkt: Der Seitencode ist groß, und die Sprache ändert sich
 * ohne Neuladen nicht.
 */
let gtmLanguage = null;

function detectGtmLanguage() {
  if (gtmLanguage) return gtmLanguage;

  let locale = '';
  const scripts = document.querySelectorAll('script:not([src])');
  for (let i = 0; i < scripts.length; i++) {
    const match = /currentLocale"?\s*[:=]\s*"([a-zA-Z_-]+)"/.exec(scripts[i].textContent);
    if (match) {
      locale = match[1];
      break;
    }
  }
  if (!locale) locale = navigator.language || '';

  gtmLanguage = locale.toLowerCase().indexOf('de') === 0 ? 'de' : 'en';
  return gtmLanguage;
}

// Export für Node.js Tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { translations, getTranslation, detectGtmLanguage };
}
