/*
 * Chips unter dem fokussierten Eingabefeld, die {{Variablen}} zur Bearbeitung
 * oeffnen. Abgeglichen wird gegen die Auswahlliste, die GTM ohnehin rendert –
 * keine eigene Variablenliste, kein Name-auf-ID-Mapping.
 * Entwurf und verworfene Wege: docs/2026-08-01-variable-quick-edit-design.md
 */

(function () {
  'use strict';

  var CHIP_BAR_CLASS = 'igtm-var-chips';
  var CHIP_CLASS = 'igtm-var-chip';

  // Ergebnis des letzten Versuchs je Variablenname. Ob eine Variable integriert
  // ist, zeigt sich erst an der Auswahlliste – vorher gibt es keine Liste dazu.
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
  // Nur ueber die Klasse suchen: Der Schliessen-Knopf ist an den Edit-Overlays
  // ein <i>, an der Auswahlliste ein <div>.
  var SHEET_CLOSE = '.gtm-sheet-header__close';
  var PICKER_ROW = '.gtm-picker__row';
  var PICKER_NAME = '.column-name';
  var PICKER_INFO = '.gtm-info-outline-icon';
  var PICKER_SEARCH = 'input[type="text"]';
  var NATIVE_BTN = 'button.gtm-text-input__variable-btn';

  var TIMEOUT = 5000;
  var busy = false;

  // Erst bei Bedarf abfragen, damit der Seitencode vollstaendig geladen ist.
  function t(key, vars) {
    var text = getTranslation(detectGtmLanguage(), key);
    if (vars) {
      Object.keys(vars).forEach(function (name) {
        text = text.replace('{' + name + '}', vars[name]);
      });
    }
    return text;
  }

  // Herkunft an jedem eingefuegten Bedienelement. Nur im title, nicht im
  // aria-label — sonst liest ein Screenreader sie bei jedem Fokus mit vor.
  function withSource(text) {
    return text + '\n' + t('gtm_ui_source');
  }

  /* ------------------------------------------------------------- Werkzeug */

  // Sheets liegen fix positioniert, offsetParent ist dann null.
  function isVisible(el) {
    var box = el.getBoundingClientRect();
    return box.width > 0 && box.height > 0;
  }

  function visibleSheets() {
    return [].filter.call(document.querySelectorAll(SHEET), isVisible);
  }

  // childList und attributes zusammen: GTM haengt Sheets teils neu ein und
  // befuellt teils ein leeres Vorrats-Sheet, das schon im DOM steht.
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

  // Oberstes Sheet MIT Zeilen: Das leere Vorrats-Sheet von GTM ist ebenfalls
  // sichtbar, und der Stapel kann beliebig tief werden – dokumentweit zu suchen
  // wuerde am Ende das falsche Sheet schliessen.
  function pickerSheet() {
    var sheets = visibleSheets();
    for (var i = sheets.length - 1; i >= 0; i--) {
      if (sheets[i].querySelector(PICKER_ROW)) return sheets[i];
    }
    return null;
  }

  // AngularJS gibt den Fokus ans Tag-Sheet zurueck, obwohl der Editor darueber
  // liegt – ohne diese Pruefung schwebte die Leiste ueber ihm. Ein fehlender
  // Schliessen-Knopf kennzeichnet das leere Vorrats-Sheet.
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

  // Ohne Suche unerreichbar: Die Auswahlliste haelt nur rund 113 Zeilen im DOM.
  // Das native input-Event ist Pflicht, sonst ueberschreibt AngularJS den Wert.
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
        // Zeile da, aber kein Bearbeiten-Symbol: eine integrierte Variable.
        if (!info) {
          known[name] = 'builtin';
          closeSheet(picker);
          return;
        }
        delete known[name];

        // Beide Klicks im selben Tick: ctrl.cancel() schliesst immer das oberste
        // Sheet, und nur hier ist das noch die Liste und nicht der Editor. Der Knopf
        // muss vorher gegriffen werden, das Schliessen nimmt ihn aus dem DOM.
        var closeBtn = picker.querySelector(SHEET_CLOSE);
        info.click();
        if (closeBtn) closeBtn.click();
      })
      .catch(function () {
        // Beim Abbruch ist die Liste das oberste Sheet, hier greift cancel().
        closeSheet(picker);
        known[name] = picker ? 'missing' : 'failed';
      })
      .then(function () {
        busy = false;
        // Nur bei zurueckgekehrtem Fokus, sonst erschiene die Leiste unter einem
        // unbeteiligten Feld.
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

  // Am body statt im Feld-Container: In den engen Zellen der Parametertabellen
  // wuerde sie sonst das Zeilenraster auseinanderschieben.
  function placeBar(bar, field) {
    var box = field.getBoundingClientRect();
    document.body.appendChild(bar);
    bar.style.left = (box.left + window.scrollX) + 'px';
    bar.style.top = (box.bottom + window.scrollY + 4) + 'px';
  }

  // Diese Bedingungen gehoeren den Variablen-Chips, nicht der Leiste: Ohne
  // nativen Knopf fuehrt kein Weg zur Auswahlliste, ohne {{Name}} gibt es
  // nichts zu oeffnen. Ein Beitrag aus gtm-ui.js kann trotzdem anfallen.
  function variableChips(field) {
    if (!igtmGtmUiFeatures.isOn('chips')) return [];

    var container = field.closest(FIELD_CONTAINER);
    if (!container || !container.querySelector(NATIVE_BTN)) return [];

    return variableNames(field.value).map(function (name) {
      var state = known[name];
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = CHIP_CLASS + (state ? ' ' + CHIP_CLASS + '--' + state : '');
      chip.textContent = name;
      var label = t(TITLE_KEY[state] || 'gtm_ui_var_edit', { name: name });
      chip.title = withSource(label);
      chip.setAttribute('aria-label', label);

      // Fehlende bleiben anklickbar – sie koennen inzwischen angelegt worden sein.
      if (state === 'builtin') {
        chip.disabled = true;
      } else {
        // mousedown statt click: Das blur raeumt die Leiste sonst vorher weg.
        chip.addEventListener('mousedown', function (event) {
          event.preventDefault();
          event.stopPropagation();
          removeBar();
          openVariable(field, container, name);
        });
      }
      return chip;
    });
  }

  // Die Leiste gehoert nicht mehr allein den Variablen: gtm-ui.js steuert in
  // Parametertabellen ein eigenes Bedienelement bei. Es steht vorne, weil die
  // Zahl der Variablen-Chips schwankt und der Platz sonst mitwanderte.
  function showChips(field) {
    removeBar();

    if (busy || isCovered(field)) return;

    var parts = [];
    var extra = window.igtmTableInsert && window.igtmTableInsert.chipFor(field);
    if (extra) parts.push(extra);
    parts = parts.concat(variableChips(field));
    if (!parts.length) return;

    var bar = document.createElement('div');
    bar.className = CHIP_BAR_CLASS;
    parts.forEach(function (part) { bar.appendChild(part); });

    placeBar(bar, field);
  }

  /* ------------------------------------------------------------- Anbindung */

  // Ein delegierter Listener am Fokus statt eines Scans ueber alle Felder –
  // sonst entsteht Dauerlast, die mit der Containergroesse waechst.
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

  // capture, weil in den Sheets innere Bereiche scrollen, deren Ereignisse
  // nicht bis zum Fenster steigen.
  // Die Leiste beim Scrollen mitwandern zu lassen statt sie zu entfernen wurde
  // versucht und wieder verworfen: Im GTM kostete das den Fokus im Feld und
  // warf die Tabelle aus dem Bearbeitungsmodus.
  document.addEventListener('scroll', removeBar, true);
  window.addEventListener('resize', removeBar);

  igtmGtmUiFeatures.onChange(removeBar);
})();
