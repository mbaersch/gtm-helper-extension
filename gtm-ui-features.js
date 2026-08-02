/*
 * Schaltbare GTM-UI-Funktionen — gemeinsamer Zustand fuer gtm-ui.js und gtm-var-edit.js
 *
 * Die GTM-Oberflaeche wird von vielen Extensions erweitert; wer zwei davon
 * installiert hat, bekommt doppelte oder kollidierende Bedienelemente. Deshalb
 * ist jede unserer Funktionen einzeln abschaltbar, dazu ein Hauptschalter fuer
 * alle zusammen. Geschaltet wird im Popup (Karte "GTM-Oberflaeche"), nicht hier.
 *
 * Der Zustand liegt unter demselben Schluessel im localStorage von
 * tagmanager.google.com wie die beiden Schalter in der Oberflaeche selbst:
 *
 *   {
 *     "stickyBar": false,        // Zustand des Pins in den Listen
 *     "hideBuiltInVars": false,  // Zustand des Schalters an der Variablenkarte
 *     "enabled": true,           // Hauptschalter
 *     "features": { "nav": true, "pin": true, ... }
 *   }
 *
 * Zwei Ebenen, die nicht dasselbe sind: `features.pin` entscheidet, ob es den Pin
 * ueberhaupt gibt, `stickyBar`, ob er gedrueckt ist. Wird eine Funktion
 * abgeschaltet, verschwindet ihr Bedienelement mitsamt Wirkung — ihr eigener
 * Zustand bleibt gespeichert und gilt wieder, sobald sie zurueckkommt.
 *
 * Fehlt ein Schluessel, gilt die Funktion als eingeschaltet: Wer nie etwas
 * geschaltet hat, bekommt alles. Deshalb wird ueberall auf `!== false` geprueft
 * und nicht auf `=== true`.
 *
 * Zwei der Funktionen sind reines CSS (Hinweis im Sende-Dialog, fixierte
 * Bereichsnavigation) und haengen an einer Klasse am <html>-Element. Die Klasse
 * markiert das AUSschalten, nicht das Ein: Bis dieses Script laeuft, traegt das
 * Element keine Klasse — mit einer "An"-Klasse waere im Normalfall bei jedem
 * Seitenaufbau ein Aufblitzen zu sehen, so nur im abgeschalteten Fall.
 *
 * Aenderungen aus dem Popup kommen als Ereignis an: Das Popup schreibt per
 * chrome.scripting in den localStorage und loest anschliessend CHANGE_EVENT aus.
 * Ein storage-Ereignis gibt es hier nicht — es feuert nur in *anderen* Dokumenten
 * derselben Origin, und das injizierte Script laeuft im selben.
 */

var igtmGtmUiFeatures = (function () {
  'use strict';

  var STORAGE_KEY = 'igtm_gtm_ui';
  var CHANGE_EVENT = 'igtm-gtm-ui-changed';

  // Nur die beiden Funktionen ohne eigenes JavaScript brauchen eine Klasse.
  var OFF_CLASS = {
    nav: 'igtm-off-nav',
    submitHint: 'igtm-off-submit'
  };

  /*
   * Gelesen wird bei jedem Tastendruck in einem GTM-Feld (die Variablen-Chips
   * fragen dort nach), deshalb liegt der Stand gemerkt bereit. Ungueltig wird er
   * nur an zwei Stellen: beim eigenen Schreiben und beim Ereignis aus dem Popup.
   */
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
      // Voller oder gesperrter Speicher: die Einstellung gilt dann nur fuer diese Sitzung.
    }
  }

  function isOn(name) {
    var state = read();
    if (state.enabled === false) return false;
    return (state.features || {})[name] !== false;
  }

  function applyCssFlags() {
    Object.keys(OFF_CLASS).forEach(function (name) {
      document.documentElement.classList.toggle(OFF_CLASS[name], !isOn(name));
    });
  }

  function onChange(handler) {
    window.addEventListener(CHANGE_EVENT, handler);
  }

  // Zuerst registriert und damit als Erster am Zug: Alle weiteren Empfaenger des
  // Ereignisses sehen bereits den neuen Stand.
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
