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

  // google_tag_data.tidr ist intern und undokumentiert. Die Destinations stehen dort,
  // sobald der Container geladen ist, unabhängig von Consent und davon, ob ein Tag feuert.
  // scriptSource ist die tatsächlich geladene URL, auch wenn sie sich nicht als Loader zu erkennen gibt.
  function tidr() {
    var out = { destinations: {}, scriptSources: {} };
    try {
      var c = window.google_tag_data.tidr.container;
      Object.keys(c).forEach(function (id) {
        var k = id.toUpperCase();
        if (Array.isArray(c[id].destinations)) out.destinations[k] = c[id].destinations.slice();
        if (typeof c[id].scriptSource === 'string' && c[id].scriptSource) out.scriptSources[k] = c[id].scriptSource;
      });
    } catch (e) { /* ignore */ }
    return out;
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

  function scan() {
    var t = tidr();
    var records = window.GTMClassify.buildRecords({
      globalKeys: gtmGlobalKeys(), resourceUrls: resourceUrls(),
      destinations: t.destinations, scriptSources: t.scriptSources,
      pageUrl: location.href, frame: frame
    });
    var fresh = records.filter(function (r) {
      var key = r.id.toUpperCase();
      var sig = [r.origin, r.host, r.path, r.via].join('|') + '|' + (r.destinations || []).join(',');
      if (seen[key] === sig) return false; // schon so gemeldet
      seen[key] = sig;
      return true;
    });
    if (!fresh.length) return;

    fresh.forEach(function (r) {
      // Konsole bewusst englisch (MAIN-World kennt die gewählte UI-Sprache nicht) + Farbakzent im Badge-Blau.
      var label = window.GTMClassify.originLabel(r);
      console.log('%c[GTM Helper]%c ' + r.id + (label ? ' loaded via ' + label : ' detected') +
                  (frame === 'iframe' ? ' (iframe)' : '') +
                  (r.destinations ? ' — destinations: ' + r.destinations.join(', ') : ''),
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
