var currentLang = 'de';

const CMP_COOKIES = {
  "cookiefirst-consent": "CookieFirst",
  "CookieConsent": "CookieBot / TYPO3 Cookieman",
  "OptanonConsent": "OneTrust / CookiePro",
  "OptanonAlertBoxClosed": "OneTrust / CookiePro",
  "axeptio_cookies": "Axeptio",
  "axeptio_authorized_vendors": "Axeptio",
  "axeptio_all_vendors": "Axeptio",
  "borlabs-cookie": "Borlabs",
  "borlabsCookie": "Borlabs",
  "CookieInformationConsent": "Cookie Information",
  "viewed_cookie_policy": "Cookie Law Info",
  "cookielawinfo-checkbox-necessary": "Cookie Law Info",
  "cookielawinfo-checkbox-preferences": "Cookie Law Info",
  "cookielawinfo-checkbox-analytics": "Cookie Law Info",
  "cookielawinfo-checkbox-advertisement": "Cookie Law Info",
  "cookielawinfo-checkbox-performance": "Cookie Law Info",
  "cookielawinfo-checkbox-non-necessary": "Cookie Law Info",
  "CookieLawInfoConsent": "Cookie Law Info",
  "hu-consent": "Cookie Notice & Compliance",
  "cookie_notice_accepted": "Cookie Notice & Compliance",
  "complianz_policy_id": "Complianz",
  "complianz_consent_status": "Complianz",
  "cmplz_banner-status": "Complianz",
  "cmplz_consented_services": "Complianz",
  "cmplz_saved_categories": "Complianz",
  "cmplz_saved_services": "Complianz",
  "cmplz_stats": "Complianz",
  "cmplz_functional": "Complianz",
  "cmplz_preferences": "Complianz",
  "cmplz_statistics": "Complianz",
  "cmplz_marketing": "Complianz",
  "notice_gdpr_prefs": "TrustArc",
  "notice_preferences": "TrustArc",
  "kcm_data": "Kick Consent Manager",
  "trk_consent": "Simple Consent Manager",
  "legalweb_cookie_settings": "legalweb",
  "dp_cookieconsent_status": "DP Cookie Consent",
  "klaro": "Klaro.js",
  "euconsent-v2": "IAB / Didomi / Uni Consent / Sirdata",
  "didomi_token": "Didomi",
  "__lxG__consent__v2": "Clickio",
  "cookiehub": "CookieHub",
  "CookieScriptConsent": "CookieScript",
  "cookieyes-consent": "CookieYes",
  "lawwwing-consent-v2": "Lawwwing",
  "consentDate": "Sourcepoint",
  "consentUUID": "Sourcepoint",
  "truendo_cmp": "Truendo",
  "uniconsent-v2": "Uni Consent",
  "consent-studio__storage": "Consent Studio",
  "cookiepal-consent": "CookiePal",
  "osano_consentmanager": "Osano",
  "cyt-consent": "Cytrio",
  "cyt_consent_given": "Cytrio",
  "Mdt_Consent": "Mandatly",
  "__hs_cookie_cat_pref": "Hubspot",
  "amcookie_allowed": "Amasty",
  "amcookie_policy_restriction": "Amasty",
  "cookieconsent_mode": "datareporter.eu",
  "cookieconsent_status": "datareporter.eu",
  "TC_PRIVACY_CENTER": "Commanders Act",
  "TC_PRIVACY": "Commanders Act",
  "cookies-analytics": "Enzuzo",
  "cookies-functional": "Enzuzo",
  "cookies-marketing": "Enzuzo",
  "cookies-preferences": "Enzuzo",
  "TERMLY_API_CACHE": "Termly",
  "_swb": "Ketch",
  "_swb_consent_": "Ketch",
  "_ketch_consent_v1_": "Ketch",
  "__gitbook_cookie_granted": "Gitbook",
  "consent-policy": "Wix",
  "cookie-preference": "Shopware",
  "google-analytics-enabled": "Shopware (Native)",
  "_tracking_consent": "Shopify",
  "_pandectes_gdpr": "Pandectes",
  "cookieconsent_status1": "Consentmo",
  "cookieconsent_preferences_disabled": "Consentmo",
  "avada_cookie_consent": "Avada",
  "aviaCookieConsent": "Avia (Enfold)",
  "moove_gdpr_popup": "Moove GDPR",
  "clearfy_cookie_hide": "Clearfy",
  "cookiesjsr": "Drupal Cookies JSR",
  "cookie-agreed": "EU Cookie Compliance",
  "gox_cookie_consent": "go-x-blocks",
  "reDimCookieHint": "reDim CookieHint",
  "sg-cookie-manager": "SG Cookies Bar",
  "cookie_consent_user_accepted": "TermsFeed",
  "ss_performanceCookiesAllowed": "Squarespace",
  "ss_marketingCookiesAllowed": "Squarespace",
  "cookiesNotification": "Consentik",
  "_consentik_cookie": "Consentik",
  "goodg_block_popup": "GoodApps",
  "acris_cookie_acc": "Acris",
  "acris_cookie_landing_page": "Acris",
  "acris_cookie_referrer": "Acris",
  "acris_cookie_first_activated": "Acris",
  "cookiePreferences": "Acris",
  "session-1": "Acris",
  "session-": "Acris",
  "cookie_accepted": "Magento 1 GDPR",
  "cookie_closed": "Magento 1 GDPR",
  "cookiesEnabled": "Magento 1 GDPR",
  "required_cookies": "Magento 1 GDPR",
  "popupData": "Magento 1 GDPR",
  "cc_cookie": "Orestbida / Prive / Legal Cockpit",
  "mw-cookie-settings": "Mediawiki",
  "sm-cookie-consent": "SiteMinder",
  "tarteaucitron": "Tarte au Citron",
  "CONSENTMGR": "Tealium",
  "ttcm_consent": "TamTam Consent",
  "cookieconsentTimestamp": "LANsoft",
  "cl_consent": "CookieLegit",
  "cl_essential": "CookieLegit",
  "cl_marketing": "CookieLegit",
  "cl_tracking": "CookieLegit",
  "cc_accepted_cookies": "Cookieconfirm",
  "cc_consent_id": "Cookieconfirm",
  "ccm_consent": "CCM19 / clickskeks / CMP4Net / WUM",
  "dsgvo_cd": "Unknown",
  "cms_cookies": "Contao / CMS Accept Tags",
  "cms_cookies_saved": "Contao / CMS Accept Tags",
  "GXConsents": "Gambio",
  "oil_data": "Gambio",
  "AdvertisementCookies": "Unknown Builder",
  "AnalyticsCookies": "Unknown Builder",
  "ShowCookieConsent": "Unknown Builder",
  "cookie-pref": "InMobi",
  "cookie-cracker_2": "Cookie Cracker",
  "hwdatenschutz_cookie_approved": "HW Datenschutz",
  "icm_cookie_settings": "Impuls Cookie Monster",
  "DIRO_C_FINGERPRINT": "JS Consent Banner",
  "ka_cookies_viewed": "KA Cookies",
  "kekt-kookies": "KookieTool CMP",
  "cc_cookie_accept": "LWD Cookie Master",
  "cc_cookie_save": "LWD Cookie Master",
  "cc_cookie_decline": "LWD Cookie Master",
  "cookieControl": "TYPO3 IG CookieConsent",
  "cookie_banner_hidden": "TYPO3 RM Cookie Consent",
  "cookiefox_consent": "CookieFox",
  "cookies_and_content_security_policy": "Cookies and Content Security Policy",
  "ct_action": "Cookietrust CMP",
  "ConsentID": "DNN Cookie Consent",
  "cookieAcceptanceCookie": "EU Cookie Directive Lite",
  "euCookie": "EU Cookie Law",
  "fmalertcookies": "FM Alert Cookies",
  "gdpr_notice_shown": "GDPR Tools",
  "cookieaccept": "mod_cookiesaccept",
  "cookie_optin": "Sgalinski Cookie Opt-In",
  "sgcc-cookie-notice": "Simple GDPR Cookie Compliance",
  "omCookieConsent": "TYPO3 OM Cookie Manager",
  "displayCookieConsent": "WF Cookie Consent",
  "lwpcngStatus": "WP Cookie Notice",
  "cookie_consent": "Zoho Cookie Banner / TYPO3 Datamints Consentmanager",
  "mhcookie": "Must Have Cookie",
  "cookieadmin_consent": "CookieAdmin",
  "pixelmate": "DSGVO-Pixelmate",
  "privacyPolicyAccept": "TYPO3 NB Cookie Banner",
  "bst_dsgvo_cookie": "BST DSGVO Cookie",
  "cookiesDirective": "Cookies Policy Notification Bar",
  "wpca_consent": "WP Cookie Allow",
  "ez-consent-tcf": "Ezoic CMP",
  "wpl_viewed_cookie": "GDPR Cookie Consent",
  "pressidium_cookie_consent": "Pressidium Cookie Consent",
  "sellwerk_cbconsent": "Sellwerk / Website-Check (Dury Legal)"
};

