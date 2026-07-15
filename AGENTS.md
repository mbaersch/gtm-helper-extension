# AGENTS.md — GTM & CMP Helper

Chrome Extension (Manifest V3) mit drei Funktionen: GTM-Container in beliebige Seiten injizieren, den Consent-Status bekannter CMPs zurücksetzen, geladene Google-Tags & Container erkennen. Seit 2019 im Chrome Web Store, aktuelle Version siehe `manifest.json`.

## Umgebung
- Windows, PowerShell als primäre Shell. Das Build-Skript ruft `Compress-Archive` auf — kein zip-Binary nötig.
- Node nur für Build/Tests, nicht zur Laufzeit. `npm run build` erzeugt `gtm-cmp-helper-v<version>.zip` aus `manifest.json`-Version.
- Tests: Playwright (`npm test`). `package.json` und Tests sind bewusst **nicht** versioniert (siehe .gitignore-Whitelist).

## Zwei Whitelists — die häufigste Fehlerquelle
`.gitignore` ignoriert per `*` **alles** und erlaubt einzeln zurück. Eine neue Laufzeit-Datei muss deshalb an **zwei** Stellen eingetragen werden, sonst fehlt sie still in git und/oder im ZIP:
1. `.gitignore` — `!pfad/datei` ergänzen (sonst nicht versioniert)
2. `scripts/package-extension.js` — in `filesToInclude` (sonst nicht im ZIP-Paket)

Nicht-Laufzeit-Dateien (Doku wie diese Datei, README) brauchen nur (1).

## Wo was liegt
| Zweck | Ort |
|---|---|
| CMP-Erkennung & Reset (Cookie-/Storage-Namen → CMP) | `popup.js`, Konstanten `CMP_COOKIES`, `CMP_LOCAL_STORAGE`, `CMP_SESSION_STORAGE` ganz oben — **plus** der dynamische Block, s. u. |
| GTM-Injektion, Popup-Logik | `popup.js` (Rest), `content.js`, `background.js` |
| Tag-/Container-Erkennung | `detect/gtm-detect.js` (MAIN world), `detect/classify.js` (Lademethode), `detect/gtm-relay.js` (ISOLATED world → Bridge zum Background) |
| CSS-Hinweis im GTM-UI (Sende-Dialog) | `gtm-ui.css`, injiziert nur auf `tagmanager.google.com` |
| Übersetzungen DE/EN | `translations.js` |
| Design-/Plan-Dokumente | `docs/` |
| Externe Datenimporte, nicht versioniert | `data/` |

## Die CMP-Liste steht an ZWEI Stellen in popup.js
Die drei Konstanten sind **nicht** die vollständige Liste. CMPs, deren Cookie-Namen pro Site variieren (Account-/Site-ID im Namen), stehen dort nicht, sondern werden im Reset-Code dynamisch per Präfix aufgelöst — im Block ab `//Dynamische Namen von Cookies suchen und anhängen...` (`chrome.cookies.getAll` → `results.filter(x => x.name.indexOf("<präfix>") >= 0)`).

Aktuell dynamisch: Real Cookie Banner (`real_cookie_banner-v:`), Consentmanager.net (`__cmpc`), Concord (`concord-allow-state-`), Piwik PRO (`ppms_privacy_`), iubenda (`_iub_cs-`), MyAgilePrivacy (`map_accepted_`), MND Cookie Notice (`mnd-`), BigID/illow (`bigidcmp-consent-`).

**Wer die unterstützten CMPs zählt oder gegen eine Fremdliste abgleicht, muss beide Stellen lesen.** Nur die Konstanten zu parsen unterzählt und meldet bereits unterstützte Tools als fehlend (real passiert: iubenda wurde als „kennen wir nicht" geführt und neu recherchiert, obwohl es seit Langem drin ist).

## Die CMP-Liste hat vier Orte
Wird ein CMP ergänzt, muss die Zahl/Liste überall mitgezogen werden — sonst driften Store-Text und Infoseite auseinander:
1. `popup.js` — die eigentlichen Erkennungs-/Lösch-Patterns
2. `README.md` + `README.de.md` — Feature-Text und Changelog ("60+ CMPs")
3. `manifest.json` — `description` (fließt in den Web-Store-Eintrag), `webstore/description.txt`
4. **Infoseite** (siehe unten) — `<ul class="cmp-list">` mit den Klarnamen, plus `<meta name="description">` und Fließtext

## Infoseite (anderes Projekt)
Die öffentliche Doku liegt **nicht** in diesem Repo, sondern unter:
`C:\Users\mbaer\Eigene Websites\4. Sites MBSL\markus-baersch.de\gtm-cmp-helper-extension.html`

- Früher `analytrix.de/gtm-helper-chrome-extension.html`, umgezogen per 301-Redirect (analytrix `.htaccess`). Kanonische URL: `https://www.markus-baersch.de/gtm-cmp-helper-extension.html`.
- Der HTML-Kommentar direkt nach `<!DOCTYPE html>` hält den beschriebenen Versionsstand fest — bei Releases mitpflegen.
- `webdoc/gtm-helper-chrome-extension.html` im Repo ist ein **veralteter Stand** der alten analytrix-Seite, nicht die Quelle der Wahrheit.
- `README.md` verlinkt noch auf die alte analytrix-URL (funktioniert via Redirect, bei Gelegenheit korrigieren).

## Konventionen
- Popup-Texte immer über `translations.js` (DE **und** EN), nie hart im HTML.
- Keine neuen Permissions ohne Not — "no new permissions" ist ein wiederkehrendes Changelog-Versprechen. Aktuell: `activeTab`, `cookies`, `scripting`, `<all_urls>`.
- Changelog in beiden READMEs pflegen, Versions-Badge und `manifest.json` synchron halten.
- Commits: Conventional Commits (`feat(popup):`, `fix:`, `docs(readme):`, `chore(release):`).
