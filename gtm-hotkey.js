/*
 * Tastenkuerzel der Workspace-Suche: aufnehmen, vergleichen, beschriften.
 * Gemeinsam genutzt von popup.js und gtm-ui.js — getrennte Kontexte, aber
 * dieselbe Beschriftung, jeweils in der Sprache ihrer eigenen Oberflaeche.
 */

var igtmHotkey = (function () {
  'use strict';

  var DEFAULT = { alt: true, ctrl: false, shift: false, meta: false, code: 'KeyS', key: 's' };

  // Tags, Trigger, Variablen — in dieser Reihenfolge, jede Kombination fuer
  // sich waehlbar.
  var SECTION_DEFAULTS = [
    { alt: true, ctrl: false, shift: false, meta: false, code: 'Digit1', key: '1' },
    { alt: true, ctrl: false, shift: false, meta: false, code: 'Digit2', key: '2' },
    { alt: true, ctrl: false, shift: false, meta: false, code: 'Digit3', key: '3' }
  ];

  var MODIFIER_KEYS = ['Alt', 'Control', 'Shift', 'Meta', 'AltGraph',
                       'CapsLock', 'NumLock', 'ScrollLock', 'Dead'];

  // Ohne Alt, Strg oder Cmd wuerde die Kombination auch beim Tippen in einem
  // GTM-Feld feuern: Der Handler prueft nicht, wo der Fokus gerade steht.
  function valid(combo) {
    if (!combo || (!combo.alt && !combo.ctrl && !combo.meta)) return false;
    return !!(combo.code || combo.key);
  }

  function resolve(combo, fallback) {
    return valid(combo) ? combo : (fallback || DEFAULT);
  }

  // Die Kombination des index-ten Bereichs aus der gespeicherten Liste.
  function section(list, index) {
    return resolve((list || [])[index], SECTION_DEFAULTS[index]);
  }

  // null nur beim reinen Modifier-Anschlag — der ist noch keine Eingabe. Ob
  // die Kombination taugt, entscheidet der Aufrufer mit valid(): Er muss die
  // beiden Faelle unterscheiden, um nicht schon beim Halten von Alt zu meckern.
  function fromEvent(event) {
    if (MODIFIER_KEYS.indexOf(event.key) !== -1) return null;
    return {
      alt: !!event.altKey,
      ctrl: !!event.ctrlKey,
      shift: !!event.shiftKey,
      meta: !!event.metaKey,
      code: event.code || '',
      key: event.key ? event.key.toLowerCase() : ''
    };
  }

  // code trifft die Taste unabhaengig vom Layout, key faengt macOS ab: Dort
  // kommt Alt+S als "ß" an. Beides zusammen deckt auch Dvorak ab.
  function matches(event, combo) {
    var c = resolve(combo);
    if (!!event.altKey !== !!c.alt) return false;
    if (!!event.ctrlKey !== !!c.ctrl) return false;
    if (!!event.shiftKey !== !!c.shift) return false;
    if (!!event.metaKey !== !!c.meta) return false;
    if (c.code && event.code === c.code) return true;
    return !!(c.key && event.key && event.key.toLowerCase() === c.key);
  }

  // Drei Faelle, in dieser Reihenfolge, sonst steht das Falsche im Feld:
  // Buchstabe/Ziffer aus key (auf AZERTY heisst die Taste dann wie beschriftet),
  // dann code (macht das macOS-"ß" wieder zu einem S), dann jedes andere
  // einzelne Zeichen aus key — sonst stuende bei Strg+Ü "BracketLeft" da.
  function keyLabel(c, lang) {
    var code = c.code || '';
    if (c.key && /^[a-z0-9]$/i.test(c.key)) return c.key.toUpperCase();
    if (code === 'Space') return getTranslation(lang, 'hotkey_key_space');
    var named = /^(?:Key|Digit)(.+)$/.exec(code);
    if (named) return named[1].toUpperCase();
    if (c.key && c.key.length === 1 && c.key.trim()) return c.key.toUpperCase();
    return code || '?';
  }

  function label(combo, lang) {
    var c = resolve(combo);
    var parts = [];
    if (c.ctrl) parts.push(getTranslation(lang, 'hotkey_mod_ctrl'));
    if (c.alt) parts.push(getTranslation(lang, 'hotkey_mod_alt'));
    if (c.shift) parts.push(getTranslation(lang, 'hotkey_mod_shift'));
    if (c.meta) parts.push(getTranslation(lang, 'hotkey_mod_meta'));
    parts.push(keyLabel(c, lang));
    return parts.join('+');
  }

  return {
    DEFAULT: DEFAULT,
    SECTION_DEFAULTS: SECTION_DEFAULTS,
    valid: valid,
    resolve: resolve,
    section: section,
    fromEvent: fromEvent,
    matches: matches,
    label: label
  };
})();
