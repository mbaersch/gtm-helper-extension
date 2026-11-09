/*
 * Logiktest fuer gtm-hotkey.js — laeuft ohne Browser, mit dem echten
 * translations.js im selben Kontext.
 */
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const sandbox = {};
vm.createContext(sandbox);
['translations.js', 'gtm-hotkey.js'].forEach((datei) => {
  vm.runInContext(fs.readFileSync(datei, 'utf8'), sandbox, { filename: datei });
});
const hk = sandbox.igtmHotkey;

function ev(over) {
  return Object.assign({ altKey: false, ctrlKey: false, shiftKey: false, metaKey: false,
                         code: '', key: '' }, over);
}

/* ------------------------------------------------------------------ Vergleich */

assert.ok(hk.matches(ev({ altKey: true, code: 'KeyS', key: 's' }), hk.DEFAULT), 'Alt+S trifft');
assert.ok(!hk.matches(ev({ altKey: true, ctrlKey: true, code: 'KeyS', key: 's' }), hk.DEFAULT),
  'Strg+Alt+S trifft nicht');
assert.ok(!hk.matches(ev({ code: 'KeyS', key: 's' }), hk.DEFAULT), 'S allein trifft nicht');

// macOS: Alt+S kommt als "ß" an, der code bleibt KeyS.
assert.ok(hk.matches(ev({ altKey: true, code: 'KeyS', key: 'ß' }), hk.DEFAULT), 'macOS-Fall');
// Dvorak: die mit S beschriftete Taste sitzt anderswo, key rettet den Vergleich.
assert.ok(hk.matches(ev({ altKey: true, code: 'KeyO', key: 's' }), hk.DEFAULT), 'Dvorak-Fall');

const strgAltK = { alt: true, ctrl: true, shift: false, meta: false, code: 'KeyK', key: 'k' };
assert.ok(hk.matches(ev({ altKey: true, ctrlKey: true, code: 'KeyK', key: 'k' }), strgAltK),
  'eigene Kombination trifft');
assert.ok(!hk.matches(ev({ altKey: true, code: 'KeyS', key: 's' }), strgAltK),
  'nach dem Umstellen trifft Alt+S nicht mehr');

// Fehlt die Kombination oder taugt sie nicht, gilt wieder Alt+S.
assert.ok(hk.matches(ev({ altKey: true, code: 'KeyS', key: 's' }), undefined), 'ohne Angabe Alt+S');
assert.ok(hk.matches(ev({ altKey: true, code: 'KeyS', key: 's' }), { shift: true, code: 'KeyX' }),
  'ungueltige Angabe faellt auf Alt+S zurueck');

/* ------------------------------------------------------------------- Aufnahme */

assert.strictEqual(hk.fromEvent(ev({ altKey: true, key: 'Alt', code: 'AltLeft' })), null,
  'reiner Modifier ist noch keine Eingabe');
assert.ok(!hk.valid(hk.fromEvent(ev({ shiftKey: true, code: 'KeyS', key: 'S' }))),
  'Umschalt allein reicht nicht');
assert.ok(!hk.valid(hk.fromEvent(ev({ code: 'F2', key: 'F2' }))), 'F2 ohne Modifier reicht nicht');

const aufgenommen = hk.fromEvent(ev({ altKey: true, ctrlKey: true, code: 'KeyK', key: 'K' }));
assert.ok(hk.valid(aufgenommen), 'Strg+Alt+K ist gueltig');
assert.strictEqual(aufgenommen.key, 'k', 'key wird klein gespeichert');
assert.strictEqual(aufgenommen.shift, false, 'nicht gedrueckte Modifier stehen auf false');

/* ---------------------------------------------------------------- Beschriftung */

assert.strictEqual(hk.label(hk.DEFAULT, 'de'), 'Alt+S', 'Standard auf Deutsch');
assert.strictEqual(hk.label(strgAltK, 'de'), 'Strg+Alt+K', 'Modifier auf Deutsch');
assert.strictEqual(hk.label(strgAltK, 'en'), 'Ctrl+Alt+K', 'Modifier auf Englisch');
assert.strictEqual(hk.label({ alt: true, shift: true, code: 'KeyK', key: 'k' }, 'de'),
  'Alt+Umschalt+K', 'Umschalt als Zusatz');

