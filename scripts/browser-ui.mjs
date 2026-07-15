/**
 * browser-ui.js – Injizierbare Browser-UI-Komponenten fuer Audit-Overlays
 *
 * Stellt Funktionen bereit die per page.evaluate() ein Overlay in den Browser injizieren
 * und per page.exposeFunction() mit Node.js kommunizieren.
 *
 * CSS ist explizit gegen Global Resets gehaertet (alle Properties explizit gesetzt).
 */

// ── Shared Styles (reset-proof) ──────────────────────────────────────────────

const OVERLAY_STYLES = `
  #__audit-overlay {
    position: fixed !important; inset: 0 !important; z-index: 2147483647 !important;
    background: rgba(0,0,0,0.55) !important;
    display: flex !important; align-items: center !important; justify-content: center !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    font-size: 14px !important; color: #333 !important;
    box-sizing: border-box !important; margin: 0 !important; padding: 0 !important;
    line-height: 1.5 !important; letter-spacing: normal !important;
    text-transform: none !important; text-decoration: none !important;
    float: none !important; border: none !important; outline: none !important;
  }
  #__audit-overlay .__audit-card {
    background: #fff !important; border-radius: 14px !important; padding: 32px 36px !important;
    max-width: 520px !important; width: 90% !important;
    box-shadow: 0 12px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.06) !important;
    position: relative !important; display: block !important;
    cursor: grab !important; user-select: none !important;
    margin: 0 !important; box-sizing: border-box !important;
  }
  #__audit-overlay .__audit-card.--dragging { cursor: grabbing !important; }
  #__audit-overlay .__audit-title {
    font-size: 17px !important; font-weight: 700 !important; margin: 0 0 16px 0 !important;
    color: #111 !important; display: block !important; padding: 0 !important;
    line-height: 1.4 !important;
  }
  #__audit-overlay .__audit-msg {
    font-size: 14px !important; line-height: 1.7 !important; margin: 0 0 20px 0 !important;
    color: #444 !important; display: block !important; padding: 0 !important;
  }
  #__audit-overlay .__audit-code {
    font-family: "Cascadia Code", "Fira Code", Consolas, monospace !important;
    background: #f5f5f5 !important; border: 1px solid #ddd !important; border-radius: 8px !important;
    padding: 14px 18px !important; font-size: 13px !important; word-break: break-all !important;
    margin: 0 0 16px 0 !important; color: #222 !important; display: block !important;
    /* ABWEICHUNG von der Auditor-Kopie: Die Karte traegt user-select:none, damit man das Panel
       ziehen kann (cursor:grab) — das erbt der Selektor mit und war deshalb nicht markierbar.
       Hier gezielt zurueckgenommen: Text markierbar, Panel bleibt ziehbar. */
    user-select: text !important; -webkit-user-select: text !important; cursor: text !important;
  }
  #__audit-overlay .__audit-detail {
    font-size: 12px !important; color: #888 !important; margin: 0 0 6px 0 !important;
    display: block !important; padding: 2px 0 !important; line-height: 1.5 !important;
  }
  #__audit-overlay .__audit-btn {
    display: inline-block !important; padding: 12px 24px !important; border: none !important;
    border-radius: 8px !important; font-size: 14px !important; font-weight: 600 !important;
    cursor: pointer !important; margin: 8px 10px 0 0 !important;
    transition: opacity 0.15s !important; text-align: center !important;
    line-height: 1.4 !important; font-family: inherit !important;
    box-sizing: border-box !important;
  }
  #__audit-overlay .__audit-btn:hover { opacity: 0.85 !important; }
  #__audit-overlay .__audit-btn-primary { background: #2563eb !important; color: #fff !important; }
  #__audit-overlay .__audit-btn-success { background: #16a34a !important; color: #fff !important; }
  #__audit-overlay .__audit-btn-danger  { background: #dc2626 !important; color: #fff !important; }
  #__audit-overlay .__audit-btn-secondary { background: #e5e7eb !important; color: #333 !important; }
  #__audit-overlay .__audit-input {
    width: 100% !important; padding: 12px 16px !important; border: 1px solid #d1d5db !important;
    border-radius: 8px !important; font-size: 14px !important;
    font-family: "Cascadia Code", Consolas, monospace !important;
    margin: 0 0 16px 0 !important; outline: none !important;
    background: #fff !important; color: #222 !important; display: block !important;
    box-sizing: border-box !important;
  }
  #__audit-overlay .__audit-input:focus { border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.15) !important; }
  #__audit-overlay .__audit-status {
    font-size: 12px !important; padding: 8px 12px !important; border-radius: 6px !important;
    margin: 0 0 16px 0 !important; display: block !important; box-sizing: border-box !important;
  }
  #__audit-overlay .__audit-status-info { background: #eff6ff !important; color: #1d4ed8 !important; }
  #__audit-overlay .__audit-status-ok   { background: #f0fdf4 !important; color: #15803d !important; }
  #__audit-overlay .__audit-status-err  { background: #fef2f2 !important; color: #b91c1c !important; }
  #__audit-overlay .__audit-actions {
    margin: 20px 0 0 0 !important; padding: 0 !important; display: block !important;
  }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────

const CALLBACK_NAME = '__auditUICallback';
let _callbackCounter = 0;

function nextCallbackName(suffix = '') {
  return CALLBACK_NAME + '_' + suffix + '_' + (++_callbackCounter) + '_' + Date.now();
}

async function injectOverlay(page, innerHTML) {
  await page.evaluate(({ styles, html }) => {
    const old = document.getElementById('__audit-overlay');
    if (old) old.remove();
    const oldStyle = document.getElementById('__audit-overlay-style');
    if (oldStyle) oldStyle.remove();

    const style = document.createElement('style');
    style.id = '__audit-overlay-style';
    style.textContent = styles;
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.id = '__audit-overlay';
    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    // Make cards draggable
    const card = overlay.querySelector('.__audit-card');
    if (card) {
      let dragging = false, startX, startY, origX, origY;
      card.addEventListener('mousedown', (e) => {
        // Don't drag when clicking buttons or inputs
        if (e.target.closest('button, input, a, select, textarea')) return;
        dragging = true;
        card.classList.add('--dragging');
        const rect = card.getBoundingClientRect();
        startX = e.clientX; startY = e.clientY;
        origX = rect.left; origY = rect.top;
        // Switch card to fixed positioning for free movement
        card.style.setProperty('position', 'fixed', 'important');
        card.style.setProperty('left', origX + 'px', 'important');
        card.style.setProperty('top', origY + 'px', 'important');
        card.style.setProperty('margin', '0', 'important');
        // Detach from flex centering
        overlay.style.setProperty('display', 'block', 'important');
        e.preventDefault();
      });
      document.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        const dx = e.clientX - startX, dy = e.clientY - startY;
        card.style.setProperty('left', (origX + dx) + 'px', 'important');
        card.style.setProperty('top', (origY + dy) + 'px', 'important');
      });
      document.addEventListener('mouseup', () => {
        if (!dragging) return;
        dragging = false;
        card.classList.remove('--dragging');
      });
    }
  }, { styles: OVERLAY_STYLES, html: innerHTML });
}

async function removeOverlay(page) {
  await page.evaluate(() => {
    const el = document.getElementById('__audit-overlay');
    if (el) el.remove();
    const st = document.getElementById('__audit-overlay-style');
    if (st) st.remove();
  });
}

async function showOverlayAndWait(page, buildHTML) {
  const callbackName = nextCallbackName('dlg');

  let resolvePromise;
  const resultPromise = new Promise((resolve) => { resolvePromise = resolve; });

  try {
    await page.exposeFunction(callbackName, (value) => {
      resolvePromise(value);
    });
  } catch { /* unique name should prevent collisions */ }

  const html = buildHTML(callbackName);
  await injectOverlay(page, html);

  const result = await resultPromise;
  await removeOverlay(page);
  return result;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function showMessage(page, message, { type = 'info', title = 'Audit Tool', timeout = 0 } = {}) {
  const icons = { info: '\u2139\uFE0F', warning: '\u26A0\uFE0F', error: '\u274C' };
  const icon = icons[type] || icons.info;

  const result = await showOverlayAndWait(page, (cb) => `
    <div class="__audit-card">
      <div class="__audit-title">${icon} ${escapeHTML(title)}</div>
      <div class="__audit-msg">${escapeHTML(message)}</div>
      <div class="__audit-actions">
        <button class="__audit-btn __audit-btn-primary" onclick="window['${cb}']('ok')">OK</button>
      </div>
    </div>
  `);

  return result;
}

export async function showClickPrompt(page, label) {
  const callbackName = nextCallbackName('click');

  let resolvePromise;
  const resultPromise = new Promise((resolve) => { resolvePromise = resolve; });

  try {
    await page.exposeFunction(callbackName, (value) => {
      resolvePromise(JSON.parse(value));
    });
  } catch { /* */ }

  const STABLE_DATA_ATTRS = [
    'data-testid', 'data-id', 'data-action', 'data-key', 'data-name',
    'data-cy', 'data-qa', 'data-element', 'data-role', 'data-type',
  ];

  // Floating card at bottom — NO dark overlay so the page stays visible and clickable
  await page.evaluate(({ styles, label, cbName }) => {
    const old = document.getElementById('__audit-clickprompt');
    if (old) old.remove();
    const oldStyle = document.getElementById('__audit-clickprompt-style');
    if (oldStyle) oldStyle.remove();

    const style = document.createElement('style');
    style.id = '__audit-clickprompt-style';
    style.textContent = styles + `
      /* ABWEICHUNG von der Auditor-Kopie: Karte in die ECKE oben links (vorher bottom:24px, mittig).
         Die Mitte ist doppelt besetzt: unten mittig sitzen die Cookie-BARS, oben/mittig die
         zentrierten MODALS. Beides real erlebt — erst verschwand die Karte hinter der Bar
         (123strand.de), dann verdeckte sie das Modal samt Zustimmen-Button (a1-abendschein.de,
         per Screenshot bestaetigt). Die linke obere Ecke ist bei Consent-Dialogen praktisch nie
         belegt. Schmaler ist sie auch, und verschiebbar bleibt sie ohnehin. */
      #__audit-clickprompt {
        position: fixed !important; top: 16px !important; left: 16px !important;
        transform: none !important; z-index: 2147483647 !important;
        /* Consent-Modals weichzeichnen die Seite oft NICHT mit einem Overlay davor, sondern legen
           filter:blur() auf jedes Geschwister von <body> — und unsere Karte haengt genau dort, wird
           also selbst weichgezeichnet. Dagegen hilft kein z-index (real: a1-abendschein.de, per
           Screenshot belegt: Banner scharf, Karte verschwommen). Die ID-Regel schlaegt "body > *". */
        filter: none !important; -webkit-filter: none !important;
        backdrop-filter: none !important; opacity: 1 !important;
        background: #fff !important; border-radius: 12px !important;
        padding: 14px 18px !important; max-width: 300px !important; width: auto !important;
        box-shadow: 0 8px 32px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.08) !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        font-size: 14px !important; color: #333 !important;
        pointer-events: auto !important; text-align: center !important;
        box-sizing: border-box !important; margin: 0 !important;
        line-height: 1.5 !important; cursor: grab !important; user-select: none !important;
      }
      #__audit-clickprompt.--dragging { cursor: grabbing !important; }
      #__audit-clickprompt-title {
        font-size: 15px !important; font-weight: 700 !important; color: #111 !important;
        margin: 0 0 8px 0 !important; padding: 0 !important; display: block !important;
      }
      #__audit-clickprompt-msg {
        font-size: 14px !important; color: #444 !important;
        margin: 0 0 10px 0 !important; padding: 0 !important; display: block !important;
      }
      #__audit-click-status {
        font-size: 13px !important; color: #6b7280 !important;
        margin: 0 !important; padding: 0 !important; display: block !important;
        animation: __audit-pulse 1.5s ease-in-out infinite;
      }
      @keyframes __audit-pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
    `;
    document.head.appendChild(style);

    const card = document.createElement('div');
    card.id = '__audit-clickprompt';
    card.innerHTML =
      '<div id="__audit-clickprompt-title">\uD83D\uDDB1\uFE0F Klick erforderlich</div>' +
      '<div id="__audit-clickprompt-msg">Bitte klicke den <strong style="font-weight:700 !important;">' +
      label + '</strong>-Button auf der Seite.</div>' +
      '<div id="__audit-click-status">Warte auf Klick...</div>';
    document.body.appendChild(card);

    // Drag handling
    let dragging = false, startX, startY, origX, origY;
    card.addEventListener('mousedown', (e) => {
      dragging = true;
      card.classList.add('--dragging');
      const rect = card.getBoundingClientRect();
      startX = e.clientX; startY = e.clientY;
      origX = rect.left; origY = rect.top;
      // Switch from bottom-centered to fixed position for free movement
      card.style.setProperty('bottom', 'auto', 'important');
      card.style.setProperty('left', origX + 'px', 'important');
      card.style.setProperty('top', origY + 'px', 'important');
      card.style.setProperty('transform', 'none', 'important');
      e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX, dy = e.clientY - startY;
      card.style.setProperty('left', (origX + dx) + 'px', 'important');
      card.style.setProperty('top', (origY + dy) + 'px', 'important');
    });
    document.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      card.classList.remove('--dragging');
    });
  }, { styles: '', label: escapeHTML(label), cbName: callbackName });

  // Install click listener
  await page.evaluate((args) => {
    const INTERACTIVE = ['BUTTON', 'A', 'INPUT', 'SELECT'];
    const stableAttrs = args.stableAttrs;
    const cbName = args.cbName;
    const WS_RE = /\s+/;

    document.addEventListener('click', function handler(e) {
      if (e.target.closest('#__audit-clickprompt')) return;
      document.removeEventListener('click', handler, true);

      const t = e.target;
      const el = INTERACTIVE.includes(t.tagName) || t.getAttribute('role') === 'button'
        ? t
        : t.closest('button, a, [role="button"], input[type="button"], input[type="submit"]') || t;

      const id = el.id ? '#' + el.id : null;
      const stableDataAttr = Array.from(el.attributes)
        .filter(a => stableAttrs.includes(a.name))
        .map(a => '[' + a.name + '="' + a.value + '"]')[0] || null;
      const allDataAttrs = Array.from(el.attributes)
        .filter(a => a.name.startsWith('data-'))
        .map(a => '[' + a.name + '="' + a.value + '"]');
      const classes = el.className && typeof el.className === 'string'
        ? '.' + el.className.trim().split(WS_RE).join('.')
        : null;
      const tag = el.tagName.toLowerCase();

      const result = {
        selector: id || stableDataAttr || classes || tag,
        id: el.id || null,
        stableDataAttr,
        allDataAttrs,
        classes: el.className || null,
        tag,
        text: (el.innerText || '').trim().slice(0, 80) || null,
      };

      const status = document.getElementById('__audit-click-status');
      if (status) {
        status.textContent = 'Klick erkannt auf <' + tag + '> ' + (result.text || '');
        status.style.setProperty('color', '#16a34a', 'important');
        status.style.animation = 'none';
      }

      window[cbName](JSON.stringify(result));
    }, { once: false, capture: true });
  }, { stableAttrs: STABLE_DATA_ATTRS, cbName: callbackName });

  const result = await resultPromise;
  // Clean up floating card
  await page.evaluate(() => {
    const el = document.getElementById('__audit-clickprompt');
    if (el) el.remove();
    const st = document.getElementById('__audit-clickprompt-style');
    if (st) st.remove();
  });
  return result;
}

export async function showSelectorResult(page, result, label) {
  const details = [
    result.id ? `ID: ${result.id}` : null,
    result.tag ? `Tag: &lt;${result.tag}&gt;` : null,
    result.text ? `Text: "${escapeHTML(result.text)}"` : null,
    result.classes ? `Klassen: ${escapeHTML(String(result.classes))}` : null,
    result.allDataAttrs?.length ? `Data-Attrs: ${result.allDataAttrs.join(', ')}` : null,
  ].filter(Boolean);

  const value = await showOverlayAndWait(page, (cb) => `
    <div class="__audit-card">
      <div class="__audit-title">\u2705 ${escapeHTML(label)}-Selektor erkannt</div>
      <div class="__audit-code">${escapeHTML(result.selector)}</div>
      ${details.map(d => `<div class="__audit-detail">${d}</div>`).join('')}
      <div class="__audit-actions">
        <button class="__audit-btn __audit-btn-success" onclick="window['${cb}']('yes')">Verwenden</button>
        <button class="__audit-btn __audit-btn-secondary" onclick="window['${cb}']('no')">Manuell eingeben</button>
      </div>
    </div>
  `);

  return { confirmed: value === 'yes' };
}

// ABWEICHUNG von der Auditor-Kopie: Parameter `value` ergaenzt (vorbefuellter, editierbarer Wert).
// Grund: Wird ein vorgeschlagener Selektor abgelehnt, ist er meist nur unnoetig komplex und soll
// gekuerzt, nicht neu getippt werden. `placeholder` taugt dafuer nicht — grauer Hinweistext, nicht
// editierbar. Lohnt den Rueckport nach c:\Users\mbaer\Documents\Dev\tracking-auditor\browser-ui.js.
export async function showTextInput(page, label, placeholder = 'z.B. #btn-accept oder .my-class', value = '') {
  const callbackName = nextCallbackName('input');

  let resolvePromise;
  const resultPromise = new Promise((resolve) => { resolvePromise = resolve; });

  try {
    await page.exposeFunction(callbackName, (value) => {
      resolvePromise(value);
    });
  } catch { /* */ }

  const validateName = nextCallbackName('validate');
  try {
    await page.exposeFunction(validateName, async (selector) => {
      try {
        const count = await page.locator(selector).count();
        return JSON.stringify({ count });
      } catch (e) {
        return JSON.stringify({ count: 0, error: e.message });
      }
    });
  } catch { /* */ }

  await injectOverlay(page, `
    <div class="__audit-card">
      <div class="__audit-title">\u270F\uFE0F ${escapeHTML(label)}</div>
      <div class="__audit-msg">Selektor manuell eingeben (wird gegen die Seite validiert):</div>
      <input class="__audit-input" id="__audit-sel-input" type="text"
             placeholder="${escapeHTML(placeholder)}" value="${escapeHTML(value)}" autofocus />
      <div id="__audit-sel-status" class="__audit-status __audit-status-info" style="display:none !important;"></div>
      <button class="__audit-btn __audit-btn-primary" id="__audit-sel-validate"
              onclick="(async()=>{
                const inp=document.getElementById('__audit-sel-input');
                const st=document.getElementById('__audit-sel-status');
                const val=inp.value.trim();
                if(!val){st.style.setProperty('display','block','important');st.className='__audit-status __audit-status-err';st.textContent='Bitte Selektor eingeben';return;}
                st.style.setProperty('display','block','important');st.className='__audit-status __audit-status-info';st.textContent='Pruefe...';
                const r=JSON.parse(await window['${validateName}'](val));
                if(r.count>0){st.className='__audit-status __audit-status-ok';st.textContent=r.count+' Element(e) gefunden';document.getElementById('__audit-sel-submit').style.setProperty('display','inline-block','important');}
                else{st.className='__audit-status __audit-status-err';st.textContent='Kein Element gefunden'+(r.error?' ('+r.error+')':'');}
              })()">Pruefen</button>
      <button class="__audit-btn __audit-btn-success" id="__audit-sel-submit" style="display:none !important;"
              onclick="window['${callbackName}'](document.getElementById('__audit-sel-input').value.trim())">Verwenden</button>
    </div>
  `);

  await page.evaluate(() => {
    const input = document.getElementById('__audit-sel-input');
    if (input) input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('__audit-sel-validate').click();
    });
  });

  const result = await resultPromise;
  await removeOverlay(page);
  return result;
}

export async function showConfirm(page, message) {
  const value = await showOverlayAndWait(page, (cb) => `
    <div class="__audit-card">
      <div class="__audit-title">\u2753 Bestaetigung</div>
      <div class="__audit-msg">${escapeHTML(message)}</div>
      <div class="__audit-actions">
        <button class="__audit-btn __audit-btn-primary" onclick="window['${cb}']('yes')">Ja</button>
        <button class="__audit-btn __audit-btn-secondary" onclick="window['${cb}']('no')">Nein</button>
      </div>
    </div>
  `);
  return value === 'yes';
}

export async function showCMPMatch(page, matchedCMP) {
  const value = await showOverlayAndWait(page, (cb) => `
    <div class="__audit-card">
      <div class="__audit-title">\uD83D\uDD0D CMP erkannt</div>
      <div class="__audit-msg">Die eingegebenen Selektoren passen zu einem bekannten CMP:</div>
      <div class="__audit-code">${escapeHTML(matchedCMP.name)} (${escapeHTML(matchedCMP.key)})</div>
      <div class="__audit-detail">Accept: ${escapeHTML(matchedCMP.accept)}</div>
      <div class="__audit-detail">Reject: ${escapeHTML(matchedCMP.reject)}</div>
      <div class="__audit-actions">
        <button class="__audit-btn __audit-btn-success" onclick="window['${cb}']('use')">Ja, verwenden</button>
        <button class="__audit-btn __audit-btn-secondary" onclick="window['${cb}']('new')">Nein, neues CMP anlegen</button>
      </div>
    </div>
  `);
  return { useExisting: value === 'use' };
}

export async function showCMPNameInput(page) {
  const callbackName = nextCallbackName('cmpname');

  let resolvePromise;
  const resultPromise = new Promise((resolve) => { resolvePromise = resolve; });

  try {
    await page.exposeFunction(callbackName, (value) => {
      resolvePromise(value);
    });
  } catch { /* */ }

  await injectOverlay(page, `
    <div class="__audit-card">
      <div class="__audit-title">\uD83D\uDCDD CMP speichern</div>
      <div class="__audit-msg">Name:</div>
      <input class="__audit-input" id="__audit-cmpname-input" type="text"
             placeholder="z.B. Complianz, Cookiebot, ..." autofocus />
      <div class="__audit-msg" style="margin-top:10px !important;">Priority (wie haeufig kommt dieses CMP vor?):</div>
      <select id="__audit-prio-select" class="__audit-input" style="padding:6px 10px !important;">
        <option value="1">1 – Sehr haeufig</option>
        <option value="2">2</option>
        <option value="3" selected>3 – Normal</option>
        <option value="4">4</option>
        <option value="5">5 – Selten</option>
        <option value="7">7</option>
        <option value="9">9 – Sehr selten</option>
      </select>
      <button class="__audit-btn __audit-btn-primary" style="margin-top:10px !important;"
              onclick="(()=>{
                const n=document.getElementById('__audit-cmpname-input').value.trim();
                const p=document.getElementById('__audit-prio-select').value;
                if(n) window['${callbackName}'](JSON.stringify({name:n,priority:parseInt(p,10)}));
              })()">Speichern</button>
    </div>
  `);

  await page.evaluate(() => {
    const input = document.getElementById('__audit-cmpname-input');
    if (input) input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const v = input.value.trim();
        if (v) input.closest('.__audit-card').querySelector('.__audit-btn').click();
      }
    });
  });

  const raw = await resultPromise;
  await removeOverlay(page);
  try { return JSON.parse(raw); }
  catch { return { name: raw, priority: 3 }; }
}

// ── Status Bar (non-blocking, red accent, with optional skip button) ─────────

const STATUS_BAR_STYLES = `
  #__audit-statusbar, #__audit-statusbar * {
    box-sizing: border-box !important; margin: 0 !important; padding: 0 !important;
    line-height: 1.4 !important; text-transform: none !important;
    font-style: normal !important; text-decoration: none !important;
    float: none !important; border: none !important; outline: none !important;
  }
  #__audit-statusbar {
    position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important;
    z-index: 2147483646 !important;
    background: linear-gradient(135deg, #450a0a 0%, #7f1d1d 50%, #991b1b 100%) !important;
    color: #fecaca !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    font-size: 13px !important; padding: 8px 16px !important;
    display: flex !important; align-items: center !important; gap: 10px !important;
    box-shadow: 0 2px 12px rgba(127,29,29,0.5) !important;
    border-bottom: 2px solid #ef4444 !important;
    width: auto !important; height: auto !important;
  }
  #__audit-statusbar-spinner {
    width: 14px !important; height: 14px !important; border: 2px solid #991b1b !important;
    border-top-color: #ef4444 !important;
    border-radius: 50% !important; animation: __audit-spin 0.8s linear infinite;
    flex-shrink: 0 !important; display: block !important;
  }
  @keyframes __audit-spin { to { transform: rotate(360deg); } }
  #__audit-statusbar-phase {
    font-weight: 700 !important; color: #fca5a5 !important; white-space: nowrap !important;
    display: inline !important; font-size: 13px !important;
  }
  #__audit-statusbar-detail {
    color: #fecaca !important; flex: 1 !important; overflow: hidden !important;
    text-overflow: ellipsis !important; white-space: nowrap !important;
    display: block !important; font-size: 13px !important;
  }
  #__audit-statusbar-stats {
    font-size: 11px !important; color: #fca5a5 !important; white-space: nowrap !important;
    display: inline !important;
  }
  #__audit-statusbar-actions {
    display: none !important; margin-left: auto !important; align-items: center !important;
    gap: 6px !important; flex-shrink: 0 !important;
  }
  #__audit-statusbar-actions.--visible { display: flex !important; }
  #__audit-cmp-select {
    background: rgba(255,255,255,0.15) !important; color: #fecaca !important;
    border: 1px solid rgba(255,255,255,0.3) !important; border-radius: 4px !important;
    padding: 3px 6px !important; font-size: 11px !important; cursor: pointer !important;
    font-family: inherit !important; max-width: 180px !important;
    appearance: auto !important; -webkit-appearance: menulist !important;
  }
  #__audit-cmp-select option { background: #1c1c1c !important; color: #fecaca !important; }
  #__audit-cmp-use-btn, #__audit-cmp-manual-btn {
    background: rgba(255,255,255,0.15) !important; color: #fecaca !important;
    border: 1px solid rgba(255,255,255,0.3) !important; border-radius: 4px !important;
    padding: 3px 10px !important; font-size: 11px !important; cursor: pointer !important;
    white-space: nowrap !important; font-family: inherit !important;
  }
  #__audit-cmp-use-btn:hover, #__audit-cmp-manual-btn:hover { background: rgba(255,255,255,0.25) !important; }
  #__audit-cmp-use-btn:disabled { opacity: 0.4 !important; cursor: not-allowed !important; }
