var currentLang = 'de';

const CMP_COOKIES = {
  "cookiefirst-consent": "CookieFirst",
  "CookieConsent": "CookieBot",
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
  "trk_consent": "gms Legacy",
  "legalweb_cookie_settings": "legalweb",
  "dp_cookieconsent_status": "DP Cookie Consent",
  "klaro": "Klaro.js",
  "euconsent-v2": "IAB / Didomi / Uni Consent",
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
  "cc_cookie": "Orestbida / Prive",
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
  "ccm_consent": "CCM19",
  "dsgvo_cd": "Unknown",
  "cms_cookies": "Contao",
  "cms_cookies_saved": "Contao",
  "GXConsents": "Gambio",
  "oil_data": "Gambio",
  "AdvertisementCookies": "Unknown Builder",
  "AnalyticsCookies": "Unknown Builder",
  "ShowCookieConsent": "Unknown Builder",
  "cookie-pref": "InMobi"
};

const CMP_LOCAL_STORAGE = {
  "cookiefirst-id": "CookieFirst",
  "cookiefirst-consent": "CookieFirst",
  "uc_user_interaction": "UserCentrics",
  "uc_settings": "UserCentrics",
  "truste.eu.cookie.notice_gdpr_prefs": "TrustArc",
  "truste.eu.cookie.notice_preferences": "TrustArc",
  "ccm_consent": "CCM19",
  "ppms_webstorage": "Piwik PRO",
  "euconsent-v2": "IAB / Didomi / Uni Consent",
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
  "cookieConsentChoice": "Unknown Builder"
};

const CMP_SESSION_STORAGE = {
  "ccm_consent": "CCM19"
};

function updateUI(lang) {
  const elementsToTranslate = [
    { id: 'hdng', key: 'hdng', type: 'innerText' },
    { id: 'option_hint', key: 'option_hint', type: 'innerHTML' },
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
    { id: 'label_detected_cmp', key: 'detected_cmp', type: 'innerText' },
    { id: 'igtm_help', key: 'help_link', type: 'innerText' }
  ];

  elementsToTranslate.forEach(item => {
    const el = document.getElementById(item.id);
    if (el) {
      const translation = getTranslation(lang, item.key);
      if (item.type === 'innerHTML') el.innerHTML = translation;
      else if (item.type === 'placeholder') el.placeholder = translation;
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
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('igtm_lang', lang);
  updateUI(lang);
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
      for (let cookie of cookies) {
        if (CMP_COOKIES[cookie.name]) {
          return callback(CMP_COOKIES[cookie.name]);
        }
        // Sonderfall Piwik PRO (ppms_privacy_...)
        if (cookie.name.indexOf("ppms_privacy_") === 0) return callback("Piwik PRO");
        // Sonderfall Real Cookie Banner
        if (cookie.name.indexOf("real_cookie_banner-v:") === 0) return callback("Real Cookie Banner");
        // Sonderfall Consentmanager.net
        if (cookie.name.indexOf("__cmpc") === 0) return callback("Consentmanager.net");
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
    callback(response);
  });
}

// Liest die Einstellungen aus dem localStorage der aktiven Seite
function getSettingsFromPage(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: function() {
        return localStorage.getItem("igtm_settings") || "{}";
      }
    }, function(results) {
      var settings = JSON.parse(results[0].result);
      callback(settings);
    });
  });
}

// Speichert die Einstellungen im localStorage der aktiven Seite
function saveSettingsToPage(settings, callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: function(newSettings) {
        localStorage.setItem("igtm_settings", JSON.stringify(newSettings));
      },
      args: [settings]
    }, function() {
      callback();
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
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: function() {
        return localStorage.getItem("igtm_checkup") || "";
      }
    }, function(results) {
      callback(results[0].result);
    });
  });
}


