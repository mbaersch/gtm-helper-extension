/*
 * GTM UI-Komfort: fixierbarer Titelbalken, Sortierung von Parametertabellen und
 * ausblendbare Liste der integrierten Variablen
 *
 * Fixierter Titelbalken und ausgeblendete Variablenliste sind Geschmackssache und
 * deshalb an Ort und Stelle schaltbar: der Pin in der Suchleiste, der Schalter in
 * der Kopfzeile der Variablenkarte. Beide Zustaende liegen unter einem Schluessel
 * im localStorage von tagmanager.google.com, analog zu igtm_settings auf den
 * besuchten Seiten.
 *
 * Ob es diese Bedienelemente ueberhaupt gibt, entscheidet eine Ebene darueber: die
 * Karte "GTM-Oberflaeche" im Popup. Sie schaltet jede Funktion einzeln ab, damit
 * sich nichts mit anderen GTM-Extensions doppelt. Abgeschaltet heisst hier
 * wirklich weg — kein Pin, keine Sortierzeile, keine Wirkung; siehe
 * gtm-ui-features.js.
 *
 * Die Sortierung hat keinen Schalter in der Oberflaeche: Sie erscheint nur an
 * Tabellen, die sich verlustfrei sortieren lassen, und tut nichts, bis jemand sie
 * anklickt.
 *
 * Das Script laeuft in der ISOLATED world. DOM und localStorage der Seite sind
 * erreichbar, ohne dass sich unsere Variablen mit dem AngularJS der GTM-
 * Oberflaeche mischen. An dessen $scope kommen wir umgekehrt aber auch nicht
 * heran – Details zur Sortierung siehe bei sortTable().
 *
 * Sprache: Beschriftungen, die IN einer fremden Seite landen, folgen deren
 * Sprache, nicht der im Popup gewaehlten. Die liegt im localStorage der
 * Extension und ist von hier aus nicht erreichbar, und ein deutscher Tooltip
 * neben englischen GTM-Schaltflaechen waere ohnehin verkehrt. Die Texte selbst
 * stehen wie alle anderen in translations.js.
 */