`;

export async function showStatusBar(page, phase, detail = '') {
  await page.evaluate(({ styles, phase, detail }) => {
    const old = document.getElementById('__audit-statusbar');
    if (old) old.remove();
    const oldStyle = document.getElementById('__audit-statusbar-style');
    if (oldStyle) oldStyle.remove();

    const style = document.createElement('style');
    style.id = '__audit-statusbar-style';
    style.textContent = styles;
    document.head.appendChild(style);

    const bar = document.createElement('div');
    bar.id = '__audit-statusbar';
    bar.innerHTML =
      '<div id="__audit-statusbar-spinner"></div>' +
      '<div id="__audit-statusbar-phase">' + phase + '</div>' +
      '<div id="__audit-statusbar-detail">' + detail + '</div>' +
      '<div id="__audit-statusbar-stats"></div>' +
      '<div id="__audit-statusbar-actions"></div>';
    document.body.appendChild(bar);
  }, { styles: STATUS_BAR_STYLES, phase, detail });
}

export async function updateStatusBar(page, phase, detail = '', stats = '') {
  await page.evaluate(({ phase, detail, stats }) => {
    const bar = document.getElementById('__audit-statusbar');
    if (!bar) return;
    const phaseEl = document.getElementById('__audit-statusbar-phase');
    const detailEl = document.getElementById('__audit-statusbar-detail');
    const statsEl = document.getElementById('__audit-statusbar-stats');
    if (phaseEl && phase) phaseEl.textContent = phase;
    if (detailEl) detailEl.textContent = detail || '';
    if (statsEl) statsEl.textContent = stats || '';
  }, { phase, detail, stats });
}

/**
 * Show a CMP dropdown + "Verwenden" + "Manueller Modus" in the status bar.
 * @param {import('playwright').Page} page
 * @param {{ key: string, name: string }[]} cmpEntries – alphabetically sorted
 * @returns {Promise<{ type: 'select', key: string } | { type: 'manual' }>}
 */
export async function enableCMPSelect(page, cmpEntries) {
  const callbackName = nextCallbackName('cmpsel');

  let resolvePromise;
  const resultPromise = new Promise((resolve) => { resolvePromise = resolve; });

  try {
    await page.exposeFunction(callbackName, (json) => {
      resolvePromise(JSON.parse(json));
    });
  } catch { /* */ }

  await page.evaluate(({ cbName, entries }) => {
    const container = document.getElementById('__audit-statusbar-actions');
    if (!container) return;

    // Build select
    const select = document.createElement('select');
    select.id = '__audit-cmp-select';
    const placeholder = document.createElement('option');
    placeholder.textContent = '\u2014 CMP w\u00e4hlen \u2014';
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.value = '';
    select.appendChild(placeholder);
    for (const e of entries) {
      const opt = document.createElement('option');
      opt.value = e.key;
      opt.textContent = e.name;
      select.appendChild(opt);
    }

    // Build "Verwenden" button
    const useBtn = document.createElement('button');
    useBtn.id = '__audit-cmp-use-btn';
    useBtn.textContent = 'Verwenden';
    useBtn.disabled = true;

    // Build "Manueller Modus" button
    const manualBtn = document.createElement('button');
    manualBtn.id = '__audit-cmp-manual-btn';
    manualBtn.textContent = 'Manueller Modus';

    // Enable "Verwenden" when a CMP is selected
    select.addEventListener('change', () => {
      useBtn.disabled = !select.value;
    });

    // Callbacks
    useBtn.addEventListener('click', () => {
      if (select.value) {
        window[cbName](JSON.stringify({ type: 'select', key: select.value }));
      }
    });
    manualBtn.addEventListener('click', () => {
      window[cbName](JSON.stringify({ type: 'manual' }));
    });

    container.appendChild(select);
    container.appendChild(useBtn);
    container.appendChild(manualBtn);
    container.classList.add('--visible');
  }, { cbName: callbackName, entries: cmpEntries });

  return resultPromise;
}

/**
 * Replace the CMP select UI with a "Manuell übernehmen" button after auto-detection.
 * Returns { overridePromise } – resolves to true when the user clicks the button.
 */
export async function showCMPOverride(page, cmpName) {
  const callbackName = nextCallbackName('cmpovr');

  let resolveOverride;
  const overridePromise = new Promise((resolve) => { resolveOverride = resolve; });

  try {
    await page.exposeFunction(callbackName, () => resolveOverride(true));
  } catch { /* already exposed in this context */ }

  await page.evaluate(({ name, cbName }) => {
    const actions = document.getElementById('__audit-statusbar-actions');
    if (!actions) return;
    actions.innerHTML = '';

    const label = document.createElement('span');
    label.textContent = `CMP: ${name}`;
    label.style.cssText = 'color: #fca5a5 !important; font-size: 11px !important; font-weight: 600 !important; white-space: nowrap !important;';

    const btn = document.createElement('button');
    btn.id = '__audit-cmp-override-btn';
    btn.textContent = 'Manuell \u00fcbernehmen';
    btn.style.cssText = 'background: rgba(255,255,255,0.15) !important; color: #fecaca !important; border: 1px solid rgba(255,255,255,0.3) !important; border-radius: 4px !important; padding: 3px 10px !important; font-size: 11px !important; cursor: pointer !important; white-space: nowrap !important; font-family: inherit !important;';
    btn.addEventListener('mouseover', () => { btn.style.background = 'rgba(255,255,255,0.25) !important'; });
    btn.addEventListener('mouseout', () => { btn.style.background = 'rgba(255,255,255,0.15) !important'; });
    btn.addEventListener('click', () => {
      window[cbName]();
      btn.textContent = '\u2713 Manueller Modus';
      btn.disabled = true;
      btn.style.opacity = '0.6 !important';
    });

    actions.appendChild(label);
    actions.appendChild(btn);
    actions.classList.add('--visible');
  }, { name: cmpName, cbName: callbackName });

  return { overridePromise };
}

export async function removeStatusBar(page) {
  await page.evaluate(() => {
    const el = document.getElementById('__audit-statusbar');
    if (el) el.remove();
    const st = document.getElementById('__audit-statusbar-style');
    if (st) st.remove();
  });
}

// ── E-Commerce Step Prompt (non-blocking floating card) ─────────────────────

const ECOM_PROMPT_STYLES = `
  #__audit-ecomprompt, #__audit-ecomprompt * {
    box-sizing: border-box !important; margin: 0 !important; padding: 0 !important;
    line-height: 1.5 !important; text-transform: none !important;
    font-style: normal !important; text-decoration: none !important;
    float: none !important; border: none !important; outline: none !important;
  }
  #__audit-ecomprompt {
    position: fixed !important; bottom: 24px !important; left: 50% !important;
    transform: translateX(-50%) !important; z-index: 2147483647 !important;
    background: #fff !important; border-radius: 12px !important;
    padding: 20px 28px !important; max-width: 480px !important; width: 90% !important;
    box-shadow: 0 8px 32px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.08) !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    font-size: 14px !important; color: #333 !important;
    pointer-events: auto !important;
    box-sizing: border-box !important;
    cursor: grab !important; user-select: none !important;
  }
  #__audit-ecomprompt.--dragging { cursor: grabbing !important; }
  #__audit-ecomprompt-title {
    font-size: 15px !important; font-weight: 700 !important; color: #111 !important;
    margin: 0 0 8px 0 !important; padding: 0 !important; display: block !important;
  }
  #__audit-ecomprompt-msg {
    font-size: 13px !important; color: #555 !important;
    margin: 0 0 14px 0 !important; padding: 0 !important; display: block !important;
    line-height: 1.6 !important;
  }
  #__audit-ecomprompt-actions {
    display: flex !important; gap: 10px !important; margin: 0 !important; padding: 0 !important;
  }
  #__audit-ecomprompt-next {
    display: inline-block !important; padding: 10px 20px !important; border: none !important;
    border-radius: 8px !important; font-size: 13px !important; font-weight: 600 !important;
    cursor: pointer !important; background: #2563eb !important; color: #fff !important;
    font-family: inherit !important; transition: opacity 0.15s !important;
  }
  #__audit-ecomprompt-next:hover { opacity: 0.85 !important; }
  #__audit-ecomprompt-done {
    display: inline-block !important; padding: 10px 20px !important; border: none !important;
    border-radius: 8px !important; font-size: 13px !important; font-weight: 600 !important;
    cursor: pointer !important; background: #e5e7eb !important; color: #333 !important;
    font-family: inherit !important; transition: opacity 0.15s !important;
  }
  #__audit-ecomprompt-done:hover { opacity: 0.85 !important; }
