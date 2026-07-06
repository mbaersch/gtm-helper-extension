// Reine GTM-Loader-Klassifikation. DOM-/chrome-frei, dual-use (Browser + node).
// Portiert aus Dev/tracking-auditor audit.js (detectSSTFromUrls / tryDecodeStapeTransport).
(function (root) {
  'use strict';

  var LOADER_HOSTS = ['googletagmanager.com'];
  var ID_RE = /^(GTM|G|AW|GT|DC)-[A-Z0-9]+$/i;
  var GTAG_TID_RE = /^G-[A-Z0-9]+$/i;
  var GOOGLE_PATHS = ['/gtm.js', '/gtag/js', '/g/collect', '/collect', '/j/collect'];

  function isGoogleHost(host) {
    return LOADER_HOSTS.some(function (h) {
      return host === h || host === 'www.' + h || host.endsWith('.' + h);
    });
  }

  function decodeBase64Utf8(value) {
    try {
      var bin = atob(value);
      var bytes = Uint8Array.from(bin, function (c) { return c.charCodeAt(0); });
      return new TextDecoder('utf-8').decode(bytes);
    } catch (e) {
      return null;
    }
  }

  function extractIdFromDecoded(decoded) {
    try {
      // decoded ist z.B. '/gtm.js?id=GTM-ABCDE' -> als relative URL parsen
      var u = new URL(decoded, 'https://x.invalid');
      var id = u.searchParams.get('id') || u.searchParams.get('tid');
      return id && ID_RE.test(id) ? id : null;
    } catch (e) {
      return null;
    }
  }

  function classifyLoaderUrl(urlString) {
    var u;
    try { u = new URL(urlString); } catch (e) { return null; }
    var host = u.hostname;
    var path = u.pathname;
    var google = isGoogleHost(host);

    // 1) base64-Tunnel: irgendein Query-Param decodiert zu einem Google-Loader-Pfad
    var entries = Array.from(u.searchParams.values());
    for (var i = 0; i < entries.length; i++) {
      var decoded = decodeBase64Utf8(entries[i]);
      if (decoded && GOOGLE_PATHS.some(function (p) { return decoded.indexOf(p) !== -1; })) {
        return { id: extractIdFromDecoded(decoded), method: 'base64', host: host };
      }
    }

    // 2) echter Loader-Pfad: /gtm.js oder /gtag/js
    if (path.endsWith('/gtm.js') || path.endsWith('/gtag/js')) {
      var id = u.searchParams.get('id');
      if (id && ID_RE.test(id)) {
        return { id: id, method: google ? 'standard' : 'first-party', host: host };
      }
      return null;
    }

    // 3) Custom-Path Collect: Fremd-Host, kein /collect, aber v=2 + gtag-tid
    if (!google && path.indexOf('/collect') === -1) {
      var tid = u.searchParams.get('tid');
      var v = u.searchParams.get('v');
      if (tid && GTAG_TID_RE.test(tid) && v === '2') {
        return { id: tid, method: 'custom-path', host: host };
      }
    }

    return null;
  }

  function buildRecords(input) {
    var frame = input.frame || 'top';
    var byId = new Map();

    (input.globalKeys || []).forEach(function (key) {
      if (ID_RE.test(key)) {
        byId.set(key.toUpperCase(), {
          id: key, method: 'unknown', host: null, loaderUrl: null, frame: frame
        });
      }
    });

    (input.resourceUrls || []).forEach(function (url) {
      var c = classifyLoaderUrl(url);
      if (!c || !c.id) return;
      var k = c.id.toUpperCase();
      if (byId.has(k)) {
        var rec = byId.get(k);
        rec.method = c.method; rec.host = c.host; rec.loaderUrl = url;
      } else {
        byId.set(k, { id: c.id, method: c.method, host: c.host, loaderUrl: url, frame: frame });
      }
    });

    return Array.from(byId.values());
  }

  var api = { classifyLoaderUrl: classifyLoaderUrl, buildRecords: buildRecords };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;      // node
  } else {
    root.GTMClassify = api;    // Browser (MAIN-World global)
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
