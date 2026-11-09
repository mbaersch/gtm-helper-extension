/*
 * Logiktest fuer gtm-ui-features.js — laeuft ohne Browser gegen einen Stub aus
 * localStorage, documentElement.classList und window-Ereignissen.
 */
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

function makeSandbox(stored) {
  const store = { igtm_gtm_ui: stored };
  const classes = new Set();
  const listeners = {};

  const sandbox = {
    localStorage: {
      getItem: (key) => (key in store ? store[key] : null),
      setItem: (key, value) => { store[key] = value; }
    },
    document: {
      documentElement: {
        classList: {
          toggle: (name, on) => { if (on) classes.add(name); else classes.delete(name); },
          contains: (name) => classes.has(name)
        }
      }
    },
    window: {
      addEventListener: (type, fn) => { (listeners[type] = listeners[type] || []).push(fn); }
    },
    Object: Object,
    JSON: JSON
  };

  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(__dirname + '/gtm-ui-features.js', 'utf8'), sandbox);

  return {
    api: sandbox.igtmGtmUiFeatures,
    classes,
    store,
    fire: () => (listeners['igtm-gtm-ui-changed'] || []).forEach((fn) => fn())
  };
}

const NAMES = ['nav', 'pin', 'builtIn', 'submitHint', 'chips', 'sort', 'listSort', 'overviewHint', 'searchHotkey'];

// Ohne gespeicherten Stand ist alles an.
let s = makeSandbox(undefined);
NAMES.forEach((name) => assert.ok(s.api.isOn(name), name + ' sollte ohne Stand an sein'));
assert.ok(!s.classes.has('igtm-off-nav'), 'ohne Stand keine Aus-Klasse');
assert.ok(!s.classes.has('igtm-off-submit'), 'ohne Stand keine Aus-Klasse');

// Unbrauchbarer Inhalt darf nicht dazu fuehren, dass alles ausfaellt.
s = makeSandbox('{kaputt');
NAMES.forEach((name) => assert.ok(s.api.isOn(name), name + ' sollte bei kaputtem Stand an sein'));

// Einzelne Funktion aus, der Rest bleibt.
s = makeSandbox(JSON.stringify({ features: { nav: false } }));
assert.ok(!s.api.isOn('nav'), 'nav sollte aus sein');
assert.ok(s.api.isOn('pin'), 'pin sollte an bleiben');
assert.ok(s.classes.has('igtm-off-nav'), 'Aus-Klasse fuer nav gesetzt');
assert.ok(!s.classes.has('igtm-off-submit'), 'submitHint unberuehrt');

// Hauptschalter aus schlaegt alles, auch ausdruecklich eingeschaltete Funktionen.
s = makeSandbox(JSON.stringify({ enabled: false, features: { nav: true, pin: true } }));
NAMES.forEach((name) => assert.ok(!s.api.isOn(name), name + ' sollte bei enabled:false aus sein'));
assert.ok(s.classes.has('igtm-off-nav') && s.classes.has('igtm-off-submit'), 'beide Aus-Klassen gesetzt');

// Aenderung von aussen: neuer Inhalt im Speicher, dann das Ereignis.
s = makeSandbox(JSON.stringify({ features: { chips: false } }));
assert.ok(!s.api.isOn('chips'), 'chips zunaechst aus');
s.store.igtm_gtm_ui = JSON.stringify({ features: { chips: true, submitHint: false } });
s.fire();
assert.ok(s.api.isOn('chips'), 'chips nach dem Ereignis an (Zwischenspeicher verworfen)');
assert.ok(s.classes.has('igtm-off-submit'), 'Aus-Klasse nach dem Ereignis nachgezogen');

// listSearch bleibt die einzige Ausnahme von "fehlender Schluessel heisst an".
s = makeSandbox(JSON.stringify({ features: {} }));
assert.ok(!s.api.isOn('listSearch'), 'listSearch ohne Zutun aus');
assert.ok(s.api.isOn('searchHotkey'), 'searchHotkey ohne Zutun an');
s = makeSandbox(JSON.stringify({ features: { searchHotkey: false } }));
assert.ok(!s.api.isOn('searchHotkey'), 'searchHotkey abschaltbar');

// Schreiben aus der Oberflaeche heraus laesst die Funktionsliste unberuehrt.
s = makeSandbox(JSON.stringify({ features: { pin: false } }));
const state = s.api.read();
state.stickyBar = true;
s.api.write(state);
assert.strictEqual(JSON.parse(s.store.igtm_gtm_ui).stickyBar, true, 'stickyBar geschrieben');
assert.strictEqual(JSON.parse(s.store.igtm_gtm_ui).features.pin, false, 'Funktionsliste erhalten');
assert.ok(!s.api.isOn('pin'), 'pin bleibt aus');

console.log('✅ Alle Tests für gtm-ui-features.js bestanden!');
