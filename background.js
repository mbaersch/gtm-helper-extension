function buildCheckupUrl(url) {
	var regex = /https:\/\/tagmanager\.google\.com\/.*\/accounts\/(\d+)\/containers\/(\d+)\/workspaces\/(\d+)/;
	var matches = regex.exec(url);
	if (matches && matches.length === 4) {
	  return "https://www.analytrix.de/gtm-checkup-helper.html?autoaccountid=" +
		matches[1] + "&autocontainerid=" + matches[2] +
		"&autoworkspaceid=" + matches[3] + "#results";
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
		if (checkupUrl && checkupUrl !== "") {
		  chrome.action.setBadgeText({ text: "check" });
		  chrome.action.setBadgeBackgroundColor({ color: "orange" });
		} else if (active) {
		  chrome.action.setBadgeText({ text: "aktiv" });
		  chrome.action.setBadgeBackgroundColor({ color: "#439e49" });
		} else {
		  chrome.action.setBadgeText({ text: "" });
		}
	  });
	});
  }
  
  // Update Badge bei Tab-Updates und Aktivierung
  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
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
	  if (tabs.length > 0) {
		updateBadgeForTab(tabs[0].id);
	  }
	});
  }, 2000);
  
  //URL Prüfen auf GTM-Container Parameter
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
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