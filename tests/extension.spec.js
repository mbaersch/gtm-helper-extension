const { test, expect, chromium } = require('@playwright/test');
const path = require('path');

test.describe('GTM Helper E2E Tests', () => {
  let browserContext;
  let extensionId;

  test.beforeAll(async () => {
    const extensionPath = path.resolve(__dirname, '..');
    const userDataDir = path.resolve(__dirname, '..', 'tmp-user-data-test');

    browserContext = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });

    let [background] = browserContext.serviceWorkers();
    if (!background) background = await browserContext.waitForEvent('serviceworker');
    extensionId = background.url().split('/')[2];
  });

  test.afterAll(async () => {
    await browserContext.close();
  });

  test('should detect CookieBot CMP on a page', async () => {
    const page = await browserContext.newPage();
    // Wir gehen auf eine neutrale Seite (z.B. about:blank oder google.de)
    await page.goto('https://www.google.de');
    
    // Simuliere einen CookieBot Cookie
    await browserContext.addCookies([{
      name: 'CookieConsent',
      value: 'test-value',
      domain: '.google.de',
      path: '/'
    }]);

    // Popup öffnen
    const popupPage = await browserContext.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.waitForSelector('#hdng');

    // Prüfen, ob CMP Box sichtbar ist und CookieBot anzeigt
    const cmpBox = popupPage.locator('#show_detected_cmp');
    await expect(cmpBox).toBeVisible();
    const cmpName = await popupPage.textContent('#detected_cmp_name');
    expect(cmpName).toContain('CookieBot');
    
    await page.close();
    await popupPage.close();
  });

  test('should inject GTM script with parameters', async () => {
    const page = await browserContext.newPage();
    await page.goto('https://example.com');

    // Einstellungen im localStorage der Seite setzen (wie die Extension es tut)
    await page.evaluate(() => {
      const settings = {
        igtm_Status: true,
        igtmGtmCode: '<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({\'gtm.start\':new Date().getTime(),event:\'gtm.js\'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!=\'dataLayer\'?\'&l=\'+l:\'\';j.async=true;j.src=\'https://www.googletagmanager.com/gtm.js?id=\'+i+dl;f.parentNode.insertBefore(j,f);})(window,document,\'script\',\'dataLayer\',\'GTM-TEST\');</script>',
        igtmGtmAuth: 'auth123',
        igtmGtmPreview: 'env-1',
        igtmPos: 'head'
      };
      localStorage.setItem('igtm_settings', JSON.stringify(settings));
    });

    // Seite neu laden, damit das Content-Script greift
    await page.reload();

    // Prüfen, ob das Script im Head vorhanden ist und die Parameter enthält
    const scriptSrc = await page.evaluate(() => {
      const script = document.querySelector('script[src*="googletagmanager.com/gtm.js"]');
      return script ? script.src : null;
    });

    expect(scriptSrc).toContain('id=GTM-TEST');
    expect(scriptSrc).toContain('gtm_auth=auth123');
    expect(scriptSrc).toContain('gtm_preview=env-1');
    expect(scriptSrc).toContain('gtm_cookies_win=x');

    await page.close();
  });
});