const CMP_LOCAL_STORAGE = {
  "cookiefirst-id": "CookieFirst",
  "cookiefirst-consent": "CookieFirst",
  "uc_user_interaction": "UserCentrics",
  "uc_settings": "UserCentrics",
  "ucData": "UserCentrics",
  "ucString": "UserCentrics",
  "truste.eu.cookie.notice_gdpr_prefs": "TrustArc",
  "truste.eu.cookie.notice_preferences": "TrustArc",
  "ccm_consent": "CCM19 / clickskeks / CMP4Net / WUM",
  "ppms_webstorage": "Piwik PRO",
  "euconsent-v2": "IAB / Didomi / Uni Consent / Sirdata",
  "didomi_token": "Didomi",
  "__lxG__consent__v2": "Clickio",
  "sp_consent": "Secure Privacy",
  "sp_dynamic": "Secure Privacy",
  "_sp_user_consent_40": "Sourcepoint",
  "TERMLY_API_CACHE": "Termly",
  "osano_consentmanager": "Osano",
  "cyt_consent_given": "Cytrio",
  "__acceptrics_settings": "Acceptrics",
  "sddan:cmp": "ABConsent",
  "sddan:cmp:stc": "ABConsent",
  "sddan:cmp:stc:ts": "ABConsent",
  "silktideCookieBanner_InitialChoice": "Silktide",
  "conversionBearCookieConsent": "Ultimate Cookie Banner",
  "scalaLGPDBanner": "Scala",
  "consent": "JTL",
  "df-cookies-allowed": "Doofinder",
  "ccb_contao_token": "Contao",
  "cookieConsentChoice": "Unknown Builder",
  "dcm_cookie_consent": "CM Cookie Manager"
};

const CMP_SESSION_STORAGE = {
  "ccm_consent": "CCM19 / clickskeks / CMP4Net / WUM"
};

// Consent-Cookies mit Account-/Site-ID im Namen. Gelöscht wird per Teilstring, erkannt
// nur per Präfix: "mnd-" steckt auch in "recommend-". `local` leitet LS-Schlüssel ab.
const CMP_COOKIE_PREFIXES = [
  // ohne "v:", es gibt real_cookie_banner-v:3_blog:1_path:... und real_cookie_banner-blog:1
  { prefix: "real_cookie_banner-", cmp: "Real Cookie Banner" },
  { prefix: "__cmpc", cmp: "Consentmanager.net", cookies: ["__cmpiuid"],
    local: found => found.flatMap(c => [c.name + "_" + found[0].domain, c.name + "_expire" + found[0].domain]) },
  { prefix: "concord-allow-state-", cmp: "Concord",
    local: found => {
      const account = found[0].name.replace("concord-allow-state-", "");
      return ["concord-consent-state-" + account, "concord-transient-token-" + account, "concord-banner-closed"];
    } },
  { prefix: "ppms_privacy_", cmp: "Piwik PRO" },
  { prefix: "_iub_cs-", cmp: "iubenda" },
  { prefix: "map_accepted_", cmp: "MyAgilePrivacy" },
  { prefix: "mnd-", cmp: "MND Cookie Notice" },
  { prefix: "bigidcmp-consent-", cmp: "BigID / illow", local: found => [found[0].name] }
];

