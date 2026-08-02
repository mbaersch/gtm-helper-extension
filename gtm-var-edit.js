/*
 * Variablen aus Eingabefeldern heraus bearbeiten
 *
 * Im GTM fuehrt jeder Weg zur Definition einer Variablen – ausser der aus einem
 * Eingabefeld heraus. Steht eine Variable als {{Name}} in einem Textfeld eines
 * Tags oder Triggers, bleibt nur der Umweg ueber die Auswahlliste: oeffnen,
 * suchen, dort bearbeiten, und am Ende steht die Liste im Weg. Dieses Script
 * blendet unter dem fokussierten Feld je einen Chip pro gefundener Variablen ein
 * und geht diesen Weg auf Klick selbst zu Ende.
 *
 * Es braucht dafuer keine Liste der Variablen und kein Name-auf-ID-Mapping. Der
 * Abgleich passiert gegen die Auswahlliste, die GTM ohnehin rendert; Umbenennen,
 * Anlegen und Loeschen wirken deshalb sofort, ohne dass irgendetwas aktuell
 * gehalten werden muesste. Ein Index waere hier auch nutzlos, denn GTM-Overlays
 * haben keine eigene Route – es gibt keine URL, in der eine Variable als Nummer
 * auftaucht, und damit kein Ziel, fuer das man eine ID braeuchte.
 *
 * Das Script laeuft in der ISOLATED world, wie gtm-ui.js. Details und die
 * verworfenen Wege: docs/2026-08-01-variable-quick-edit-design.md
 *
 * Abschaltbar ueber die Karte "GTM-Oberflaeche" im Popup, Schluessel `chips` –
 * siehe gtm-ui-features.js.
 */

