/*
 * Suchbegriff der Listen ueber den Bereichswechsel hinweg.
 *
 * tagmanager.google.com verlangt eine Anmeldung, deshalb wird die Seite
 * abgefangen. Das Geruest bildet beide Filter-Bauarten nach: Die Tag-Liste
 * (Angular 2) reagiert nur auf keyup, Trigger und Variablen (AngularJS) auf
 * input. Beide zeigen das Feld erst mit der Klasse 'enabled' an der Huelle.
 */
const { test, expect, chromium } = require('playwright/test');
const path = require('path');

const BASE = 'https://tagmanager.google.com/#/container/accounts/1/containers/1/workspaces/1';

const PAGE_HTML = `<!DOCTYPE html><html><head><title>GTM</title>
<style>ctui-menu-filter input, ctui-menu-filter-ng input { display: none; }
ctui-menu-filter.enabled input, ctui-menu-filter-ng.enabled input { display: inline; }
/* Im echten GTM traegt das <i> ein Icon. Ohne Ausdehnung verweigert Playwright
   den Klick darauf. */
i.icon { display: inline-block; width: 16px; height: 16px; background: #ccc; }</style>
</head><body>
  <div id="area"></div>
  <script>
    var DATA = ['alpha', 'beta', 'gamma', 'test-eins', 'test-zwei'];

    function huelle(tagName) {
      return '<' + tagName + '><div>' +
        '<input type="text" class="blg-input" aria-label="Filter">' +
        '<i class="icon" role="button" tabindex="0"></i>' +
        '</div></' + tagName + '>';
    }

    function render() {
      var m = /\\/(tags|triggers|variables)(?:[?#]|$)/.exec(location.hash);
      var area = m ? m[1] : null;
      var el = document.getElementById('area');
      if (!area) { el.innerHTML = ''; return; }

      var istTag = area === 'tags';
      var host = istTag
        ? '<gtm-tag-list-table>{INHALT}</gtm-tag-list-table>'
        : '<div data-items="ctrl.' + (area === 'triggers' ? 'triggerList' : 'variableList') + '">{INHALT}</div>';
      var inhalt = '<div class="card-title-bar"><div class="card-actions">' +
        huelle(istTag ? 'ctui-menu-filter-ng' : 'ctui-menu-filter') +
        '</div></div><table><tbody></tbody></table>';

      // Bereichswechsel dauert im echten GTM bis zu 450 ms.
      el.innerHTML = '';
      setTimeout(function () {
        el.innerHTML = host.replace('{INHALT}', inhalt);
        verdrahten(istTag);
        zeichnen('');
      }, 120);
    }

    function verdrahten(istTag) {
      var input = document.querySelector('.blg-input');
      var toggle = document.querySelector('i.icon[role="button"]');
      toggle.addEventListener('click', function () {
        var h = input.closest('ctui-menu-filter, ctui-menu-filter-ng');
        h.classList.toggle('enabled');
        if (!h.classList.contains('enabled')) { input.value = ''; zeichnen(''); }
      });
      input.addEventListener(istTag ? 'keyup' : 'input', function () {
        zeichnen(input.value);
      });
    }

    function zeichnen(filter) {
      var body = document.querySelector('tbody');
      if (!body) return;
      body.innerHTML = DATA
        .filter(function (n) { return !filter || n.indexOf(filter) >= 0; })
        .map(function (n) { return '<tr><td>' + n + '</td></tr>'; })
        .join('');
    }

    window.addEventListener('hashchange', render);
    render();
  <\/script>
</body></html>`;

async function feature(page, flags) {
  await page.evaluate((f) => {
    localStorage.setItem('igtm_gtm_ui', JSON.stringify({ enabled: true, features: f }));
    window.dispatchEvent(new CustomEvent('igtm-gtm-ui-changed'));
  }, flags);
  await page.waitForTimeout(150);
}

async function suchen(page, begriff) {
  await page.click('i.icon[role="button"]');
  await page.fill('.blg-input', begriff);
  await page.dispatchEvent('.blg-input', 'keyup');
  await page.waitForTimeout(200);
}

async function wechsel(page, ziel) {
  await page.evaluate((u) => { location.hash = u; }, ziel);
  await page.waitForTimeout(900);
}

const HIN = '#/container/accounts/1/containers/1/workspaces/1/variables';
const ZURUECK = '#/container/accounts/1/containers/1/workspaces/1/tags';

const zeilen = (page) => page.locator('tbody tr').count();