function deleteConsentSettings() {
  if (confirm(getTranslation(currentLang, "confirm_reset"))) {
    
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: function() {
          return localStorage.getItem("ppms_webstorage") || "";
        }
      }, function(results) {
        var ppCookie = "noPPCookie";
        if (results && results[0].result) {
          var ppobj;
          try {ppobj = JSON.parse(results[0].result); } catch(e) {ppobj = []}
          var ppid = ppobj[0];
          if ((ppid && ppid.key)) ppCookie = ppid.key;
        } 

        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          let tab = tabs[0];
          let tabId = tab.id;
          let currentUrl = tab.url;
          
          // Liste der Consent-Cookie-Namen aus Mappings generieren
          let cookieNames = [ppCookie, ...Object.keys(CMP_COOKIES)];
          
          // Liste der localStorage-Schlüssel aus Mappings generieren
          let localStorageKeys = Object.keys(CMP_LOCAL_STORAGE);

          // Liste der sessionStorage-Schlüssel aus Mappings generieren
          let sessionStorageKeys = Object.keys(CMP_SESSION_STORAGE);

          //Dynamische Namen von Cookies suchen und anhängen...
          chrome.cookies.getAll({url: tabs[0].url}, function(results) {
            //Real Cookie Banner:
            let realCookiesFound = results.filter(x=>x.name.indexOf("real_cookie_banner-v:")>=0);
            if (realCookiesFound.length > 0) cookieNames = cookieNames.concat(realCookiesFound.map(x => (x.name)));
            //Consentmanager.net
            let consentManagerCookiesFound = results.filter(x=>x.name.indexOf("__cmpc")>=0);
            if (consentManagerCookiesFound.length > 0) {
              let cmCookieDomain = consentManagerCookiesFound[0].domain; 
              let cmCookieNames = consentManagerCookiesFound.map(x => (x.name));
              cookieNames = cookieNames.concat(cmCookieNames);
              cookieNames.push("__cmpiuid");
              cmCookieNames.forEach(x=>{
                localStorageKeys.push(x+"_"+cmCookieDomain);
                localStorageKeys.push(x+"_expire"+cmCookieDomain);
              });
            }
            //Concord
            let concordCookiesFound = results.filter(x=>x.name.indexOf("concord-allow-state-")>=0);
            if (concordCookiesFound.length > 0) {
              let coCookieNames = concordCookiesFound.map(x => (x.name));
              let coAccount = coCookieNames[0].replace("concord-allow-state-", "");
              cookieNames = cookieNames.concat(coCookieNames);
              localStorageKeys.push("concord-consent-state-"+coAccount);
              localStorageKeys.push("concord-transient-token-"+coAccount);
              localStorageKeys.push("concord-banner-closed");
            }
            //Piwik PRO (alle)
            let ppCookiesFound = results.filter(x=>x.name.indexOf("ppms_privacy_")>=0);
            if (ppCookiesFound.length > 0) 
              cookieNames = cookieNames.concat(ppCookiesFound.map(x => (x.name)));
            //Iubenda
            let iubCookiesFound = results.filter(x=>x.name.indexOf("_iub_cs-")>=0);
            if (iubCookiesFound.length > 0 && iubCookiesFound[0].name) 
              cookieNames.push(iubCookiesFound[0].name);
            //MyAgilePrivacy
            let mapCookiesFound = results.filter(x=>x.name.indexOf("map_accepted_")>=0);
            if (mapCookiesFound.length > 0) 
              cookieNames = cookieNames.concat(mapCookiesFound.map(x => (x.name)));
            //MND Cookie Notice (Shopware)
            let mndCookiesFound = results.filter(x=>x.name.indexOf("mnd-")>=0);
            if (mndCookiesFound.length > 0) 
              cookieNames = cookieNames.concat(mndCookiesFound.map(x => (x.name)));
            //BigID / illow 
            let bigIdCookies = results.filter(x=>x.name.indexOf("bigidcmp-consent-")>=0);
            if (bigIdCookies.length > 0) {
              let biCookieNames = bigIdCookies.map(x => (x.name));
              cookieNames = cookieNames.concat(biCookieNames);
              localStorageKeys.push(biCookieNames[0]);
            }
            //Cookies entfernen, wenn vorhanden
            cookieNames.forEach(function(name) {
              chrome.cookies.remove({ url: currentUrl, name: name });
              //console.log("remove cookie: ", name); 
            });
      
            //LS Einträge entfernen, wenn vorhanden
            chrome.scripting.executeScript({
              target: { tabId: tabId },
              func: function(keys) {
                keys.forEach(function(key) {
                  localStorage.removeItem(key);
                });
              },
              args: [localStorageKeys]
            }, function() {
              //chrome.tabs.reload(tabId);
            });

            //SessionStorage Einträge entfernen, wenn vorhanden (Danke, CCM19 :|)
            chrome.scripting.executeScript({
              target: { tabId: tabId },
              func: function(keys) {
                keys.forEach(function(key) {
                  sessionStorage.removeItem(key);
                });
              },
              args: [sessionStorageKeys]
            }, function() {
              chrome.tabs.reload(tabId);
            });

          });
          
        });

      });
    });

  window.close();

  }
}

function deleteSpecificConsentSettings(cmpName) {
  if (confirm(getTranslation(currentLang, "confirm_reset") + " (" + cmpName + ")")) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const tab = tabs[0];
      const currentUrl = tab.url;

      // Filter keys for this specific CMP
      const cookieNames = Object.keys(CMP_COOKIES).filter(key => CMP_COOKIES[key] === cmpName);
      const localStorageKeys = Object.keys(CMP_LOCAL_STORAGE).filter(key => CMP_LOCAL_STORAGE[key] === cmpName);
      const sessionStorageKeys = Object.keys(CMP_SESSION_STORAGE).filter(key => CMP_SESSION_STORAGE[key] === cmpName);

      // Cookies entfernen
      cookieNames.forEach(name => {
        chrome.cookies.remove({ url: currentUrl, name: name });
      });

      // LS/SS entfernen
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: function(lsKeys, ssKeys) {
          lsKeys.forEach(key => localStorage.removeItem(key));
          ssKeys.forEach(key => sessionStorage.removeItem(key));
        },
        args: [localStorageKeys, sessionStorageKeys]
      }, function() {
        chrome.tabs.reload(tab.id);
        window.close();
      });
    });
  }
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
        deleteSpecificConsentSettings(cmpName);
      });
    } else {
      cmpBox.style.display = 'none';
    }
  });

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

  // Info Overlay Steuerung
  const infoBtn = document.getElementById('info_btn');
  const infoOverlay = document.getElementById('info_overlay');
  const infoCloseBtn = document.getElementById('info_close_btn');

  if (infoBtn && infoOverlay && infoCloseBtn) {
    infoBtn.addEventListener('click', () => {
      infoOverlay.style.display = 'flex';
    });
    infoCloseBtn.addEventListener('click', () => {
      infoOverlay.style.display = 'none';
    });
    // Schließen bei Klick auf das Overlay außerhalb des Contents
    infoOverlay.addEventListener('click', (e) => {
      if (e.target === infoOverlay) infoOverlay.style.display = 'none';
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
