/*
 * Kommentare aus den Paketdateien entfernen, aufgerufen beim Packen.
 *
 * Kein Minifier als Abhängigkeit: package.json ist nicht versioniert, ein npm-
 * Paket wäre nach dem nächsten Aufsetzen weg und der Build kaputt. Deshalb ein
 * eigener Zustandsautomat — ein Regex über den Quelltext würde an "//" in einer
 * URL oder an einem Regex-Literal scheitern.
 */

// Nach diesen Zeichen beginnt ein "/" einen regulären Ausdruck und keine Division.
const REGEX_AFTER = '(,=:[!&|?{};+-*%~^<>';
const REGEX_AFTER_WORDS = [
  'return', 'typeof', 'instanceof', 'case', 'in', 'of', 'new', 'delete',
  'void', 'throw', 'do', 'else', 'yield', 'await'
];

function regexFolgt(davor, wort) {
  if (!davor) return true;
  if (REGEX_AFTER.indexOf(davor) >= 0) return true;
  if (/[A-Za-z0-9_$]/.test(davor)) return REGEX_AFTER_WORDS.indexOf(wort) >= 0;
  return false;
}

function stripJs(code) {
  let out = '';
  let i = 0;
  let davor = '';   // letztes bedeutungstragendes Zeichen
  let wort = '';    // das Wort, das darauf endet (für return, typeof …)

  const merken = (c) => {
    if (/\s/.test(c)) return;
    davor = c;
    wort = /[A-Za-z0-9_$]/.test(c) ? wort + c : '';
  };

  while (i < code.length) {
    const c = code[i];
    const next = code[i + 1];

    if (c === '/' && next === '/') {
      while (i < code.length && code[i] !== '\n') i++;
      continue;
    }

    if (c === '/' && next === '*') {
      i += 2;
      while (i < code.length && !(code[i] === '*' && code[i + 1] === '/')) i++;
      i += 2;
      continue;
    }

    if (c === '"' || c === "'" || c === '`') {
      const ende = c;
      out += c;
      i++;
      while (i < code.length) {
        if (code[i] === '\\') { out += code[i] + (code[i + 1] || ''); i += 2; continue; }
        out += code[i];
        if (code[i] === ende) { i++; break; }
        i++;
      }
      davor = ende;
      wort = '';
      continue;
    }

    if (c === '/' && regexFolgt(davor, wort)) {
      out += c;
      i++;
      let inKlasse = false;
      while (i < code.length) {
        if (code[i] === '\\') { out += code[i] + (code[i + 1] || ''); i += 2; continue; }
        if (code[i] === '[') inKlasse = true;
        else if (code[i] === ']') inKlasse = false;
        out += code[i];
        if (code[i] === '/' && !inKlasse) { i++; break; }
        if (code[i] === '\n') { i++; break; }   // unbeendet: dann war es doch keine
        i++;
      }
      davor = '/';
      wort = '';
      continue;
    }

    out += c;
    merken(c);
    i++;
  }

  return aufraeumen(out);
}

// Zeichenketten (content: "…") aussparen.
function stripCss(code) {
  let out = '';
  let i = 0;

  while (i < code.length) {
    const c = code[i];

    if (c === '/' && code[i + 1] === '*') {
      i += 2;
      while (i < code.length && !(code[i] === '*' && code[i + 1] === '/')) i++;
      i += 2;
      continue;
    }

    if (c === '"' || c === "'") {
      const ende = c;
      out += c;
      i++;
      while (i < code.length) {
        if (code[i] === '\\') { out += code[i] + (code[i + 1] || ''); i += 2; continue; }
        out += code[i];
        if (code[i] === ende) { i++; break; }
        i++;
      }
      continue;
    }

    out += c;
    i++;
  }

  return aufraeumen(out);
}

// Bedingte Kommentare bleiben stehen: <!--[if …]> ist Anweisung, nicht Erklärung.
function stripHtml(code) {
  return aufraeumen(code.replace(/<!--(?!\[if)[\s\S]*?-->/g, ''));
}

function aufraeumen(text) {
  return text
    .split('\n')
    .map((zeile) => (zeile.trim() === '' ? '' : zeile.replace(/\s+$/, '')))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\n+/, '');
}

module.exports = { stripJs, stripCss, stripHtml };
