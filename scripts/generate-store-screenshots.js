const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

// Chrome-Web-Store-Screenshots müssen exakt 1280x800 sein. Aufbau: eine echte Seite
// als Vollbild-Hintergrund (statischer Screenshot in images/), darüber das Popup als
// rechts angedocktes Panel voller Höhe (scrollt intern) — wie ein reales Extension-Popup.
const VIEW_W = 1280;
const VIEW_H = 800;
const PANEL_W = 440;
const imagesDir = path.resolve(__dirname, '..', 'images');

const bgCache = {};
function staticBg(file) {
  if (!bgCache[file]) {
    bgCache[file] = 'data:image/png;base64,' +
      fs.readFileSync(path.join(imagesDir, file)).toString('base64');
  }
  return bgCache[file];
}

function storeCss(bgDataUri) {
  return `
    html, body {
      margin: 0 !important; padding: 0 !important;
      width: ${VIEW_W}px !important; height: ${VIEW_H}px !important;
      overflow: hidden !important;
    }
    body {
      background-image: url("${bgDataUri}") !important;
      background-size: cover !important;
      background-position: left top !important;
      background-repeat: no-repeat !important;
    }
    .container {
      position: fixed !important;
      top: 0 !important; right: 0 !important;
      width: ${PANEL_W}px !important; height: ${VIEW_H}px !important;
      overflow-y: auto !important; overflow-x: hidden !important;
      background: #111 !important;
      border-left: 2px solid #C44E00 !important;
      box-shadow: -14px 0 60px rgba(0,0,0,0.75) !important;
      box-sizing: border-box !important;
    }
    ::-webkit-scrollbar { display: none; }
  `;
}

// --- Promo Tiles (statisches HTML, in den Marken-Farben) --------------------
const BRACKETS_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" ' +
  'stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/>' +
  '<polyline points="8 6 2 12 8 18"/></svg>';