// localStorage eingebetteter CMP-Frames (partitioniert nach Top-Level-Site). Erreichbar
// nur über ein Script im Frame selbst, also nur, solange der Frame geladen ist.
const CMP_FRAME_STORAGE = [
  { origin: "https://web.cmp.usercentrics.eu", prefix: "ucData_", cmp: "UserCentrics" }
];

function updateUI(lang) {
  const elementsToTranslate = [
    { id: 'hdng', key: 'hdng', type: 'innerText' },
    { id: 'option_hint', key: 'option_hint', type: 'innerHTML' },
    { id: 'info_back_top', key: 'info_back', type: 'innerText' },
    { id: 'info_close_btn', key: 'info_back', type: 'innerText' },
    { id: 'checkup_desc', key: 'checkup_desc', type: 'innerText' },
    { id: 'igtm_inspect', key: 'igtm_inspect', type: 'innerText' },
    { id: 'igtm_gtm_code', key: 'igtm_gtm_code_placeholder', type: 'placeholder' },
    { id: 'igtm_init', key: 'igtm_init_placeholder', type: 'placeholder' },
    { id: 'igtm_code', key: 'igtm_code_placeholder', type: 'placeholder' },
    { id: 'label_igtm_active', key: 'igtm_active', type: 'innerText' },
    { id: 'label_igtm_addinit', key: 'igtm_addinit', type: 'innerText' },
    { id: 'label_igtm_addcode', key: 'igtm_addcode', type: 'innerText' },
    { id: 'label_advanced_settings', key: 'advanced_settings', type: 'innerText' },
    { id: 'label_advanced_hint', key: 'advanced_hint', type: 'innerText' },
    { id: 'label_gtm_auth', key: 'gtm_auth_label', type: 'innerText' },
    { id: 'label_gtm_preview', key: 'gtm_preview_label', type: 'innerText' },
    { id: 'label_gtm_position', key: 'gtm_position_label', type: 'innerText' },
    { id: 'label_pos_head', key: 'pos_head', type: 'innerText' },
    { id: 'label_pos_body', key: 'pos_body', type: 'innerText' },
    { id: 'igtm_save', key: 'save_btn', type: 'innerText' },
    { id: 'igtm_reset_consent', key: 'reset_consent_btn', type: 'innerText' },
    { id: 'igtm_reset_consent', key: 'reset_consent_title', type: 'title' },
    { id: 'igtm_reset_specific', key: 'reset_specific_link', type: 'innerText' },
    { id: 'igtm_reset_specific', key: 'reset_specific_title', type: 'title' },
    { id: 'label_detected_cmp', key: 'detected_cmp', type: 'innerText' },
    { id: 'label_gtm_detect', key: 'gtm_detect_title', type: 'innerText' },
    { id: 'label_igtm_gtmui_active', key: 'gtmui_active', type: 'innerText' },
    { id: 'label_gtmui_hint', key: 'gtmui_hint', type: 'innerText' },
    { id: 'label_feat_nav', key: 'gtmui_feat_nav', type: 'innerText' },
    { id: 'label_feat_pin', key: 'gtmui_feat_pin', type: 'innerText' },
    { id: 'label_feat_builtin', key: 'gtmui_feat_builtin', type: 'innerText' },
    { id: 'label_feat_chips', key: 'gtmui_feat_chips', type: 'innerText' },
    { id: 'label_feat_sort', key: 'gtmui_feat_sort', type: 'innerText' },
    { id: 'label_feat_listsort', key: 'gtmui_feat_listsort', type: 'innerText' },
    { id: 'label_feat_listsearch', key: 'gtmui_feat_listsearch', type: 'innerText' },
    { id: 'label_feat_submit', key: 'gtmui_feat_submit', type: 'innerText' },
    { id: 'label_feat_overview', key: 'gtmui_feat_overview', type: 'innerText' },
    { id: 'label_feat_searchhotkey', key: 'gtmui_feat_searchhotkey', type: 'innerText' },
    { id: 'label_feat_sectionhotkeys', key: 'gtmui_feat_sectionhotkeys', type: 'innerText' },
    { id: 'label_hotkey', key: 'gtmui_hotkey_label', type: 'innerText' },
    { id: 'igtm_hotkey_hint', key: 'gtmui_hotkey_invalid', type: 'innerText' },
    { id: 'label_hotkey_tags', key: 'gtmui_hotkey_tags', type: 'innerText' },
    { id: 'label_hotkey_triggers', key: 'gtmui_hotkey_triggers', type: 'innerText' },
    { id: 'label_hotkey_variables', key: 'gtmui_hotkey_variables', type: 'innerText' },
    { id: 'igtm_section_hint', key: 'gtmui_hotkey_invalid', type: 'innerText' },
    { id: 'gtmui_note', key: 'gtmui_note', type: 'innerText' },
    { id: 'igtm_help', key: 'help_link', type: 'innerText' }
  ];

  elementsToTranslate.forEach(item => {
    const el = document.getElementById(item.id);
    if (el) {
      const translation = getTranslation(lang, item.key);
      if (item.type === 'innerHTML') el.innerHTML = translation;
      else if (item.type === 'placeholder') el.placeholder = translation;
      else if (item.type === 'title') el.title = translation;
      else el.innerText = translation;
    }
  });

  // Update switcher styles
  document.getElementById('lang_de').style.fontWeight = lang === 'de' ? 'bold' : 'normal';
  document.getElementById('lang_de').style.color = lang === 'de' ? 'var(--primary-color)' : 'inherit';
  document.getElementById('lang_en').style.fontWeight = lang === 'en' ? 'bold' : 'normal';
  document.getElementById('lang_en').style.color = lang === 'en' ? 'var(--primary-color)' : 'inherit';
  
  // Update "GTM Container identifiziert!" label specifically
  const checkupLabel = document.querySelector('#show_checkup b');
  if (checkupLabel) checkupLabel.innerText = getTranslation(lang, 'show_checkup_b');

  // Stehen nicht in der Liste oben: Die Beschriftung ist die Kombination selbst.
  paintHotkeyFields(lang);
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('igtm_lang', lang);
  updateUI(lang);
  // Erkannte Tags neu lokalisieren (Methoden-Labels folgen der Sprache).
  paintGtmDetections();
  // Background über die Sprache informieren, damit das Badge (im 2s-Polling) lokalisiert bleibt.
  try { chrome.runtime.sendMessage({ action: 'setLang', lang: lang }); } catch (e) { /* ignore */ }
}

