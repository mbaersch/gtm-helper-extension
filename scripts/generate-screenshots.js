const { chromium } = require('@playwright/test');
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// imgopt ist ein global installiertes CLI, bewusst kein Dependency — fehlt es, bleiben
// die Bilder unoptimiert statt den Lauf abzubrechen.
function optimizeImages(dir) {
  const result = spawnSync('imgopt', [dir], { stdio: 'inherit', shell: true });
  if (result.error || result.status !== 0) {
    console.log('⚠️  imgopt nicht ausgeführt — Bilder bleiben unoptimiert.');
  }
}

async function generateScreenshots() {
  const extensionPath = path.resolve(__dirname, '..');
  const userDataDir = path.resolve(__dirname, '..', 'tmp-user-data');
  const screenshotDir = path.resolve(__dirname, '..', 'screenshots');

  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }

  const browserContext = await chromium.launchPersistentContext(userDataDir, {
    headless: false, // Muss headed sein für Extensions
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });

  // Extension ID finden
  let [background] = browserContext.serviceWorkers();
  if (!background) background = await browserContext.waitForEvent('serviceworker');
  const extensionId = background.url().split('/')[2];
  const popupUrl = `chrome-extension://${extensionId}/popup.html`;

  const page = await browserContext.newPage();

  const scenarios = [
    { name: 'dark_de', lang: 'de', theme: 'dark', advanced: false },
    { name: 'dark_en', lang: 'en', theme: 'dark', advanced: false },
    { name: 'light_de', lang: 'de', theme: 'light', advanced: false },
    { name: 'advanced_open', lang: 'de', theme: 'dark', advanced: true },
    { name: 'detection_de', lang: 'de', theme: 'dark', advanced: false, detection: true },
    { name: 'gtmui_de', lang: 'de', theme: 'dark', advanced: false, gtmui: true },
  ];

  for (const scenario of scenarios) {
    console.log(`Generating screenshot: ${scenario.name}...`);
    await page.goto(popupUrl);

    // Einstellungen via evaluate im Popup-Kontext setzen
    await page.evaluate((s) => {
      localStorage.setItem('igtm_lang', s.lang);
      localStorage.setItem('igtm_theme', s.theme);
    }, scenario);
    // Reload über Playwright, sonst kann ein Mock noch vor dem Neuladen laufen und verpuffen.
    await page.reload();

    // Warten bis geladen
    await page.waitForSelector('#hdng');
    
    // Falls Advanced-Einstellungen gezeigt werden sollen
    if (scenario.advanced) {
      await page.click('summary#label_advanced_settings');
      await page.waitForTimeout(300); // Animation abwarten
    }

    // Falls die Tag-Erkennungs-Sektion demonstriert werden soll (Mock-Funde injizieren)
    if (scenario.detection) {
      await page.waitForTimeout(300); // renderGtmDetections-Callback abwarten (setzt sonst auf leer zurück)
      await page.evaluate(() => {
        window.gtmDetectRecords = [
          { id: 'GTM-XXXX123', method: 'standard', host: 'www.googletagmanager.com', frame: 'top' },
          { id: 'G-ABCD1234', method: 'first-party', host: 'sst.example.com', frame: 'top' },
          { id: 'AW-98765432', method: 'standard', host: 'www.googletagmanager.com', frame: 'top' }
        ];
        window.paintGtmDetections();
      });
    }

    // Die GTM-UI-Karte ist nur bedienbar, wenn ein GTM-Tab aktiv ist – hier gibt es
    // keinen, deshalb wird der entsperrte Zustand direkt gezeichnet.
    if (scenario.gtmui) {
      await page.evaluate(() => {
        window.paintGtmUiCard({ enabled: true, features: {} }, true);
        const scroller = document.querySelector('main');
        if (scroller) scroller.scrollTop = scroller.scrollHeight;
      });
      await page.waitForTimeout(250);
    }

    // Screenshot nur vom Container-Div machen (für saubere Ränder)
    const element = await page.$('.container');
    await element.screenshot({ path: path.join(screenshotDir, `popup_${scenario.name}.png`) });
  }

  console.log('Optimiere Bilder...');
  optimizeImages(screenshotDir);

  console.log('✅ Alle Screenshots wurden im Ordner /screenshots gespeichert!');
  await browserContext.close();
}

generateScreenshots().catch(console.error);
