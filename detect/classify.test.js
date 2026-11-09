const assert = require('assert');
const { classifyLoaderUrl, classifyOrigin, buildRecords } = require('./classify.js');

// --- classifyLoaderUrl ---
// Standard GTM-Loader
assert.deepStrictEqual(
  classifyLoaderUrl('https://www.googletagmanager.com/gtm.js?id=GTM-ABCDE'),
  { id: 'GTM-ABCDE', method: 'standard', host: 'www.googletagmanager.com', kind: 'loader' }
);
// Standard gtag-Loader
assert.deepStrictEqual(
  classifyLoaderUrl('https://www.googletagmanager.com/gtag/js?id=G-ABC123'),
  { id: 'G-ABC123', method: 'standard', host: 'www.googletagmanager.com', kind: 'loader' }
);
// First-Party / sGTM: gtm.js auf Fremd-Host
assert.deepStrictEqual(
  classifyLoaderUrl('https://sst.example.com/gtm.js?id=GTM-ABCDE'),
  { id: 'GTM-ABCDE', method: 'first-party', host: 'sst.example.com', kind: 'loader' }
);
// Custom-Path Collect: Fremd-Host, kryptischer Pfad, kein /collect, v=2 + tid
assert.deepStrictEqual(
  classifyLoaderUrl('https://metrics.example.com/xyz?v=2&tid=G-ABC123&en=page_view'),
  { id: 'G-ABC123', method: 'custom-path', host: 'metrics.example.com', kind: 'hit' }
);
// base64-Tunnel: Query-Param decodiert zu Google-Loader-Pfad
// atob('L2d0bS5qcz9pZD1HVE0tQUJDREU=') === '/gtm.js?id=GTM-ABCDE'
assert.deepStrictEqual(
  classifyLoaderUrl('https://tunnel.example.com/x?d=L2d0bS5qcz9pZD1HVE0tQUJDREU='),
  { id: 'GTM-ABCDE', method: 'base64', host: 'tunnel.example.com', kind: 'loader' }
);
// base64-getunnelter Hit (kein Loader): '/g/collect?v=2&tid=G-ABC123'
assert.deepStrictEqual(
  classifyLoaderUrl('https://tunnel.example.com/x?d=' + Buffer.from('/g/collect?v=2&tid=G-ABC123').toString('base64')),
  { id: 'G-ABC123', method: 'base64', host: 'tunnel.example.com', kind: 'hit' }
);
// Kein GTM-Bezug -> null
assert.strictEqual(classifyLoaderUrl('https://example.com/app.js'), null);
assert.strictEqual(classifyLoaderUrl('not-a-url'), null);

// --- classifyOrigin ---
const PAGE = 'https://www.example.com/shop/';
assert.deepStrictEqual(classifyOrigin('https://www.googletagmanager.com/gtm.js?id=GTM-A', PAGE),
  { origin: 'standard', host: 'www.googletagmanager.com', path: null });
assert.deepStrictEqual(classifyOrigin('https://www.example.com/metrics/?id=GTM-A', PAGE),
  { origin: 'same-origin', host: 'www.example.com', path: '/metrics/' });
assert.deepStrictEqual(classifyOrigin('https://www.example.com/metrics/gtm.js?id=GTM-A', PAGE),
  { origin: 'same-origin', host: 'www.example.com', path: '/metrics/' });
assert.deepStrictEqual(classifyOrigin('https://tg.example.com/x7f2kq9wnb3d.js?8hz=x', PAGE),
  { origin: 'same-site', host: 'tg.example.com', path: '/' });
assert.deepStrictEqual(classifyOrigin('https://load.abc.stape.io/gtm.js?id=GTM-A', PAGE),
  { origin: 'cross-site', host: 'load.abc.stape.io', path: '/' });
// Nur das erste Pfadsegment zählt (/mtx/fps/<base64>/... -> /mtx/)
assert.strictEqual(classifyOrigin('https://example.com/mtx/fps/aWQ9R1RNLVhZ/3-q7Zt0xa', PAGE).path, '/mtx/');
assert.strictEqual(classifyOrigin('https://www.example.com/metrics/sub/gtm.js?id=GTM-A', PAGE).path, '/metrics/');
// www-Seite, Loader auf der nackten Domain mit eigenem Pfad 
assert.deepStrictEqual(classifyOrigin('https://example.com/mtx/k4ve8wq2pzrd.js?q9xv2m=x', PAGE),
  { origin: 'same-site', host: 'example.com', path: '/mtx/' });
