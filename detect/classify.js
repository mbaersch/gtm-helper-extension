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
        var isLoader = decoded.indexOf('/gtm.js') !== -1 || decoded.indexOf('/gtag/js') !== -1;
        return { id: extractIdFromDecoded(decoded), method: 'base64', host: host, kind: isLoader ? 'loader' : 'hit' };
      }
    }

    // 2) echter Loader-Pfad: /gtm.js oder /gtag/js
    if (path.endsWith('/gtm.js') || path.endsWith('/gtag/js')) {
      var id = u.searchParams.get('id');
      if (id && ID_RE.test(id)) {
        return { id: id, method: google ? 'standard' : 'first-party', host: host, kind: 'loader' };
      }
      return null;
    }

    // 3) Custom-Path Collect: Fremd-Host, kein /collect, aber v=2 + gtag-tid
    if (!google && path.indexOf('/collect') === -1) {
      var tid = u.searchParams.get('tid');
      var v = u.searchParams.get('v');
      if (tid && GTAG_TID_RE.test(tid) && v === '2') {
        return { id: tid, method: 'custom-path', host: host, kind: 'hit' };
      }
    }

    return null;
  }

  // Zweistufige Endungen, bei denen "letzte zwei Labels" die falsche Domain liefert
  // (example.co.uk -> co.uk, dann wäre jeder *.co.uk-Host same-site). Gleiche Liste wie im tracking-auditor.
  var SECOND_LEVEL_SUFFIXES = [
    'co.uk', 'org.uk', 'me.uk', 'gov.uk', 'ac.uk', 'ltd.uk', 'plc.uk', 'net.uk',
    'com.au', 'net.au', 'org.au', 'edu.au', 'gov.au', 'id.au',
    'co.nz', 'net.nz', 'org.nz', 'govt.nz',
    'co.za', 'org.za', 'net.za',
    'com.br', 'net.br', 'org.br', 'gov.br',
    'co.jp', 'or.jp', 'ne.jp', 'go.jp',
    'com.tr', 'org.tr', 'net.tr',
    'co.in', 'net.in', 'org.in', 'gov.in',
    'com.mx', 'com.ar', 'com.co', 'com.sg', 'com.hk', 'com.tw', 'com.cn', 'com.ua'
  ];

  function siteDomain(host) {
    var parts = host.split('.');
    var n = (parts.length >= 3 && SECOND_LEVEL_SUFFIXES.indexOf(parts.slice(-2).join('.')) !== -1) ? 3 : 2;
    return parts.slice(-n).join('.');
  }

  // Woher der Loader kommt, relativ zur Seite. www-Seite mit Loader auf der nackten Domain ist
  // nach Browser-Definition same-site, nicht same-origin -- der Pfad bleibt dort trotzdem sichtbar.
  function classifyOrigin(loaderUrl, pageUrl) {
    var u, p;
    try { u = new URL(loaderUrl); p = new URL(pageUrl); } catch (e) { return null; }
    var host = u.hostname;
    if (isGoogleHost(host)) return { origin: 'standard', host: host, path: null };
    // Nur das erste Segment: dahinter hängt Stape kodierte IDs an (/ehlytics/fps/<base64>/...).
    var seg = u.pathname.match(/^\/[^/]+\//);
    var path = seg ? seg[0] : '/';
    if (host === p.hostname) return { origin: 'same-origin', host: host, path: path };
    return { origin: siteDomain(host) === siteDomain(p.hostname) ? 'same-site' : 'cross-site', host: host, path: path };
  }

  function applyLoader(rec, url, method, pageUrl) {
    var o = classifyOrigin(url, pageUrl);
    rec.loaderUrl = url;
    rec.origin = o ? o.origin : null;
    rec.host = o ? o.host : null;
    rec.path = o ? o.path : null;
    rec.via = (method === 'base64' || method === 'custom-path') ? method : null;
  }

  function newRecord(id, frame) {
    return { id: id, origin: null, host: null, path: null, via: null, loaderUrl: null, frame: frame };
  }

  function buildRecords(input) {
    var frame = input.frame || 'top';
    var pageUrl = input.pageUrl || '';
    var byId = new Map();
    // Rang der Quelle: echte Loader-URL 3, tidr.scriptSource 2, Collect-Hit 1. Ein Hit sagt nur,
    // wie gesendet wird -- sonst überschreibt Stapes getunnelter Hit den tatsächlichen Loader.
    var rank = new Map();
    function offer(k, url, method, r) {
      if ((rank.get(k) || 0) >= r) return;
      rank.set(k, r);
      applyLoader(byId.get(k), url, method, pageUrl);
    }

    (input.globalKeys || []).forEach(function (key) {
      if (ID_RE.test(key)) byId.set(key.toUpperCase(), newRecord(key, frame));
    });

    (input.resourceUrls || []).forEach(function (url) {
      var c = classifyLoaderUrl(url);
      if (!c || !c.id) return;
      var k = c.id.toUpperCase();
      if (!byId.has(k)) byId.set(k, newRecord(c.id, frame));
      offer(k, url, c.method, c.kind === 'loader' ? 3 : 1);
    });

    // Loader, deren URL sich nicht als solcher zu erkennen gibt (Stape v2.1 verschleiert per XOR):
    // Google selbst notiert die geladene URL in tidr.scriptSource.
    var sources = input.scriptSources || {};
    byId.forEach(function (rec, k) {
      if (!sources[k]) return;
      var c = classifyLoaderUrl(sources[k]);
      offer(k, sources[k], c ? c.method : null, 2);
    });

    // Destinations eines GTM-Containers (neues Format) oder eines GT-Tags. Die eigene ID
    // steht bei G-Tags selbst in der Liste und wäre als Unterzeile nur ein Duplikat.
    var dests = input.destinations || {};
    byId.forEach(function (rec, k) {
      var list = (dests[k] || []).filter(function (d) {
        return ID_RE.test(d) && d.toUpperCase() !== k;
      });
      if (list.length) rec.destinations = list;
    });

    return Array.from(byId.values());
  }

  // "Same-Site (tom.example.de) · base64" -- Fachbegriffe, in beiden UI-Sprachen gleich.
  // Ohne Loader-URL null: lieber keine Angabe als eine geratene.
  function originLabel(rec) {
    var name = { standard: 'Standard', 'same-origin': 'Same-Origin',
                 'same-site': 'Same-Site', 'cross-site': 'Cross-Site' }[rec.origin];
    if (!name) return null;
    var detail = rec.origin === 'same-origin' ? rec.path
      : rec.host + (rec.path && rec.path !== '/' ? rec.path : '');
    return name + (detail ? ' (' + detail + ')' : '') +
           (rec.via ? ' · ' + (rec.via === 'custom-path' ? 'custom path' : rec.via) : '');
  }

  var api = { classifyLoaderUrl: classifyLoaderUrl, classifyOrigin: classifyOrigin,
              buildRecords: buildRecords, originLabel: originLabel };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;      // node
  } else {
    root.GTMClassify = api;    // Browser (MAIN-World global)
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
