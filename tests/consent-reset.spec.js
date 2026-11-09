/*
 * Consent-Reset: allgemeiner und CMP-spezifischer Reset laufen über dieselbe
 * Routine. Die Seite ist per Route simuliert, der Reset wird aus dem Popup heraus
 * gegen deren Tab ausgelöst (ohne Bestätigung, Reload und window.close).
 */
const { test, expect, chromium } = require('playwright/test');
const path = require('path');

const SITE = 'https://shop.test/';

test.describe('Consent-Reset', () => {
  let context;
  let popup;
  let site;

  test.beforeAll(async () => {
    const extensionPath = process.env.IGTM_EXT_PATH || path.resolve(__dirname, '..');
    const userDataDir = ''; // leer = frisches Temp-Profil; im Projektordner scheitert Chromes SingletonLock auf Netzfreigaben

    context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`
      ]
    });
    const html = body => ({ contentType: 'text/html', body: '<!doctype html>' + body });
    await context.route('https://shop.test/**', route => route.fulfill(html(
      route.request().url().endsWith('/uc')
        ? '<iframe src="https://web.cmp.usercentrics.eu/frame"></iframe><iframe src="https://other.test/frame"></iframe>'
        : '<title>shop</title>')));
    await context.route('https://web.cmp.usercentrics.eu/**', route => route.fulfill(html('uc')));
    await context.route('https://other.test/**', route => route.fulfill(html('other')));

    let [background] = context.serviceWorkers();
    if (!background) background = await context.waitForEvent('serviceworker');
    const extensionId = background.url().split('/')[2];

    site = await context.newPage();
    await site.goto(SITE);
    popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await popup.waitForSelector('#igtm_reset_consent');
  });

  test.afterAll(async () => {
    await context.close();
  });

  async function seed(cookieNames, local) {
    await context.clearCookies();
    await context.addCookies(cookieNames.map(name => ({ name, value: '1', url: SITE })));
    await site.evaluate(entries => {
      localStorage.clear();
      Object.entries(entries).forEach(([k, v]) => localStorage.setItem(k, v));
    }, local);
  }

  async function reset(cmpName) {
    await popup.evaluate(cmp => new Promise(resolve => {
      chrome.tabs.query({ url: 'https://shop.test/*' }, tabs => resetConsent(tabs[0], cmp, resolve));
    }), cmpName || null);
  }

  async function state() {
    const cookies = (await context.cookies(SITE)).map(c => c.name).sort();
    const local = await site.evaluate(() => Object.keys(localStorage).sort());
    return { cookies, local };
  }

  test('Einzel-Reset löscht dynamische Namen (Real Cookie Banner)', async () => {
    await seed(['real_cookie_banner-v:3_blog:1', 'CookieConsent', 'other'], {});
    await reset('Real Cookie Banner');
    expect((await state()).cookies).toEqual(['CookieConsent', 'other']);
  });

  test('Einzel-Reset Consentmanager: Cookies und abgeleitete LS-Schlüssel', async () => {
    await seed(['__cmpcc', '__cmpiuid', 'other'], {
      '__cmpcc_shop.test': 'x', '__cmpcc_expireshop.test': 'x', 'keep': 'x'
    });
    await reset('Consentmanager.net');
    expect(await state()).toEqual({ cookies: ['other'], local: ['keep'] });
  });

  test('Einzel-Reset Piwik PRO: Cookie aus ppms_webstorage und Präfix-Cookies', async () => {
    await seed(['ppms_privacy_abc', 'pp_custom', 'other'], {
      ppms_webstorage: JSON.stringify([{ key: 'pp_custom' }])
    });
    await reset('Piwik PRO');
    expect(await state()).toEqual({ cookies: ['other'], local: [] });
  });

  test('Einzel-Reset lässt fremde CMPs stehen', async () => {
    await seed(['CookieConsent', 'real_cookie_banner-blog:1'], { 'didomi_token': 'x' });
    await reset('Real Cookie Banner');
    expect(await state()).toEqual({ cookies: ['CookieConsent'], local: ['didomi_token'] });
  });

  test('Gesamt-Reset löscht alles Bekannte', async () => {
    await seed(['CookieConsent', 'real_cookie_banner-blog:1', 'concord-allow-state-42', 'other'], {
      'didomi_token': 'x', 'concord-consent-state-42': 'x', 'concord-banner-closed': 'x', 'keep': 'x'
    });
    await reset(null);
    expect(await state()).toEqual({ cookies: ['other'], local: ['keep'] });
  });

  test('Usercentrics: ucData/ucString im Hauptframe, ucData_<id> im UC-Frame', async () => {
    await site.goto(SITE + 'uc');
    const frameOf = host => site.frames().find(f => f.url().startsWith(host));
    await expect.poll(() => !!frameOf('https://web.cmp.usercentrics.eu') && !!frameOf('https://other.test')).toBe(true);
    const ucFrame = frameOf('https://web.cmp.usercentrics.eu');
    const otherFrame = frameOf('https://other.test');
    const frameKeys = f => f.evaluate(() => Object.keys(localStorage).sort());
    const fill = (f, keys) => f.evaluate(k => { localStorage.clear(); k.forEach(x => localStorage.setItem(x, '1')); }, keys);

    for (const cmp of ['UserCentrics', null]) {
      await seed([], { ucData: 'x', ucString: 'x', keep: 'x' });
      await fill(ucFrame, ['ucData_AbC123', 'ucOther']);
      await fill(otherFrame, ['ucData_AbC123']);

      await reset(cmp);

      expect((await state()).local).toEqual(['keep']);
      expect(await frameKeys(ucFrame)).toEqual(['ucOther']);
      expect(await frameKeys(otherFrame)).toEqual(['ucData_AbC123']);
    }
  });
});