`;

const ECOM_STEP_INSTRUCTIONS = {
  'Kategorie-Seite': 'Navigiere zu einer Kategorie-/Listing-Seite und klicke dann "Schritt abschließen".',
  'Produkt-Seite': 'Navigiere zu einer Produktdetailseite (PDP) und klicke dann "Schritt abschließen".',
  'Add-to-Cart': 'Klicke den "In den Warenkorb"-Button und klicke dann "Schritt abschließen".',
  'Warenkorb': 'Navigiere zum Warenkorb und klicke dann "Schritt abschließen".',
  'Checkout': 'Navigiere zum Checkout und klicke dann "Schritt abschließen".',
};

/**
 * Show a floating E-Commerce step prompt (non-blocking, page stays navigable).
 * Re-injects itself after navigation so the prompt survives page.goto() by the user.
 * page.exposeFunction() survives navigations; only the DOM needs re-injection.
 *
 * @param {import('playwright').Page} page
 * @param {string} stepName – e.g. 'Kategorie-Seite'
 * @param {number} stepNumber – 1-based
 * @param {number} totalSteps
 * @param {{ nextLabel?: string, instruction?: string }} [options]
 * @returns {Promise<'next'|'done'>}
 */
export async function showEcomStepPrompt(page, stepName, stepNumber, totalSteps, options = {}) {
  const callbackName = nextCallbackName('ecom');

  let resolvePromise;
  const resultPromise = new Promise((resolve) => { resolvePromise = resolve; });

  try {
    await page.exposeFunction(callbackName, (value) => {
      resolvePromise(value);
    });
  } catch { /* unique name should prevent collisions */ }

  const instruction = options.instruction
    || ECOM_STEP_INSTRUCTIONS[stepName]
    || 'Führe den Schritt aus und klicke dann "Schritt abschließen".';
  const nextLabel = options.nextLabel || 'Schritt abschlie\u00DFen';

  const injectArgs = {
    styles: ECOM_PROMPT_STYLES,
    title: '\uD83D\uDCE6 Schritt ' + stepNumber + '/' + totalSteps + ': ' + escapeHTML(stepName),
    instruction: escapeHTML(instruction),
    nextLabel: escapeHTML(nextLabel),
    cbName: callbackName,
  };

  // Injection function – called initially and after every navigation
  async function injectPrompt() {
    const { styles, title, instruction, nextLabel, cbName } = injectArgs;
    await page.evaluate(({ styles, title, instruction, nextLabel, cbName }) => {
      // Guard: don't double-inject
      if (document.getElementById('__audit-ecomprompt')) return;

      const style = document.createElement('style');
      style.id = '__audit-ecomprompt-style';
      style.textContent = styles;
      document.head.appendChild(style);

      const card = document.createElement('div');
      card.id = '__audit-ecomprompt';
      card.innerHTML =
        '<div id="__audit-ecomprompt-title">' + title + '</div>' +
        '<div id="__audit-ecomprompt-msg">' + instruction + '</div>' +
        '<div id="__audit-ecomprompt-actions">' +
          '<button id="__audit-ecomprompt-next">' + nextLabel + '</button>' +
          '<button id="__audit-ecomprompt-done">Audit abschlie\u00DFen</button>' +
        '</div>';
      document.body.appendChild(card);

      // Button callbacks
      document.getElementById('__audit-ecomprompt-next').addEventListener('click', () => {
        window[cbName]('next');
      });
      document.getElementById('__audit-ecomprompt-done').addEventListener('click', () => {
        window[cbName]('done');
      });

      // Drag handling
      let dragging = false, startX, startY, origX, origY;
      card.addEventListener('mousedown', (e) => {
        if (e.target.closest('button')) return;
        dragging = true;
        card.classList.add('--dragging');
        const rect = card.getBoundingClientRect();
        startX = e.clientX; startY = e.clientY;
        origX = rect.left; origY = rect.top;
        card.style.setProperty('bottom', 'auto', 'important');
        card.style.setProperty('left', origX + 'px', 'important');
        card.style.setProperty('top', origY + 'px', 'important');
        card.style.setProperty('transform', 'none', 'important');
        e.preventDefault();
      });
      document.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        const dx = e.clientX - startX, dy = e.clientY - startY;
        card.style.setProperty('left', (origX + dx) + 'px', 'important');
        card.style.setProperty('top', (origY + dy) + 'px', 'important');
      });
      document.addEventListener('mouseup', () => {
        if (!dragging) return;
        dragging = false;
        card.classList.remove('--dragging');
      });
    }, { styles, title, instruction, nextLabel, cbName });
  }

  // Initial injection
  await injectPrompt();

  // Re-inject after every navigation (DOM is destroyed, exposeFunction survives)
  const onLoad = async () => {
    try { await injectPrompt(); } catch { /* page may have been closed */ }
  };
  page.on('load', onLoad);

  const result = await resultPromise;

  // Clean up: remove listener and DOM
  page.off('load', onLoad);
  try {
    await page.evaluate(() => {
      const el = document.getElementById('__audit-ecomprompt');
      if (el) el.remove();
      const st = document.getElementById('__audit-ecomprompt-style');
      if (st) st.remove();
    });
  } catch { /* page may have navigated */ }

  return result;
}

/**
 * Wait for the user to click anywhere on the page (outside our UI).
 * Shows a floating indicator with pulsing "Warte auf Klick..." and an abort button.
 * Re-injects after navigation. Returns 'click' or 'done'.
 *
 * Used for interactive Add-to-Cart: after "Bereit", the next page click = ATC.
 */
export async function showEcomClickWait(page) {
  const callbackName = nextCallbackName('ecomclick');

  let resolvePromise;
  const resultPromise = new Promise((resolve) => { resolvePromise = resolve; });
  let resolved = false;

  try {
    await page.exposeFunction(callbackName, (value) => {
      if (resolved) return;
      resolved = true;
      resolvePromise(value);
    });
  } catch { /* */ }

  const injectArgs = { styles: ECOM_PROMPT_STYLES, cbName: callbackName };

  async function inject() {
    const { styles, cbName } = injectArgs;
    await page.evaluate(({ styles, cbName }) => {
      if (document.getElementById('__audit-ecomprompt')) return;

      const oldStyle = document.getElementById('__audit-ecomprompt-style');
      if (oldStyle) oldStyle.remove();

      const style = document.createElement('style');
      style.id = '__audit-ecomprompt-style';
      style.textContent = styles + `
        #__audit-ecomprompt-status {
          font-size: 13px !important; color: #6b7280 !important;
          margin: 0 0 12px 0 !important; padding: 0 !important; display: block !important;
          animation: __audit-ecom-pulse 1.5s ease-in-out infinite;
        }
        @keyframes __audit-ecom-pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
      `;
      document.head.appendChild(style);

      const card = document.createElement('div');
      card.id = '__audit-ecomprompt';
      card.innerHTML =
        '<div id="__audit-ecomprompt-title">\uD83D\uDDB1\uFE0F Klick erforderlich</div>' +
        '<div id="__audit-ecomprompt-msg">Dein n\u00E4chster Klick auf der Seite wird als Add-to-Cart erfasst.</div>' +
        '<div id="__audit-ecomprompt-status">Warte auf Klick...</div>' +
        '<div id="__audit-ecomprompt-actions">' +
          '<button id="__audit-ecomprompt-done">Audit abschlie\u00DFen</button>' +
        '</div>';
      document.body.appendChild(card);

      document.getElementById('__audit-ecomprompt-done').addEventListener('click', () => {
        window[cbName]('done');
      });

      // Click listener – any click outside our UI = ATC click
      document.addEventListener('click', function handler(e) {
        if (e.target.closest('#__audit-ecomprompt')) return;
        if (e.target.closest('#__audit-statusbar')) return;
        document.removeEventListener('click', handler, true);

        const status = document.getElementById('__audit-ecomprompt-status');
        if (status) {
          status.textContent = 'Klick erkannt \u2013 sammle Daten...';
          status.style.setProperty('color', '#16a34a', 'important');
          status.style.animation = 'none';
        }

        // Call back to Node BEFORE navigation can destroy the page
        window[cbName]('click');
      }, { capture: true });

      // Drag handling
      let dragging = false, startX, startY, origX, origY;
      card.addEventListener('mousedown', (e) => {
        if (e.target.closest('button')) return;
        dragging = true;
        card.classList.add('--dragging');
        const rect = card.getBoundingClientRect();
        startX = e.clientX; startY = e.clientY;
        origX = rect.left; origY = rect.top;
        card.style.setProperty('bottom', 'auto', 'important');
        card.style.setProperty('left', origX + 'px', 'important');
        card.style.setProperty('top', origY + 'px', 'important');
        card.style.setProperty('transform', 'none', 'important');
        e.preventDefault();
      });
      document.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        const dx = e.clientX - startX, dy = e.clientY - startY;
        card.style.setProperty('left', (origX + dx) + 'px', 'important');
        card.style.setProperty('top', (origY + dy) + 'px', 'important');
      });
      document.addEventListener('mouseup', () => {
        if (!dragging) return;
        dragging = false;
        card.classList.remove('--dragging');
      });
    }, { styles, cbName });
  }

  await inject();

  // Re-inject after navigation (click listener needs to be re-installed too)
  const onLoad = async () => {
    if (resolved) return;
    try { await inject(); } catch { /* page may close */ }
  };
  page.on('load', onLoad);

  const result = await resultPromise;

  page.off('load', onLoad);
  try {
    await page.evaluate(() => {
      const el = document.getElementById('__audit-ecomprompt');
      if (el) el.remove();
      const st = document.getElementById('__audit-ecomprompt-style');
      if (st) st.remove();
    });
  } catch { /* page may have navigated */ }

  return result;
}

// ── Consent Card (manual consent fallback for audit.js) ─────────────────────

/**
 * Shows a small draggable card asking the user to manually accept/reject cookies.
 * Button is disabled for 2s settle time, then enabled. Returns a Promise that
 * resolves when the user clicks the confirm button.
 */
export async function showConsentCard(page, action) {
  const callbackName = nextCallbackName('consent');
  const isAccept = action === 'ACCEPT';
  const title = isAccept ? 'Consent: Akzeptieren' : 'Consent: Ablehnen';
  const msg = isAccept
    ? 'Bitte alle Cookies <b>akzeptieren</b>, dann best\u00e4tigen:'
    : 'Bitte alle Cookies <b>ablehnen</b>, dann best\u00e4tigen:';
  const btnLabel = isAccept ? 'Cookies akzeptiert' : 'Cookies abgelehnt';

  let resolveConsent;
  const consentPromise = new Promise((resolve) => { resolveConsent = resolve; });

  await page.exposeFunction(callbackName, () => {
    resolveConsent();
  });

  await page.evaluate(({ title, msg, btnLabel, cbName }) => {
    const style = document.createElement('style');
    style.id = '__audit-consent-style';
    style.textContent = `
      #__audit-consent-card {
        position: fixed !important; bottom: 24px !important; right: 24px !important;
        z-index: 2147483647 !important;
        background: #fff !important; border-radius: 12px !important;
        padding: 20px 24px !important; max-width: 360px !important; width: auto !important;
        box-shadow: 0 8px 32px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.08) !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        font-size: 14px !important; color: #333 !important;
        box-sizing: border-box !important; margin: 0 !important;
        line-height: 1.5 !important; cursor: grab !important; user-select: none !important;
      }
      #__audit-consent-card.--dragging { cursor: grabbing !important; }
      #__audit-consent-title {
        font-size: 15px !important; font-weight: 700 !important; color: #111 !important;
        margin: 0 0 8px 0 !important; display: block !important;
      }
      #__audit-consent-msg {
        font-size: 13px !important; color: #555 !important;
        margin: 0 0 14px 0 !important; display: block !important;
      }
      #__audit-consent-btn {
        background: #2563eb !important; color: #fff !important; border: none !important;
        border-radius: 8px !important; padding: 10px 20px !important;
        font-size: 14px !important; font-weight: 600 !important; cursor: pointer !important;
        display: block !important; width: 100% !important; text-align: center !important;
      }
      #__audit-consent-btn:hover:not(:disabled) { background: #1d4ed8 !important; }
      #__audit-consent-btn:disabled { background: #9ca3af !important; cursor: default !important; pointer-events: none !important; }
      #__audit-consent-btn.--ready { background: #2563eb !important; cursor: pointer !important; pointer-events: auto !important; }
    `;
    document.head.appendChild(style);

    const card = document.createElement('div');
    card.id = '__audit-consent-card';
    card.innerHTML =
      '<div id="__audit-consent-title">' + title + '</div>' +
      '<div id="__audit-consent-msg">' + msg + '</div>' +
      '<button id="__audit-consent-btn" disabled>Bitte warten...</button>';
    document.body.appendChild(card);

    // Enable button after 2s settle time
    setTimeout(() => {
      const btn = document.getElementById('__audit-consent-btn');
      if (btn) {
        btn.disabled = false;
        btn.classList.add('--ready');
        btn.textContent = btnLabel;
      }
    }, 2000);

    document.getElementById('__audit-consent-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      const btn = document.getElementById('__audit-consent-btn');
      if (!btn.classList.contains('--ready')) return;
      btn.disabled = true;
      btn.classList.remove('--ready');
      btn.textContent = 'OK – weiter...';
      btn.style.setProperty('background', '#22c55e', 'important');
      window[cbName]();
    });

    // Drag handling
    let dragging = false, startX, startY, origX, origY;
    card.addEventListener('mousedown', (e) => {
      if (e.target.id === '__audit-consent-btn') return;
      dragging = true;
      card.classList.add('--dragging');
      const rect = card.getBoundingClientRect();
      startX = e.clientX; startY = e.clientY;
      origX = rect.left; origY = rect.top;
      card.style.setProperty('bottom', 'auto', 'important');
      card.style.setProperty('right', 'auto', 'important');
      card.style.setProperty('left', origX + 'px', 'important');
      card.style.setProperty('top', origY + 'px', 'important');
      e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      card.style.setProperty('left', (origX + e.clientX - startX) + 'px', 'important');
      card.style.setProperty('top', (origY + e.clientY - startY) + 'px', 'important');
    });
    document.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      card.classList.remove('--dragging');
    });
  }, { title, msg, btnLabel, cbName: callbackName });

  return consentPromise;
}

/**
 * Removes the consent card from the page.
 */
export async function removeConsentCard(page) {
  await page.evaluate(() => {
    const card = document.getElementById('__audit-consent-card');
    const style = document.getElementById('__audit-consent-style');
    if (card) card.remove();
    if (style) style.remove();
  }).catch(() => {});
}

// ── Utility ──────────────────────────────────────────────────────────────────

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
