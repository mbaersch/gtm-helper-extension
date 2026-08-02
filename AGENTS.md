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
| Schalter für die GTM-UI-Funktionen | `gtm-ui-features.js` (Zustand), Karte „GTM-Oberfläche" in `popup.html`/`popup.js` — s. u. |
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

## Sprache im GTM-UI: nicht `<html lang>`
Alles, was in die GTM-Oberfläche hineingeschrieben wird (`gtm-ui.js`, `gtm-var-edit.js`), folgt deren Sprache, nicht der Popup-Einstellung — die ist aus einem Content-Script dort auch gar nicht erreichbar. **`<html lang>` ist auf `tagmanager.google.com` leer**, ein Griff darauf fällt still auf `navigator.language` durch und fällt nur auf, wenn Browser- und GTM-Sprache auseinanderlaufen (`?hl=en`). Maßgeblich ist `preloadData.currentLocale` aus dem Seitencode; aus der ISOLATED world ist das Objekt unsichtbar, deshalb liest `detectGtmLanguage()` in `translations.js` den Inline-Code als Text. Immer diese Funktion verwenden.

## GTM-UI-Funktionen sind einzeln abschaltbar
Die GTM-Oberfläche wird von vielen Extensions erweitert; wer zwei davon installiert hat, bekommt doppelte oder kollidierende Bedienelemente (unser Ausblenden der integrierten Variablen überschneidet sich etwa mit `hideBuiltInVariables.js` des GTM Fixers). Deshalb ist jede Funktion einzeln schaltbar, dazu ein Hauptschalter — über die Karte **„GTM-Oberfläche"** unten im Popup.

Alles dazu in `gtm-ui-features.js`; die Datei wird vor `gtm-ui.js` geladen und stellt `igtmGtmUiFeatures` bereit (`read`, `write`, `isOn`, `onChange`).

**Zwei Ebenen, die nicht dasselbe sind.** `features.pin` entscheidet, ob es den Pin überhaupt gibt; `stickyBar`, ob er gedrückt ist. Wird eine Funktion abgeschaltet, verschwindet ihr Bedienelement mitsamt Wirkung — ihr eigener Zustand bleibt gespeichert und gilt wieder, sobald sie zurückkommt. Beides liegt unter `igtm_gtm_ui` im `localStorage` von `tagmanager.google.com`:

```json
{ "stickyBar": false, "hideBuiltInVars": false,
  "enabled": true,
  "features": { "nav": true, "pin": true, "builtIn": true,
                "submitHint": true, "chips": true, "sort": true } }
```

- **Fehlt ein Schlüssel, ist die Funktion an.** Überall `!== false` prüfen, nie `=== true` — sonst ist bei jedem, der nie etwas geschaltet hat, alles aus.
- Die beiden reinen CSS-Funktionen (`nav`, `submitHint`) hängen an einer Klasse am `<html>`-Element, die das **Aus**schalten markiert (`igtm-off-nav`, `igtm-off-submit`). Andersherum gäbe es im Normalfall bei jedem Seitenaufbau ein Aufblitzen, weil bis `document_idle` keine Klasse gesetzt ist.
- Das Popup schreibt per `chrome.scripting` in **alle** offenen GTM-Tabs und löst dort `igtm-gtm-ui-changed` auf `window` aus. Der `localStorage` gehört zwar der Origin und ist für alle Tabs derselbe, aber die laufenden Content-Scripts erfahren von der Änderung nur durch das Ereignis. Ein `storage`-Ereignis taugt dafür nicht: Es feuert nur in *anderen* Dokumenten derselben Origin, und das injizierte Script läuft im selben.
- **Die Karte ist nur bedienbar, während ein GTM-Tab aktiv ist.** Sonst kommt das Popup an die Origin nicht heran (`chrome.storage` scheidet aus, das wäre eine neue Permission). Auf anderen Seiten werden die Kästchen **ausgeblendet**, nicht ausgegraut — ein ausgegrautes Häkchen würde einen Zustand behaupten, der geraten wäre.

## Konventionen
- Popup-Texte immer über `translations.js` (DE **und** EN), nie hart im HTML.
- Keine neuen Permissions ohne Not — "no new permissions" ist ein wiederkehrendes Changelog-Versprechen. Aktuell: `activeTab`, `cookies`, `scripting`, `<all_urls>`.
- Changelog in beiden READMEs pflegen, Versions-Badge und `manifest.json` synchron halten.
- Commits: Conventional Commits (`feat(popup):`, `fix:`, `docs(readme):`, `chore(release):`).
