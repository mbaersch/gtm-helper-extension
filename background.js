// translations.js im Service-Worker verfügbar machen (definiert getTranslation/translations global).
importScripts('translations.js');

// Aktuelle UI-Sprache fürs Badge. Flüchtig (SW-Lebensdauer); das Popup meldet sie beim Öffnen/Umschalten.
let badgeLang = 'de';

// Flüchtige, per-Tab-Sammlung erkannter GTM-Container (Service-Worker-lebensdauer).
const gtmByTab = new Map(); // tabId -> Map<idUpper, Record>

function gtmRecordsForTab(tabId) {
  const m = gtmByTab.get(tabId);
  return m ? Array.from(m.values()) : [];
}

function addGtmRecords(tabId, records) {
  if (tabId == null) return;
  let m = gtmByTab.get(tabId);
  if (!m) { m = new Map(); gtmByTab.set(tabId, m); }
  (records || []).forEach(r => { if (r && r.id) m.set(r.id.toUpperCase(), r); });
}

function buildCheckupUrl(url) {
	var regex = /https:\/\/tagmanager\.google\.com\/.*\/accounts\/(\d+)\/containers\/(\d+)\/workspaces\/(\d+)/;
	var matches = regex.exec(url);
	if (matches && matches.length === 4) {
	  return "https://www.analytrix.de/gtm-checkup-helper.html?autoaccountid=" +
		matches[1] + "&autocontainerid=" + matches[2] +
		"&autoworkspaceid=" + matches[3] + "#methods";
	}
	return "";
  }
  
  // Aktualisierung Badge: 
  // "check", wenn die URL ein GTM-Container-Muster hat,
  // "aktiv", wenn mindestens eine Option aktiviert
  function updateBadgeForTab(tabId) {
	chrome.tabs.get(tabId, function(tab) {
	  let currentUrl = tab.url || "";
	  let checkupUrl = "";
	  if (currentUrl.indexOf("tagmanager.google.com") !== -1) {
		checkupUrl = buildCheckupUrl(currentUrl);
	  }

	  chrome.scripting.executeScript({
		target: { tabId: tabId },
		func: function() {
		  return localStorage.getItem("igtm_settings") || "{}";
		}
	  }, function(results) {
		if (chrome.runtime.lastError) {
		  chrome.action.setBadgeText({ text: "" });
		  return;
		}
		let settings = JSON.parse(results[0].result)||{};
		let active = settings.igtm_Status || settings.igtmAddInit || settings.igtmAddCode;
		let gtmCount = gtmRecordsForTab(tabId).length;
		if (checkupUrl && checkupUrl !== "") {
		  chrome.action.setBadgeText({ text: getTranslation(badgeLang, "badge_check") });
		  chrome.action.setBadgeBackgroundColor({ color: "orange" });
		} else if (active) {
		  chrome.action.setBadgeText({ text: getTranslation(badgeLang, "badge_active") });
		  chrome.action.setBadgeBackgroundColor({ color: "#439e49" });
		} else if (gtmCount > 0) {
		  chrome.action.setBadgeText({ text: String(gtmCount) });
		  chrome.action.setBadgeBackgroundColor({ color: "#3b6fd4" });
		} else {
		  chrome.action.setBadgeText({ text: "" });
		}
	  });
	});
  }
  
  // Update Badge bei Tab-Updates und Aktivierung
  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (changeInfo.status === "loading") {
	  gtmByTab.delete(tabId); // Funde gelten nur für die aktuelle Seite
	}
	if (changeInfo.status === "complete") {
	  updateBadgeForTab(tabId);
	}
  });
  chrome.tabs.onActivated.addListener(function(activeInfo) {
	updateBadgeForTab(activeInfo.tabId);
  });
  
  // Polling: Alle 2 Sekunden Badge aktualisieren
  setInterval(function() {
	chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
	  if (tabs && tabs.length > 0) {
		updateBadgeForTab(tabs[0].id);
	  }
	});
  }, 2000);
  
  //URL Prüfen auf GTM-Container Parameter
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	if (msg.action === "setLang") {
	  badgeLang = msg.lang || "de";
	  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		if (tabs && tabs[0]) updateBadgeForTab(tabs[0].id);
	  });
	  return; // keine Antwort nötig
	}
	if (msg.action === "gtmDetected") {
	  const tabId = sender.tab && sender.tab.id;
	  addGtmRecords(tabId, msg.records);
	  if (tabId != null) updateBadgeForTab(tabId);
	  return; // keine Antwort nötig
	}
	if (msg.action === "gtmGetForActiveTab") {
	  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		sendResponse({ records: tabs[0] ? gtmRecordsForTab(tabs[0].id) : [] });
	  });
	  return true;
	}
	if (msg.action === "checkURL") {
	  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
		if (tabs[0]) {
		  let url = tabs[0].url;
		  let checkupUrl = buildCheckupUrl(url);
		  let hasCheckup = (checkupUrl !== "");
		  sendResponse({ hasCheckup: hasCheckup, checkupUrl: checkupUrl });
		} else {
		  sendResponse({ hasCheckup: false, checkupUrl: "" });
		}
	  });
	  return true;
	}
  });

  // Aufräumen: Fund-Map beim Schließen eines Tabs entfernen
  chrome.tabs.onRemoved.addListener(function (tabId) { gtmByTab.delete(tabId); });