test.describe('Suchbegriff der Listen', () => {
  let context;
  let page;

  test.beforeAll(async () => {
    const extensionPath = process.env.IGTM_EXT_PATH || path.resolve(__dirname, '..');
    const userDataDir = ''; // leer = frisches Temp-Profil; im Projektordner scheitert Chromes SingletonLock auf Netzfreigaben

    context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`]
    });

    // Ohne dieses Warten sind die Content-Scripts beim ersten goto noch nicht da.
    let [background] = context.serviceWorkers();
    if (!background) background = await context.waitForEvent('serviceworker');

    await context.route('https://tagmanager.google.com/**', (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: PAGE_HTML })
    );

    page = await context.newPage();
    await page.goto(BASE + '/tags');
    await page.waitForTimeout(500);
    await feature(page, { listSearch: true, listSort: false });
  });

  test.afterAll(async () => { await context.close(); });

  // reload() statt goto(): Bei gleichbleibendem Hash laedt der Browser nicht
  // neu, und das Geruest baut nichts auf. Den gemerkten Begriff raeumt der
  // Reload nicht mehr weg — er liegt bewusst im sessionStorage.
  test.beforeEach(async () => {
    await page.goto(BASE + '/tags');
    await page.evaluate(() => sessionStorage.removeItem('igtm_list_search'));
    await page.reload();
    await page.waitForTimeout(500);
  });

  test('Begriff steht nach dem Rueckweg wieder im Feld', async () => {
    await suchen(page, 'test');
    expect(await zeilen(page)).toBe(2);

    await wechsel(page, HIN);
    await wechsel(page, ZURUECK);

    expect(await page.inputValue('.blg-input')).toBe('test');
    expect(await zeilen(page)).toBe(2);
    await expect(page.locator('.blg-input')).toBeVisible();
  });

  test('Begriff ueberlebt ein Neuladen desselben Tabs', async () => {
    await suchen(page, 'test');

    await page.reload();
    await page.waitForTimeout(900);

    expect(await page.inputValue('.blg-input')).toBe('test');
    expect(await zeilen(page)).toBe(2);
    await expect(page.locator('.blg-input')).toBeVisible();
  });

  test('Markierung erscheint und weicht der eigenen Eingabe', async () => {
    await suchen(page, 'test');
    await wechsel(page, HIN);
    await wechsel(page, ZURUECK);

    const feld = page.locator('.blg-input');
    await expect(feld).toHaveClass(/igtm-restored/);
    expect(await feld.getAttribute('title')).toBeTruthy();

    await feld.click();
    await page.keyboard.type('x');
    await page.waitForTimeout(150);

    await expect(feld).not.toHaveClass(/igtm-restored/);
    expect(await feld.getAttribute('title')).toBeNull();
  });

  test('Ein geleerter Begriff kommt nicht zurueck', async () => {
    await suchen(page, 'test');
    await wechsel(page, HIN);
    await wechsel(page, ZURUECK);
    expect(await page.inputValue('.blg-input')).toBe('test');

    // Leeren ueber das Icon — dieser Weg loest kein input-Ereignis aus.
    await page.click('i.icon[role="button"]');
    await page.waitForTimeout(200);

    await wechsel(page, HIN);
    await wechsel(page, ZURUECK);

    expect(await page.inputValue('.blg-input')).toBe('');
    expect(await zeilen(page)).toBe(5);
  });

  test('Ein ausgeklapptes Feld wird nicht angeklickt', async () => {
    await suchen(page, 'test');
    await wechsel(page, HIN);
    await wechsel(page, ZURUECK);

    // Ein zweiter Klick auf den Umschalter wuerde das Feld leeren und
    // zuklappen — beides waere hier sichtbar.
    await expect(page.locator('.blg-input')).toBeVisible();
    expect(await page.inputValue('.blg-input')).toBe('test');
  });

  test('Bei abgeschaltetem listSearch passiert nichts', async () => {
    await suchen(page, 'test');
    await feature(page, { listSearch: false, listSort: false });

    await wechsel(page, HIN);
    await wechsel(page, ZURUECK);

    expect(await page.inputValue('.blg-input')).toBe('');
    expect(await zeilen(page)).toBe(5);

    await feature(page, { listSearch: true, listSort: false });
  });

  test('Wer die Funktion nie geschaltet hat, bekommt einen Hinweis', async () => {
    // Schluessel fehlt ganz — der Zustand jedes Bestandsnutzers.
    await feature(page, { listSort: false });
    await page.reload();
    await page.waitForTimeout(900);

    const title = await page.getAttribute('.blg-input', 'title');
    expect(title).toContain('GTM & CMP Helper');

    await feature(page, { listSearch: true, listSort: false });
  });

  test('Wer sie abgelehnt hat, bekommt keinen', async () => {
    await feature(page, { listSearch: false, listSort: false });
    await page.reload();
    await page.waitForTimeout(900);

    expect(await page.getAttribute('.blg-input', 'title')).toBeNull();

    await feature(page, { listSearch: true, listSort: false });
  });

  test('Ein anderer Container verwirft den Begriff', async () => {
    await suchen(page, 'test');
    await wechsel(page, '#/container/accounts/1/containers/999/workspaces/1/tags');

    expect(await page.inputValue('.blg-input')).toBe('');
    expect(await zeilen(page)).toBe(5);
  });
});
