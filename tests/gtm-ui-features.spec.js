/*
 * Schaltbare GTM-UI-Funktionen im echten Browser.
 *
 * tagmanager.google.com verlangt eine Anmeldung, deshalb wird die Seite
 * abgefangen und durch ein Geruest ersetzt, das nur die Merkmale enthaelt, an
 * denen gtm-ui.js ansetzt. Die URL bleibt dabei die echte — Content-Scripts und
 * CSS werden also ganz normal injiziert.
 *
 * Das Umschalten aus dem Popup wird nachgestellt, indem in der Seite selbst
 * geschrieben und anschliessend dasselbe Ereignis ausgeloest wird, das
 * popup.js per chrome.scripting ausloest.
 */
const { test, expect, chromium } = require('playwright/test');
const path = require('path');

const GTM_URL = 'https://tagmanager.google.com/#/container/accounts/1/containers/1/workspaces/1';

const PAGE_HTML = `<!DOCTYPE html><html><head><title>GTM</title></head><body>
  <div class="suite-assistant-search-input-container flex">
    <input type="text" class="suite-assistant-search-input suite-input" placeholder="Suchen">
  </div>

  <div class="gtm-container-page-navigation">
    <div class="blg-body-med gtm-container-menu-list">
      <a class="gtm-container-menu-list-item wd-open-overview-button" href="#/container/accounts/1/containers/1/workspaces/1">Übersicht</a>
      <a class="gtm-container-menu-list-item open-tag-list-button" href="#/container/accounts/1/containers/1/workspaces/1/tags">Tags</a>
      <a class="gtm-container-menu-list-item wd-open-trigger-list-button" href="#/container/accounts/1/containers/1/workspaces/1/triggers">Trigger</a>
      <a class="gtm-container-menu-list-item wd-open-variable-list-button selected" href="#/container/accounts/1/containers/1/workspaces/1/variables">Variablen</a>
    </div>
  </div>

  <div data-items="ctrl.variableList">
    <div class="card-title-bar"><div class="card-actions">Suche</div></div>
  </div>

  <div data-items="ctrl.builtInVariables">
    <div class="card-title-bar"><div class="card-actions">Integrierte Variablen</div></div>
    <table class="gtm-table--hide-empty"><tbody><tr><td>Page URL</td></tr></tbody></table>
  </div>

  <gtm-overview-workspace-header>
    <div class="config-destination-card__header workspaces-header" id="ws-clean">
      <div class="workspaces-header__title">
        <div class="blg-caption">Default Workspace</div>
        <div role="heading" aria-level="2" class="blg-subhead"><span>Ausstehende Aenderungen</span></div>
      </div>
      <div class="workspaces-header__right-elements">
        <div class="workspaces-header__count-item"><span class="workspaces-header__count-number">0</span><span class="workspaces-header__count-label">Geaendert</span></div>
        <div class="workspaces-header__count-item"><span class="workspaces-header__count-number">0</span><span class="workspaces-header__count-label">Hinzugefuegt</span></div>
        <div class="workspaces-header__count-item"><span class="workspaces-header__count-number">0</span><span class="workspaces-header__count-label">Geloescht</span></div>
      </div>
    </div>
  </gtm-overview-workspace-header>

  <!-- Vierstellig mit Trennzeichen: parseInt laese davon die 1. -->
  <gtm-overview-workspace-header>
    <div class="config-destination-card__header workspaces-header" id="ws-dirty">
      <div class="workspaces-header__title">
        <div class="blg-caption">Zweiter Workspace</div>
        <div role="heading" aria-level="2" class="blg-subhead"><span>Ausstehende Aenderungen</span></div>
      </div>
      <div class="workspaces-header__right-elements">
        <div class="workspaces-header__count-item"><span class="workspaces-header__count-number">0</span><span class="workspaces-header__count-label">Geaendert</span></div>
        <div class="workspaces-header__count-item"><span class="workspaces-header__count-number">1.234</span><span class="workspaces-header__count-label">Hinzugefuegt</span></div>
        <div class="workspaces-header__count-item"><span class="workspaces-header__count-number">0</span><span class="workspaces-header__count-label">Geloescht</span></div>
      </div>
    </div>
  </gtm-overview-workspace-header>

  <div id="tbl">
    <div class="simple-table-row">
      <div class="simple-table-row__cell simple-table-row__cell--header">Name</div>
      <div class="simple-table-row__cell simple-table-row__cell--header">Wert</div>
    </div>
    <div class="simple-table-row">
      <div class="simple-table-row__cell"><input type="text" class="ctui-text-input" value="b"></div>
      <div class="simple-table-row__cell"><input type="text" class="ctui-text-input" value="2"></div>
    </div>
    <div class="simple-table-row">
      <div class="simple-table-row__cell"><input type="text" class="ctui-text-input" value="a"></div>
      <div class="simple-table-row__cell"><input type="text" class="ctui-text-input" value="1"></div>
    </div>
  </div>
</body></html>`;

