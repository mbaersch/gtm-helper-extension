const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

async function generateStoreScreenshots() {
  const extensionPath = path.resolve(__dirname, '..');
  const userDataDir = path.resolve(__dirname, '..', 'tmp-user-data-store');
  const webstoreDir = path.resolve(__dirname, '..', 'webstore');

  if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir);

  const browserContext = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });

  const page = await browserContext.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  // Get extension ID
  let [background] = browserContext.serviceWorkers();
  if (!background) background = await browserContext.waitForEvent('serviceworker');
  const extensionId = background.url().split('/')[2];
  const popupUrl = `chrome-extension://${extensionId}/popup.html`;

  const scenarios = [
    { 
      name: '1-main', 
      setup: async (p) => {
        await p.goto('https://www.example.com');
        await p.evaluate(() => localStorage.clear());
      }
    },
    { 
      name: '2-cmp-detected', 
      setup: async (p) => {
        await p.goto('https://www.google.com'); // Trigger some default stuff
        // Mock CookieConsent cookie
        await browserContext.addCookies([{ name: 'CookieConsent', value: '-1', domain: '.google.com', path: '/' }]);
      }
    },
    {
      name: '3-gtm-detected',
      setup: async (p) => {
        await p.goto('https://tagmanager.google.com');
        await p.evaluate(() => {
          localStorage.setItem('igtm_checkup', 'https://www.analytrix.de/gtm-checkup-helper.html?id=GTM-XXXXXX');
        });
      }
    },
    {
      name: '4-tags-detected',
      setup: async (p) => {
        await p.goto('https://www.example.com');
      },
      // Zeigt die neue Sektion "Erkannte Google-Tags & Container" mit Beispiel-Funden (Mock).
      afterOpen: async (p) => {
        await p.evaluate(() => {
          window.gtmDetectRecords = [
            { id: 'GTM-XXXX123', method: 'standard', host: 'www.googletagmanager.com', frame: 'top' },
            { id: 'G-ABCD1234', method: 'first-party', host: 'sst.example.com', frame: 'top' },
            { id: 'AW-98765432', method: 'standard', host: 'www.googletagmanager.com', frame: 'top' }
          ];
          window.paintGtmDetections();
        });
      }
    }
  ];

  for (const s of scenarios) {
    console.log(`Generating store screenshot: ${s.name}...`);
    await s.setup(page);
    await page.goto(popupUrl);
    
    // Popup als zentriertes Panel voller Höhe: oben ausgerichtet, scrollt intern
    // statt überzulaufen (verhindert das Abschneiden von Header/Footer bei langem Popup).
    await page.addStyleTag({ content: `
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 1280px !important;
        height: 800px !important;
        overflow: hidden !important;
        background: linear-gradient(135deg, #1a1a1a 0%, #000 100%) !important;
      }
      .container {
        position: fixed !important;
        top: 0 !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        width: 440px !important;
        height: 800px !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        background: #111 !important;
        border-left: 1px solid #C44E00 !important;
        border-right: 1px solid #C44E00 !important;
        box-shadow: 0 0 100px rgba(0,0,0,0.9) !important;
        box-sizing: border-box !important;
      }
      ::-webkit-scrollbar { display: none; }
    `});

    await page.waitForTimeout(500);
    // Optionaler Hook nach dem Öffnen (z.B. Mock-Funde in die Erkennungs-Sektion injizieren)
    if (s.afterOpen) { await s.afterOpen(page); await page.waitForTimeout(200); }
    // Store-Screenshots müssen exakt 1280x800 sein -> per clip erzwingen.
    const filename = `insertgtm-2026-${s.name.split('-')[0]}.png`;
    await page.screenshot({ path: path.join(webstoreDir, filename), clip: { x: 0, y: 0, width: 1280, height: 800 } });
  }

  // Generate NEW ICON 128x128
  console.log('Generating new 128x128 icon...');
  await page.setViewportSize({ width: 128, height: 128 });
  await page.setContent(`
    <div style="
      width: 128px; 
      height: 128px; 
      background: #111; 
      display: flex; 
      flex-direction: column;
      justify-content: center; 
      align-items: center; 
      font-family: 'Segoe UI', system-ui, sans-serif;
      border: 4px solid #C44E00;
      box-sizing: border-box;
      color: #fff;
    ">
      <div style="font-size: 40px; font-weight: bold; color: #C44E00; line-height: 0.9;">GTM</div>
      <div style="font-size: 24px; font-weight: bold; color: #005141; margin-top: -5px;">& CMP</div>
      <div style="font-size: 14px; letter-spacing: 2px; color: #aaa; margin-top: 2px;">HELPER</div>
    </div>
  `);
  await page.screenshot({ path: path.join(webstoreDir, 'injectGTM_big_v3.png'), omitBackground: true });
  await page.screenshot({ path: path.join(webstoreDir, 'injectGTM_128_webstore.png'), omitBackground: true });

  console.log('✅ Webstore assets generated in /images');
  await browserContext.close();
}

generateStoreScreenshots().catch(console.error);
