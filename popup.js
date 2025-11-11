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
    chrome.action.setBadgeText({ text: "check" });
    chrome.action.setBadgeBackgroundColor({ color: "orange" });
  } else if (status) {
    chrome.action.setBadgeText({ text: "aktiv" });
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
  if (confirm("Alle Consent-Einstellungen für diese Domain löschen und Seite neu laden?")) {
    
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
          
          // Liste der Consent-Cookie-Namen (wie ursprünglich)
          let cookieNames = [

            //Piwik PRO ID, wenn vorhanden (sonst Dummy)
            ppCookie,

            //CookieFirst
            "cookiefirst-consent",
    
            //CookieBot
            "CookieConsent",
    
            //OneTrust / CookiePro
            "OptanonConsent",
            "OptanonAlertBoxClosed",
    
            //Axeptio (https://www.axeptio.eu) 
            "axeptio_cookies",
            "axeptio_authorized_vendors",
            "axeptio_all_vendors",
    
            //Borlabs
            "borlabs-cookie",
            "borlabsCookie",
    
            //Cookie Information Consent Manager
            "CookieInformationConsent",
    
            //Cookie Law Info
            "viewed_cookie_policy",
            "cookielawinfo-checkbox-necessary",
            "cookielawinfo-checkbox-preferences",
            "cookielawinfo-checkbox-analytics",
            "cookielawinfo-checkbox-advertisement",
            "cookielawinfo-checkbox-performance",
            "cookielawinfo-checkbox-non-necessary",
            "CookieLawInfoConsent",
    
            //Cookie Notice & Compliance (WP Plugin)
            "hu-consent",
            "cookie_notice_accepted",
    
            //Complianz - GDPR/CCPA Cookie Consent (WP Plugin)
            "complianz_policy_id",
            "complianz_consent_status",
            "cmplz_banner-status",
            "cmplz_consented_services",
            "cmplz_saved_categories",
            "cmplz_saved_services",
            "cmplz_stats",
            "cmplz_policy_id",
            "cmplz_functional",
            "cmplz_preferences",
            "cmplz_statistics",
            "cmplz_marketing",
    
             //TrustArc Cookies
            "notice_gdpr_prefs",
            "notice_preferences",
    
            //Kick Consent Manager (Joomla)
            "kcm_data",
    
            //let`s give it a shot... 
            "consent",
            "privacy_signal",
            "cookieConsent",
            "cookieconsent",
            "cookieSettings",
            "cookiesettings",
            "analytics",
            "marketing",
            "statistics",
            
            //gms Legacy Consent Cookie
            "trk_consent",

            //legalweb
            "legalweb_cookie_settings",

            //DP Cookie Consent (Typo3 Extension)
            "dp_cookieconsent_status",

            //Klaro.js
            "klaro",

            //Didomi 
            "euconsent-v2",
            "didomi_token",

            //Clickio
            "__lxG__consent__v2",

            //CookieHub
            "cookiehub",

            //CookieScript
            "CookieScriptConsent",

            //CookieYes
            "cookieyes-consent",

            //Lawwwing
            "lawwwing-consent-v2",

            //Sourcepoint
            "consentDate",
            "consentUUID",

            //Truendo
            "truendo_cmp",

            //Uni Consent
            "uniconsent-v2",

            //Consent Studio
            "consent-studio__storage",

            //CookiePal
            "cookiepal-consent",

            //Osano
            "osano_consentmanager",

            //Cytrio
            "cyt-consent",
            "cyt_consent_given",

            //Mandatly
            "Mdt_Consent",
            
            //Hubspot Consent
            "__hs_cookie_cat_pref",

            //Amasty Cookie Consent (Magento)
            "amcookie_allowed",
            "amcookie_policy_restriction",

            //datareporter.eu
            "cookieconsent_mode",
            "cookieconsent_status",

            //Commanders Act
            "TC_PRIVACY_CENTER",
            "TC_PRIVACY",

            //Enzuzo
            "cookies-analytics",
            "cookies-functional",
            "cookies-marketing",
            "cookies-preferences",

            //Termly
            "TERMLY_API_CACHE",

            //Ketch
            "_swb",
            "_swb_consent_",
            "_ketch_consent_v1_",

            //Gitbook
            "__gitbook_cookie_granted",

            //Wix
            "consent-policy",

            //Shopware
            "cookie-preference",
            //Shopware (native Integration)
            "google-analytics-enabled",

            //Shopify
            "_tracking_consent",

            //Pandectes GDPR/DSGVO Cookie (Shopify)
            "_pandectes_gdpr",

            //Consentmo (Shopify)
            "cookieconsent_status1",
            "cookieconsent_preferences_disabled",

            //Avada (Shopify)
            "avada_cookie_consent",

            //Consentik (Shopify)
            "cookiesNotification",
            "_consentik_cookie",

            //GoodApps (Shopify) 
            "goodg_block_popup",

            //Acris
            "acris_cookie_acc",
            "acris_cookie_landing_page",
            "acris_cookie_referrer",
            "acris_cookie_first_activated",
            "cookiePreferences",
            "session-1",
            "session-",
            
            //Magento 1 GDPR Compliance
            "cookie_accepted", 
            "cookie_closed", 
            "cookiesEnabled", 
            "required_cookies", 
            "popupData",

            //Orestbida Cookie Consent / Prive
            "cc_cookie",

            //Mediawiki
            "mw-cookie-settings",

            //SiteMinder
            "sm-cookie-consent",

            //Tarte au Citron
            "tarteaucitron",

            //Tealium
            "CONSENTMGR",

            //TamTam Consent
            "ttcm_consent",

            //LANsoft (ts only)
            "cookieconsentTimestamp",

            //CookieLegit
            "cl_consent",
            "cl_essential",
            "cl_marketing",
            "cl_tracking",

            //Cookieconfirm
            "cc_accepted_cookies",
            "cc_consent_id",

            //New 2.9:
            //CCM19 - optional cookie storage
            "ccm_consent",

            //Unknown
            "dsgvo_cd",

            //contao plugins,
            "cms_cookies",
            "cms_cookies_saved",

          ];

          // Liste der localStorage-Schlüssel, die gelöscht werden sollen
          let localStorageKeys = [
            //CookieFirst
            "cookiefirst-id",
            "cookiefirst-consent",

            //UserCentrics
            "uc_user_interaction",
            "uc_settings",

            //TrustArc localStorage
            "truste.eu.cookie.notice_gdpr_prefs",
            "truste.eu.cookie.notice_preferences",

            //CCM19 (standard: localStorage)
            "ccm_consent",

            //Piwik PRO
            "ppms_webstorage",

            //Didomi
            "euconsent-v2",
            "didomi_token",

            //Clickio
            "__lxG__consent__v2",

            //Secure Privacy
            "sp_consent",
            "sp_dynamic",

            //Sourcepoint
            "_sp_user_consent_40",

            //Termly
            "TERMLY_API_CACHE",

            //Osano
            "osano_consentmanager",
            
            //Cytrio
            "cyt_consent_given",

            //Acceptrics
            "__acceptrics_settings",

            //ABConsent
            "sddan:cmp",
            "sddan:cmp:stc",
            "sddan:cmp:stc:ts",

            //Silktide
            "silktideCookieBanner_InitialChoice",

            //Ultimate Cookie Banner (Shopify)
            "conversionBearCookieConsent",

            //Scala (Shopify)
            "scalaLGPDBanner",

            //JTL 
            "consent",

            //Doofinder
            "df-cookies-allowed",

            //Contao plugins
            "ccb_contao_token_2", 

          ];

          // Liste der localStorage-Schlüssel, die gelöscht werden sollen
          let sessionStorageKeys = [
            //CCM19 - optional sessionStorage key
            "ccm_consent",
          ];

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

window.onload = function() {
  // Einstellungen laden und Felder füllen
  getSettingsFromPage(function(settings) {
    //document.getElementById('igtm_gtm_id').value = settings.igtmGtmId || '';
    document.getElementById('igtm_gtm_code').value = settings.igtmGtmCode || '';
    document.getElementById('igtm_active').checked = settings.igtm_Status || false;
    document.getElementById('igtm_addcode').checked = settings.igtmAddCode || false;
    document.getElementById('igtm_code').value = settings.igtmCode || '';
    document.getElementById('igtm_addinit').checked = settings.igtmAddInit || false;
    document.getElementById('igtm_init').value = settings.igtmInit || '';
    let combinedStatus = settings.igtm_Status || settings.igtmAddInit || settings.igtmAddCode;
    getCheckupUrl(function(checkupUrl) {
      updateBadge(combinedStatus, checkupUrl);
    });
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
      igtmInit: document.getElementById('igtm_init').value.trim()
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
  
  var lnk = document.getElementById('igtm_help');
  lnk.addEventListener("click", function() {
    chrome.tabs.create({ active: true, url: lnk.href });
  });
};
