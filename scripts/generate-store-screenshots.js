const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

async function generateStoreScreenshots() {
  const extensionPath = path.resolve(__dirname, '..');
  const userDataDir = path.resolve(__dirname, '..', 'tmp-user-data-store');
  const imagesDir = path.resolve(__dirname, '..', 'images');

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
    }
  ];

  for (const s of scenarios) {
    console.log(`Generating store screenshot: ${s.name}...`);
    await s.setup(page);
    await page.goto(popupUrl);
    
    // Inject some style to make it look nice in the center of 1280x800
    await page.addStyleTag({ content: `
      body { 
        background: linear-gradient(135deg, #1a1a1a 0%, #000 100%);
        display: flex; 
        justify-content: center; 
        align-items: center; 
        height: 100vh; 
        margin: 0;
        overflow: hidden;
      }
      .container { 
        box-shadow: 0 20px 80px rgba(0,0,0,0.8);
        border: 1px solid #C44E00;
        width: 400px;
        transform: scale(1.2);
        background: #111;
        border-radius: 8px;
      }
      /* Hide scrollbars */
      ::-webkit-scrollbar { display: none; }
    `});

    await page.waitForTimeout(500);
    // Use the specific file names to replace the old ones (converting to PNG/JPG as needed)
    // We'll use 2026 for the new ones
    const filename = `insertgtm-2026-${s.name.split('-')[0]}.png`;
    await page.screenshot({ path: path.join(imagesDir, filename) });
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
  await page.screenshot({ path: path.join(imagesDir, 'injectGTM_big_v3.png'), omitBackground: true });
  await page.screenshot({ path: path.join(imagesDir, 'injectGTM_128.png'), omitBackground: true });

  console.log('✅ Webstore assets generated in /images');
  await browserContext.close();
}

generateStoreScreenshots().catch(console.error);
