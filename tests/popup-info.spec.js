/*
 * Die Info-Ansicht im Popup: ersetzt den Inhalt von main, statt sich als
 * Overlay darüberzulegen, und wird über den Zurück-Schalter oder Escape wieder
 * verlassen.
 */
const { test, expect, chromium } = require('playwright/test');
const path = require('path');

test.describe('Info-Ansicht im Popup', () => {
  let context;
  let popup;

  test.beforeAll(async () => {
    // Gegen das Paket testen: IGTM_EXT_PATH auf dist/ setzen (npm run build -- --no-zip).
    const extensionPath = process.env.IGTM_EXT_PATH || path.resolve(__dirname, '..');
    const userDataDir = ''; // leer = frisches Temp-Profil; im Projektordner scheitert Chromes SingletonLock auf Netzfreigaben

    context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`
      ]
    });

    let [background] = context.serviceWorkers();
    if (!background) background = await context.waitForEvent('serviceworker');
    const extensionId = background.url().split('/')[2];

    popup = await context.newPage();
    await popup.setViewportSize({ width: 550, height: 580 });
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await popup.waitForSelector('#info_btn');
    await popup.evaluate(() => setLanguage('de'));
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('geschlossen: der Text ist weg, die Bedienung da', async () => {
    await expect(popup.locator('#info_page')).toBeHidden();
    await expect(popup.locator('#igtm_gtm_code')).toBeVisible();
  });

  test('geöffnet: der Text nimmt den ganzen Bereich ein', async () => {
    await popup.click('#info_btn');

    await expect(popup.locator('#info_page')).toBeVisible();
    await expect(popup.locator('#igtm_gtm_code')).toBeHidden();
    await expect(popup.locator('#gtmui_section')).toBeHidden();

    // Zurück steht oben und unten.
    await expect(popup.locator('#info_back_top')).toBeVisible();
    await expect(popup.locator('#info_close_btn')).toBeVisible();
    await expect(popup.locator('#info_back_top')).toHaveText('← Zurück');
  });

  test('der Text ist auf dem aktuellen Stand', async () => {
    const text = await popup.textContent('#option_hint');
    expect(text).toContain('130');
    expect(text).not.toMatch(/60\+? CMP|über 60/);
    // Jeder Funktionsbereich der Extension kommt vor.
    ['Consent', 'GTM-Container', 'dataLayer', 'Google-Tags', 'GTM-Oberfläche', 'localStorage']
      .forEach((begriff) => expect(text).toContain(begriff));
    expect(await popup.locator('#option_hint h3').count()).toBeGreaterThanOrEqual(5);
  });

  test('Sprachumschaltung wirkt auch hier', async () => {
    await popup.evaluate(() => setLanguage('en'));
    await expect(popup.locator('#info_back_top')).toHaveText('← Back');
    expect(await popup.textContent('#option_hint')).toContain('Reset consent');

    await popup.evaluate(() => setLanguage('de'));
    await expect(popup.locator('#info_back_top')).toHaveText('← Zurück');
  });

  test('Zurück über den Schalter', async () => {
    await popup.click('#info_close_btn');
    await expect(popup.locator('#info_page')).toBeHidden();
    await expect(popup.locator('#igtm_gtm_code')).toBeVisible();
  });

  test('Zurück über Escape', async () => {
    await popup.click('#info_btn');
    await expect(popup.locator('#info_page')).toBeVisible();

    await popup.keyboard.press('Escape');
    await expect(popup.locator('#info_page')).toBeHidden();
    await expect(popup.locator('#igtm_gtm_code')).toBeVisible();
  });
});
