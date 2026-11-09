/*
 * "Zeile darunter einfuegen" in Parametertabellen.
 *
 * Wie in gtm-ui-features.spec.js wird tagmanager.google.com abgefangen und durch
 * ein Geruest ersetzt. Der Add-Button haengt hier per Skript synchron eine leere
 * Zeile an – so verhaelt sich AngularJS am lebenden Container ebenfalls (am
 * echten Container gemessen: Zeilenzahl direkt nach .click() bereits erhoeht).
 */
const { test, expect, chromium } = require('playwright/test');
const path = require('path');

const GTM_URL = 'https://tagmanager.google.com/#/container/accounts/1/containers/1/workspaces/1';

// Eine Zelle so, wie GTM sie rendert – mit dem Container, an dem die
// Variablen-Chips haengen, und dem nativen Knopf zur Auswahlliste.
function cell(value) {
  return `<div class="simple-table-row__cell">
    <div class="gtm-text-input-inner">
      <input type="text" class="ctui-text-input" value="${value}">
      <button class="gtm-text-input__variable-btn" type="button">+</button>
    </div>
  </div>`;
}

function row(a, b) {
  return `<div class="simple-table-row">${cell(a)}${cell(b)}
    <div class="simple-table-row__cell simple-table-row__cell--remove-icon-cell">x</div>
  </div>`;
}

// Metadata-Tabellen kennen keine Variablen: anderes Feld (gtm-text-input statt
// ctui-text-input) und kein Knopf zur Auswahlliste.
function metaRow(a, b) {
  const metaCell = (v) => `<div class="simple-table-row__cell">
    <div class="gtm-text-input-inner">
      <input type="text" class="gtm-text-input" value="${v}">
    </div>
  </div>`;
  return `<div class="simple-table-row">${metaCell(a)}${metaCell(b)}
    <div class="simple-table-row__cell simple-table-row__cell--remove-icon-cell">x</div>
  </div>`;
}

const HEADER = `<div class="simple-table-row">
  <div class="simple-table-row__cell simple-table-row__cell--header">Eingabe</div>
  <div class="simple-table-row__cell simple-table-row__cell--header">Ausgabe</div>
  <div class="simple-table-row__cell simple-table-row__cell--header simple-table-row__cell--remove-icon-cell"></div>
</div>`;

// Jede Tabelle in einem eigenen .blg-form-input mit eigenem Add-Button – sonst
// findet die Suche aufwaerts mehrere und bietet zu Recht nichts an. GTM benennt
// den Knopf je nach Tabellentyp unterschiedlich, deshalb ist die Klasse hier
// einstellbar.
// btnClass/ngClick bilden die drei im GTM beobachteten Varianten ab: Klasse mit
// "add-row", nur der Angular-Handler, oder beides.
function block(id, rows, btnClass, ngClick) {
  const cls = btnClass === undefined ? 'wd-vt-simple-table-add-row' : btnClass;
  const handler = ngClick === false ? '' : ' data-ng-click="ctrl.addRow()"';
  return `<div class="blg-form-input">
    <div id="${id}">${HEADER}${rows}</div>
    <div class="gtm-flex">
      <button class="btn ${cls}" type="button"${handler} data-target="${id}">+ Zeile hinzufügen</button>
    </div>
  </div>`;
}

