#!/usr/bin/env node

/**
 * learn-cmp.mjs — interaktiver Rekorder fuer CMP-Consent-Traeger.
 *
 * Abkoemmling von learn.js aus C:\Users\mbaer\Documents\Dev\tracking-auditor.
 * Die Browser-UI (scripts/browser-ui.mjs) ist eine unveraenderte Kopie von dort.
 *
 * Unterschied zum Original: learn.js sammelt NUR Selektoren fuer die Banner-Bedienung.
 * Dieses Skript nimmt zusaetzlich auf, was der Klick an Cookies / localStorage /
 * sessionStorage hinterlaesst — das ist der Consent-TRAEGER, den popup.js loeschen muss.
 * Beides faellt in einem Durchlauf an, weil beides denselben Banner-Klick braucht.
 *
 * Fuer Faelle, die der automatische Harvester nicht schafft: Shadow DOM, Banner ohne
 * cookie-artige Klassennamen, Klick-Divs statt Buttons, Bot-Schutz.
 *
 * Aufruf:
 *   node scripts/learn-cmp.mjs --url https://example.com --cmp "Tool-Name"
 *
 * Ergebnis: Anhang an data/findings.json (consent_carrier fuer popup.js + selectors
 * im cmp-library.json-Schema als Staging fuer den Auditor).
 */

import { chromium } from 'playwright';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  showMessage, showClickPrompt, showSelectorResult,
  showTextInput, showConfirm,
} from './browser-ui.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const FINDINGS = resolve(ROOT, 'data/findings.json');

const args = process.argv.slice(2);
const arg = n => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : null; };
const url = arg('url');
const cmpName = arg('cmp');
if (!url) {
  console.error('Aufruf: node scripts/learn-cmp.mjs --url <url> [--cmp "<name>"]');
  process.exit(1);
}

// --- Zustands-Aufnahme -------------------------------------------------------
const readStorage = page => page.evaluate(`(() => ({
  ls: Object.keys(localStorage).map(k => [k, (localStorage.getItem(k)||'').slice(0,80)]),
  ss: Object.keys(sessionStorage).map(k => [k, (sessionStorage.getItem(k)||'').slice(0,80)]),
}))()`);

async function snapshot(ctx, page) {
  const cookies = await ctx.cookies();
  const st = await readStorage(page).catch(() => ({ ls: [], ss: [] }));
  return {
    cookies: cookies.map(c => ({ name: c.name, domain: c.domain, path: c.path, value: (c.value || '').slice(0, 80) })),
    ls: st.ls, ss: st.ss,
  };
}

const names = a => a.map(x => Array.isArray(x) ? x[0] : x.name);
function diff(before, after) {
  const b = { c: names(before.cookies), l: names(before.ls), s: names(before.ss) };
  return {
    cookies: after.cookies.filter(c => !b.c.includes(c.name)),
    ls: after.ls.filter(([k]) => !b.l.includes(k)),
    ss: after.ss.filter(([k]) => !b.s.includes(k)),
  };
}

// --- Banner-Erkennung: bewusst TEXT-basiert ---------------------------------
// Der automatische Harvester sucht Container mit cookie/consent/gdpr in id/class und
// scheitert daran regelmaessig — Real Cookie Banner z.B. nennt seinen Container
// "bnnr-body-rightSide-<uuid>" und benutzt klickbare DIVs statt Buttons. Hier wird
// deshalb nur gefragt: steht irgendwo sichtbar ein Consent-Text?
// Ist das Banner (wieder) da? Gemessen am ACCEPT-SELEKTOR, den der User eingelernt hat — nicht an
// irgendeinem Consent-Text auf der Seite.
//
// Die Textsuche hier vorher (/akzeptier|zustimm|einverstanden|.../) war zu grob und faellt auf jede
// Seite herein, die diese Woerter woanders fuehrt: a1-abendschein.de hat eine Kontaktformular-Checkbox
// "Ich bin mit einer Kontaktaufnahme ... einverstanden" — damit waere JEDER Key als Traeger
// durchgegangen. Genau dieser Fehler hat auf fairtrade-kampagnen.de alle 5 Keys als Traeger gemeldet
// (journal.md, Fallstrick 11). Der Accept-Button ist das Banner; ist er weg, ist das Banner weg.
const bannerVisible = sel => `(() => {
  const vis = e => { const cs=getComputedStyle(e), r=e.getBoundingClientRect();
    return cs.display!=='none' && cs.visibility!=='hidden' && cs.opacity!=='0' && r.height>0 && r.width>0; };
  try { return [...document.querySelectorAll(${JSON.stringify(sel)})].some(vis); }
  catch (e) { return false; }
})()`;

