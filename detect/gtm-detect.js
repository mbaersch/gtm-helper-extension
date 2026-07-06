// MAIN-World. Liest Page-Globals + Resource-Timings, klassifiziert, loggt, postMessage.
(function () {
  'use strict';
  if (!window.GTMClassify) return; // classify.js muss vorher geladen sein

  var frame = (window.top === window.self) ? 'top' : 'iframe';
  var seen = {}; // id -> serialisierte Methode, um Deltas zu erkennen

  function gtmGlobalKeys() {
    try {
      var g = window.google_tag_manager;
      return g ? Object.keys(g) : [];
    } catch (e) { return []; }
  }

  function resourceUrls() {
    var urls = [];
    try {
      performance.getEntriesByType('resource').forEach(function (e) { urls.push(e.name); });
    } catch (e) { /* ignore */ }
    // Fallback: script-src-Attribute (fängt inline injizierte Loader)
    try {
      document.querySelectorAll('script[src]').forEach(function (s) { urls.push(s.src); });
    } catch (e) { /* ignore */ }
    return urls;
  }

  function methodLabel(m) {
    return { standard: 'standard', 'first-party': 'first-party (sGTM)',
             'custom-path': 'custom path', base64: 'base64 loader',
             unknown: 'unknown (inline?)' }[m] || m;
  }

  function scan() {
    var records = window.GTMClassify.buildRecords({
      globalKeys: gtmGlobalKeys(), resourceUrls: resourceUrls(), frame: frame
    });
    var fresh = records.filter(function (r) {
      var key = r.id.toUpperCase();
      if (seen[key] === r.method) return false; // schon in dieser Methode gemeldet
      seen[key] = r.method;
      return true;
    });
    if (!fresh.length) return;

    fresh.forEach(function (r) {
      // Konsole bewusst englisch (MAIN-World kennt die gewählte UI-Sprache nicht) + Farbakzent im Badge-Blau.
      console.log('%c[GTM Helper]%c ' + r.id + ' loaded via ' + methodLabel(r.method) +
                  (r.host ? ' — host: ' + r.host : '') + (frame === 'iframe' ? ' (iframe)' : ''),
                  'color:#3b6fd4;font-weight:bold', 'color:inherit');
    });
    try {
      window.postMessage({ source: 'gtmhelper-detect', records: fresh, url: location.href }, '*');
    } catch (e) { /* ignore */ }
  }

  // Backoff: 500ms für 15s, dann 2s bis 60s, dann Stopp.
  var start = Date.now();
  function tick() {
    scan();
    var elapsed = Date.now() - start;
    if (elapsed > 60000) return;
    setTimeout(tick, elapsed < 15000 ? 500 : 2000);
  }
  scan();
  setTimeout(tick, 500);

  // Zusätzlich: neue Resource-Loads sofort mitnehmen.
  try {
    new PerformanceObserver(function () { scan(); }).observe({ type: 'resource', buffered: true });
  } catch (e) { /* ignore */ }
})();
