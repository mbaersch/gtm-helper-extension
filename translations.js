const translations = {
  de: {
    hdng: "GTM & CMP Helper",
    info_back: "← Zurück",
    option_hint: `<h3>Consent zurücksetzen</h3>
<p>Wird eine CMP erkannt, erscheint sie oben im Popup und lässt sich einzeln zurücksetzen — dabei bleibt alles andere unangetastet. <b>Consent löschen</b> im Fußbereich geht weiter und räumt Cookies sowie Local- und SessionStorage aller bekannten Consent-Tools für diese Domain weg, rund 130 CMPs. Das ist oft die einzige Lösung, wenn CMP und Plattform sich Einträge teilen. In beiden Fällen lädt die Seite anschließend neu, und der Banner ist wieder da.</p>

<h3>GTM-Container einfügen</h3>
<p>Es genügt die Container-ID (<code>GTM-XXXXXX</code>) — der Loader entsteht daraus beim Verlassen des Feldes. Ein vollständiger Container-Code funktioniert ebenso, script-Tags braucht es nicht. Unter <b>Erweiterte Einstellungen</b> stehen Umgebungen (<code>gtm_auth</code>, <code>gtm_preview</code>) und die Einfügeposition (Head oder Body).</p>

<h3>dataLayer-Push und eigener Code</h3>
<p>Vor dem Container lässt sich ein Objekt in den dataLayer schreiben — etwa <code>{"internal": true}</code>, um eigene Zugriffe zu markieren — und beliebiger JavaScript-Code ausführen. Wirksam wird all das erst mit <b>Speichern &amp; neu laden</b>.</p>

<h3>Google-Tags erkennen</h3>
<p>Geladene GTM-Container und gtag.js-Tags werden von selbst erkannt, samt Ladeweg: Standard, first-party (Server-side GTM), eigener Pfad oder base64-Tunnel. Die Zahl am Symbol in der Symbolleiste nennt die Container auf der Seite; zu erkannten Containern führt ein Link zum Container-Checkup.</p>

<h3>Komfort in der GTM-Oberfläche</h3>
<p>Auf <code>tagmanager.google.com</code> kommen Bedienhilfen dazu: mitlaufende Bereichsnavigation, fixierbare Titelbalken, sortierbare Parametertabellen, ausblendbare integrierte Variablen, eine Warnung im Sende-Dialog und Chips, über die sich Variablen direkt aus einem Eingabefeld heraus bearbeiten lassen. Jede Funktion ist in der Karte <b>GTM-Oberfläche verbessern</b> einzeln abschaltbar.</p>

<h3>Wo die Einstellungen liegen</h3>
<p>Im <code>localStorage</code> der geöffneten Seite, getrennt nach Domain — was hier eingetragen wird, gilt also nur dort. Es werden keine Daten übertragen; die Extension kommt mit <code>activeTab</code>, <code>cookies</code> und <code>scripting</code> aus.</p>`,
    show_checkup_b: "GTM Container identifiziert!",
    igtm_inspect: "GTM Container Checkup",
    igtm_active: "GTM-Container einfügen",
    igtm_gtm_code_placeholder: "GTM-xxxx ID oder kompletten Container-Code (keine script Tags erforderlich) einfügen",
    igtm_addinit: "Push in dataLayer",
    igtm_init_placeholder: 'BSP: {"Internal": true, "mode": "Test"}',
    igtm_addcode: "Extra Script-Code einfügen",
    igtm_code_placeholder: "BSP: console.log('GTM Einfuegung aktiv');",
    save_btn: "🔄 Speichern & neu laden",
    reset_consent_btn: "🍪 Consent löschen",
    reset_consent_title: "Löscht die Consent-Daten aller bekannten CMPs für diese Domain, nicht nur die der erkannten. Oft der einzige Weg, wenn CMP und Plattform sich Einträge teilen.",
    reset_specific_link: "nur diese zurücksetzen",
    reset_specific_title: "Löscht ausschließlich die Einträge der erkannten CMP. Kommt der Banner danach nicht wieder, hängen ihre Daten mit denen der Plattform zusammen — dann hilft „Consent löschen“ unten.",
    checkup_desc: "Untersuche diesen Container mit Analytrix:",
    help_link: "Hilfe",
    confirm_reset: "Alle bekannten Consent-Daten für diese Domain löschen?\n\nBetroffen sind Cookies sowie Local- und SessionStorage von rund 130 CMPs — nicht nur die der erkannten. Das ist oft die einzige Lösung, wenn CMP und Plattform sich Einträge teilen.\n\nAnschließend wird die Seite neu geladen.",
    confirm_reset_specific: "Nur die Consent-Daten von {cmp} für diese Domain löschen?\n\nAlle übrigen Einträge bleiben stehen. Kommt der Banner danach nicht wieder, hängen die Daten mit denen der Plattform zusammen — dann hilft „Consent löschen“ unten.\n\nAnschließend wird die Seite neu geladen.",
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
    gtmui_feat_submit: "Sende-Dialog bei Erstellung ohne Veröffentlichung anpassen",
    gtmui_feat_chips: "Bearbeitung für Variablen in Eingabefeldern ermöglichen",
    gtmui_feat_sort: "Buttons zum Sortieren von Parametertabellen",
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
    info_back: "← Back",
    option_hint: `<h3>Reset consent</h3>
<p>When a CMP is detected it shows up at the top of the popup and can be reset on its own, leaving everything else untouched. <b>Clear Consent</b> in the footer goes further and removes cookies as well as local and session storage of every known consent tool for this domain, around 130 CMPs. That is often the only way when a CMP and the platform share entries. Either way the page reloads afterwards and the banner is back.</p>

<h3>Inject a GTM container</h3>
<p>The container ID is enough (<code>GTM-XXXXXX</code>) — the loader is built from it when you leave the field. A complete container snippet works just as well, script tags are not needed. <b>Advanced Settings</b> holds environments (<code>gtm_auth</code>, <code>gtm_preview</code>) and the injection position (head or body).</p>

<h3>dataLayer push and custom code</h3>
<p>Ahead of the container you can write an object into the dataLayer — <code>{"internal": true}</code> to mark your own visits, for instance — and run arbitrary JavaScript. None of it takes effect until <b>Save &amp; Reload</b>.</p>

<h3>Detect Google tags</h3>
<p>Loaded GTM containers and gtag.js tags are detected on their own, including the load method: standard, first-party (server-side GTM), custom path or base64 tunnel. The number on the toolbar icon counts the containers on the page; detected containers come with a link to the container checkup.</p>

<h3>Comfort in the GTM interface</h3>
<p>On <code>tagmanager.google.com</code> you get extra usability helpers: section navigation that stays in view, pinnable title bars, sortable parameter tables, collapsible built-in variables, a warning in the submit dialog, and chips that let you edit a variable straight from an input field. Every one of them can be switched off individually in the <b>Enhance the GTM interface</b> card.</p>

<h3>Where the settings live</h3>
<p>In the <code>localStorage</code> of the page you have open, separately per domain — whatever you enter here applies there and nowhere else. No data is transmitted; the extension gets by with <code>activeTab</code>, <code>cookies</code> and <code>scripting</code>.</p>`,
    show_checkup_b: "GTM Container identified!",
    igtm_inspect: "GTM Container Checkup",
    igtm_active: "Inject GTM container",
    igtm_gtm_code_placeholder: "Paste GTM-xxxx container ID or complete container code (no script tags required)",
    igtm_addinit: "Push into dataLayer",
    igtm_init_placeholder: 'Ex: {"Internal": true, "mode": "Test"}',
    igtm_addcode: "Inject extra script code",
    igtm_code_placeholder: "Ex: console.log('GTM injection active');",
    save_btn: "🔄 Save & Reload",
    reset_consent_btn: "🍪 Clear Consent",
    reset_consent_title: "Clears the consent data of every known CMP for this domain, not just the detected one. Often the only way when a CMP and the platform share entries.",
    reset_specific_link: "reset this one only",
    reset_specific_title: "Clears the entries of the detected CMP and nothing else. If the banner stays away afterwards, its data is tied to the platform’s — then use “Clear Consent” below.",
    checkup_desc: "Inspect this container with Analytrix:",
    help_link: "Help",
    confirm_reset: "Delete all known consent data for this domain?\n\nThis covers cookies as well as local and session storage of around 130 CMPs — not just the detected one. It is often the only way when a CMP and the platform share entries.\n\nThe page reloads afterwards.",
    confirm_reset_specific: "Delete only the consent data of {cmp} for this domain?\n\nEvery other entry stays. If the banner stays away afterwards, its data is tied to the platform’s — then use “Clear Consent” below.\n\nThe page reloads afterwards.",
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
    gtmui_feat_submit: "Mark the submit dialog when creating without publishing",
    gtmui_feat_chips: "Allow editing variables from within input fields",
    gtmui_feat_sort: "Buttons for sorting parameter tables",
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
