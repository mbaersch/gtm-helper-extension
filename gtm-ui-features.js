/*
 * Schaltbare GTM-UI-Funktionen — gemeinsamer Zustand fuer gtm-ui.js und
 * gtm-var-edit.js. Aufbau des Schluessels igtm_gtm_ui: siehe AGENTS.md.
 */

var igtmGtmUiFeatures = (function () {
  'use strict';

  var STORAGE_KEY = 'igtm_gtm_ui';
  var CHANGE_EVENT = 'igtm-gtm-ui-changed';

  var OFF_CLASS = {
    nav: 'igtm-off-nav',
    submitHint: 'igtm-off-submit'
  };

  // Gelesen wird bei jedem Tastendruck in einem GTM-Feld, deshalb gemerkt.
  var cache = null;

  function read() {
    if (cache) return cache;
    try {
      cache = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      cache = {};
    }
    return cache;
  }

  function write(state) {
    cache = state;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // Gesperrter Speicher: die Einstellung gilt dann nur fuer diese Sitzung.
    }
  }

  // Fehlender Schluessel heisst an — sonst ist bei jedem, der nie etwas
  // geschaltet hat, alles aus.
  function isOn(name) {
    var state = read();
    if (state.enabled === false) return false;
    var value = (state.features || {})[name];
    // Einzige Ausnahme von "fehlender Schluessel heisst an": Diese Funktion
    // blendet Zeilen aus und darf niemandem ungefragt zustossen.
    if (name === 'listSearch') return value === true;
    return value !== false;
  }

  // Die Klasse markiert das AUSschalten: Bis dieses Script laeuft, traegt das
  // Element keine, mit einer "An"-Klasse blitzte es bei jedem Aufbau auf.
  function applyCssFlags() {
    Object.keys(OFF_CLASS).forEach(function (name) {
      document.documentElement.classList.toggle(OFF_CLASS[name], !isOn(name));
    });
  }

  function onChange(handler) {
    window.addEventListener(CHANGE_EVENT, handler);
  }

  // Zuerst registriert: Alle weiteren Empfaenger sehen bereits den neuen Stand.
  // Ein storage-Ereignis taugt hier nicht, es feuert nur in anderen Dokumenten
  // derselben Origin — das Popup schreibt per chrome.scripting in dieses.
  window.addEventListener(CHANGE_EVENT, function () {
    cache = null;
  });

  applyCssFlags();
  onChange(applyCssFlags);

  return {
    read: read,
    write: write,
    isOn: isOn,
    onChange: onChange
  };
})();