function setTheme(theme) {
  const body = document.body;
  const themeBtn = document.getElementById('theme_btn');
  if (theme === 'light') {
    body.classList.add('light-theme');
    themeBtn.innerText = '☀️';
  } else {
    body.classList.remove('light-theme');
    themeBtn.innerText = '🌙';
  }
  localStorage.setItem('igtm_theme', theme);
}

function identifyCMP(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const tab = tabs[0];
    if (!tab) return callback(null);

    // 1. Check Cookies
    chrome.cookies.getAll({ url: tab.url }, function(cookies) {
      // Zu einer chrome://-URL gibt es keine Cookies; die Abfrage meldet das
      // als Fehler, der gelesen werden muss.
      if (chrome.runtime.lastError || !cookies) return callback(null);

      for (let cookie of cookies) {
        if (CMP_COOKIES[cookie.name]) {
          return callback(CMP_COOKIES[cookie.name]);
        }
        const rule = CMP_COOKIE_PREFIXES.find(r => cookie.name.indexOf(r.prefix) === 0);
        if (rule) return callback(rule.cmp);
      }

      // 2. Check LocalStorage
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: function(keys) {
          let found = null;
          keys.forEach(key => {
            if (localStorage.getItem(key)) found = key;
          });
          return found;
        },
        args: [Object.keys(CMP_LOCAL_STORAGE)]
      }, function(results) {
        if (chrome.runtime.lastError) return callback(null);
        if (results && results[0] && results[0].result) {
          return callback(CMP_LOCAL_STORAGE[results[0].result]);
        }

        // 3. Check SessionStorage
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: function(keys) {
            let found = null;
            keys.forEach(key => {
              if (sessionStorage.getItem(key)) found = key;
            });
            return found;
          },
          args: [Object.keys(CMP_SESSION_STORAGE)]
        }, function(results) {
          if (chrome.runtime.lastError) return callback(null);
          if (results && results[0] && results[0].result) {
            return callback(CMP_SESSION_STORAGE[results[0].result]);
          }
          callback(null);
        });
      });
    });
  });
}

// Funktion, um den Checkup-Status (und die Checkup-URL) vom Background abzufragen
function checkURL(callback) {
  chrome.runtime.sendMessage({ action: "checkURL" }, function(response) {
    // Antwortet der Service Worker nicht, ist response undefined — sonst
    // scheitern die Aufrufer an response.hasCheckup.
    if (chrome.runtime.lastError) return callback({});
    callback(response || {});
  });
}

// Zuletzt geholte Funde, damit die Liste bei Sprachwechsel neu lokalisiert werden kann.
var gtmDetectRecords = [];

// Inline-SVG statt Emoji: Das rendert je nach Betriebssystem anders und bringt
// eine eigene Farbe mit.
const GTM_COPY_SVG =
  '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
  '<rect x="9" y="9" width="12" height="12" rx="2"/>' +
  '<path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>' +
  '</svg>';
const GTM_CHECK_SVG =
  '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
  '<path d="M4 12.5 9.5 18 20 6.5"/></svg>';

// navigator.clipboard lehnt ohne Fokus ab (z. B. direkt nach dem Oeffnen des
// Popups) — dann uebernimmt der alte execCommand-Weg.
function copyTextToClipboard(text) {
  const legacy = () => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    return ok ? Promise.resolve() : Promise.reject(new Error('copy failed'));
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).catch(legacy);
  }
  return legacy();
}

function copyGtmId(btn, id) {
  copyTextToClipboard(id).then(() => {
    clearTimeout(btn._resetTimer);
    btn.classList.add('copied');
    btn.innerHTML = GTM_CHECK_SVG;
    btn.title = getTranslation(currentLang, 'gtm_copy_done') || 'Kopiert';
    btn._resetTimer = setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = GTM_COPY_SVG;
      btn.title = getTranslation(currentLang, 'gtm_copy_id') || 'ID kopieren';
    }, 1400);
  }).catch(() => { /* Zwischenablage nicht verfuegbar */ });
}

// Rendert die erkannten Tags aus dem Cache in der aktuellen Sprache neu.
function paintGtmDetections() {
  const box = document.getElementById('gtm_detect_box');
  const list = document.getElementById('gtm_detect_list');
  if (!box || !list) return;
  list.innerHTML = '';
  if (!gtmDetectRecords || gtmDetectRecords.length === 0) {
    // Wie der Checkup-Hinweis: Sektion nur zeigen, wenn wirklich etwas erkannt wurde.
    box.style.display = 'none';
    return;
  }
  const copyLabel = getTranslation(currentLang, 'gtm_copy_id') || 'ID kopieren';
  const destHint = getTranslation(currentLang, 'gtm_dest_hint');
  const addRow = (id, label, cls) => {
    const li = document.createElement('li');
    if (cls) li.className = cls;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gtm-copy-btn';
    btn.innerHTML = GTM_COPY_SVG;
    btn.title = copyLabel;
    btn.setAttribute('aria-label', copyLabel + ': ' + id);
    btn.addEventListener('click', () => copyGtmId(btn, id));
    li.appendChild(btn);

    const text = document.createElement('span');
    text.innerText = label;
    li.appendChild(text);

    list.appendChild(li);
    return text;
  };
  gtmDetectRecords.forEach((r) => {
    const label = GTMClassify.originLabel(r);
    addRow(r.id, r.id + (label ? ' · ' + label : '') + (r.frame === 'iframe' ? ' (iframe)' : ''));
    (r.destinations || []).forEach((d) => {
      const text = addRow(d, d + ' · ' + gtmDestinationType(d), 'gtm-dest');
      text.title = destHint;
    });
  });
  box.style.display = 'block';
}