(function () {
  'use strict';

  var CHIP_BAR_CLASS = 'igtm-var-chips';
  var CHIP_CLASS = 'igtm-var-chip';

  /*
   * Was beim letzten Versuch herauskam, je Variablenname. Der Chip traegt das
   * Ergebnis anschliessend als Farbe, der Tooltip als Erklaerung – im Chip selbst
   * ist fuer einen Satz kein Platz.
   *
   * Ob eine Variable integriert ist, laesst sich vorher nicht wissen: Es gibt
   * keine Liste, und die Namen sind uebersetzt. Sichtbar wird es erst an der Zeile
   * der Auswahlliste, deren Bearbeiten-Symbol an ng-if="!variable.isBuiltIn" haengt.
   */
  var known = {};
  var TITLE_KEY = {
    builtin: 'gtm_ui_var_builtin',
    missing: 'gtm_ui_var_missing',
    failed: 'gtm_ui_var_failed'
  };
  var FIELD_SELECTOR = 'input[type="text"], textarea';
  var FIELD_CONTAINER = '.gtm-text-input-inner';
  var VARIABLE_PATTERN = /\{\{([^}]+)\}\}/g;

  var SHEET = '.gtm-sheet';
  // Der Schliessen-Knopf traegt ueberall dieselbe Klasse, aber nicht denselben
  // Tag-Namen: an den Edit-Overlays ein <i>, an der Auswahlliste ein <div>.
  // Deshalb ausschliesslich ueber die Klasse suchen – ein Selektor mit Tag-Namen
  // wuerde ausgerechnet an der Auswahlliste danebengreifen. Dieselbe Eigenart ist
  // in gtm-ui.js fuer die Parametertabellen dokumentiert.
  var SHEET_CLOSE = '.gtm-sheet-header__close';
  var PICKER_ROW = '.gtm-picker__row';
  var PICKER_NAME = '.column-name';
  var PICKER_INFO = '.gtm-info-outline-icon';
  // Das Sheet der Auswahlliste enthaelt genau ein Textfeld – die Suche.
  var PICKER_SEARCH = 'input[type="text"]';
  var NATIVE_BTN = 'button.gtm-text-input__variable-btn';

  var TIMEOUT = 5000;
  var busy = false;

  // Sprache der GTM-Oberflaeche, ermittelt in translations.js. Erst bei Bedarf
  // abgefragt, damit der Seitencode zum Zeitpunkt der Auswertung vollstaendig ist.
  function t(key, vars) {
    var text = getTranslation(detectGtmLanguage(), key);
    if (vars) {
      Object.keys(vars).forEach(function (name) {
        text = text.replace('{' + name + '}', vars[name]);
      });
    }
    return text;
  }

  /* ------------------------------------------------------------- Werkzeug */

  // Sheets liegen fix positioniert, offsetParent ist dann null – die Groesse ist
  // das verlaessliche Merkmal.
  function isVisible(el) {
    var box = el.getBoundingClientRect();
    return box.width > 0 && box.height > 0;
  }

  function visibleSheets() {
    return [].filter.call(document.querySelectorAll(SHEET), isVisible);
  }

  /*
   * Wartet beobachtend, statt zu pollen. childList und attributes zusammen, weil
   * GTM Sheets teils neu einhaengt und teils ein leeres Vorrats-Sheet befuellt,
   * das bereits im DOM steht.
   */
  function waitFor(predicate) {
    return new Promise(function (resolve, reject) {
      var immediate = predicate();
      if (immediate) return resolve(immediate);

      var timer = setTimeout(function () {
        observer.disconnect();
        reject(new Error('Zeitlimit'));
      }, TIMEOUT);

      var observer = new MutationObserver(function () {
        var hit = predicate();
        if (!hit) return;
        clearTimeout(timer);
        observer.disconnect();
        resolve(hit);
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style', 'hidden']
      });
    });
  }

  /*
   * Die Auswahlliste ist das oberste Sheet, das Zeilen enthaelt.
   *
   * Zwei Beobachtungen stecken darin. GTM haelt ein leeres Vorrats-Sheet bereit:
   * sichtbar, ohne Inhalt und ohne Schliessen-Knopf – nur der Inhalt taugt also
   * als Merkmal, nicht die Position. Und der Stapel kann beliebig tief werden,
   * weil sich aus einer geoeffneten Variablen heraus die naechste Referenz
   * anklicken laesst; dokumentweit zu suchen koennte deshalb einen Treffer in
   * einer aelteren Liste finden und am Ende das falsche Sheet schliessen.
   */
  function pickerSheet() {
    var sheets = visibleSheets();
    for (var i = sheets.length - 1; i >= 0; i--) {
      if (sheets[i].querySelector(PICKER_ROW)) return sheets[i];
    }
    return null;
  }

  /*
   * Liegt ueber dem Sheet des Feldes ein weiteres in Benutzung? Dann ist das Feld
   * verdeckt und darf keine Chips zeigen.
   *
   * Der Fall tritt nach jedem Ablauf ein: Sobald die Auswahlliste geschlossen ist,
   * gibt AngularJS den Fokus an das Feld im Tag-Sheet zurueck, obwohl der Editor
   * darueber liegt. Ohne diese Pruefung baute focusin die Leiste neu auf – und weil
   * sie den z-index braucht, um im eigenen Sheet ueberhaupt sichtbar zu sein,
   * schwebte sie dann ueber dem Editor.
   *
   * Das leere Vorrats-Sheet zaehlt nicht mit; sein fehlender Schliessen-Knopf ist
   * das Zeichen dafuer, dass es nicht bezogen ist.
   */
  function isCovered(field) {
    var own = field.closest(SHEET);
    if (!own) return false;
    var sheets = visibleSheets();
    var index = sheets.indexOf(own);
    if (index < 0) return false;
    return sheets.slice(index + 1).some(function (sheet) {
      return !!sheet.querySelector(SHEET_CLOSE);
    });
  }

  function findRow(picker, name) {
    var rows = picker.querySelectorAll(PICKER_ROW);
    for (var i = 0; i < rows.length; i++) {
      var cell = rows[i].querySelector(PICKER_NAME);
      if (!cell) continue;
      if (cell.textContent.trim().toLowerCase() === name.toLowerCase()) return rows[i];
    }
    return null;
  }

  /*
   * Die Auswahlliste haelt nur einen Ausschnitt im DOM – gemessen 113 Zeilen,
   * alphabetisch abgeschnitten. Wer weiter hinten steht, ist ohne Suche gar nicht
   * erreichbar; das duerfte auch der Grund sein, warum vergleichbare Loesungen bei
   * grossen Containern unzuverlaessig werden. Geschrieben wird wie in sortTable()
   * von gtm-ui.js: Wert setzen und das native input-Event feuern, sonst bekommt
   * ng-model die Aenderung nicht mit und AngularJS ueberschreibt sie wieder.
   */
  function filterPicker(picker, name) {
    var search = picker.querySelector(PICKER_SEARCH);
    if (!search) return;
    search.value = name;
    search.dispatchEvent(new Event('input', { bubbles: true }));
    search.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function closeSheet(sheet) {
    if (!sheet) return;
    var btn = sheet.querySelector(SHEET_CLOSE);
    if (btn) btn.click();
  }

  /* -------------------------------------------------------------- Ablauf */

  function openVariable(field, container, name) {
    if (busy) return;

    var nativeBtn = container.querySelector(NATIVE_BTN);
    // Ohne den nativen Knopf gibt es keinen Weg zur Auswahlliste. Dann wird auch
    // kein Chip angeboten, hierher kommen wir also im Normalfall nicht.
    if (!nativeBtn || nativeBtn.disabled) return;

    busy = true;
    var picker = null;

    Promise.resolve()
      .then(function () {
        nativeBtn.click();
        return waitFor(pickerSheet);
      })
      .then(function (sheet) {
        picker = sheet;
        filterPicker(picker, name);
        return waitFor(function () {
          return findRow(picker, name);
        });
      })
      .then(function (row) {
        var info = row.querySelector(PICKER_INFO);
        // Zeile da, aber kein Bearbeiten-Symbol: eine integrierte Variable. Das ist
        // kein Fehler, sondern ein Ergebnis – und etwas anderes als eine Referenz,
        // die es gar nicht gibt.
        if (!info) {
          known[name] = 'builtin';
          closeSheet(picker);
          return;
        }
        delete known[name];

        /*
         * Beide Klicks im selben Tick – das ist der Kern der Sache.
         *
         * ctrl.cancel() schliesst nicht das Sheet, an dessen Knopf es haengt,
         * sondern das oberste. Liegt der Editor erst darueber, trifft es ihn statt
         * die Liste. Der einzige Moment, in dem die Liste selbst oben liegt, ist
         * unmittelbar nach dem Klick auf das Bearbeiten-Symbol: openVariableInSheet
         * ist angestossen, der Editor aber noch nicht aufgebaut. Genau dort wird
         * geschlossen – danach steht der Editor direkt ueber dem Tag, und sein
         * Schliessen fuehrt dorthin zurueck, wo die Bearbeitung angefordert wurde.
         *
         * Der Knopf wird vor dem Klick gegriffen, weil das Schliessen ihn aus dem
         * DOM nimmt.
         */
        var closeBtn = picker.querySelector(SHEET_CLOSE);
        info.click();
        if (closeBtn) closeBtn.click();
      })
      .catch(function () {
        // Die fremde Oberflaeche darf nicht halb geoeffnet zurueckbleiben. Beim
        // Abbruch ist die Liste das oberste Sheet, hier greift cancel() also.
        closeSheet(picker);
        known[name] = picker ? 'missing' : 'failed';
      })
      .then(function () {
        busy = false;
        // Chips neu aufbauen, damit das Ergebnis am Chip sichtbar wird. Nur wenn
        // das Feld den Fokus zurueckbekommen hat – sonst waere eine Leiste unter
        // einem unbeteiligten Feld verwirrend, und sie kommt beim naechsten Fokus
        // ohnehin eingefaerbt wieder.
        if (known[name] && document.activeElement === field) showChips(field);
      });
  }

  /* ------------------------------------------------------------------ UI */

  function variableNames(value) {
    var names = [];
    var match;
    VARIABLE_PATTERN.lastIndex = 0;
    while ((match = VARIABLE_PATTERN.exec(value || '')) !== null) {
      var name = match[1].trim();
      if (name && names.indexOf(name) < 0) names.push(name);
    }
    return names;
  }

  function removeBar() {
    var bar = document.querySelector('.' + CHIP_BAR_CLASS);
    if (bar) bar.remove();
  }

  /*
   * Die Leiste haengt am body, nicht im Feld-Container: In den engen Zellen der
   * Parametertabellen wuerde sie sonst das Zeilenraster auseinanderschieben.
   * Positioniert wird ueber die Bildschirmkoordinaten des Feldes.
   */
  function placeBar(bar, field) {
    var box = field.getBoundingClientRect();
    document.body.appendChild(bar);
    bar.style.left = (box.left + window.scrollX) + 'px';
    bar.style.top = (box.bottom + window.scrollY + 4) + 'px';
  }

  function showChips(field) {
    removeBar();

    // Abgeschaltet in der Karte "GTM-Oberflaeche" des Popups: keine Chips.
    if (!igtmGtmUiFeatures.isOn('chips')) return;

    // Waehrend ein Ablauf laeuft, gehoert keine Leiste ins Bild.
    if (busy || isCovered(field)) return;

    var container = field.closest(FIELD_CONTAINER);
    if (!container) return;
    // Ohne nativen Variablen-Knopf fuehrt kein Weg zur Auswahlliste – dann lieber
    // gar keinen Chip anbieten als einen, der ins Leere laeuft.
    if (!container.querySelector(NATIVE_BTN)) return;

    var names = variableNames(field.value);
    if (!names.length) return;

    var bar = document.createElement('div');
    bar.className = CHIP_BAR_CLASS;

    names.forEach(function (name) {
      var state = known[name];
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = CHIP_CLASS + (state ? ' ' + CHIP_CLASS + '--' + state : '');
      chip.textContent = name;
      chip.title = t(TITLE_KEY[state] || 'gtm_ui_var_edit', { name: name });
      chip.setAttribute('aria-label', chip.title);

      // Integrierte Variablen haben keine Konfiguration – ein weiterer Versuch
      // fuehrt zum selben Ergebnis. Fehlende bleiben anklickbar: Sie koennen
      // inzwischen angelegt worden sein.
      if (state === 'builtin') {
        chip.disabled = true;
      } else {
        // mousedown statt click: Das blur des Feldes raeumt die Leiste sonst weg,
        // bevor der Klick ankommt.
        chip.addEventListener('mousedown', function (event) {
          event.preventDefault();
          event.stopPropagation();
          removeBar();
          openVariable(field, container, name);
        });
      }
      bar.appendChild(chip);
    });

    placeBar(bar, field);
  }

  /* ------------------------------------------------------------- Anbindung */

  /*
   * Ein einziger delegierter Listener statt eines Scans ueber alle Felder: Die
   * Anzeige haengt am Fokus, also genuegt das Fokus-Ereignis. Damit gibt es keine
   * Dauerlast, unabhaengig davon, wie gross der Container ist – anders als bei
   * Loesungen, die in jedem Feld dauerhaft eine Schaltflaeche vorhalten und dafuer
   * bei jeder DOM-Aenderung das ganze Dokument absuchen muessen.
   */
  function onFieldEvent(event) {
    var field = event.target;
    if (!field.matches || !field.matches(FIELD_SELECTOR)) return;
    showChips(field);
  }

  document.addEventListener('focusin', onFieldEvent, true);
  // Beim Tippen kann eine Referenz entstehen oder verschwinden.
  document.addEventListener('input', onFieldEvent, true);

  document.addEventListener('focusout', function (event) {
    if (event.target.matches && event.target.matches(FIELD_SELECTOR)) removeBar();
  }, true);

  // Die Leiste kennt nur die Position von eben. Statt sie nachzufuehren, wird sie
  // beim Scrollen geschlossen – capture, weil in den Sheets innere Bereiche
  // scrollen, deren Ereignisse nicht bis zum Fenster steigen.
  document.addEventListener('scroll', removeBar, true);
  window.addEventListener('resize', removeBar);

  // Wird die Funktion im Popup abgeschaltet, waehrend eine Leiste offen steht,
  // verschwindet sie sofort statt erst beim naechsten Fokuswechsel.
  igtmGtmUiFeatures.onChange(removeBar);
})();