// Setzt die Funktionsliste so, wie es popup.js tut, und meldet es den Scripts.
// combos bleibt weg, solange die Kuerzel nicht zur Sache gehoeren — ohne die
// Schluessel gelten Alt+S und Alt+1..3.
async function setFeatures(page, enabled, features, combos) {
  await page.evaluate(({ isEnabled, flags, hotkeys }) => {
    let state = {};
    try {
      state = JSON.parse(localStorage.getItem('igtm_gtm_ui')) || {};
    } catch (e) {
      state = {};
    }
    state.enabled = isEnabled;
    state.features = flags;
    state.searchHotkeyCombo = (hotkeys || {}).searchHotkeyCombo;
    state.sectionHotkeyCombos = (hotkeys || {}).sectionHotkeyCombos;
    localStorage.setItem('igtm_gtm_ui', JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('igtm-gtm-ui-changed'));
  }, { isEnabled: enabled, flags: features, hotkeys: combos });
  // Die Elemente werden im naechsten Frame nachgezogen.
  await page.waitForTimeout(150);
}

const ALL_ON = { nav: true, pin: true, builtIn: true, submitHint: true, chips: true, sort: true, listSort: true, overviewHint: true, searchHotkey: true, sectionHotkeys: true };

test.describe('Schaltbare GTM-UI-Funktionen', () => {
  let context;
  let extensionId;
  let page;

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
    extensionId = background.url().split('/')[2];

    await context.route('https://tagmanager.google.com/**', (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: PAGE_HTML })
    );

    page = await context.newPage();
    await page.goto(GTM_URL);
    await page.waitForTimeout(500);
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('ohne gespeicherten Stand ist alles da', async () => {
    await page.evaluate(() => localStorage.removeItem('igtm_gtm_ui'));
    await page.reload();
    await page.waitForTimeout(500);

    await expect(page.locator('.igtm-pin-bar')).toHaveCount(1);
    await expect(page.locator('#igtm-builtin-switch')).toHaveCount(1);
    await expect(page.locator('.igtm-sort-row')).toHaveCount(1);

    // Nur der Kopf mit ausstehenden Aenderungen, und der trotz Trennzeichen.
    await expect(page.locator('#ws-dirty')).toHaveClass(/igtm-ws-changed/);
    await expect(page.locator('#ws-clean')).not.toHaveClass(/igtm-ws-changed/);

    const nav = await page.evaluate(() =>
      getComputedStyle(document.querySelector('.gtm-container-page-navigation')).position
    );
    expect(nav).toBe('sticky');

    const classes = await page.evaluate(() => document.documentElement.className);
    expect(classes).not.toContain('igtm-off-');
  });

  test('einzelne Funktion aus: nur diese verschwindet', async () => {
    await setFeatures(page, true, Object.assign({}, ALL_ON, { pin: false }));

    await expect(page.locator('.igtm-pin-bar')).toHaveCount(0);
    await expect(page.locator('#igtm-builtin-switch')).toHaveCount(1);
    await expect(page.locator('.igtm-sort-row')).toHaveCount(1);

    const nav = await page.evaluate(() =>
      getComputedStyle(document.querySelector('.gtm-container-page-navigation')).position
    );
    expect(nav).toBe('sticky');
  });

  test('CSS-Funktion aus: Bereichsnavigation klebt nicht mehr', async () => {
    await setFeatures(page, true, Object.assign({}, ALL_ON, { nav: false }));

    const nav = await page.evaluate(() =>
      getComputedStyle(document.querySelector('.gtm-container-page-navigation')).position
    );
    expect(nav).toBe('static');
    await expect(page.locator('.igtm-pin-bar')).toHaveCount(1);
  });

  test('Hauptschalter aus: nichts von uns bleibt im DOM', async () => {
    await setFeatures(page, false, ALL_ON);

    await expect(page.locator('.igtm-pin-bar')).toHaveCount(0);
    await expect(page.locator('#igtm-builtin-switch')).toHaveCount(0);
    await expect(page.locator('.igtm-sort-row')).toHaveCount(0);
    await expect(page.locator('tfoot')).toHaveCount(0);
    await expect(page.locator('.igtm-ws-changed')).toHaveCount(0);

    const nav = await page.evaluate(() =>
      getComputedStyle(document.querySelector('.gtm-container-page-navigation')).position
    );
    expect(nav).toBe('static');
  });

  test('wieder eingeschaltet: alles kommt zurueck, nichts doppelt', async () => {
    await setFeatures(page, true, ALL_ON);

    await expect(page.locator('.igtm-pin-bar')).toHaveCount(1);
    await expect(page.locator('#igtm-builtin-switch')).toHaveCount(1);
    await expect(page.locator('.igtm-sort-row')).toHaveCount(1);

    const nav = await page.evaluate(() =>
      getComputedStyle(document.querySelector('.gtm-container-page-navigation')).position
    );
    expect(nav).toBe('sticky');
  });

  test('Uebersichtsseite: eigener Schalter, nachgereichte Koepfe werden erfasst', async () => {
    await setFeatures(page, true, Object.assign({}, ALL_ON, { overviewHint: false }));
    await expect(page.locator('.igtm-ws-changed')).toHaveCount(0);
    await expect(page.locator('.igtm-pin-bar')).toHaveCount(1);   // uebrige unberuehrt

    await setFeatures(page, true, ALL_ON);
    await expect(page.locator('#ws-dirty')).toHaveClass(/igtm-ws-changed/);

    const bg = await page.evaluate(() =>
      getComputedStyle(document.getElementById('ws-dirty')).backgroundColor
    );
    expect(bg).toBe('rgb(243, 231, 209)');

    // Beim Containerwechsel baut Angular die Karte neu auf. Das ist eine
    // childList-Mutation — genau die, auf die der Observer hoert.
    await page.evaluate(() => {
      const clone = document.getElementById('ws-dirty')
        .closest('gtm-overview-workspace-header').cloneNode(true);
      const header = clone.querySelector('.workspaces-header');
      header.id = 'ws-late';
      header.classList.remove('igtm-ws-changed');
      document.body.appendChild(clone);
    });
    await page.waitForTimeout(150);
    await expect(page.locator('#ws-late')).toHaveClass(/igtm-ws-changed/);

    await page.evaluate(() =>
      document.getElementById('ws-late').closest('gtm-overview-workspace-header').remove()
    );
  });

  test('Alt+S fokussiert die Workspace-Suche und markiert ihren Inhalt', async () => {
    await setFeatures(page, true, ALL_ON);

    await expect(page.locator('input.suite-assistant-search-input'))
      .toHaveAttribute('title', /Alt\+S/);

    await page.evaluate(() => {
      const feld = document.querySelector('input.suite-assistant-search-input');
      feld.value = 'vorher';
      document.activeElement.blur();
    });
    await page.keyboard.press('Alt+s');

    const stand = await page.evaluate(() => ({
      aktiv: document.activeElement.className,
      markiert: document.activeElement.selectionStart === 0 &&
                document.activeElement.selectionEnd === 'vorher'.length
    }));
    expect(stand.aktiv).toContain('suite-assistant-search-input');
    expect(stand.markiert).toBe(true);
  });

  test('verdecktes Feld: Alt+S laesst die Taste durch', async () => {
    await setFeatures(page, true, ALL_ON);
    await page.evaluate(() => {
      const deckel = document.createElement('div');
      deckel.id = 'igtm-test-deckel';
      deckel.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#000';
      document.body.appendChild(deckel);
      document.activeElement.blur();
    });

    await page.keyboard.press('Alt+s');
    expect(await page.evaluate(() => document.activeElement.tagName)).toBe('BODY');

    await page.evaluate(() => document.getElementById('igtm-test-deckel').remove());
  });

  test('searchHotkey aus: kein Hinweis, kein Fokus', async () => {
    await setFeatures(page, true, Object.assign({}, ALL_ON, { searchHotkey: false }));

    expect(await page.evaluate(() =>
      document.querySelector('input.suite-assistant-search-input').getAttribute('title')
    )).toBeNull();

    await page.evaluate(() => document.activeElement.blur());
    await page.keyboard.press('Alt+s');
    expect(await page.evaluate(() => document.activeElement.tagName)).toBe('BODY');
  });

  test('eigenes Kuerzel: Strg+Alt+K greift, Alt+S nicht mehr', async () => {
    await setFeatures(page, true, ALL_ON, {
      searchHotkeyCombo: { alt: true, ctrl: true, shift: false, meta: false, code: 'KeyK', key: 'k' }
    });

    await expect(page.locator('input.suite-assistant-search-input'))
      .toHaveAttribute('title', /(Strg|Ctrl)\+Alt\+K/);

    await page.evaluate(() => document.activeElement.blur());
    await page.keyboard.press('Alt+s');
    expect(await page.evaluate(() => document.activeElement.tagName)).toBe('BODY');

    await page.keyboard.press('Control+Alt+k');
    expect(await page.evaluate(() => document.activeElement.className))
      .toContain('suite-assistant-search-input');

    // Ohne den Schluessel gilt wieder Alt+S — die folgenden Tests erwarten das.
    await setFeatures(page, true, ALL_ON);
  });

  test('Alt+1 bis Alt+3 wechseln den Bereich', async () => {
    await setFeatures(page, true, ALL_ON);

    await expect(page.locator('a.open-tag-list-button')).toHaveAttribute('title', /Alt\+1/);
    await expect(page.locator('a.wd-open-trigger-list-button')).toHaveAttribute('title', /Alt\+2/);
    await expect(page.locator('a.wd-open-variable-list-button')).toHaveAttribute('title', /Alt\+3/);
    // Die Uebersicht bleibt aussen vor.
    expect(await page.evaluate(() =>
      document.querySelector('a.wd-open-overview-button').getAttribute('title')
    )).toBeNull();

    await page.evaluate(() => document.activeElement.blur());
    await page.keyboard.press('Alt+1');
    expect(await page.evaluate(() => location.hash)).toContain('/tags');

    await page.keyboard.press('Alt+2');
    expect(await page.evaluate(() => location.hash)).toContain('/triggers');

    await page.keyboard.press('Alt+3');
    expect(await page.evaluate(() => location.hash)).toContain('/variables');

    await page.evaluate(() => { location.hash = '#/container/accounts/1/containers/1/workspaces/1'; });
  });

  test('verdecktes Menue: Alt+1 laesst die Taste durch', async () => {
    await setFeatures(page, true, ALL_ON);
    await page.evaluate(() => {
      const deckel = document.createElement('div');
      deckel.id = 'igtm-test-deckel';
      deckel.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#000';
      document.body.appendChild(deckel);
      document.activeElement.blur();
    });

    await page.keyboard.press('Alt+1');
    expect(await page.evaluate(() => location.hash)).not.toContain('/tags');

    await page.evaluate(() => document.getElementById('igtm-test-deckel').remove());
  });

  test('eigene Bereichskuerzel: jeder Bereich fuer sich', async () => {
    // Erster Bereich auf Strg+K, zweiter auf Alt+K — dieselbe Taste, andere
    // Modifier. Der dritte bleibt leer und faellt auf Alt+3 zurueck.
    await setFeatures(page, true, ALL_ON, {
      sectionHotkeyCombos: [
        { alt: false, ctrl: true, shift: false, meta: false, code: 'KeyK', key: 'k' },
        { alt: true, ctrl: false, shift: false, meta: false, code: 'KeyK', key: 'k' }
      ]
    });

    await expect(page.locator('a.open-tag-list-button'))
      .toHaveAttribute('title', /(Strg|Ctrl)\+K/);
    await expect(page.locator('a.wd-open-trigger-list-button'))
      .toHaveAttribute('title', /Alt\+K/);
    await expect(page.locator('a.wd-open-variable-list-button'))
      .toHaveAttribute('title', /Alt\+3/);

    await page.evaluate(() => document.activeElement.blur());
    await page.keyboard.press('Alt+1');
    expect(await page.evaluate(() => location.hash)).not.toContain('/tags');

    await page.keyboard.press('Control+k');
    expect(await page.evaluate(() => location.hash)).toContain('/tags');

    await page.keyboard.press('Alt+k');
    expect(await page.evaluate(() => location.hash)).toContain('/triggers');

    await page.keyboard.press('Alt+3');
    expect(await page.evaluate(() => location.hash)).toContain('/variables');

    await page.evaluate(() => { location.hash = '#/container/accounts/1/containers/1/workspaces/1'; });
    await setFeatures(page, true, ALL_ON);
  });

  test('sectionHotkeys aus: kein Hinweis, kein Wechsel', async () => {
    await setFeatures(page, true, Object.assign({}, ALL_ON, { sectionHotkeys: false }));

    expect(await page.evaluate(() =>
      document.querySelector('a.open-tag-list-button').getAttribute('title')
    )).toBeNull();

    await page.evaluate(() => document.activeElement.blur());
    await page.keyboard.press('Alt+1');
    expect(await page.evaluate(() => location.hash)).not.toContain('/tags');
  });

  test('der Pin behaelt seinen eigenen Zustand ueber das Abschalten hinweg', async () => {
    await page.locator('.igtm-pin-bar').click();
    expect(await page.evaluate(() =>
      document.documentElement.classList.contains('igtm-sticky-bar')
    )).toBe(true);

    await setFeatures(page, true, Object.assign({}, ALL_ON, { pin: false }));
    expect(await page.evaluate(() =>
      document.documentElement.classList.contains('igtm-sticky-bar')
    )).toBe(false);

    await setFeatures(page, true, ALL_ON);
    expect(await page.evaluate(() =>
      document.documentElement.classList.contains('igtm-sticky-bar')
    )).toBe(true);

    // Fuer die folgenden Tests wieder zurueckstellen.
    await page.locator('.igtm-pin-bar').click();
  });

  test('Popup ausserhalb des Tag Managers: Kaestchen aus, Hinweis an', async () => {
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await popup.waitForSelector('#gtmui_section');
    await popup.waitForTimeout(300);

    await expect(popup.locator('#gtmui_note')).toBeVisible();
    await expect(popup.locator('#gtmui_features')).toBeHidden();
    await expect(popup.locator('#igtm_gtmui_active')).toBeHidden();
    await expect(popup.locator('#label_gtmui_hint')).toBeVisible();

    await popup.close();
  });

  /*
   * Im Popup-Fenster von Chrome ist der GTM-Tab der aktive; als Playwright-Tab
   * geoeffnet ist es das Popup selbst. Der Weg ueber chrome.tabs.query wird
   * deshalb hier direkt gefahren, statt die Kaestchen anzuklicken — geprueft
   * wird genau das, was ein Klick ausloest.
   */
  test('Popup schreibt per chrome.scripting in den GTM-Tab', async () => {
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await popup.waitForSelector('#gtmui_section');

    const found = await popup.evaluate(() => new Promise((resolve) => {
      chrome.tabs.query({ url: 'https://tagmanager.google.com/*' }, (tabs) => resolve(tabs.length));
    }));
    expect(found).toBe(1);

    await popup.evaluate(() => applyGtmUiState(true, {
      nav: true, pin: false, builtIn: true, submitHint: true, chips: true, sort: true
    }));
    await popup.waitForTimeout(400);

    // Zurueckgelesen wird ueber denselben Weg, den das Popup beim Oeffnen geht.
    const state = await popup.evaluate(() => new Promise((resolve) => {
      chrome.tabs.query({ url: 'https://tagmanager.google.com/*' }, (tabs) => {
        readGtmUiState(tabs[0].id, resolve);
      });
    }));
    expect(state.features.pin).toBe(false);
    expect(state.features.sort).toBe(true);

    await popup.close();

    // Und in der Seite ist es angekommen, ohne dass sie neu geladen wurde.
    await page.bringToFront();
    await page.waitForTimeout(200);
    await expect(page.locator('.igtm-pin-bar')).toHaveCount(0);
    await expect(page.locator('.igtm-sort-row')).toHaveCount(1);
  });

  test('Popup nimmt ein eigenes Kuerzel auf und lehnt Kombinationen ohne Alt/Strg ab', async () => {
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await popup.waitForSelector('#gtmui_section');

    // Als Playwright-Tab ist das Popup selbst der aktive Tab, die Karte bleibt
    // deshalb gesperrt. Angemeldet wird von Hand, was initGtmUiCard() sonst tut.
    await popup.evaluate(() => {
      setLanguage('de');
      paintGtmUiCard({ enabled: true, features: {} }, true);
      initHotkeyFields();
    });

    const field = popup.locator('#igtm_hotkey_field');
    await expect(field).toHaveValue('Alt+S');

    await field.click();
    await expect(field).toHaveValue('Taste drücken…');

    await popup.keyboard.press('Shift+K');
    await expect(popup.locator('#igtm_hotkey_hint')).toBeVisible();
    await expect(field).toHaveValue('Taste drücken…');

    await popup.keyboard.press('Control+Alt+k');
    await expect(field).toHaveValue('Strg+Alt+K');
    await expect(popup.locator('#igtm_hotkey_hint')).toBeHidden();

    const gespeichert = await popup.evaluate(() => new Promise((resolve) => {
      chrome.tabs.query({ url: 'https://tagmanager.google.com/*' }, (tabs) => {
        readGtmUiState(tabs[0].id, resolve);
      });
    }));
    expect(gespeichert.searchHotkeyCombo).toMatchObject({ alt: true, ctrl: true, code: 'KeyK' });

    await popup.locator('#igtm_hotkey_reset').click();
    await expect(field).toHaveValue('Alt+S');

    // Zeile und Hinweis gehoeren zum Schalter darueber.
    await popup.evaluate(() => paintGtmUiCard({ enabled: true, features: { searchHotkey: false } }, true));
    await expect(popup.locator('#igtm_hotkey_row')).toBeHidden();

    await popup.close();
    await setFeatures(page, true, ALL_ON);
  });

  test('Popup nimmt die drei Bereichskuerzel einzeln auf', async () => {
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await popup.waitForSelector('#gtmui_section');
    await popup.evaluate(() => {
      setLanguage('de');
      paintGtmUiCard({ enabled: true, features: {} }, true);
      initHotkeyFields();
    });

    await expect(popup.locator('#igtm_section_field_0')).toHaveValue('Alt+1');
    await expect(popup.locator('#igtm_section_field_1')).toHaveValue('Alt+2');
    await expect(popup.locator('#igtm_section_field_2')).toHaveValue('Alt+3');

    await popup.locator('#igtm_section_field_0').click();
    await popup.keyboard.press('k');
    await expect(popup.locator('#igtm_section_hint')).toBeVisible();

    await popup.keyboard.press('Control+k');
    await expect(popup.locator('#igtm_section_field_0')).toHaveValue('Strg+K');

    // Nur die eine Zeile ändert sich, die anderen bleiben stehen.
    await expect(popup.locator('#igtm_section_field_1')).toHaveValue('Alt+2');

    await popup.locator('#igtm_section_field_1').click();
    await popup.keyboard.press('Alt+k');
    await expect(popup.locator('#igtm_section_field_1')).toHaveValue('Alt+K');

    const gespeichert = await popup.evaluate(() => new Promise((resolve) => {
      chrome.tabs.query({ url: 'https://tagmanager.google.com/*' }, (tabs) => {
        readGtmUiState(tabs[0].id, resolve);
      });
    }));
    expect(gespeichert.sectionHotkeyCombos[0]).toMatchObject({ ctrl: true, alt: false, code: 'KeyK' });
    expect(gespeichert.sectionHotkeyCombos[1]).toMatchObject({ alt: true, ctrl: false, code: 'KeyK' });
    expect(gespeichert.sectionHotkeyCombos[2]).toMatchObject({ alt: true, code: 'Digit3' });
    // Das Kuerzel der Suche bleibt davon unberuehrt.
    expect(gespeichert.searchHotkeyCombo).toMatchObject({ alt: true, ctrl: false, code: 'KeyS' });

    await popup.locator('#igtm_section_reset_0').click();
    await expect(popup.locator('#igtm_section_field_0')).toHaveValue('Alt+1');

    await popup.evaluate(() => paintGtmUiCard({ enabled: true, features: { sectionHotkeys: false } }, true));
    await expect(popup.locator('#igtm_section_row_0')).toBeHidden();
    await expect(popup.locator('#igtm_section_row_2')).toBeHidden();

    await popup.close();
    await setFeatures(page, true, ALL_ON);
  });
});