const PAGE_HTML = `<!DOCTYPE html><html><head><title>GTM</title></head><body>
  ${block('haupt', row('a', '1') + row('b', '2') + row('c', '3') + row('d', '4'))}
  ${block('einzeilig', row('nur', 'eine'))}
  ${block('mitvariable', row('{{Page URL}}', 'x') + row('y', 'z'))}
  ${block('metadata', row('m1', 'v1') + row('m2', 'v2'), 'wd-add-row-button', false)}
  ${block('settings', row('s1', 'w1') + row('s2', 'w2'), 'btn--create vt-st-add')}
  ${block('metafelder', metaRow('k1', 'x1') + metaRow('k2', 'x2'), 'wd-add-row-button')}

  <div class="blg-form-input">
    <div id="ohnebutton">${HEADER}${row('k', 'l') + row('m', 'n')}</div>
  </div>

  <div class="blg-form-input">
    <div id="mitselect">
      ${HEADER}
      <div class="simple-table-row">
        <div class="simple-table-row__cell"><div class="gtm-text-input-inner"><input type="text" class="ctui-text-input" value="p"></div></div>
        <div class="simple-table-row__cell"><select><option>q</option></select></div>
      </div>
      ${row('r', 's')}
    </div>
    <button class="wd-vt-simple-table-add-row" type="button" data-target="mitselect">+ Zeile hinzufügen</button>
  </div>

  <script>
    // Stellt ctrl.addRow() nach: leere Zeile synchron ans Ende der Datenzeilen,
    // aber vor unsere Sortierzeile.
    var sel = 'button[data-ng-click*="addRow"], button[class*="add-row"]';
    document.querySelectorAll(sel).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var host = document.getElementById(btn.dataset.target);
        var rows = host.querySelectorAll('.simple-table-row:not(.igtm-sort-row)');
        var copy = rows[rows.length - 1].cloneNode(true);
        copy.querySelectorAll('input').forEach(function (i) { i.value = ''; });
        host.insertBefore(copy, host.querySelector('.igtm-sort-row'));
      });
    });
  </script>
</body></html>`;

const ALL_ON = { nav: true, pin: true, builtIn: true, submitHint: true, chips: true, sort: true, listSort: true };

async function setFeatures(page, features) {
  await page.evaluate((flags) => {
    let state = {};
    try {
      state = JSON.parse(localStorage.getItem('igtm_gtm_ui')) || {};
    } catch (e) {
      state = {};
    }
    state.enabled = true;
    state.features = flags;
    localStorage.setItem('igtm_gtm_ui', JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('igtm-gtm-ui-changed'));
  }, features);
  await page.waitForTimeout(150);
}

// Werte aller Datenzeilen einer Tabelle – ohne Kopf- und Sortierzeile.
async function valuesOf(page, id) {
  return page.evaluate((tableId) => {
    const host = document.getElementById(tableId);
    return [].filter.call(host.children, (el) =>
      el.classList.contains('simple-table-row') &&
      !el.classList.contains('igtm-sort-row') &&
      !el.querySelector('.simple-table-row__cell--header')
    ).map((r) => [].map.call(r.querySelectorAll('input[type="text"]'), (i) => i.value));
  }, id);
}

// Fokus in Zeile `index`, Spalte `col` einer Tabelle setzen.
// preventScroll ist Pflicht: Die Bloecke liegen hier dicht untereinander, ein
// scrollendes focus() raeumt die Chipleiste sofort wieder weg (scroll-Handler in
// gtm-var-edit.js). Im GTM klickt der Anwender in ein sichtbares Feld.
/*
 * Zwei Schritte, und die Reihenfolge ist Pflicht: erst das Zielfeld in den
 * Blick scrollen, dann fokussieren. gtm-var-edit.js raeumt die Leiste bei
 * jedem scroll ab (bewusst, siehe dort). Entstuende sie ausserhalb des
 * Viewports, muesste Playwright vor dem Klick dorthin scrollen — und waere sie
 * damit los. Genau das machte diese Tests sporadisch rot, je nachdem wie hoch
 * die Seite durch die Sortierzeilen der Vortests gerade war.
 */