// Das "ß" von macOS darf nicht in der Beschriftung landen.
assert.strictEqual(hk.label({ alt: true, code: 'KeyS', key: 'ß' }, 'de'), 'Alt+S', 'macOS-Fall');
// AZERTY: key gewinnt, die Taste heisst dort so, wie sie beschriftet ist.
assert.strictEqual(hk.label({ alt: true, code: 'KeyA', key: 'q' }, 'de'), 'Alt+Q', 'AZERTY-Fall');
assert.strictEqual(hk.label({ ctrl: true, code: 'Space', key: ' ' }, 'de'), 'Strg+Leertaste',
  'Leertaste benannt');
assert.strictEqual(hk.label({ ctrl: true, altKey: false, code: 'F2', key: 'f2' }, 'de'), 'Strg+F2',
  'Funktionstaste unveraendert');
assert.strictEqual(hk.label({ alt: true, code: 'Digit1', key: '1' }, 'de'), 'Alt+1', 'Ziffer');
// macOS: Alt+1 kommt als anderes Zeichen an, der code rettet die Beschriftung.
assert.strictEqual(hk.label({ alt: true, code: 'Digit1', key: '¡' }, 'de'), 'Alt+1', 'macOS-Ziffer');
// Umlaute und Sonderzeichen: Der code hiesse hier "BracketLeft".
assert.strictEqual(hk.label({ ctrl: true, code: 'BracketLeft', key: 'ü' }, 'de'), 'Strg+Ü', 'Umlaut');
assert.strictEqual(hk.label({ alt: true, code: 'Backslash', key: '#' }, 'de'), 'Alt+#', 'Sonderzeichen');

/* --------------------------------------------------------------- Bereiche */

// Ohne gespeicherte Liste gilt Alt+1 bis Alt+3 — nicht die Vorgabe der Suche.
// Object.assign hebt das Ergebnis aus dem vm-Kontext, sonst scheitert der
// Vergleich am Prototyp.
assert.deepStrictEqual(Object.assign({}, hk.section(undefined, 1)),
  { alt: true, ctrl: false, shift: false, meta: false, code: 'Digit2', key: '2' },
  'zweiter Bereich ohne Angabe');

// Jeder Bereich steht fuer sich: eigene Taste, eigene Modifier.
const eigene = [
  { alt: false, ctrl: true, shift: false, meta: false, code: 'BracketLeft', key: 'ü' },
  { alt: true, ctrl: false, shift: false, meta: false, code: 'BracketLeft', key: 'ü' }
];
assert.ok(hk.matches(ev({ ctrlKey: true, code: 'BracketLeft', key: 'ü' }), hk.section(eigene, 0)),
  'Strg+Ü fuer Tags');
assert.ok(hk.matches(ev({ altKey: true, code: 'BracketLeft', key: 'ü' }), hk.section(eigene, 1)),
  'Alt+Ü fuer Trigger');
assert.ok(!hk.matches(ev({ altKey: true, code: 'BracketLeft', key: 'ü' }), hk.section(eigene, 0)),
  'Alt+Ü ist nicht das Kuerzel der Tags');
// Ein Loch in der Liste faellt auf die Vorgabe des jeweiligen Bereichs zurueck.
assert.ok(hk.matches(ev({ altKey: true, code: 'Digit3', key: '3' }), hk.section(eigene, 2)),
  'dritter Bereich bleibt bei Alt+3');

assert.strictEqual(hk.label(hk.section(eigene, 0), 'de'), 'Strg+Ü', 'eigene Taste beschriftet');
assert.strictEqual(hk.label(hk.section(undefined, 0), 'de'), 'Alt+1', 'Vorgabe beschriftet');

console.log('✅ Alle Tests für gtm-hotkey.js bestanden!');