// Produktnamen, deshalb nicht übersetzt.
function gtmDestinationType(id) {
  const prefix = id.split('-')[0].toUpperCase();
  return { G: 'GA4', AW: 'Google Ads', DC: 'Floodlight', GT: 'Google Tag' }[prefix] || prefix;
}

// Erkannte GTM-Container/Tags vom Background holen und rendern
function renderGtmDetections() {
  const box = document.getElementById('gtm_detect_box');
  const list = document.getElementById('gtm_detect_list');
  if (!box || !list) return;

  // 1) aktueller Stand aus dem Background
  chrome.runtime.sendMessage({ action: 'gtmGetForActiveTab' }, (resp) => {
    gtmDetectRecords = (resp && resp.records) || [];
    paintGtmDetections();
    // 2) Fallback nach SW-Neustart: Content-Script direkt rescannen lassen
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;
      chrome.tabs.sendMessage(tabs[0].id, { action: 'gtmRescan' }, (r2) => {
        if (chrome.runtime.lastError) return; // kein Content-Script auf dieser Seite
        if (r2 && r2.records && r2.records.length > gtmDetectRecords.length) {
          gtmDetectRecords = r2.records;
          paintGtmDetections();
        }
      });
    });
  });
}

// Auf chrome://-Seiten, im Web Store und auf Extension-Seiten ist Injizieren
// nicht erlaubt: lastError muss gelesen werden, sonst loggt Chrome, und results
// ist dort undefined. Der Callback bekommt in dem Fall null.
function runInActiveTab(details, callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const tab = tabs[0];
    if (!tab) return callback(null);

    chrome.scripting.executeScript(
      Object.assign({ target: { tabId: tab.id } }, details),
      function(results) {
        if (chrome.runtime.lastError || !results || !results[0]) return callback(null);
        callback(results[0].result);
      }
    );
  });
}

// Liest die Einstellungen aus dem localStorage der aktiven Seite
function getSettingsFromPage(callback) {
  runInActiveTab({
    func: function() {
      return localStorage.getItem("igtm_settings") || "{}";
    }
  }, function(raw) {
    var settings = {};
    try {
      settings = JSON.parse(raw || "{}") || {};
    } catch (e) {
      settings = {};
    }
    callback(settings);
  });
}

// Speichert die Einstellungen im localStorage der aktiven Seite
function saveSettingsToPage(settings, callback) {
  runInActiveTab({
    func: function(newSettings) {
      localStorage.setItem("igtm_settings", JSON.stringify(newSettings));
    },
    args: [settings]
  }, function() {
    callback();
  });
}

/* ------------------------------------------------- Karte "GTM-Oberfläche" */

/*
 * Schalter für die Komfortfunktionen im GTM. Der Zustand liegt im localStorage
 * von tagmanager.google.com (igtm_gtm_ui, siehe gtm-ui-features.js) und ist von
 * hier nur über chrome.scripting im aktiven Tab erreichbar — chrome.storage
 * wäre eine neue Berechtigung.
 */

const GTM_UI_ORIGIN = 'https://tagmanager.google.com/';
const GTM_UI_STORAGE_KEY = 'igtm_gtm_ui';
const GTM_UI_FEATURES = ['nav', 'pin', 'builtIn', 'chips', 'sort', 'listSort', 'listSearch', 'submitHint', 'overviewHint', 'searchHotkey', 'sectionHotkeys'];

function featureBoxes() {
  return GTM_UI_FEATURES.map(name => document.querySelector('[data-feature="' + name + '"]'));
}

/*
 * Die vier Kürzel-Zeilen unter ihren Schaltern. Sie arbeiten alle gleich; nur
 * Vorgabe und Ablageort unterscheiden sich. Die drei Bereiche liegen in einer
 * Liste, deshalb `index`.
 */
const HOTKEY_ROWS = [
  {
    name: 'searchHotkeyCombo', feature: 'searchHotkey',
    row: 'igtm_hotkey_row', field: 'igtm_hotkey_field',
    reset: 'igtm_hotkey_reset', hint: 'igtm_hotkey_hint',
    fallback: () => igtmHotkey.DEFAULT
  }
].concat([0, 1, 2].map(index => ({
  name: 'sectionHotkeyCombos', index: index, feature: 'sectionHotkeys',
  row: 'igtm_section_row_' + index, field: 'igtm_section_field_' + index,
  reset: 'igtm_section_reset_' + index, hint: 'igtm_section_hint',
  fallback: () => igtmHotkey.SECTION_DEFAULTS[index]
})));

// Gespiegelt aus dem Zustand der Seite. Nur hier gehalten, weil die
// Kombinationen in keinem Formularfeld stehen, aus dem collectGtmUiState() sie
// ablesen könnte.
const hotkeyStore = {};
let hotkeyRecording = null;

function readHotkey(store, row) {
  const value = store[row.name];
  return row.index === undefined ? value : (value || [])[row.index];
}

function writeHotkey(store, row, combo) {
  if (row.index === undefined) {
    store[row.name] = combo;
    return;
  }
  if (!Array.isArray(store[row.name])) store[row.name] = [];
  store[row.name][row.index] = combo;
}