function promoTileHtml(w, h) {
  const s = h / 280;                 // 440x280 -> s=1, 1400x560 -> s=2
  const isSmall = w < 600;
  const iconPx = (isSmall ? 64 : 116) * s;
  const titlePx = (isSmall ? 30 : 60) * s;
  const tagPx = (isSmall ? 15 : 25) * s;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body{margin:0;padding:0;width:${w}px;height:${h}px;overflow:hidden;
      font-family:'Segoe UI',system-ui,sans-serif;}
    .tile{width:${w}px;height:${h}px;box-sizing:border-box;padding:0 ${52 * s}px;
      display:flex;align-items:center;gap:${44 * s}px;position:relative;
      ${isSmall ? 'flex-direction:column;justify-content:center;text-align:center;gap:' + (18 * s) + 'px;' : ''}
      background:
        radial-gradient(${700 * s}px ${420 * s}px at 12% 8%, rgba(196,78,0,0.30) 0%, rgba(196,78,0,0) 60%),
        radial-gradient(${700 * s}px ${420 * s}px at 92% 105%, rgba(0,150,110,0.24) 0%, rgba(0,150,110,0) 60%),
        linear-gradient(135deg, #16181c 0%, #0a0b0d 100%);}
    .tile::after{content:'';position:absolute;inset:0;
      background-image:linear-gradient(rgba(255,255,255,0.035) 1px,transparent 1px),
        linear-gradient(90deg,rgba(255,255,255,0.035) 1px,transparent 1px);
      background-size:${40 * s}px ${40 * s}px;
      -webkit-mask-image:radial-gradient(ellipse at center,#000 35%,transparent 78%);
      mask-image:radial-gradient(ellipse at center,#000 35%,transparent 78%);pointer-events:none;}
    .icon{flex:0 0 auto;color:#ff6b2c;position:relative;z-index:1;display:flex;}
    .icon svg{width:${iconPx}px;height:${iconPx}px;}
    .text{position:relative;z-index:1;min-width:0;}
    .title{font-size:${titlePx}px;font-weight:800;color:#fff;letter-spacing:-0.5px;line-height:1.05;}
    .title .amp{color:#2dd4bf;}
    .tagline{font-size:${tagPx}px;color:#9aa4b2;margin-top:${12 * s}px;line-height:1.4;
      max-width:${isSmall ? Math.round(w * 0.86) : 760}px;}
  </style></head><body>
    <div class="tile">
      <div class="icon">${BRACKETS_SVG}</div>
      <div class="text">
        <div class="title">GTM <span class="amp">&amp;</span> CMP Helper</div>
        <div class="tagline">Reset consent for 60+ CMPs, inject GTM containers, and detect loaded Google tags &amp; containers.</div>
      </div>
    </div>
  </body></html>`;
}

async function renderPromoTile(page, dir, filename, w, h) {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(promoTileHtml(w, h), { waitUntil: 'load' });
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(dir, filename), clip: { x: 0, y: 0, width: w, height: h } });
  console.log('  wrote', filename);
}

// Mock-Funde für die Erkennungs-Sektion (Beispiel-IDs).
const DETECT_RECORDS = [
  { id: 'GTM-XXXX123', method: 'standard', host: 'www.googletagmanager.com', frame: 'top' },
  { id: 'G-ABCD1234', method: 'first-party', host: 'sst.example.com', frame: 'top' },
  { id: 'AW-98765432', method: 'standard', host: 'www.googletagmanager.com', frame: 'top' }
];

async function generateStoreScreenshots() {
  const extensionPath = path.resolve(__dirname, '..');
  const userDataDir = path.resolve(__dirname, '..', 'tmp-user-data-store');
  const webstoreDir = path.resolve(__dirname, '..', 'webstore');

  // Determinismus: altes Profil (übernommener CMP-State o.ä.) vor dem Lauf entfernen.
  if (fs.existsSync(userDataDir)) fs.rmSync(userDataDir, { recursive: true, force: true });
  if (!fs.existsSync(webstoreDir)) fs.mkdirSync(webstoreDir);

  const browserContext = await chromium.launchPersistentContext(userDataDir, {
    headless: false, // Extensions brauchen einen headed Context
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });

  const page = await browserContext.newPage();
  await page.setViewportSize({ width: VIEW_W, height: VIEW_H });

  let [background] = browserContext.serviceWorkers();
  if (!background) background = await browserContext.waitForEvent('serviceworker');
  const extensionId = background.url().split('/')[2];
  const popupUrl = `chrome-extension://${extensionId}/popup.html`;

  // Zustände werden deterministisch per DOM eingeblendet (kein echter Tab/State nötig).
  const scenarios = [
    { name: 'overview', bg: 'analytrixpage.png' },
    {
      name: 'cmp-reset', bg: 'analytrixpage.png',
      afterOpen: async (p) => p.evaluate(() => {
        const el = document.getElementById('detected_cmp_name');
        if (el) el.innerText = 'CookieBot';
        const box = document.getElementById('show_detected_cmp');
        if (box) box.style.display = 'block';
      })
    },
    {
      name: 'checkup', bg: 'gtmpage.png',
      afterOpen: async (p) => p.evaluate(() => {
        const box = document.getElementById('show_checkup');
        if (box) box.style.display = 'block';
      })
    },
    {
      name: 'tags-detected', bg: 'analytrixpage.png',
      afterOpen: async (p, recs) => p.evaluate((records) => {
        window.gtmDetectRecords = records;
        window.paintGtmDetections();
      }, recs)
    },
  ];

  for (let i = 0; i < scenarios.length; i++) {
    const s = scenarios[i];
    console.log(`Generating store screenshot: ${s.name}...`);
    await page.goto(popupUrl);
    await page.waitForSelector('#hdng');
    await page.addStyleTag({ content: storeCss(staticBg(s.bg)) });
    // Init-Callbacks (identifyCMP/checkURL/renderGtmDetections) abwarten, bevor wir mocken.
    await page.waitForTimeout(600);
    if (s.afterOpen) { await s.afterOpen(page, DETECT_RECORDS); await page.waitForTimeout(250); }
    const filename = `store-${i + 1}-${s.name}.png`;
    await page.screenshot({
      path: path.join(webstoreDir, filename),
      clip: { x: 0, y: 0, width: VIEW_W, height: VIEW_H }
    });
    console.log('  wrote', filename);
  }

  console.log('Generating promo tiles...');
  await renderPromoTile(page, webstoreDir, 'promo-small-440x280.png', 440, 280);
  await renderPromoTile(page, webstoreDir, 'promo-marquee-1400x560.png', 1400, 560);

  console.log('✅ Store-Assets (1280x800 screenshots + promo tiles) in /webstore erzeugt.');
  await browserContext.close();
}

generateStoreScreenshots().catch((e) => { console.error(e); process.exit(1); });