async function focusField(page, id, index, col) {
  await page.evaluate(({ tableId, i, c }) => {
    const host = document.getElementById(tableId);
    const rows = [].filter.call(host.children, (el) =>
      el.classList.contains('simple-table-row') &&
      !el.classList.contains('igtm-sort-row') &&
      !el.querySelector('.simple-table-row__cell--header')
    );
    // Fokus erst abgeben: Sonst loest ein focus() auf das bereits aktive Feld
    // kein focusin aus und die Leiste wird nicht neu aufgebaut – im GTM
    // entspricht das dem Klick in ein anderes Feld.
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    window.igtmTestZiel = rows[i].querySelectorAll('input[type="text"]')[c];
    window.igtmTestZiel.scrollIntoView({ block: 'center' });
  }, { tableId: id, i: index, c: col });

  // Das scroll-Ereignis kommt asynchron: Ohne diese Pause raeumte es die
  // Leiste wieder weg, die der folgende Fokus gerade aufbaut.
  await page.waitForTimeout(100);

  await page.evaluate(() => window.igtmTestZiel.focus({ preventScroll: true }));
  await page.waitForTimeout(100);
}

test.describe('Zeile in Parametertabellen darunter einfuegen', () => {
  let context;
  let page;

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

  test.beforeEach(async () => {
    await page.reload();
    await page.waitForTimeout(400);
    await setFeatures(page, ALL_ON);
  });

  test('erste Spalte, Zeile mit Nachfolgern: Bedienelement da', async () => {
    await focusField(page, 'haupt', 1, 0);
    await expect(page.locator('.igtm-insert-row')).toHaveCount(1);
  });

  test('letzte Zeile: kein Bedienelement, dort genuegt der native Button', async () => {
    await focusField(page, 'haupt', 3, 0);
    await expect(page.locator('.igtm-insert-row')).toHaveCount(0);
  });

  test('zweite Spalte: kein Bedienelement', async () => {
    await focusField(page, 'haupt', 1, 1);
    await expect(page.locator('.igtm-insert-row')).toHaveCount(0);
  });

  test('einzeilige Tabelle: kein Bedienelement', async () => {
    await focusField(page, 'einzeilig', 0, 0);
    await expect(page.locator('.igtm-insert-row')).toHaveCount(0);
  });

  test('Tabelle mit Auswahlliste: kein Bedienelement', async () => {
    await focusField(page, 'mitselect', 0, 0);
    await expect(page.locator('.igtm-insert-row')).toHaveCount(0);
  });

  // GTM benennt den Knopf je nach Tabellentyp anders: wd-add-row-button in der
  // Metadata-Tabelle, nur btn--create vt-st-add in den Einstellungstabellen der
  // Google-Tags. Gemeinsam ist allein data-ng-click="ctrl.addRow()".
  test('Add-Button nur ueber die Klasse erkannt', async () => {
    await focusField(page, 'metadata', 0, 0);
    await expect(page.locator('.igtm-insert-row')).toHaveCount(1);

    await page.locator('.igtm-insert-row').click();
    await page.waitForTimeout(200);
    expect(await valuesOf(page, 'metadata')).toEqual([
      ['m1', 'v1'],
      ['', ''],
      ['m2', 'v2']
    ]);
  });

  test('Add-Button nur ueber data-ng-click erkannt', async () => {
    await focusField(page, 'settings', 0, 0);
    await expect(page.locator('.igtm-insert-row')).toHaveCount(1);

    await page.locator('.igtm-insert-row').click();
    await page.waitForTimeout(200);
    expect(await valuesOf(page, 'settings')).toEqual([
      ['s1', 'w1'],
      ['', ''],
      ['s2', 'w2']
    ]);
  });

  // Metadata-Tabellen nutzen gtm-text-input statt ctui-text-input – sonst
  // gaebe es dort weder Sortierung noch Einfuegen.
  test('Metadata-Textfelder werden erkannt', async () => {
    await focusField(page, 'metafelder', 0, 0);
    await expect(page.locator('.igtm-insert-row')).toHaveCount(1);
    // Ohne Variablenknopf im Feld: nur das Einfuege-Element, keine Chips.
    await expect(page.locator('.igtm-var-chip')).toHaveCount(0);

    await page.locator('.igtm-insert-row').click();
    await page.waitForTimeout(200);
    expect(await valuesOf(page, 'metafelder')).toEqual([
      ['k1', 'x1'],
      ['', ''],
      ['k2', 'x2']
    ]);
  });

  test('Tabelle ohne eigenen Add-Button: kein Bedienelement', async () => {
    await focusField(page, 'ohnebutton', 0, 0);
    await expect(page.locator('.igtm-insert-row')).toHaveCount(0);
  });

  test('Funktion abgeschaltet: kein Bedienelement', async () => {
    await setFeatures(page, Object.assign({}, ALL_ON, { sort: false }));
    await focusField(page, 'haupt', 1, 0);
    await expect(page.locator('.igtm-insert-row')).toHaveCount(0);
  });

  test('Klick verschiebt nur unterhalb und laesst die eigene Zeile stehen', async () => {
    await focusField(page, 'haupt', 1, 0);
    await page.locator('.igtm-insert-row').click();
    await page.waitForTimeout(200);

    expect(await valuesOf(page, 'haupt')).toEqual([
      ['a', '1'],
      ['b', '2'],
      ['', ''],
      ['c', '3'],
      ['d', '4']
    ]);
  });

  test('Klick in der ersten Zeile: Position 2 wird frei', async () => {
    await focusField(page, 'haupt', 0, 0);
    await page.locator('.igtm-insert-row').click();
    await page.waitForTimeout(200);

    expect(await valuesOf(page, 'haupt')).toEqual([
      ['a', '1'],
      ['', ''],
      ['b', '2'],
      ['c', '3'],
      ['d', '4']
    ]);
  });

  test('zweimal hintereinander einfuegen', async () => {
    await focusField(page, 'haupt', 1, 0);
    await page.locator('.igtm-insert-row').click();
    await page.waitForTimeout(200);
    await focusField(page, 'haupt', 1, 0);
    await page.locator('.igtm-insert-row').click();
    await page.waitForTimeout(200);

    expect(await valuesOf(page, 'haupt')).toEqual([
      ['a', '1'],
      ['b', '2'],
      ['', ''],
      ['', ''],
      ['c', '3'],
      ['d', '4']
    ]);
  });

  test('Fokus steht danach wieder im Ausgangsfeld', async () => {
    await focusField(page, 'haupt', 1, 0);
    await page.locator('.igtm-insert-row').click();
    await page.waitForTimeout(200);

    expect(await page.evaluate(() => document.activeElement.value)).toBe('b');
  });

  test('Bedienelement steht vor den Variablen-Chips', async () => {
    await focusField(page, 'mitvariable', 0, 0);
    const classes = await page.evaluate(() =>
      [].map.call(document.querySelectorAll('.igtm-var-chips > *'), (el) => el.className)
    );
    expect(classes.length).toBeGreaterThan(1);
    expect(classes[0]).toContain('igtm-insert-row');
    expect(classes[1]).toContain('igtm-var-chip');
  });

  test('Leiste erscheint auch ohne Variable im Feld', async () => {
    await focusField(page, 'haupt', 1, 0);
    await expect(page.locator('.igtm-var-chips')).toHaveCount(1);
    await expect(page.locator('.igtm-var-chip')).toHaveCount(0);
  });

  test('Variablen-Chips abgeschaltet: Bedienelement bleibt', async () => {
    await setFeatures(page, Object.assign({}, ALL_ON, { chips: false }));
    await focusField(page, 'mitvariable', 0, 0);
    await expect(page.locator('.igtm-insert-row')).toHaveCount(1);
    await expect(page.locator('.igtm-var-chip')).toHaveCount(0);
  });

  // Sicherung gegen den Rueckfall: Liegt die Leiste ausserhalb des Viewports,
  // scrollt Playwright vor dem Klick — und das Scrollen entfernt sie.
  test('die Leiste entsteht im sichtbaren Bereich', async () => {
    await focusField(page, 'metadata', 0, 0);
    const sichtbar = await page.evaluate(() => {
      const r = document.querySelector('.igtm-insert-row').getBoundingClientRect();
      return r.top >= 0 && r.bottom <= window.innerHeight;
    });
    expect(sichtbar).toBe(true);
  });
});