function hotkeyCombo(row) {
  return igtmHotkey.resolve(readHotkey(hotkeyStore, row), row.fallback());
}

function paintHotkeyFields(lang) {
  HOTKEY_ROWS.forEach(row => {
    const field = document.getElementById(row.field);
    if (!field) return;
    field.value = hotkeyRecording === row
      ? getTranslation(lang, 'gtmui_hotkey_record')
      : igtmHotkey.label(hotkeyCombo(row), lang);
    document.getElementById(row.reset).title =
      getTranslation(lang, 'gtmui_hotkey_reset')
        .replace('{key}', igtmHotkey.label(row.fallback(), lang));
  });
}

function saveHotkey(row, combo) {
  writeHotkey(hotkeyStore, row, combo);
  document.getElementById(row.hint).style.display = 'none';
  paintHotkeyFields(currentLang);
  const next = collectGtmUiState();
  applyGtmUiState(next.enabled, next.features, next.hotkeys);
}

function initHotkeyFields() {
  HOTKEY_ROWS.forEach(row => {
    const field = document.getElementById(row.field);
    const hint = document.getElementById(row.hint);

    field.addEventListener('focus', function() {
      hotkeyRecording = row;
      hint.style.display = 'none';
      field.classList.add('recording');
      paintHotkeyFields(currentLang);
    });

    field.addEventListener('blur', function() {
      hotkeyRecording = null;
      field.classList.remove('recording');
      paintHotkeyFields(currentLang);
    });

    // Tab und Escape bleiben der Bedienung: Ohne einen Weg aus der Aufnahme
    // heraus säße der Fokus fest. Damit sind sie als Kürzel ausgeschlossen.
    field.addEventListener('keydown', function(event) {
      if (event.key === 'Tab') return;
      if (event.key === 'Escape') { field.blur(); return; }
      event.preventDefault();
      event.stopPropagation();

      const combo = igtmHotkey.fromEvent(event);
      // null heißt: nur ein Modifier gedrückt, die Aufnahme läuft weiter.
      if (!combo) return;
      if (!igtmHotkey.valid(combo)) {
        hint.style.display = 'block';
        return;
      }
      saveHotkey(row, combo);
      field.blur();
    });

    document.getElementById(row.reset).addEventListener('click', function() {
      saveHotkey(row, row.fallback());
    });
  });
}

function readGtmUiState(tabId, callback) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: function(key) {
      return localStorage.getItem(key) || '{}';
    },
    args: [GTM_UI_STORAGE_KEY]
  }, function(results) {
    if (chrome.runtime.lastError || !results || !results[0]) {
      callback({});
      return;
    }
    try {
      callback(JSON.parse(results[0].result) || {});
    } catch (e) {
      callback({});
    }
  });
}

// In alle GTM-Tabs schreiben: Der localStorage ist für alle derselbe, aber die
// laufenden Scripts erfahren von der Änderung nur durch das Ereignis.
function applyGtmUiState(enabled, features, hotkeys) {
  chrome.tabs.query({ url: GTM_UI_ORIGIN + '*' }, function(tabs) {
    (tabs || []).forEach(function(tab) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        // Nur die eigenen Felder überschreiben: stickyBar und hideBuiltInVars
        // gehören den Schaltern in der Oberfläche.
        func: function(key, isEnabled, featureFlags, combos) {
          let state = {};
          try {
            state = JSON.parse(localStorage.getItem(key)) || {};
          } catch (e) {
            state = {};
          }
          state.enabled = isEnabled;
          state.features = featureFlags;
          Object.keys(combos || {}).forEach(function(name) { state[name] = combos[name]; });
          localStorage.setItem(key, JSON.stringify(state));
          window.dispatchEvent(new CustomEvent('igtm-gtm-ui-changed'));
        },
        // null statt undefined: Ein undefined in args laesst executeScript
        // scheitern, und dann kommt gar nichts mehr in der Seite an.
        args: [GTM_UI_STORAGE_KEY, enabled, features, hotkeys || null]
      }, function() {
        void chrome.runtime.lastError;
      });
    });
  });
}

// Fehlender Schlüssel heißt an — `!== false` wie in gtm-ui-features.js, mit
// listSearch als einziger Ausnahme. Ohne
// GTM-Tab werden die Kästchen ausgeblendet statt ausgegraut: Ein ausgegrautes
// Häkchen behauptete einen Zustand, der geraten wäre.
function paintGtmUiCard(state, editable) {
  const master = document.getElementById('igtm_gtmui_active');
  const enabled = state.enabled !== false;
  const features = state.features || {};

  master.checked = enabled;

  featureBoxes().forEach((box, index) => {
    const name = GTM_UI_FEATURES[index];
    // listSearch ist die einzige Funktion, die ohne Zutun aus ist — siehe
    // isOn() in gtm-ui-features.js. Ohne diese Ausnahme zeigte das Popup ein
    // Häkchen für eine Funktion, die nicht läuft.
    box.checked = name === 'listSearch'
      ? features[name] === true
      : features[name] !== false;
    box.disabled = !enabled;
  });

  // Jede Zeile gehört zum Schalter darüber: Ist er aus, gibt es kein Kürzel zu
  // wählen.
  HOTKEY_ROWS.forEach(row => {
    writeHotkey(hotkeyStore, row, igtmHotkey.resolve(readHotkey(state, row), row.fallback()));
    const visible = enabled && features[row.feature] !== false;
    document.getElementById(row.row).style.display = visible ? 'flex' : 'none';
    if (!visible) document.getElementById(row.hint).style.display = 'none';
  });
  paintHotkeyFields(currentLang);

  document.getElementById('gtmui_section').classList.toggle('gtmui-locked', !editable);
  document.getElementById('gtmui_note').style.display = editable ? 'none' : 'block';
}

