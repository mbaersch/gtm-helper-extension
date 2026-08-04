/*
 * Zustand der Listen (Tags, Trigger, Variablen) ueber einen Bereichswechsel
 * hinweg halten: Sortierung und Suchbegriff. GTM setzt beides sonst jedes Mal
 * zurueck.
 *
 * Abschaltbar ueber gtm-ui-features.js ('listSort', 'listSearch').
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

  var FIELD = 'input.blg-input';
  var HULL = 'ctui-menu-filter, ctui-menu-filter-ng';
  var TOGGLE = 'i.icon[role="button"]';
  var ENABLED = 'enabled';
  var MARK = 'igtm-restored';
  var TITLE_BACKUP = 'data-igtm-title';

  // Der Umschalter darf pro Wiederherstellung nur einmal gedrueckt werden,
  // sonst klappt jeder Poll-Durchlauf das Feld erneut auf und zu.
  var toggled = false;

  // sessionStorage statt localStorage: ueberlebt das Neuladen, ist pro Tab
  // getrennt und mit dem Tab weg. Ein Begriff, der Tage ueberdauert, filtert die
  // Liste beim naechsten Oeffnen still und wirkt wie ein Fehler.
  var SEARCH_KEY = 'igtm_list_search';

  function currentArea() {
    var match = /\/(tags|triggers|variables)(?:[?#]|$)/.exec(location.hash);
    return match ? match[1] : null;
  }

  function listOf(area) {
    return AREAS[area] ? document.querySelector(AREAS[area]) : null;
  }

  function currentContainer() {
    var match = /\/containers\/(\d+)\//.exec(location.hash);
    return match ? match[1] : null;
  }

  // Auf der Variablenseite gibt es zwei Felder — integrierte und
  // benutzerdefinierte Variablen. Deshalb nie global suchen, immer im Host.
  function searchFieldIn(host) {
    return host.querySelector(FIELD);
  }

  // Beschriftung folgt der Sprache der GTM-Oberflaeche, nicht der im Popup
  // gewaehlten. Siehe detectGtmLanguage() in translations.js.
  function t(key) {
    return getTranslation(detectGtmLanguage(), key);
  }

  function withSource(text) {
    return text + '\n' + t('gtm_ui_source');
  }

  // Fehlender Schluessel heisst: Die Funktion wurde nie angefasst, der Hinweis
  // erreicht jemanden, der sie nicht kennt. Steht dort ausdruecklich false, hat
  // sie jemand abgelehnt — dann Ruhe.
  function searchNeverSet() {
    var state = igtmGtmUiFeatures.read();
    if (state.enabled === false) return false;
    return (state.features || {}).listSearch === undefined;
  }

  // Ueberschreibt nie ein vorhandenes title — GTM setzt dort selbst nichts,
  // aber eine andere Extension koennte es.
  function hintSearch(area) {
    var host = listOf(area);
    if (!host) return false;

    var field = searchFieldIn(host);
    if (!field) return false;

    if (!field.hasAttribute('title')) field.setAttribute('title', t('gtm_ui_search_hint'));
    return true;
  }

  function mark(field) {
    if (field.classList.contains(MARK)) return;
    // Ein vorhandenes title sichern, sonst ist es nach dem Entfernen weg.
    if (field.hasAttribute('title')) {
      field.setAttribute(TITLE_BACKUP, field.getAttribute('title'));
    }
    field.classList.add(MARK);
    field.setAttribute('title', withSource(t('gtm_ui_search_restored')));
  }

  function unmark(field) {
    if (!field.classList.contains(MARK)) return;
    field.classList.remove(MARK);
    if (field.hasAttribute(TITLE_BACKUP)) {
      field.setAttribute('title', field.getAttribute(TITLE_BACKUP));
      field.removeAttribute(TITLE_BACKUP);
    } else {
      field.removeAttribute('title');
    }
  }

  // Ein Begriff aus Container A hat in Container B nichts zu suchen — der
  // Wechsel dorthin ist ein hashchange, kein Neuladen.
  function readSearch() {
    var container = currentContainer();
    try {
      var saved = JSON.parse(sessionStorage.getItem(SEARCH_KEY));
      if (saved && saved.container === container) return saved;
    } catch (e) {
      // Gesperrter Speicher: der Begriff gilt dann nur bis zum Neuladen.
    }
    return { container: container, tags: '', triggers: '', variables: '' };
  }

  function rememberSearch(area, value) {
    var state = readSearch();
    state[area] = value;
    try {
      sessionStorage.setItem(SEARCH_KEY, JSON.stringify(state));
    } catch (e) {}
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

  // true = fertig, false = noch warten. Zwei Schritte, die beide noetig sind:
  // Der Umschalter macht das Feld sichtbar, die Ereignisse filtern. Ohne den
  // Umschalter filtert es unsichtbar, ohne die Ereignisse passiert nichts.
  function restoreSearch(area) {
    var want = readSearch()[area];
    if (!want) return true;

    var host = listOf(area);
    if (!host) return false;

    var field = searchFieldIn(host);
    if (!field) return false;
    if (field.value === want) return true;

    var hull = field.closest(HULL);
    if (hull && !hull.classList.contains(ENABLED)) {
      // Erst ausklappen, im naechsten Durchlauf fuellen. Ein Klick bei bereits
      // ausgeklapptem Feld wuerde es leeren, deshalb nur solange ENABLED fehlt.
      if (toggled) return false;
      var toggle = hull.querySelector(TOGGLE);
      if (!toggle) return true;
      toggled = true;
      toggle.click();
      return false;
    }

    fillSearch(area, want);
    return true;
  }

  // input fuer die AngularJS-Bindung von Triggern und Variablen, keyup fuer die
  // Angular-2-Tag-Liste — dort haengt genau ein Listener, und der auf keyup.
  function fillSearch(area, value) {
    var host = listOf(area);
    var field = host && searchFieldIn(host);
    if (!field) return;

    field.focus();
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'a', code: 'KeyA' }));
    mark(field);
  }

  function startRestore(area) {
    stopPolling();
    if (!area) return;

    var wantSort = igtmGtmUiFeatures.isOn('listSort') && !!stored(area);
    var wantSearch = igtmGtmUiFeatures.isOn('listSearch') && !!readSearch()[area];
    var wantHint = searchNeverSet();
    if (!wantSort && !wantSearch && !wantHint) return;

    var searchDone = !wantSearch;
    var sortDone = !wantSort;
    var hintDone = !wantHint;
    var deadline = Date.now() + TIMEOUT_MS;
    toggled = false;

    poll = setInterval(function () {
      // Erst filtern, dann sortieren: feste Reihenfolge statt zweier Poller,
      // die sich ins Gehege kommen.
      if (!searchDone) searchDone = restoreSearch(area);
      if (searchDone && !sortDone) sortDone = restore(area);
      if (!hintDone) hintDone = hintSearch(area);
      if ((searchDone && sortDone && hintDone) || Date.now() > deadline) stopPolling();
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

  // Das Leeren ueber das Icon im Feld loest kein input-Ereignis aus. Ohne
  // diesen Zweig kaeme ein geloeschter Begriff beim naechsten Wechsel zurueck
  // und liesse sich nie wieder loswerden.
  document.addEventListener('click', function (event) {
    if (!igtmGtmUiFeatures.isOn('listSearch')) return;
    // Laeuft ein Poller, stammt der Klick von uns.
    if (poll) return;

    var toggle = event.target.closest ? event.target.closest(TOGGLE) : null;
    if (!toggle || !toggle.closest(HULL)) return;

    var area = currentArea();
    var host = area && listOf(area);
    if (!host || !host.contains(toggle)) return;

    // Der Wert steht erst nach dem Zug der Komponente fest.
    setTimeout(function () {
      var field = searchFieldIn(host);
      if (field) rememberSearch(area, field.value);
    }, 50);
  });

  document.addEventListener('input', function (event) {
    if (!igtmGtmUiFeatures.isOn('listSearch')) return;

    var field = event.target;
    if (!field.classList || !field.classList.contains('blg-input')) return;

    var area = currentArea();
    var host = area && listOf(area);
    if (!host || searchFieldIn(host) !== field) return;

    unmark(field);
    rememberSearch(area, field.value);
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