(function () {
  'use strict';

  var CLASS_ON = 'igtm-sticky-bar';
  var CLASS_HIDE_BUILTIN = 'igtm-hide-builtin';
  var PIN_CLASS = 'igtm-pin-bar';
  var SWITCH_ID = 'igtm-builtin-switch';
  var BUILTIN_SELECTOR = 'div[data-items="ctrl.builtInVariables"]';

  // Die Listen mit fixierbarem Titelbalken – jede bekommt ihren eigenen Pin,
  // alle schalten denselben gespeicherten Zustand. Einzeln benannt statt ueber
  // einen Sammelselektor, weil die Variablenseite mit ctrl.builtInVariables eine
  // zweite Karte enthaelt, die sonst einen zweiten Balken an dieselbe Kante
  // haengen wuerde.
  var LIST_SELECTORS = [
    'gtm-tag-list-table',
    'div[data-items="ctrl.triggerList"]',
    'div[data-items="ctrl.variableList"]'
  ];
  var SORT_ROW_CLASS = 'igtm-sort-row';

  // Duenne Huelle um getTranslation() aus translations.js, ergaenzt um Platzhalter.
  // Die Sprache ermittelt detectGtmLanguage() dort ebenfalls – erst bei Bedarf,
  // damit der Seitencode zum Zeitpunkt der Auswertung vollstaendig ist.
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

  // Gespeicherter Zustand und die Frage, ob eine Funktion ueberhaupt laeuft –
  // beides kommt aus gtm-ui-features.js, das vor diesem Script geladen wird.
  var readState = igtmGtmUiFeatures.read;
  var writeState = igtmGtmUiFeatures.write;
  var isOn = igtmGtmUiFeatures.isOn;

  function applyPinState() {
    var active = isOn('pin') && readState().stickyBar === true;
    document.documentElement.classList.toggle(CLASS_ON, active);
    var label = t(active ? 'gtm_ui_pin_off' : 'gtm_ui_pin_on');
    [].forEach.call(document.querySelectorAll('.' + PIN_CLASS), function (btn) {
      btn.title = label;
      // Der Button traegt nur ein Icon – ohne aria-label bliebe er unbeschriftet.
      btn.setAttribute('aria-label', label);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  // Klick-Handler fuer einen gespeicherten Schalter. Die Elemente von GTM tragen
  // eigene AngularJS-Handler – der Klick darf deshalb nicht weiterlaufen.
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
      // Klasse statt ID: Der Pin sitzt in jeder der drei Listen, IDs waeren
      // dann mehrfach vergeben.
      btn.className = PIN_CLASS;
      btn.type = 'button';
      // Inline-SVG statt Emoji: ein Emoji rendert je nach Betriebssystem anders
      // und bringt eine eigene Farbe mit. Das Motiv zeigt einen fixierten Balken
      // ueber mitscrollenden Listenzeilen; eingefaerbt wird ueber currentColor.
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
      // Eingeschaltet heisst sichtbar – die Voreinstellung.
      sw.setAttribute('aria-checked', hidden ? 'false' : 'true');
      sw.title = label;
      sw.setAttribute('aria-label', label);
    }
  }

  function injectBuiltInSwitch() {
    var container = document.querySelector(BUILTIN_SELECTOR);
    if (!container || container.querySelector('#' + SWITCH_ID)) return;

    // Der Schalter gehoert in die Kopfzeile der Karte, damit er auch dann noch
    // erreichbar ist, wenn die Tabelle darunter ausgeblendet ist.
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

  /*
   * GTM rendert dieselbe Tabelle in zwei Gattungen: als echte <table> (die
   * Suchtabelle in Vendor-Templates) und als reines div-Geruest (etwa die
   * Ereignisparameter in gtm-inherited-params-table). Die Klassennamen sind in
   * beiden Faellen identisch – nur tr/td werden durch div ersetzt. Zeilen und
   * Zellen werden deshalb ueber Klassen erkannt, nicht ueber Tag-Namen; damit
   * braucht es keine Liste von Tabellen-Selektoren, die bei der naechsten
   * GTM-Komponente ohnehin unvollstaendig waere.
   */
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

  // Datenzeilen des Containers. Die eigene Sortierzeile traegt dieselbe Klasse –
  // sie braucht sie fuers Spaltenraster – und muss hier ausgeschlossen werden,
  // sonst zaehlt sie als Zeile ohne Textfelder und die Sortierung bricht ab.
  function rowsOf(container) {
    return [].filter.call(container.children, function (el) {
      return el.classList.contains(ROW_CLASS) &&
        !el.classList.contains(SORT_ROW_CLASS) &&
        !el.querySelector('.' + HEADER_CELL_CLASS);
    });
  }

  function inputsOf(row) {
    return [].slice.call(row.querySelectorAll('input[type="text"].ctui-text-input'));
  }

  // Datenzellen einer Zeile – ohne die Spalte mit der Entfernen-Schaltflaeche.
  function dataCells(row) {
    return [].filter.call(row.children, function (cell) {
      return cell.classList.contains(CELL_CLASS) && !cell.classList.contains(REMOVE_CELL_CLASS);
    });
  }

  /*
   * Sortierbar ist eine Tabelle nur, wenn jede Datenzelle genau ein Textfeld
   * enthaelt und sonst kein Eingabeelement. Sortiert wird ueber die Textfelder;
   * alles andere – eine Auswahlliste etwa – wuerde beim Umsortieren nicht
   * mitwandern und in seiner Zeile stehen bleiben. Der Datensatz zerfiele, ohne
   * dass man es der Tabelle ansieht. Geprueft wird die erste Zeile, weil alle
   * Zeilen aus demselben ng-repeat-Template stammen; vor dem Schreiben
   * kontrolliert sortTable() zusaetzlich jede einzelne Zeile.
   */
  function isSortable(table) {
    var first = rowsOf(table)[0];
    if (!first) return false;

    var cells = dataCells(first);
    if (!cells.length) return false;

    for (var i = 0; i < cells.length; i++) {
      var fields = cells[i].querySelectorAll('input, select, textarea');
      if (fields.length !== 1) return false;
      if (fields[0].type !== 'text' || !fields[0].classList.contains('ctui-text-input')) return false;
    }
    return true;
  }

  /*
   * Die Kopfzeile liegt je nach Gattung im Container selbst (div-Geruest) oder
   * eine Ebene hoeher im <thead>, waehrend der Container das <tbody> ist.
   */
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

  /*
   * An ctrl.tableHelper.rows kommen wir aus der ISOLATED world nicht heran, also
   * wird ueber die sichtbaren Felder sortiert: Werte lesen, sortieren, in die
   * unveraenderten Zeilen zurueckschreiben. Das native input-Event ist dabei
   * entscheidend – ohne es bekaeme ng-model die Aenderung nicht mit und AngularJS
   * wuerde die alten Werte zurueckschreiben. Die Zeilen selbst bleiben stehen
   * (ng-repeat haelt sie ueber row.id), es wandert nur ihr Inhalt; Eingabe und
   * Ausgabe bleiben zusammen, weil pro Zeile das komplette Werte-Array umzieht.
   */
  function sortTable(table, column, direction) {
    var rows = rowsOf(table);
    if (!rows.length) return;

    // Letzte Sicherung unmittelbar vor dem Schreiben: Weicht auch nur eine Zeile
    // vom erwarteten Aufbau ab, wird gar nicht sortiert. Eine unsortierte Tabelle
    // ist harmlos, ein halb umsortierter Datensatz nicht.
    var expected = dataCells(rows[0]).length;
    var values = [];
    for (var i = 0; i < rows.length; i++) {
      var fields = inputsOf(rows[i]);
      if (fields.length !== expected) {
        console.warn('[GTM Helper] Tabelle uneinheitlich aufgebaut – nicht sortiert.');
        return;
      }
      values.push(fields.map(function (input) { return input.value; }));
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

    rows.forEach(function (row, index) {
      var inputs = inputsOf(row);
      sorted[index].forEach(function (value, colIndex) {
        var input = inputs[colIndex];
        if (!input || input.value === value) return;
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
  }

  // Bei einer echten Tabelle ist der Container das <tbody>; die Sortierzeile
  // gehoert dann in ein <tfoot>, das ng-repeat im Gegensatz zum <tbody> nicht
  // anfasst. Beim div-Geruest ist der Container selbst der richtige Ort.
  function hostOf(container) {
    return container.tagName === 'TBODY' ? container.parentElement : container;
  }

  // Beschriftung und Tooltip beschreiben immer, was der naechste Klick tut.
  function paintSortButtons(container) {
    var host = hostOf(container);
    if (!host) return;
    var state = sortState.get(container) || {};
    var names = columnNames(container);
    var buttons = host.querySelectorAll('.' + SORT_ROW_CLASS + ' button');
    [].forEach.call(buttons, function (btn, index) {
      var ascending = !(state.column === index && state.direction === 1);
      // Nicht jede Tabelle hat Spaltenueberschriften – dann die Nummer nennen.
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

    // Ohne Eingabefelder ist die Tabelle schreibgeschuetzt, mit fremden
    // Eingabeelementen nicht verlustfrei sortierbar – in beiden Faellen kein Schalter.
    if (!isSortable(container)) return;

    var first = rowsOf(container)[0];
    var cells = dataCells(first);
    var isTable = container.tagName === 'TBODY';
    var cellTag = isTable ? 'td' : 'div';

    var sortRow = document.createElement(isTable ? 'tr' : 'div');
    sortRow.className = ROW_CLASS + ' ' + SORT_ROW_CLASS;

    for (var c = 0; c < cells.length; c++) {
      // Die Zellklassen stammen aus der Datenzeile: nur so sitzen die Schalter im
      // Spaltenraster, statt an den rechten Rand zu rutschen.
      var cell = document.createElement(cellTag);
      cell.className = cells[c].className;
      var btn = document.createElement('button');
      btn.type = 'button';
      // btn ist die Schaltflaechenklasse der GTM-Oberflaeche – kein eigenes Styling noetig.
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

  // Mit der Sortierzeile geht das <tfoot> mit, das sie bei echten Tabellen traegt:
  // Ein leeres tfoot bliebe sonst stehen, und beim Wiedereinschalten haenge
  // addSortRow() ein zweites daneben.
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

  /* ---------------------------------------------------------------- Anbindung */

  // Abgeschaltete Funktionen werden nicht nur nicht mehr eingehaengt, sondern
  // raeumen auch ab, was von ihnen im DOM steht: Der Schalter im Popup wirkt
  // sofort, ohne dass die Seite neu geladen werden muss.
  function refresh() {
    if (isOn('pin')) injectPin();
    else { removePins(); applyPinState(); }

    if (isOn('builtIn')) injectBuiltInSwitch();
    else { removeBuiltInSwitch(); applyBuiltInState(); }

    if (isOn('sort')) findTables().forEach(addSortRow);
    else removeSortRows();
  }

  // AngularJS baut Listen und Dialoge bei jedem Wechsel neu auf; unsere Elemente
  // muessen dann nachgezogen werden. Ein Frame Entprellung genuegt, damit die
  // vielen Einzelmutationen der SPA nicht jeweils eine eigene Abfrage ausloesen.
  var pending = false;
  function scheduleRefresh() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () {
      pending = false;
      refresh();
    });
  }

  // Ist keine der drei Funktionen an, gibt es auch nichts nachzuziehen – dann
  // wird gar nicht erst beobachtet. Wer alles abschaltet, soll die Extension in
  // der Oberflaeche auch wirklich los sein.
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