const log = (...a) => console.log(...a);

(async () => {
  const browser = await chromium.launch({ headless: false });
  const ctx = await browser.newContext({ locale: 'de-DE', viewport: { width: 1400, height: 950 } });
  const page = await ctx.newPage();

  const rec = { name: cmpName || '(noch offen)', test_url: url, status: 'todo',
                checked_at: new Date().toISOString().slice(0, 10), notes: [], learned_manually: true };

  // Zwischenstand sofort auf Platte, statt erst im finally am Ende.
  //
  // Grund: Das finally lief bei zwei Laeufen (BST DSGVO, CM Cookie Manager) nie — die Prozesse hingen
  // am Reject-Prompt und wurden mit Stop-Process -Force gekillt, und ein hart gekillter Prozess fuehrt
  // kein finally mehr aus. Traeger und Selektor standen da laengst im Log, waren aber nirgends
  // gespeichert. Aufgefallen nur, weil der User nach den Selektoren fragte.
  const speichern = () => {
    try {
      const f = existsSync(FINDINGS) ? JSON.parse(readFileSync(FINDINGS, 'utf8')) : { meta: {}, findings: [] };
      f.findings = f.findings.filter(x => !(x.name === rec.name && x.test_url === rec.test_url));
      f.findings.push(rec);
      writeFileSync(FINDINGS, JSON.stringify(f, null, 2));
    } catch (e) { log('  [warn] Zwischenspeichern fehlgeschlagen: ' + (e.message || e)); }
  };

  try {
    log(`\n→ ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const before = await snapshot(ctx, page);
    log(`  Vorher: ${before.cookies.length} Cookies, ${before.ls.length} localStorage, ${before.ss.length} sessionStorage`);

    // 1. Accept einlernen
    // Hier stand eine showMessage("Gleich bitte den ZUSTIMMEN-Button klicken", timeout 4000).
    // Raus, auf Nachfrage des Users — sie war nicht nur ueberfluessig (die Klick-Karte sagt dasselbe,
    // und der Snapshot oben ist zu diesem Zeitpunkt laengst gemacht), sondern schaedlich: sie
    // verlaengert das Fenster zwischen Snapshot und Klick, und alles, was die Seite darin von selbst
    // setzt (verzoegerte Analytics, nachgeladene Skripte), erscheint im Diff als Folge des Zustimmens.
    let accept = await showClickPrompt(page, 'Zustimmen');

    if (!accept || !accept.selector) {
      // Klick kam nicht an -> Shadow DOM oder exotisches Widget: Selektor von Hand
      await showMessage(page, 'Der Klick war nicht auswertbar — vermutlich Shadow DOM. '
        + 'Bitte den Selektor in den DevTools heraussuchen und eingeben.',
        { title: 'Shadow DOM?', timeout: 6000 });
      const sel = await showTextInput(page, 'Zustimmen-Selektor');
      accept = { selector: sel, text: null };
      rec.notes.push('Accept-Selektor manuell eingegeben (Klick nicht auswertbar — Shadow DOM?).');
      rec.shadowDom = true;
      await page.click(sel).catch(e => log('  Klick fehlgeschlagen: ' + e.message));
    } else {
      const { confirmed } = await showSelectorResult(page, accept, 'Zustimmen');
      if (!confirmed) {
        // Vorschlag als editierbaren Startwert mitgeben: abgelehnt wird er meist, weil er unnoetig
        // komplex ist — dann will man ihn kuerzen, nicht abtippen.
        const sel = await showTextInput(page, 'Zustimmen-Selektor korrigieren',
          'z.B. #btn-accept oder .my-class', accept.selector);
        if (sel) accept.selector = sel;
        rec.notes.push('Accept-Selektor vom User korrigiert.');
      }
    }
    rec.accept_selector = accept.selector;
    rec.accept_text = accept.text || null;
    speichern();  // ab hier ist der Selektor sicher, auch wenn der Lauf gleich abbricht

    await page.waitForTimeout(2500);
    const after = await snapshot(ctx, page);
    const d = diff(before, after);

    log(`\n  Nach dem Zustimmen neu:`);
    d.cookies.forEach(c => log(`    Cookie  ${c.name} = ${c.value}  (${c.domain}${c.path})`));
    d.ls.forEach(([k, v]) => log(`    LS      ${k} = ${v}`));
    d.ss.forEach(([k, v]) => log(`    SS      ${k} = ${v}`));
    if (!d.cookies.length && !d.ls.length && !d.ss.length) log('    (nichts — Consent liegt evtl. serverseitig)');

    rec.new_cookies = d.cookies.map(c => ({ name: c.name, domain: c.domain, path: c.path, value_shape: c.value }));
    rec.new_local_storage = d.ls.map(([k, v]) => ({ key: k, value_shape: v }));
    rec.new_session_storage = d.ss.map(([k, v]) => ({ key: k, value_shape: v }));

    if (!d.cookies.length && !d.ls.length && !d.ss.length) {
      rec.status = 'needs_human';
      rec.reason = 'Zustimmen hinterliess weder Cookie noch Storage — Consent vermutlich serverseitig.';
      await showMessage(page, 'Der Klick hat weder Cookie noch Storage gesetzt. Das Tool speichert den '
        + 'Consent vermutlich serverseitig — hier ist nichts zu loeschen.', { title: 'Kein Traeger', timeout: 7000 });
      return;
    }

    // 2. Minimalitaet: welcher Key traegt wirklich?
    // "Loeschen bringt Banner zurueck" heisst HINREICHEND, nicht notwendig. Bei mehreren
    // Kandidaten wird jeder EINZELN getestet, sonst wandert Rauschen in popup.js.
    //
    // Vorher ungefiltert — und der Diff enthaelt IMMER die Tracker, die das CMP beim Zustimmen
    // gerade erst freigeschaltet hat. Auf allwetterzoo.de standen so _ga, _fbp, _gcl_au und
    // doubleclicks test_cookie in der Warteschlange (je 2 Seitenaufrufe), waehrend der einzige
    // echte Kandidat (ccm_consent) ganz hinten stand und nie drankam. minimality.js filtert das
    // seit heute — hier hatte ich es vergessen.
    const TRACKER = /^(_ga(_|$)|_gid$|_gat|_fbp$|_fbc$|_gcl_|pys|last_pys|_hj|_clck$|_clsk$|_uetsid|_uetvid|_pk_|__utm|test_cookie$|lastExternalReferrer)/i;
    const allCand = [
      ...d.cookies.map(c => ({ kind: 'cookie', key: c.name })),
      ...d.ls.map(([k]) => ({ kind: 'ls', key: k })),
      ...d.ss.map(([k]) => ({ kind: 'ss', key: k })),
    ];
    const skipped = allCand.filter(c => TRACKER.test(c.key));
    const cand = allCand.filter(c => !TRACKER.test(c.key));
    if (skipped.length) {
      log(`  ${skipped.length} Tracking-Key(s) uebersprungen (nie Consent-Traeger): `
        + skipped.map(c => c.key).join(', '));
      rec.notes.push('Als Tracking-Keys verworfen: ' + skipped.map(c => c.key).join(', '));
    }
    if (!cand.length) {
      rec.status = 'needs_human';
      rec.reason = 'Nach Abzug der Tracking-Keys blieb kein Kandidat uebrig.';
      await showMessage(page, 'Zustimmen hat nur Tracking-Cookies gesetzt, keinen erkennbaren '
        + 'Consent-Traeger. Der liegt vermutlich serverseitig.', { title: 'Kein Traeger', timeout: 7000 });
      return;
    }

    // Haupt-Kontext ZU, bevor die Tests starten. Er hat seinen Zweck erfuellt — der Zustand steckt in
    // `after`/`snapCookies`, jeder Test baut ihn sich ohnehin frisch auf. Blieb er offen, stapelten sich
    // die Fenster, seine Cookies lebten weiter, und der User konnte nicht erkennen, welches Fenster
    // gerade dran ist ("du oeffnest immer noch den zweiten browser, ohne den ersten vorher zu
    // schliessen"). Ab hier ist nie mehr als EIN Fenster offen.
    await ctx.close().catch(() => {});
    log('  (Haupt-Fenster geschlossen — die Tests laufen je in einem eigenen)');
    log(`\n  Pruefe ${cand.length} Kandidat(en) einzeln auf Traegerschaft...`);

    // Jeder Test bekommt einen EIGENEN Kontext, in dem der Zustand nach dem Zustimmen exakt
    // nachgebaut wird — minus dem einen Key, der geprueft wird.
    //
    // Vorher lief das ueber ctx.newPage(): ein neuer TAB im selben Kontext. Cookies und Storage
    // gehoeren aber dem Kontext, nicht dem Tab — der Test teilte sie sich also mit dem Haupt-Tab,
    // der offen blieb und dessen CMP-Skript weiterlief. Zwei Folgen (beide vom User bemerkt):
    //   1. Ein sauberer Ausgangszustand war nicht herstellbar, die Seite wurde endlos neu geladen.
    //   2. Der Cookie-Stand wurde nach jedem Test wiederhergestellt, localStorage NICHT — ein
    //      LS-Test hat den Zustand fuer alle nachfolgenden Tests zerstoert.
    // minimality.js macht es seit jeher richtig (frischer Kontext pro Test); hier zieht es nach.
    const snapCookies = after.cookies.map(x => ({ name: x.name, value: x.value, domain: x.domain,
      path: x.path, expires: x.expires, httpOnly: x.httpOnly, secure: x.secure, sameSite: x.sameSite }));

    // Negativkontrolle ZUERST: Zustand nachbauen, NICHTS loeschen, neu laden. Das Banner MUSS weg
    // bleiben. Tut es das nicht, ist die Erkennung auf dieser Seite nicht trennscharf und jedes
    // nachfolgende "TRAEGT" waere wertlos (journal.md, Fallstrick 11: fairtrade-kampagnen.de meldete
    // so alle 5 Keys als Traeger, obwohl nur einer traegt).
    const negCtx = await browser.newContext({ locale: 'de-DE', viewport: { width: 1400, height: 950 } });
    let negOk = true;
    try {
      await negCtx.addCookies(snapCookies);
      const n = await negCtx.newPage();
      await n.goto(url, { waitUntil: 'domcontentloaded' });
      await n.evaluate(({ ls, ss }) => {
        try { localStorage.clear(); sessionStorage.clear(); } catch { /* */ }
        for (const [k, v] of ls) { try { localStorage.setItem(k, v); } catch { /* */ } }
        for (const [k, v] of ss) { try { sessionStorage.setItem(k, v); } catch { /* */ } }
      }, { ls: after.ls, ss: after.ss }).catch(() => {});
      await n.goto(url, { waitUntil: 'domcontentloaded' });
      await n.waitForTimeout(2500);
      negOk = !(await n.evaluate(bannerVisible(rec.accept_selector)).catch(() => false));
    } catch { /* */ } finally { await negCtx.close().catch(() => {}); }
    if (!negOk) {
      log('\n  [WARNUNG] Negativkontrolle gescheitert: Das Banner ist auch dann noch da, wenn NICHTS');
      log('            geloescht wird. Die Erkennung ist auf dieser Seite nicht trennscharf —');
      log('            jedes "TRAEGT" waere wertlos. Traegertest wird uebersprungen.');
      rec.status = 'needs_human';
      rec.reason = 'Negativkontrolle gescheitert: Banner bleibt trotz vollstaendigem Consent sichtbar '
        + '(Accept-Selektor ' + rec.accept_selector + '). Traegerschaft nicht automatisch messbar.';
      // Kein showMessage: `page` ist hier schon zu. Das Ergebnis steht im Log und in findings.json.
      speichern();
      return;
    }
    log('  Negativkontrolle: ok (Banner bleibt weg, wenn nichts geloescht wird)');

    const sufficient = [];
    for (const c of cand) {
      const tctx = await browser.newContext({ locale: 'de-DE', viewport: { width: 1400, height: 950 } });
      try {
        await tctx.addCookies(snapCookies.filter(x => !(c.kind === 'cookie' && x.name === c.key)));
        const t = await tctx.newPage();
        // Erst laden (Origin muss existieren, bevor Storage schreibbar ist), dann Storage
        // nachbauen, dann neu laden — das Banner entscheidet beim Laden.
        await t.goto(url, { waitUntil: 'domcontentloaded' });
        await t.evaluate(({ ls, ss }) => {
          try { localStorage.clear(); sessionStorage.clear(); } catch { /* */ }
          for (const [k, v] of ls) { try { localStorage.setItem(k, v); } catch { /* */ } }
          for (const [k, v] of ss) { try { sessionStorage.setItem(k, v); } catch { /* */ } }
        }, {
          ls: after.ls.filter(([k]) => !(c.kind === 'ls' && k === c.key)),
          ss: after.ss.filter(([k]) => !(c.kind === 'ss' && k === c.key)),
        }).catch(() => {});
        await t.goto(url, { waitUntil: 'domcontentloaded' });
        await t.waitForTimeout(2500);
        const back = await t.evaluate(bannerVisible(rec.accept_selector)).catch(() => false);
        log(`    ${(c.kind + ':' + c.key).padEnd(44)} ${back ? 'TRAEGT' : 'traegt nicht'}`);
        if (back) sufficient.push(c);
      } catch (e) {
        // Ein Messfehler ist kein Messergebnis (journal.md, Fallstrick 10): nicht als
        // "traegt nicht" verbuchen, sondern als ungeprueft ausweisen.
        log(`    ${(c.kind + ':' + c.key).padEnd(44)} MESSFEHLER: ${String(e.message || e).slice(0, 60)}`);
        rec.notes.push(`Traegertest fuer ${c.kind}:${c.key} fehlgeschlagen — ungeprueft.`);
      } finally { await tctx.close().catch(() => {}); }
    }

    rec.sufficient_keys = sufficient.map(c => c.kind + ':' + c.key);
    if (sufficient.length) {
      // Fuer popup.js genuegt EIN hinreichender Key. Cookie vor Storage bevorzugen.
      const pick = sufficient.find(c => c.kind === 'cookie') || sufficient[0];
      rec.consent_carrier = {
        cookies: pick.kind === 'cookie' ? [pick.key] : [],
        local_storage: pick.kind === 'ls' ? [pick.key] : [],
        session_storage: pick.kind === 'ss' ? [pick.key] : [],
      };
      rec.status = 'carrier_found';
      rec.verification = { method: 'einzeln geloescht, Reload, Banner-Text wieder sichtbar', banner_returned: true };
      rec.notes.push(`${sufficient.length} Key(s) je HINREICHEND (${rec.sufficient_keys.join(', ')}); `
        + `fuer popup.js genuegt ${pick.key}.`);
    } else {
      rec.consent_carrier = {
        cookies: d.cookies.map(c => c.name),
        local_storage: d.ls.map(([k]) => k),
        session_storage: d.ss.map(([k]) => k),
      };
      rec.status = 'carrier_found';
      rec.notes.push('Kein Einzelkey bringt das Banner zurueck — das Tool braucht die Kombination. Alle eintragen.');
    }
    speichern();  // Traeger steht fest — ab hier ist der Reject-Teil reine Zugabe

    // 3. Reject (optional, fuer den Auditor)
    //
    // Der Prompt lief frueher auf `page` und war mit .catch(() => false) abgesichert. Das ging beim
    // ersten Einsatz still schief: der Traegertest oben raeumt via ctx.clearCookies() den Kontext
    // leer und navigiert `page` mehrfach, danach schlug showConfirm fehl — und der Fehler wurde als
    // "Nein, kein Reject aufzeichnen" verbucht. Ergebnis: der Ablehnen-Weg wurde nie erfasst, ohne
    // dass irgendwo etwas davon stand. Ein Fehler ist keine Antwort (vgl. journal.md, Fallstrick 10).
    // Jetzt: erst frischen Kontext oeffnen, dann DORT fragen. Scheitert es trotzdem, wird es laut.
    const rctx = await browser.newContext({ locale: 'de-DE', viewport: { width: 1400, height: 950 } });
    const rpage = await rctx.newPage();
    await rpage.goto(url, { waitUntil: 'domcontentloaded' });
    await rpage.waitForTimeout(2000);
    // Sonst oeffnet das zweite Fenster HINTER dem ersten und der Dialog wartet unsichtbar —
    // fuer den User sieht das aus wie "Browser offen, nichts passiert" (real auf 0800baj.de).
    await rpage.bringToFront().catch(() => {});
    let wantReject = false;
    try {
      wantReject = await showConfirm(rpage, 'Soll ich auch den ABLEHNEN-Weg aufzeichnen? '
        + '(fuer die Selektor-Bibliothek des Tracking Auditors)');
    } catch (e) {
      log('  [WARNUNG] Reject-Prompt konnte nicht angezeigt werden: ' + (e.message || e));
      log('            Der Ablehnen-Weg wurde NICHT aufgezeichnet — das ist ein Werkzeugfehler,');
      log('            kein Befund ueber das Tool.');
      rec.notes.push('Ablehnen-Weg nicht aufgezeichnet: UI-Fehler (' + String(e.message || e).slice(0, 80) + ').');
    }
    if (wantReject) {
      await showMessage(rpage, 'Bitte den ABLEHNEN-Button klicken. Falls es keinen direkten gibt: erst '
        + 'den Zwischenschritt (Einstellungen o.ae.) klicken — ich frage danach nochmal.',
        { title: 'Ablehnen einlernen', timeout: 5000 });
      const r1 = await showClickPrompt(rpage, 'Ablehnen (oder Zwischenschritt)');
      if (r1?.selector) {
        // Vorschlag bestaetigen/kuerzen — mit dem Vorschlag als editierbarem Startwert.
        const { confirmed } = await showSelectorResult(rpage, r1, 'Ablehnen');
        let rsel = r1.selector;
        if (!confirmed) {
          const corrected = await showTextInput(rpage, 'Ablehnen-Selektor korrigieren',
            'z.B. .consent-banner-button.reject-consent-all', r1.selector);
          if (corrected) rsel = corrected;
        }
        const isStep = await showConfirm(rpage, `"${r1.text || rsel}" — war das ein Zwischenschritt `
          + '(also noch NICHT das eigentliche Ablehnen)?');
        if (isStep) {
          const r2 = await showClickPrompt(rpage, 'Jetzt das eigentliche Ablehnen');
          let r2sel = r2?.selector;
          if (r2sel) {
            const res2 = await showSelectorResult(rpage, r2, 'Ablehnen (Schritt 2)');
            if (!res2.confirmed) {
              const c2 = await showTextInput(rpage, 'Ablehnen-Selektor (Schritt 2) korrigieren',
                'z.B. .save-settings', r2sel);
              if (c2) r2sel = c2;
            }
          }
          rec.reject_steps = [rsel, r2sel].filter(Boolean);
          rec.notes.push('Ablehnen ist zweistufig.');
        } else {
          rec.reject_selector = rsel;
        }
        // Was Ablehnen hinterlaesst, ist NICHT dasselbe wie bei Zustimmen: LWD Cookie Master setzt
        // cc_cookie_decline statt cc_cookie_accept. Wer nur den Accept-Pfad misst, uebersieht einen
        // Traeger (vom User beim Verifizieren nachgetragen). Also auch hier diffen.
        await rpage.waitForTimeout(2000);
        const rafter = await snapshot(rctx, rpage);
        const rd = diff(before, rafter);
        if (rd.cookies.length || rd.ls.length || rd.ss.length) {
          rec.reject_cookies = rd.cookies.map(c => ({ name: c.name, domain: c.domain, path: c.path, value_shape: c.value }));
          rec.reject_local_storage = rd.ls.map(([k, v]) => ({ key: k, value_shape: v }));
          rec.reject_session_storage = rd.ss.map(([k, v]) => ({ key: k, value_shape: v }));
          const acceptKeys = new Set([...(rec.new_cookies || []).map(c => c.name),
            ...(rec.new_local_storage || []).map(x => x.key), ...(rec.new_session_storage || []).map(x => x.key)]);
          const only = [...rd.cookies.map(c => c.name), ...rd.ls.map(([k]) => k), ...rd.ss.map(([k]) => k)]
            .filter(k => !acceptKeys.has(k));
          log('\n  Nach dem Ablehnen neu:');
          rd.cookies.forEach(c => log(`    Cookie  ${c.name} = ${c.value}`));
          rd.ls.forEach(([k, v]) => log(`    LS      ${k} = ${v}`));
          rd.ss.forEach(([k, v]) => log(`    SS      ${k} = ${v}`));
          if (only.length) {
            rec.reject_only_keys = only;
            log('    ^ NUR beim Ablehnen: ' + only.join(', ') + '  -> gehoert zusaetzlich in popup.js');
            rec.notes.push('Ablehnen setzt eigene Keys, die Zustimmen NICHT setzt: ' + only.join(', ')
              + '. Die muessen mit in popup.js, sonst bleibt ein Reject-Consent unloeschbar.');
          }
        }
      }
    }
    await rctx.close();

    // 4. Selektoren im cmp-library.json-Schema des Auditors (Staging, kein Direktschreiben)
    rec.selectors = {
      name: rec.name,
      accept: rec.accept_selector || null,
      reject: rec.reject_selector || null,
      rejectSteps: rec.reject_steps || null,
      detect: [],
      shadowDom: !!rec.shadowDom,
      priority: 3,
    };

    // Kein showMessage mehr zum Schluss: `page` ist an dieser Stelle laengst geschlossen (s. o.).
    // Das Ergebnis steht im Log und in findings.json.
    log(`\n  Traeger: ${[...rec.consent_carrier.cookies, ...rec.consent_carrier.local_storage,
      ...rec.consent_carrier.session_storage].join(', ')}`);
  } catch (e) {
    rec.status = 'error';
    rec.reason = String(e.message || e).slice(0, 200);
    log('\nFEHLER: ' + rec.reason);
  } finally {
    speichern();
    log(`\n→ ${rec.status.toUpperCase()} — angehaengt an data/findings.json`);
    if (rec.consent_carrier) {
      const all = [...rec.consent_carrier.cookies, ...rec.consent_carrier.local_storage, ...rec.consent_carrier.session_storage];
      log(`  Fuer popup.js: ${all.join(', ')}`);
    }
    await browser.close();
  }
})();