function collectGtmUiState() {
  const features = {};
  featureBoxes().forEach((box, index) => {
    features[GTM_UI_FEATURES[index]] = box.checked;
  });
  const hotkeys = {};
  HOTKEY_ROWS.forEach(row => { writeHotkey(hotkeys, row, hotkeyCombo(row)); });
  return {
    enabled: document.getElementById('igtm_gtmui_active').checked,
    features: features,
    hotkeys: hotkeys
  };
}

function initGtmUiCard() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const tab = tabs[0];
    if (!tab || !(tab.url || '').startsWith(GTM_UI_ORIGIN)) {
      paintGtmUiCard({}, false);
      return;
    }

    readGtmUiState(tab.id, function(state) {
      paintGtmUiCard(state, true);
      initHotkeyFields();

      const controls = [document.getElementById('igtm_gtmui_active')].concat(featureBoxes());
      controls.forEach(control => {
        control.addEventListener('change', function() {
          const next = collectGtmUiState();
          paintGtmUiCard(next, true);
          applyGtmUiState(next.enabled, next.features, next.hotkeys);
        });
      });
    });
  });
}

// Aktualisiert das Badge im Extension-Icon:
// "check" (orange) wenn die Checkup-URL existiert,
// sonst "aktiv" (grün) wenn mindestens eine Checkbox aktiviert ist, sonst leer.
function updateBadge(status, checkupUrl) {
  if (checkupUrl && checkupUrl !== "") {
    chrome.action.setBadgeText({ text: getTranslation(currentLang, "badge_check") });
    chrome.action.setBadgeBackgroundColor({ color: "orange" });
  } else if (status) {
    chrome.action.setBadgeText({ text: getTranslation(currentLang, "badge_active") });
    chrome.action.setBadgeBackgroundColor({ color: "#439e49" });
  } else {
    chrome.action.setBadgeText({ text: "" });
  }
}

function getCheckupUrl(callback) {
  runInActiveTab({
    func: function() {
      return localStorage.getItem("igtm_checkup") || "";
    }
  }, function(url) {
    callback(url || "");
  });
}


// Alle Löschziele, ohne cmpName für sämtliche CMPs. Ein gemeinsamer Weg für beide
// Buttons: Der Einzel-Reset kannte früher nur die Konstanten und ließ die dynamischen Namen stehen.
function consentTargets(cookies, ppmsWebstorage, cmpName) {
  const wanted = cmp => !cmpName || cmp === cmpName;
  const pick = map => Object.keys(map).filter(key => wanted(map[key]));
  const targets = {
    cookies: pick(CMP_COOKIES), local: pick(CMP_LOCAL_STORAGE), session: pick(CMP_SESSION_STORAGE),
    frames: CMP_FRAME_STORAGE.filter(f => wanted(f.cmp)).map(f => ({ origin: f.origin, prefix: f.prefix }))
  };

  CMP_COOKIE_PREFIXES.filter(rule => wanted(rule.cmp)).forEach(rule => {
    const found = cookies.filter(c => c.name.indexOf(rule.prefix) >= 0);
    if (!found.length) return;
    targets.cookies.push(...found.map(c => c.name), ...(rule.cookies || []));
    if (rule.local) targets.local.push(...rule.local(found));
  });

  // Piwik PRO nennt den Namen seines Consent-Cookies im localStorage.
  if (wanted("Piwik PRO")) {
    try {
      const key = JSON.parse(ppmsWebstorage)[0].key;
      if (key) targets.cookies.push(key);
    } catch (e) { /* kein oder unlesbarer Eintrag */ }
  }
  return targets;
}

function resetConsent(tab, cmpName, done) {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: function() {
      return localStorage.getItem("ppms_webstorage") || "";
    }
  }, function(results) {
    // Nicht injizierbare Seite: nichts zu löschen.
    if (chrome.runtime.lastError) return;
    const ppms = results && results[0] ? results[0].result : "";

    chrome.cookies.getAll({ url: tab.url }, function(cookies) {
      if (chrome.runtime.lastError || !cookies) return;
      const targets = consentTargets(cookies, ppms, cmpName);

      targets.cookies.forEach(name => chrome.cookies.remove({ url: tab.url, name: name }));

      // Getrennter Aufruf: Scheitert ein Frame, bleibt der Hauptframe unberührt.
      // Erst danach weiter, sonst bricht der Reload ihn ab.
      if (!targets.frames.length) return wipeTop();
      chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        func: function(frames) {
          frames.filter(f => f.origin === location.origin).forEach(f => {
            try {
              Object.keys(localStorage)
                .filter(key => key.indexOf(f.prefix) === 0)
                .forEach(key => localStorage.removeItem(key));
            } catch (e) { /* Storage im Frame gesperrt */ }
          });
        },
        args: [targets.frames]
      }, function() {
        void chrome.runtime.lastError;
        wipeTop();
      });

      function wipeTop() {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: function(local, session) {
            local.forEach(key => localStorage.removeItem(key));
            session.forEach(key => sessionStorage.removeItem(key));
          },
          args: [targets.local, targets.session]
        }, function() {
          void chrome.runtime.lastError;
          done();
        });
      }
    });
  });
}

function deleteConsentSettings(cmpName) {
  const frage = cmpName
    ? getTranslation(currentLang, "confirm_reset_specific").replace("{cmp}", cmpName)
    : getTranslation(currentLang, "confirm_reset");
  if (!confirm(frage)) return;

  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const tab = tabs[0];
    if (!tab) return;
    resetConsent(tab, cmpName, function() {
      chrome.tabs.reload(tab.id);
      // Erst schließen, wenn die Async-Kette durch ist: Ein früheres window.close()
      // zerstört den Popup-Kontext, bevor die Cookies überhaupt entfernt werden.
      window.close();
    });
  });
}

// Eingabehilfe: aus einer reinen GTM-Container-ID den Standard-Loader-Snippet erzeugen.
function gtmSnippetFromId(id) {
  return "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':\n"
    + "new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],\n"
    + "j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=\n"
    + "'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);\n"
    + "})(window,document,'script','dataLayer','" + id + "');";
}

