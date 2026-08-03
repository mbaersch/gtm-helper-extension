/*
 * Sortierung der Listen (Tags, Trigger, Variablen) merken und nach einem
 * Bereichswechsel wiederherstellen. GTM setzt sie sonst jedes Mal auf Name
 * aufsteigend zurueck.
 *
 * Abschaltbar ueber gtm-ui-features.js ('listSort').
 */

(function () {
  'use strict';

  // Zwei Bauarten: In der Tag-Liste traegt das <th> die Klasse selbst, bei
  // Triggern und Variablen ein <span> darin. Zustand und Klickziel sind beide
  // Male dasselbe Element, deshalb genuegt die Klasse.
  var HEAD = '.sortable';
  var ACTIVE = 'active-sort';
  var REVERSED = 'sort-reversed';

  var AREAS = {
    tags: 'gtm-tag-list-table',
    triggers: 'div[data-items="ctrl.triggerList"]',
    variables: 'div[data-items="ctrl.variableList"]'
  };

  // Bis die Liste des neuen Bereichs steht, vergehen 50–450 ms (gemessen), und
  // solange steht teils noch die alte im DOM. Deshalb auf den Selektor des
  // Bereichs warten statt auf "irgendeine sortierbare Tabelle".
  var POLL_MS = 50;
  var TIMEOUT_MS = 3000;

  function currentArea() {
    var match = /\/(tags|triggers|variables)(?:[?#]|$)/.exec(location.hash);
    return match ? match[1] : null;
  }

  function listOf(area) {
    return AREAS[area] ? document.querySelector(AREAS[area]) : null;
  }

  function headsIn(host) {
    return [].slice.call(host.querySelectorAll(HEAD));
  }

  // data-gtm-sort-column-by sitzt am <th> und ist sprachunabhaengig ('data.name',
  // 'statMetadata.modifiedTime'). Die Tag-Liste hat es nicht – dort bleibt nur
  // die Position, die zusammen mit der Spaltenzahl gespeichert wird.
  function columnKey(head, index) {
    var cell = head.closest ? head.closest('th') : null;
    var key = cell && cell.getAttribute('data-gtm-sort-column-by');
    return key || ('#' + index);
  }

  function readSort(host) {
    var heads = headsIn(host);
    for (var i = 0; i < heads.length; i++) {
      if (!heads[i].classList.contains(ACTIVE)) continue;
      return {
        key: columnKey(heads[i], i),
        cols: heads.length,
        desc: heads[i].classList.contains(REVERSED)
      };
    }
    return null;
  }

  function stored(area) {
    var state = igtmGtmUiFeatures.read();
    return (state.listSort && state.listSort[area]) || null;
  }

  function store(area, sort) {
    var state = igtmGtmUiFeatures.read();
    if (!state.listSort) state.listSort = {};
    state.listSort[area] = sort;
    igtmGtmUiFeatures.write(state);
  }

  /* ----------------------------------------------------------- Wiederherstellen */

  var poll = null;

  function stopPolling() {
    if (poll) clearInterval(poll);
    poll = null;
  }

  // true = fertig (egal ob geklickt oder bewusst nicht), false = noch warten.
  function restore(area) {
    var want = stored(area);
    if (!want) return true;

    var host = listOf(area);
    if (!host) return false;

    var heads = headsIn(host);
    if (!heads.length) return false;

    // Ohne Schluessel zaehlt die Position – dann muss die Spaltenzahl stimmen,
    // sonst landet die Sortierung auf einer anderen Spalte als gemeint.
    if (want.key.charAt(0) === '#' && heads.length !== want.cols) return true;

    var target = -1;
    for (var i = 0; i < heads.length; i++) {
      if (columnKey(heads[i], i) === want.key) { target = i; break; }
    }
    if (target < 0) return true;

    var now = readSort(host);
    if (now && now.key === want.key && now.desc === want.desc) return true;

    // Ein Klick auf eine fremde Spalte landet immer aufsteigend, jeder weitere
    // schaltet um (gemessen). Fuer jedes Ziel also hoechstens zwei Klicks.
    // Zwischen den Klicks neu greifen: AngularJS baut die Kopfzeile neu auf.
    heads[target].click();
    if (want.desc) {
      var host2 = listOf(area);
      var again = host2 && headsIn(host2)[target];
      if (again) again.click();
    }
    return true;
  }

  function startRestore(area) {
    stopPolling();
    if (!igtmGtmUiFeatures.isOn('listSort')) return;
    if (!area || !stored(area)) return;

    var deadline = Date.now() + TIMEOUT_MS;
    poll = setInterval(function () {
      if (restore(area) || Date.now() > deadline) stopPolling();
    }, POLL_MS);
  }

  /* ------------------------------------------------------------------ Anbindung */

  // Bubble-Phase am document: Der ng-click am Element ist dann durch und der
  // Zustand steht schon in den Klassen (synchron, gemessen).
  document.addEventListener('click', function (event) {
    if (!igtmGtmUiFeatures.isOn('listSort')) return;

    var head = event.target.closest ? event.target.closest(HEAD) : null;
    if (!head) return;

    var area = currentArea();
    var host = area && listOf(area);
    if (!host || !host.contains(head)) return;

    // Der Anwender hat selbst sortiert – eine laufende Wiederherstellung waere
    // ab jetzt ein Ueberschreiben seiner Entscheidung.
    stopPolling();

    var sort = readSort(host);
    if (sort) store(area, sort);
  });

  window.addEventListener('hashchange', function () {
    startRestore(currentArea());
  });

  // Abschalten muss eine laufende Wiederherstellung sofort stoppen. Die
  // gespeicherten Sortierungen bleiben liegen und gelten wieder, sobald die
  // Funktion zurueckkommt – wie beim Pin.
  igtmGtmUiFeatures.onChange(function () {
    if (!igtmGtmUiFeatures.isOn('listSort')) stopPolling();
  });

  startRestore(currentArea());
})();
