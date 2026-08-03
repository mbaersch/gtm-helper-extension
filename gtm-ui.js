/*
 * GTM UI-Komfort: fixierbarer Titelbalken, Sortierung von Parametertabellen und
 * ausblendbare Liste der integrierten Variablen. Laeuft in der ISOLATED world;
 * an den $scope des AngularJS der Seite kommt man von dort nicht heran.
 * Abschaltbar ueber gtm-ui-features.js.
 */

(function () {
  'use strict';

  var CLASS_ON = 'igtm-sticky-bar';
  var CLASS_HIDE_BUILTIN = 'igtm-hide-builtin';
  var PIN_CLASS = 'igtm-pin-bar';
  var SWITCH_ID = 'igtm-builtin-switch';
  var BUILTIN_SELECTOR = 'div[data-items="ctrl.builtInVariables"]';

  // Einzeln benannt statt ueber einen Sammelselektor: Die Variablenseite enthaelt
  // mit ctrl.builtInVariables eine zweite Karte, die sonst einen zweiten Balken
  // an dieselbe Kante haengen wuerde.
  var LIST_SELECTORS = [
    'gtm-tag-list-table',
    'div[data-items="ctrl.triggerList"]',
    'div[data-items="ctrl.variableList"]'
  ];
  var SORT_ROW_CLASS = 'igtm-sort-row';

  // Beschriftungen folgen der Sprache der GTM-Oberflaeche, nicht der im Popup
  // gewaehlten — detectGtmLanguage() erst bei Bedarf, damit der Seitencode zum
  // Zeitpunkt der Auswertung vollstaendig ist.
  function t(key, vars) {
    var text = getTranslation(detectGtmLanguage(), key);
    if (vars) {
      Object.keys(vars).forEach(function (name) {
        text = text.replace('{' + name + '}', vars[name]);
      });
    }
    return text;
  }

  /* ---------------------------------------------------------------- Titelbalken */

  var readState = igtmGtmUiFeatures.read;
  var writeState = igtmGtmUiFeatures.write;
  var isOn = igtmGtmUiFeatures.isOn;

  function applyPinState() {
    var active = isOn('pin') && readState().stickyBar === true;
    document.documentElement.classList.toggle(CLASS_ON, active);
    var label = t(active ? 'gtm_ui_pin_off' : 'gtm_ui_pin_on');
    [].forEach.call(document.querySelectorAll('.' + PIN_CLASS), function (btn) {
      btn.title = label;
      btn.setAttribute('aria-label', label);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  // Die Elemente von GTM tragen eigene AngularJS-Handler – der Klick darf
  // deshalb nicht weiterlaufen.
  function makeToggle(field, apply) {
    return function (event) {
      event.preventDefault();
      event.stopPropagation();
      var state = readState();
      state[field] = !(state[field] === true);
      writeState(state);
      apply();
    };
  }

  function injectPin() {
    var added = false;

    LIST_SELECTORS.forEach(function (selector) {
      var container = document.querySelector(selector);
      if (!container) return;
      var bar = container.querySelector('div.card-actions');
      if (!bar || bar.querySelector('.' + PIN_CLASS)) return;

      var btn = document.createElement('button');
      // Klasse statt ID: Der Pin sitzt in jeder der drei Listen.
      btn.className = PIN_CLASS;
      btn.type = 'button';
      // Inline-SVG statt Emoji: Das rendert je nach Betriebssystem anders und
      // bringt eine eigene Farbe mit.
      btn.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        '<rect x="3" y="4" width="18" height="3.2" rx="1.6"/>' +
        '<rect x="3" y="11" width="18" height="2" rx="1" opacity=".5"/>' +
        '<rect x="3" y="15.5" width="18" height="2" rx="1" opacity=".5"/>' +
        '<rect x="3" y="20" width="18" height="2" rx="1" opacity=".5"/>' +
        '</svg>';
      btn.addEventListener('click', makeToggle('stickyBar', applyPinState));
      bar.insertBefore(btn, bar.firstChild);
      added = true;
    });

    if (added) applyPinState();
  }

  function removePins() {
    [].forEach.call(document.querySelectorAll('.' + PIN_CLASS), function (btn) {
      btn.remove();
    });
  }

  /* ------------------------------------------------ Integrierte Variablen */

  function applyBuiltInState() {
    var hidden = isOn('builtIn') && readState().hideBuiltInVars === true;
    document.documentElement.classList.toggle(CLASS_HIDE_BUILTIN, hidden);
    var sw = document.getElementById(SWITCH_ID);
    if (sw) {
      var label = t(hidden ? 'gtm_ui_builtin_show' : 'gtm_ui_builtin_hide');
      sw.setAttribute('aria-checked', hidden ? 'false' : 'true');
      sw.title = label;
      sw.setAttribute('aria-label', label);
    }
  }

  function injectBuiltInSwitch() {
    var container = document.querySelector(BUILTIN_SELECTOR);
    if (!container || container.querySelector('#' + SWITCH_ID)) return;

    // In die Kopfzeile, damit er auch bei ausgeblendeter Tabelle erreichbar bleibt.
    var slot = container.querySelector('div.card-actions') ||
               container.querySelector('div.card-title');
    if (!slot) return;

    var sw = document.createElement('button');
    sw.id = SWITCH_ID;
    sw.type = 'button';
    sw.setAttribute('role', 'switch');
    sw.addEventListener('click', makeToggle('hideBuiltInVars', applyBuiltInState));
    slot.appendChild(sw);
    applyBuiltInState();
  }

  function removeBuiltInSwitch() {
    var sw = document.getElementById(SWITCH_ID);
    if (sw) sw.remove();
  }

  /* ------------------------------------------------------ Parametertabellen */

  // GTM rendert dieselbe Tabelle als echte <table> und als div-Geruest, mit
  // identischen Klassen. Zeilen und Zellen deshalb ueber Klassen erkennen,
  // nie ueber Tag-Namen.
  var ROW_CLASS = 'simple-table-row';
  var CELL_CLASS = 'simple-table-row__cell';
  var HEADER_CELL_CLASS = 'simple-table-row__cell--header';
  var REMOVE_CELL_CLASS = 'simple-table-row__cell--remove-icon-cell';

  // Sortierrichtung je Tabelle: 1 = aufsteigend, -1 = absteigend.
  var sortState = new WeakMap();

  // Als Tabelle gilt das Elternelement der Datenzeilen – ein <tbody> oder ein div.
  function findTables() {
    var containers = [];
    [].forEach.call(document.querySelectorAll('.' + ROW_CLASS), function (row) {
      if (row.querySelector('.' + HEADER_CELL_CLASS)) return;   // Kopfzeile, keine Daten
      if (row.classList.contains(SORT_ROW_CLASS)) return;       // unsere eigene Zeile
      var parent = row.parentElement;
      if (parent && containers.indexOf(parent) < 0) containers.push(parent);
    });
    return containers;
  }

  // Die eigene Sortierzeile traegt dieselbe Klasse (fuers Spaltenraster) und muss
  // ausgeschlossen werden, sonst bricht die Sortierung ab.
  function rowsOf(container) {
    return [].filter.call(container.children, function (el) {
      return el.classList.contains(ROW_CLASS) &&
        !el.classList.contains(SORT_ROW_CLASS) &&
        !el.querySelector('.' + HEADER_CELL_CLASS);
    });
  }

  // Zwei Textfeld-Klassen: ctui-text-input in Tabellen mit Variablenknopf,
  // gtm-text-input in denen ohne (Metadata). Sonst identisch aufgebaut.
  var TEXT_CLASSES = ['ctui-text-input', 'gtm-text-input'];

  function isTextField(el) {
    if (!el || el.tagName !== 'INPUT' || el.type !== 'text') return false;
    return TEXT_CLASSES.some(function (name) {
      return el.classList.contains(name);
    });
  }

  function inputsOf(row) {
    return [].filter.call(row.querySelectorAll('input[type="text"]'), isTextField);
  }

  // Datenzellen einer Zeile – ohne die Spalte mit der Entfernen-Schaltflaeche.
  function dataCells(row) {
    return [].filter.call(row.children, function (cell) {
      return cell.classList.contains(CELL_CLASS) && !cell.classList.contains(REMOVE_CELL_CLASS);
    });
  }

  // Nur Tabellen mit genau einem Textfeld je Zelle: Eine Auswahlliste wuerde beim
  // Umsortieren nicht mitwandern und der Datensatz zerfiele unbemerkt.
  function isSortable(table) {
    var first = rowsOf(table)[0];
    if (!first) return false;

    var cells = dataCells(first);
    if (!cells.length) return false;

    for (var i = 0; i < cells.length; i++) {
      var fields = cells[i].querySelectorAll('input, select, textarea');
      if (fields.length !== 1) return false;
      if (!isTextField(fields[0])) return false;
    }
    return true;
  }

  // Die Kopfzeile liegt im Container selbst (div-Geruest) oder eine Ebene
  // hoeher im <thead>, wenn der Container das <tbody> ist.
  function columnNames(container) {
    var scope = container.querySelector('.' + HEADER_CELL_CLASS)
      ? container
      : (container.parentElement || container);
    var heads = [].slice.call(scope.querySelectorAll('.' + HEADER_CELL_CLASS));
    return heads
      .filter(function (cell) {
        return !cell.classList.contains(REMOVE_CELL_CLASS);
      })
      .map(function (cell) {
        return cell.textContent.trim();
      });
  }

  // Gelesen und geschrieben wird ueber die sichtbaren Felder – an
  // ctrl.tableHelper.rows kommt die ISOLATED world nicht heran. Das native
  // input-Event ist Pflicht, sonst schreibt AngularJS die alten Werte zurueck.
  function writeRow(row, values) {
    var inputs = inputsOf(row);
    values.forEach(function (value, index) {
      var input = inputs[index];
      if (!input || input.value === value) return;
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  // Werte aller Zeilen, oder null bei uneinheitlichem Aufbau. Weicht auch nur
  // eine Zeile ab, wird gar nicht angefasst: Eine unsortierte Tabelle ist
  // harmlos, ein halb umgeschriebener Datensatz nicht.
  function readRows(table) {
    var rows = rowsOf(table);
    if (!rows.length) return null;

    var expected = dataCells(rows[0]).length;
    var values = [];
    for (var i = 0; i < rows.length; i++) {
      var fields = inputsOf(rows[i]);
      if (fields.length !== expected) return null;
      values.push(fields.map(function (input) { return input.value; }));
    }
    return values;
  }

  function sortTable(table, column, direction) {
    var values = readRows(table);
    if (!values) {
      console.warn('[GTM Helper] Tabelle uneinheitlich aufgebaut – nicht sortiert.');
      return;
    }

    var collator = new Intl.Collator(detectGtmLanguage(), { numeric: true, sensitivity: 'base' });
    var sorted = values.slice().sort(function (a, b) {
      var left = (a[column] || '').trim();
      var right = (b[column] || '').trim();
      // Leere Zeilen bleiben unten – sonst wandert die typische Leerzeile nach oben.
      if (!left && !right) return 0;
      if (!left) return 1;
      if (!right) return -1;
      return direction * collator.compare(left, right);
    });

    rowsOf(table).forEach(function (row, index) {
      writeRow(row, sorted[index]);
    });
  }

  // Bei echten Tabellen gehoert die Sortierzeile ins <tfoot>: Das <tbody> baut
  // ng-repeat neu auf.
  function hostOf(container) {
    return container.tagName === 'TBODY' ? container.parentElement : container;
  }

  function paintSortButtons(container) {
    var host = hostOf(container);
    if (!host) return;
    var state = sortState.get(container) || {};
    var names = columnNames(container);
    var buttons = host.querySelectorAll('.' + SORT_ROW_CLASS + ' button');
    [].forEach.call(buttons, function (btn, index) {
      var ascending = !(state.column === index && state.direction === 1);
      var name = names[index] || t('gtm_ui_sort_column', { n: index + 1 });
      var label = t(ascending ? 'gtm_ui_sort_asc' : 'gtm_ui_sort_desc', { col: name });
      btn.textContent = ascending ? 'A→Z' : 'Z→A';
      btn.title = label;
      btn.setAttribute('aria-label', label);
    });
  }

  function addSortRow(container) {
    var host = hostOf(container);
    if (!host || host.querySelector('.' + SORT_ROW_CLASS)) return;

    if (!isSortable(container)) return;

    var first = rowsOf(container)[0];
    var cells = dataCells(first);
    var isTable = container.tagName === 'TBODY';
    var cellTag = isTable ? 'td' : 'div';

    var sortRow = document.createElement(isTable ? 'tr' : 'div');
    sortRow.className = ROW_CLASS + ' ' + SORT_ROW_CLASS;

    for (var c = 0; c < cells.length; c++) {
      // Zellklassen aus der Datenzeile uebernehmen, sonst sitzen die Schalter
      // nicht im Spaltenraster.
      var cell = document.createElement(cellTag);
      cell.className = cells[c].className;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn igtm-sort-btn';
      btn.addEventListener('click', makeSortHandler(container, c));
      cell.appendChild(btn);
      sortRow.appendChild(cell);
    }

    // Leere Zelle unter der Spalte mit den Entfernen-Schaltflaechen.
    var allCells = [].filter.call(first.children, function (el) {
      return el.classList.contains(CELL_CLASS);
    });
    if (allCells.length > cells.length) {
      var spacer = document.createElement(cellTag);
      spacer.className = allCells[allCells.length - 1].className;
      sortRow.appendChild(spacer);
    }

    if (isTable) {
      var foot = document.createElement('tfoot');
      foot.appendChild(sortRow);
      host.appendChild(foot);
    } else {
      host.appendChild(sortRow);
    }
    paintSortButtons(container);
  }

  // Das leere <tfoot> muss mit weg, sonst haengt addSortRow() beim
  // Wiedereinschalten ein zweites daneben.
  function removeSortRows() {
    [].forEach.call(document.querySelectorAll('.' + SORT_ROW_CLASS), function (row) {
      var parent = row.parentElement;
      row.remove();
      if (parent && parent.tagName === 'TFOOT' && !parent.children.length) parent.remove();
    });
  }

  function makeSortHandler(container, column) {
    return function (event) {
      event.preventDefault();
      event.stopPropagation();
      var state = sortState.get(container) || {};
      var direction = (state.column === column && state.direction === 1) ? -1 : 1;
      sortState.set(container, { column: column, direction: direction });
      sortTable(container, column, direction);
      paintSortButtons(container);
    };
  }

  /* -------------------------------------------- Zeile darunter einfuegen */

  // GTM erweitert Parametertabellen nur unten. Wo die Reihenfolge die Semantik
  // traegt (RegEx-Tabellen), muss eine freie Zeile an einer bestimmten Stelle
  // von Hand erzeugt werden. Entwurf: docs/2026-08-03-table-insert-row-design.md
  // Ueber die Klassen ist der Knopf nicht zu fassen: Lookup-Tabellen nennen ihn
  // wd-vt-simple-table-add-row, Metadata wd-add-row-button, die Einstellungs-
  // tabellen der Google-Tags nur btn--create vt-st-add – keine gemeinsame.
  // Gemeinsam ist allen der Angular-Handler. Die Klassenvariante bleibt als
  // zweites Netz stehen, falls eine Tabelle den Handler anders benennt.
  var ADD_BUTTON = 'button[data-ng-click*="addRow"], button[class*="add-row"]';
  var INSERT_CHIP_CLASS = 'igtm-insert-row';

  // Der Add-Button liegt ausserhalb der Tabelle – am lebenden Container zwei
  // Ebenen ueber dem <tbody>. Bei mehr als einem Treffer waere nicht zu
  // entscheiden, welcher zur Tabelle gehoert: dann lieber gar nichts anbieten.
  function addButtonFor(container) {
    var node = container;
    for (var hops = 0; node && hops < 10; hops++) {
      var found = node.querySelectorAll(ADD_BUTTON);
      if (found.length === 1) return found[0];
      if (found.length > 1) return null;
      node = node.parentElement;
    }
    return null;
  }

  // Position eines Feldes in seiner Tabelle – nur fuer die erste Datenspalte
  // einer Datenzeile, auf die noch eine weitere folgt. In der letzten Zeile
  // leistet der native Button dasselbe.
  function tablePosition(field) {
    var cell = field.closest ? field.closest('.' + CELL_CLASS) : null;
    if (!cell || cell.classList.contains(REMOVE_CELL_CLASS)) return null;

    var row = cell.parentElement;
    if (!row || !row.classList.contains(ROW_CLASS)) return null;
    if (row.classList.contains(SORT_ROW_CLASS)) return null;
    if (row.querySelector('.' + HEADER_CELL_CLASS)) return null;
    if (dataCells(row)[0] !== cell) return null;

    var container = row.parentElement;
    var rows = rowsOf(container);
    var index = rows.indexOf(row);
    if (index < 0 || index >= rows.length - 1) return null;

    return { container: container, index: index };
  }

  // Erst lesen, dann klicken, dann schreiben. Bricht der Klick ab, steht unten
  // eine leere Zeile und sonst nichts – genau der Zustand, den man ohne diese
  // Funktion von Hand erzeugt. Ein halb verschobener Datensatz kann nicht
  // entstehen.
  function insertRowBelow(container, index) {
    var values = readRows(container);
    if (!values) {
      console.warn('[GTM Helper] Tabelle uneinheitlich aufgebaut – nichts eingefuegt.');
      return false;
    }

    var button = addButtonFor(container);
    if (!button || button.disabled) return false;

    var before = values.length;
    button.click();

    // AngularJS haengt die Zeile im selben Tick an – am lebenden Container
    // geprueft, deshalb kein Warten mit Zeitlimit.
    var rows = rowsOf(container);
    if (rows.length !== before + 1) return false;

    for (var target = before; target > index + 1; target--) {
      writeRow(rows[target], values[target - 1]);
    }
    writeRow(rows[index + 1], values[index].map(function () { return ''; }));
    return true;
  }

  // ng-repeat kann die Felder ausgetauscht haben – der Fokus muss deshalb aktiv
  // zurueck, obwohl preventDefault ihn im alten Element gehalten hat.
  function refocus(container, index) {
    var row = rowsOf(container)[index];
    var input = row && inputsOf(row)[0];
    if (input) input.focus();
  }

  // Schnittstelle zur Chipleiste in gtm-var-edit.js: liefert das Bedienelement
  // oder null. Die Tabellenlogik bleibt hier, die Leiste gehoert dorthin.
  function insertChipFor(field) {
    if (!isOn('sort')) return null;

    var pos = tablePosition(field);
    if (!pos || !isSortable(pos.container)) return null;

    var button = addButtonFor(pos.container);
    if (!button || button.disabled) return null;

    var chip = document.createElement('button');
    chip.type = 'button';
    // .btn ist die Schaltflaeche von GTM – dieselbe Grundlage wie bei den
    // Sortierknoepfen, damit die Aktion nicht wie ein Chip aussieht.
    chip.className = 'btn ' + INSERT_CHIP_CLASS;
    chip.textContent = t('gtm_ui_insert_row');
    chip.title = t('gtm_ui_insert_row_title');
    chip.setAttribute('aria-label', chip.title);

    // mousedown wie bei den Variablen-Chips: Das blur raeumt die Leiste sonst
    // weg, bevor der Klick ankommt.
    chip.addEventListener('mousedown', function (event) {
      event.preventDefault();
      event.stopPropagation();
      // Zwischen Aufbau und Klick kann AngularJS die Tabelle neu gebaut haben.
      var now = tablePosition(field);
      if (!now) return;
      if (insertRowBelow(now.container, now.index)) refocus(now.container, now.index);
    });

    return chip;
  }

  window.igtmTableInsert = { chipFor: insertChipFor };

  /* ---------------------------------------------------------------- Anbindung */

  // Abgeschaltete Funktionen raeumen auch ab, was im DOM steht – sonst wirkt der
  // Schalter im Popup erst nach einem Neuladen.
  function refresh() {
    if (isOn('pin')) injectPin();
    else { removePins(); applyPinState(); }

    if (isOn('builtIn')) injectBuiltInSwitch();
    else { removeBuiltInSwitch(); applyBuiltInState(); }

    if (isOn('sort')) findTables().forEach(addSortRow);
    else removeSortRows();
  }

  // AngularJS baut Listen bei jedem Wechsel neu auf. Ein Frame Entprellung, damit
  // nicht jede Einzelmutation der SPA eine eigene Abfrage ausloest.
  var pending = false;
  function scheduleRefresh() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () {
      pending = false;
      refresh();
    });
  }

  // Ist keine Funktion an, wird gar nicht erst beobachtet.
  var observer = new MutationObserver(scheduleRefresh);
  var observing = false;

  function syncObserver() {
    var needed = isOn('pin') || isOn('builtIn') || isOn('sort');
    if (needed === observing) return;
    if (needed) observer.observe(document.body, { childList: true, subtree: true });
    else observer.disconnect();
    observing = needed;
  }

  applyPinState();
  applyBuiltInState();
  refresh();
  syncObserver();

  igtmGtmUiFeatures.onChange(function () {
    refresh();
    syncObserver();
  });
})();