window.onload = function() {
  // Theme initialisieren
  const savedTheme = localStorage.getItem('igtm_theme') || 'dark';
  setTheme(savedTheme);

  // Sprache initialisieren
  const savedLang = localStorage.getItem('igtm_lang');
  if (savedLang) {
    setLanguage(savedLang);
  } else {
    const browserLang = chrome.i18n.getUILanguage().split('-')[0];
    setLanguage(browserLang === 'en' ? 'en' : 'de');
  }

  // Sprachumschalter Listener
  document.getElementById('lang_de').addEventListener('click', () => setLanguage('de'));
  document.getElementById('lang_en').addEventListener('click', () => setLanguage('en'));

  // Eingabehilfe: reine GTM-ID im Code-Feld beim Verlassen zum Loader-Snippet expandieren
  const gtmCodeField = document.getElementById('igtm_gtm_code');
  if (gtmCodeField) {
    gtmCodeField.addEventListener('blur', function() {
      const v = gtmCodeField.value.trim();
      if (/^GTM-[A-Z0-9]+$/i.test(v)) {
        gtmCodeField.value = gtmSnippetFromId(v);
      }
    });
  }

  // Einstellungen laden und Felder füllen
  getSettingsFromPage(function(settings) {
    // ... (vorheriger Code bleibt unverändert) ...
    document.getElementById('igtm_gtm_code').value = settings.igtmGtmCode || '';
    document.getElementById('igtm_active').checked = settings.igtm_Status || false;
    document.getElementById('igtm_addcode').checked = settings.igtmAddCode || false;
    document.getElementById('igtm_code').value = settings.igtmCode || '';
    document.getElementById('igtm_addinit').checked = settings.igtmAddInit || false;
    document.getElementById('igtm_init').value = settings.igtmInit || '';
    document.getElementById('igtm_gtm_auth').value = settings.igtmGtmAuth || '';
    document.getElementById('igtm_gtm_preview').value = settings.igtmGtmPreview || '';
    
    if (settings.igtmPos === 'body') {
      document.querySelector('input[name="igtm_pos"][value="body"]').checked = true;
    } else {
      document.querySelector('input[name="igtm_pos"][value="head"]').checked = true;
    }

    let combinedStatus = settings.igtm_Status || settings.igtmAddInit || settings.igtmAddCode;
    getCheckupUrl(function(checkupUrl) {
      updateBadge(combinedStatus, checkupUrl);
    });
  });

  // CMP Erkennung
  identifyCMP(function(cmpName) {
    const cmpBox = document.getElementById('show_detected_cmp');
    const cmpNameEl = document.getElementById('detected_cmp_name');
    if (cmpName) {
      cmpNameEl.innerText = cmpName;
      cmpBox.style.display = 'block';
      document.getElementById('igtm_reset_specific').addEventListener('click', (e) => {
        e.preventDefault();
        deleteConsentSettings(cmpName);
      });
    } else {
      cmpBox.style.display = 'none';
    }
  });

  // GTM-Erkennung anzeigen
  renderGtmDetections();

  initGtmUiCard();

  //Background-Script für Checkup-URL
  checkURL(function(response) {
    var showCheckup = document.getElementById("show_checkup");
    if (response.hasCheckup && response.checkupUrl) {
      var lnk = document.getElementById("igtm_inspect");
      lnk.href = response.checkupUrl;
      showCheckup.style.display = "block";
      lnk.addEventListener("click", function() {
        chrome.tabs.create({ active: true, url: response.checkupUrl });
      });
    } else {
      showCheckup.style.display = "none";
    }
  });
  
  document.getElementById('igtm_save').addEventListener('click', function(e) {
    var settings = {
      //igtmGtmId: document.getElementById('igtm_gtm_id').value,
      igtmGtmCode: document.getElementById('igtm_gtm_code').value,
      igtm_Status: document.getElementById('igtm_active').checked,
      igtmAddCode: document.getElementById('igtm_addcode').checked,
      igtmCode: document.getElementById('igtm_code').value.trim(),
      igtmAddInit: document.getElementById('igtm_addinit').checked,
      igtmInit: document.getElementById('igtm_init').value.trim(),
      igtmGtmAuth: document.getElementById('igtm_gtm_auth').value.trim(),
      igtmGtmPreview: document.getElementById('igtm_gtm_preview').value.trim(),
      igtmPos: document.querySelector('input[name="igtm_pos"]:checked').value
    };
    saveSettingsToPage(settings, function() {
      let combinedStatus = settings.igtm_Status || settings.igtmAddInit || settings.igtmAddCode;
      // Erneut die URL prüfen, um das Badge zu aktualisieren
      checkURL(function(response) {
        updateBadge(combinedStatus, response.hasCheckup ? response.checkupUrl : "");
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          chrome.tabs.reload(tabs[0].id);
        });
      });
    });
    window.close();
  });
  
  document.getElementById('igtm_reset_consent').addEventListener('click', function(e) {
    deleteConsentSettings();
  });
  
  var helpLnk = document.getElementById('igtm_help');
  helpLnk.addEventListener("click", function() {
    chrome.tabs.create({ active: true, url: helpLnk.href });
  });

  const infoBtn = document.getElementById('info_btn');
  const mainEl = document.querySelector('main');

  if (infoBtn && mainEl) {
    infoBtn.addEventListener('click', () => {
      mainEl.classList.add('info-open');
      mainEl.scrollTop = 0;
    });

    ['info_back_top', 'info_close_btn'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', () => {
        mainEl.classList.remove('info-open');
        mainEl.scrollTop = 0;
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mainEl.classList.contains('info-open')) {
        mainEl.classList.remove('info-open');
        mainEl.scrollTop = 0;
      }
    });
  }

  // Theme Umschalter Listener
  const themeBtn = document.getElementById('theme_btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const isLight = document.body.classList.contains('light-theme');
      setTheme(isLight ? 'dark' : 'light');
    });
  }
};
