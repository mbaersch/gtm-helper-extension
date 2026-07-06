// ISOLATED-World. Hört MAIN-postMessage und leitet an den Background weiter.
(function () {
  'use strict';
  var last = []; // letzter gemeldeter Stand dieses Frames (für Rescan-Antwort)

  window.addEventListener('message', function (ev) {
    if (ev.source !== window) return;
    var d = ev.data;
    if (!d || d.source !== 'gtmhelper-detect' || !Array.isArray(d.records)) return;
    last = last.concat(d.records);
    try {
      chrome.runtime.sendMessage({ action: 'gtmDetected', records: d.records, url: d.url });
    } catch (e) { /* Background evtl. schlafend/weg — unkritisch */ }
  });

  // Popup kann einen frischen Stand anfordern (nach SW-Neustart).
  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg && msg.action === 'gtmRescan') { sendResponse({ records: last }); }
    return true;
  });
})();