// Zweistufige Endung: andere *.co.uk-Domain ist cross-site, eigene Subdomain same-site
assert.strictEqual(classifyOrigin('https://sst.other.co.uk/gtm.js', 'https://www.shop.co.uk/').origin, 'cross-site');
assert.strictEqual(classifyOrigin('https://sst.shop.co.uk/gtm.js', 'https://www.shop.co.uk/').origin, 'same-site');
assert.strictEqual(classifyOrigin('not-a-url', PAGE), null);

// --- buildRecords ---
// Global-ID ohne jede Loader-URL -> keine Herkunft
assert.deepStrictEqual(
  buildRecords({ globalKeys: ['GTM-ABCDE', 'dataLayer'], resourceUrls: [], frame: 'top', pageUrl: PAGE }),
  [{ id: 'GTM-ABCDE', origin: null, host: null, path: null, via: null, loaderUrl: null, frame: 'top' }]
);
// Global-ID + passende Standard-URL -> angereichert
assert.deepStrictEqual(
  buildRecords({
    globalKeys: ['GTM-ABCDE'],
    resourceUrls: ['https://www.googletagmanager.com/gtm.js?id=GTM-ABCDE'],
    frame: 'top', pageUrl: PAGE
  }),
  [{ id: 'GTM-ABCDE', origin: 'standard', host: 'www.googletagmanager.com', path: null, via: null,
     loaderUrl: 'https://www.googletagmanager.com/gtm.js?id=GTM-ABCDE', frame: 'top' }]
);
// Verschleierter Loader (Stape v2.1): Host kommt aus tidr.scriptSource
assert.deepStrictEqual(
  buildRecords({ globalKeys: ['GTM-TEST01'], resourceUrls: [], frame: 'top', pageUrl: 'https://www.example.net/',
    scriptSources: { 'GTM-TEST01': 'https://tg.example.net/x7f2kq9wnb3d.js?8hz=QWER' } })[0],
  { id: 'GTM-TEST01', origin: 'same-site', host: 'tg.example.net', path: '/', via: null,
    loaderUrl: 'https://tg.example.net/x7f2kq9wnb3d.js?8hz=QWER', frame: 'top' }
);
// Base64-Tunnel bleibt als Ladeweg erkennbar
assert.deepStrictEqual(
  buildRecords({ globalKeys: [], frame: 'top', pageUrl: PAGE,
    resourceUrls: ['https://tunnel.example.com/x?d=L2d0bS5qcz9pZD1HVE0tQUJDREU='] })[0],
  { id: 'GTM-ABCDE', origin: 'same-site', host: 'tunnel.example.com', path: '/', via: 'base64',
    loaderUrl: 'https://tunnel.example.com/x?d=L2d0bS5qcz9pZD1HVE0tQUJDREU=', frame: 'top' }
);
// Echter Loader aus scriptSource schlägt den base64-getunnelten Hit
(function () {
  const hit = 'https://example.com/mtx/k4ve8wq2pzrd?5bd91e2f=' +
    encodeURIComponent(Buffer.from('/g/collect?v=2&tid=G-TEST000004&en=page_view').toString('base64'));
  const loader = 'https://example.com/mtx/fps/aWQ9R1RNLVhZ/3-q7Zt0xb';
  const rec = buildRecords({ globalKeys: ['G-TEST000004'], frame: 'top', pageUrl: PAGE,
    resourceUrls: [hit], scriptSources: { 'G-TEST000004': loader } })[0];
  assert.strictEqual(rec.loaderUrl, loader);
  assert.strictEqual(rec.via, null);
  assert.strictEqual(rec.path, '/mtx/');
  // Ohne scriptSource bleibt der Hit als Notbehelf
  const only = buildRecords({ globalKeys: ['G-TEST000004'], frame: 'top', pageUrl: PAGE, resourceUrls: [hit] })[0];
  assert.strictEqual(only.via, 'base64');
})();
// Ressourcen-URL hat Vorrang vor scriptSource
assert.strictEqual(
  buildRecords({ globalKeys: ['GTM-ABCDE'], frame: 'top', pageUrl: PAGE,
    resourceUrls: ['https://www.googletagmanager.com/gtm.js?id=GTM-ABCDE'],
    scriptSources: { 'GTM-ABCDE': 'https://www.example.com/x.js' } })[0].origin,
  'standard'
);
// Nicht-ID-Keys (dataLayer, pscdl etc.) werden ignoriert
assert.deepStrictEqual(
  buildRecords({ globalKeys: ['dataLayer', 'pscdl'], resourceUrls: [], frame: 'top' }),
  []
);
// Destinations aus google_tag_data.tidr (neues Format)
assert.deepStrictEqual(
  buildRecords({ globalKeys: ['GTM-TEST01'], resourceUrls: [], frame: 'top',
                 destinations: { 'GTM-TEST01': ['G-TEST000001', 'AW-100000001'] } })[0].destinations,
  ['G-TEST000001', 'AW-100000001']
);
// Altes Format: leere Liste am GTM, eigene ID am G-Tag fällt weg, AW hängt am GT-Tag
(function () {
  const recs = buildRecords({ globalKeys: ['GTM-TEST02', 'G-TEST000002', 'GT-TEST0001'], resourceUrls: [], frame: 'top',
    destinations: { 'GTM-TEST02': [], 'G-TEST000002': ['G-TEST000002'], 'GT-TEST0001': ['AW-100000002'] } });
  const by = Object.fromEntries(recs.map(r => [r.id, r]));
  assert.strictEqual(by['GTM-TEST02'].destinations, undefined);
  assert.strictEqual(by['G-TEST000002'].destinations, undefined);
  assert.deepStrictEqual(by['GT-TEST0001'].destinations, ['AW-100000002']);
})();
// Stape tunnelt auch die Hits base64-kodiert. Die G-ID ist nur Destination des
// Containers, kein eigenes Tag -- der getunnelte Hit darf keinen eigenen Eintrag erzeugen.
(function () {
  const hit = 'https://ss.example.org/p3m8vy2hdkqls?9e4c7b10=' +
    encodeURIComponent(Buffer.from('/g/collect?v=2&tid=G-TEST000003&en=page_view').toString('base64'));
  const recs = buildRecords({ globalKeys: ['GTM-TEST03'], resourceUrls: [hit], frame: 'top',
    pageUrl: 'https://www.example.org/',
    destinations: { 'GTM-TEST03': ['G-TEST000003', 'AW-100000003'] } });
  assert.deepStrictEqual(recs.map(r => r.id), ['GTM-TEST03']);
  assert.deepStrictEqual(recs[0].destinations, ['G-TEST000003', 'AW-100000003']);
  // Ohne Container, der die ID als Destination führt, bleibt der Hit ein Hinweis
  const orphan = buildRecords({ globalKeys: [], resourceUrls: [hit], frame: 'top', pageUrl: 'https://www.example.org/' });
  assert.deepStrictEqual(orphan.map(r => [r.id, r.via]), [['G-TEST000003', 'base64']]);
})();

// --- originLabel ---
const { originLabel } = require('./classify.js');
assert.strictEqual(originLabel({ origin: 'standard', host: 'www.googletagmanager.com', path: null, via: null }),
  'Standard (www.googletagmanager.com)');
assert.strictEqual(originLabel({ origin: 'same-origin', host: 'www.example.com', path: '/metrics/', via: null }),
  'Same-Origin (/metrics/)');
assert.strictEqual(originLabel({ origin: 'same-site', host: 'tg.example.net', path: null, via: 'base64' }),
  'Same-Site (tg.example.net) · base64');
assert.strictEqual(originLabel({ origin: 'cross-site', host: 'x.stape.io', path: '/', via: 'custom-path' }),
  'Cross-Site (x.stape.io) · custom path');
assert.strictEqual(originLabel({ origin: 'same-site', host: 'example.com', path: '/mtx/', via: null }),
  'Same-Site (example.com/mtx/)');
assert.strictEqual(originLabel({ origin: null, host: null, path: null, via: null }), null);

console.log('✅ Alle Tests für classify.js bestanden!');
