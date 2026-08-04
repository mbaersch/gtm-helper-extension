# GTM & CMP Helper - Chrome Extension

[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-Installieren-blue?logo=google-chrome&logoColor=white)](https://chromewebstore.google.com/detail/gtm-helper/kbnbkogeeackdjiibllebnpdccbmepil)
[![Version](https://img.shields.io/badge/version-3.7-blue.svg)](#)

GTM & CMP Helper ist eine Chrome-Extension zum Verwalten von Consent Management Platform (CMP) Daten, Injizieren von Google Tag Manager Containern und zum Debugging während der Entwicklung.

---

## Installation

### Primärer Weg (Empfohlen)
**[Installation über den Chrome Web Store](https://chromewebstore.google.com/detail/gtm-helper/kbnbkogeeackdjiibllebnpdccbmepil)**

### Für Entwickler
So laden Sie die Erweiterung manuell aus diesem Repository:
1. Repository herunterladen oder klonen.
2. Google Chrome öffnen und `chrome://extensions/` aufrufen.
3. **"Entwicklermodus"** aktivieren.
4. Auf **"Entpackte Erweiterung laden"** klicken und den Projektordner auswählen.

---

## Funktionen

### 1. GTM Container Injektion
Fügt GTM-Container-Code in die aktuelle Seite ein.
- **Erweiterte Parameter:** Unterstützung für `gtm_auth` und `gtm_preview` Umgebungs-Token.
- **GA4 Debugging:** Ermöglicht die Nutzung der GA4 DebugView durch Preview-Token ohne den offiziellen Tag Assistant.
- **Positionierung:** Optionen für die Injektion im `<head>` oder am Anfang von `<body>`.

### 2. CMP-Erkennung & Reset
Identifiziert die aktive Consent Management Platform auf einer Website.
- **Spezifischer Reset:** Löscht Cookies und Storage-Einträge der erkannten CMP.
- **Globaler Reset:** Option zum Löschen aller bekannten Consent-Daten (unterstützt über 130 CMPs).

### 3. Google-Tag- & Container-Erkennung
Erkennt automatisch die auf der aktuellen Seite geladenen Google-Tags — immer aktiv, ohne Konfiguration und ohne zusätzliche Berechtigungen.
- **Was:** GTM-Container und gtag.js-Tags (GA4, Google Ads etc.), erkannt über `window.google_tag_manager` und Resource-Timings.
- **Wie:** Klassifiziert den Ladeweg — `standard` (googletagmanager.com), `first-party` (Server-side GTM / Google Tag Gateway), `custom-path` oder `base64`-Tunnel.
- **Wo:** Container-Anzahl im Toolbar-Badge, eine Popup-Sektion „Erkannte Google-Tags & Container" (ID · Methode · Host) und ein Konsolen-Log pro neuem Fund.

### 4. Komfort in der GTM-Oberfläche
Anzeige- und Bedienhilfen auf `tagmanager.google.com` — ohne zusätzliche Berechtigungen und ohne Zugriff auf Container-Daten.
- **Fixierte Navigation:** Die Bereichsnavigation bleibt beim Scrollen langer Listen sichtbar, statt nach oben wegzuscrollen.
- **Fixierbare Suchleiste:** Ein Schalter in der Titelleiste von Tags, Triggern und Variablen hält Titel, Suche und Schaltflächen beim Scrollen oben (Standard: aus).
- **Sortierung von Parametertabellen:** Suchtabellen, Ereignisparameter und vergleichbare Schlüssel-Wert-Listen lassen sich alphabetisch auf- und absteigend sortieren — nach Eingabe- oder Ausgabespalte, auch in Custom Templates. Der Schalter erscheint nur an Tabellen, die sich verlustfrei sortieren lassen.
- **Integrierte Variablen ausblenden:** Ein Schieberegler blendet die selten benötigte Liste dauerhaft aus, damit die benutzerdefinierten Variablen ohne Scrollen erreichbar sind.
- **Warnung im Sende-Dialog:** Färbt den Senden-Button orange, sobald die gewählte Aktion nur eine Version erstellt statt zu veröffentlichen.
- **Variablen aus Eingabefeldern heraus bearbeiten:** Enthält ein Feld eines Tags oder Triggers eine Referenz wie `{{Meine Variable}}`, erscheint darunter ein Chip pro Variable. Ein Klick öffnet deren Definition direkt darüber — nach dem Schließen steht man wieder im Tag, ohne Bereichswechsel und ohne Umweg über die Auswahlliste. Auch bei kombinierten Referenzen in einem Feld.
- **Einzeln abschaltbar:** Die Karte „GTM-Oberfläche verbessern" im Popup schaltet jede dieser Funktionen für sich ab, dazu alle zusammen. Abgeschaltet heißt weg: Auch die Bedienelemente in der Oberfläche verschwinden, damit sich nichts mit anderen GTM-Extensions doppelt. Voreingestellt ist alles an. Die Karte lässt sich bedienen, während ein Tab mit `tagmanager.google.com` aktiv ist — dort liegen die Einstellungen, und ohne neue Berechtigung ist von außen kein Weg dorthin.

Die Schalter merken sich ihren Zustand; ihre Beschriftungen folgen der Sprache der GTM-Oberfläche.

### 5. Benutzeroberfläche
- **Design:** Standardmäßig im Dark Mode mit manuellem Umschalter für das Light Theme.
- **Sprache:** Verfügbar in Deutsch und Englisch.
- **Architektur:** Erstellt mit CSS Grid unter Einhaltung aktueller Extension-Standards (Manifest V3).

---

## Bedienung

1. **GTM-Injektion:** Container-Code in das Textfeld eingeben, Schalter umlegen und auf **Speichern & neu laden** klicken.
2. **Erweiterte Einstellungen:** Akkordeon öffnen, um umgebungsspezifische Token einzugeben.
3. **Consent-Reset:** Den Link **nur diese zurücksetzen** in der Erkennungs-Box (löscht allein die Daten der erkannten CMP) oder den Button **Consent löschen** im Footer (löscht alle bekannten).

---

## Changelog

> Seit 2019 im Chrome Web Store verfügbar; dieses Changelog beginnt mit dem 3.x-Refactoring.

### 3.7
- **Neu — Sortierung der Listen wird gemerkt:** GTM setzt Tag-, Trigger- und Variablenliste bei jedem Bereichswechsel auf Name aufsteigend zurück. Wer nach „Zuletzt bearbeitet" oder „Typ" sortiert, um etwas zu finden, fängt nach dem nächsten Wechsel von vorn an. Die zuletzt gewählte Sortierung wird jetzt je Liste gespeichert und beim Zurückkehren wiederhergestellt — auch nach einem Neuladen. Wieder zur Standardsortierung kommt man, indem man dorthin sortiert. Da die Spalten intern benannt sind und nicht über ihre Beschriftung erkannt werden, gilt die gemerkte Sortierung auch über Container-Typen hinweg — von Web- zu Server-Container — und unabhängig von der Sprache der Oberfläche.
- **Neu — Suchbegriff der Listen wird gemerkt (standardmäßig aus):** Das Filterfeld der Tag-, Trigger- und Variablenliste wird beim Bereichswechsel geleert. Wer in der Tag-Liste nach etwas filtert, kurz zu einem Trigger springt und zurückkommt, tippt erneut. Der Begriff bleibt jetzt erhalten, solange der Tab offen ist — auch über ein Neuladen hinweg. Ein neuer Tab startet leer, und mit dem Schließen ist der Begriff weg. Ein wiederhergestellter Begriff steht sichtbar im aufgeklappten Feld und ist farblich markiert, damit eine verkürzte Liste nicht wie ein Fehler wirkt; die Markierung verschwindet, sobald man selbst tippt. Weil die Funktion Zeilen ausblendet, ist sie als einzige voreingestellt **aus** und wird in der Karte „GTM-Oberfläche verbessern" eingeschaltet. Damit sie nicht unentdeckt bleibt, steht im Filterfeld ein Hinweis darauf — aber nur, solange niemand den Schalter angefasst hat. Wer die Funktion abschaltet, hat auch den Hinweis los.
- **Neu — jedes eingefügte Bedienelement nennt seine Herkunft:** Pin, Variablen-Schalter, Sortierknöpfe, „+ Neue Zeile unterhalb" und die Variablen-Chips tragen im Tooltip eine zweite Zeile „Eingefügt vom GTM & CMP Helper". Wer mehrere GTM-Erweiterungen installiert hat, sieht damit, woher ein Bedienelement kommt. Vorgelesen wird die Zeile nicht — sie steht nur im Tooltip, nicht in der Beschriftung für Screenreader.
- **Neu — Zeile in Parametertabellen darunter einfügen:** GTM erweitert Parametertabellen nur am Ende. Wo die Reihenfolge zählt — etwa in RegEx-Tabellen, in denen der erste Treffer gewinnt —, musste eine freie Zeile bisher von Hand erzeugt werden: unten anhängen, dann jeden Wert ab der Zielposition einzeln nach unten kopieren. Steht der Cursor jetzt in der ersten Spalte einer Zeile, auf die weitere folgen, erscheint dort „+ Neue Zeile unterhalb" und erledigt das mit einem Klick. Die Zeile, in der gearbeitet wird, bleibt unangetastet; ein Fehlklick kostet einen Klick auf GTMs Entfernen-Symbol. In der letzten Zeile erscheint nichts — dort genügt die native Schaltfläche.
- **Fix:** Die Metadata-Tabellen der Tags hatten nie Sortierschaltflächen. Sie verwenden ein anderes Textfeld als die übrigen Parametertabellen und fielen deshalb aus der Prüfung, die Tabellen mit Auswahllisten fernhält. Beide Funktionen stehen dort jetzt zur Verfügung.
- **Änderung:** Der Schalter „Buttons zum Sortieren von Parametertabellen" heißt jetzt „Erweiterungen für Parametertabellen (sortieren, Zeile einfügen)" und deckt beide Funktionen ab. Wer ihn abgeschaltet hatte, findet ihn unverändert abgeschaltet vor.

### 3.6
- **Neu — Komfortfunktionen im GTM einzeln abschaltbar:** Die Karte „GTM-Oberfläche verbessern" unten im Popup schaltet jede der sechs Funktionen für sich ab, dazu eine für alle zusammen. Abgeschaltet heißt weg: Pin, Variablen-Schalter und Sortierzeilen verschwinden mitsamt Wirkung aus der Oberfläche, damit sich nichts mit anderen GTM-Extensions doppelt. Voreingestellt ist alles an. Bedienbar ist die Karte, während ein Tab mit `tagmanager.google.com` aktiv ist — dort liegen die Einstellungen, und ohne neue Berechtigung führt kein Weg von außen dorthin.
- **Neu — Variablen aus Eingabefeldern heraus bearbeiten:** Steht in einem Feld eines Tags oder Triggers eine Referenz wie `{{Meine Variable}}`, erscheint unter dem Feld ein Chip je Variable; ein Klick öffnet deren Definition direkt über dem Tag, so dass das Schließen dorthin zurückführt statt in die Variablenliste. Kombinierte Referenzen in einem Feld bekommen je einen eigenen Chip. Integrierte Variablen werden nach dem ersten Versuch grau markiert (sie haben keine Konfiguration), Namen ohne Eintrag in der Liste rot. Keine neuen Berechtigungen.
- **Hinweis zur Umsetzung:** Die Zuordnung Name → Variable übernimmt GTMs eigene Auswahlliste, es wird keine Variablenliste vorgehalten. Umbenennen, Anlegen und Löschen wirken deshalb sofort, und es entsteht keine Dauerlast — die Chips erscheinen nur im gerade fokussierten Feld.
- **Fix:** Der Hilfe-Link im Popup zeigt direkt auf die aktuelle Adresse statt auf die weitergeleitete alte.
- **Fix:** Die Beschriftungen in der GTM-Oberfläche folgen wieder deren Sprache. Bisher richteten sie sich immer nach der Browsersprache, was nur auffiel, wenn beide auseinanderliefen (etwa mit `?hl=en`).
- **Änderung:** Fixierte Titelleisten haben eine untere Abschlusslinie, damit der durchscrollende Inhalt nicht unvermittelt darunter verschwindet.
- **Änderung — Infoseite statt Hinweisfenster:** Das „i" in der Kopfzeile öffnet keinen zentrierten Kasten mit zwei Sätzen mehr, sondern eine Seite über den ganzen Inhaltsbereich, mit Zurück-Schalter oben und unten (Escape schließt ebenfalls). Der Text beschreibt jetzt alle Funktionsbereiche samt Speicherort und benötigten Berechtigungen — und nennt die richtige Zahl unterstützter CMPs.
- **Änderung — Schalter statt Kästchen:** Die Optionen im Popup sind Schieberegler im Stil derer in der GTM-Oberfläche. Ein Doppelklick auf die Beschriftung schaltet jetzt zweimal, statt den Text zu markieren.
- **Änderung — Consent-Löschung klarer getrennt:** Der Link an der erkannten CMP heißt „nur diese zurücksetzen"; die beiden Bestätigungsdialoge nennen getrennt, was genau gelöscht wird. Der Rundumschlag über alle bekannten CMPs ist bei geteilten CMP- und Plattform-Einträgen oft die einzige Lösung — das steht jetzt dort. Neue Symbole in der Fußzeile: Keks statt Mülleimer, Kreispfeil statt Diskette.
- **Fix:** Auf Seiten, in die keine Extension schreiben darf (`chrome://`, Web Store), schrieb das Popup Fehler in die Konsole, statt die dort sinnlosen Abfragen zu überspringen.

### 3.5
- **Neu — Komfort in der GTM-Oberfläche:** dauerhaft sichtbare Bereichsnavigation, auf Wunsch fixierte Titel- und Suchleiste in Tag-, Trigger- und Variablenlisten, alphabetische Sortierung von Parametertabellen (Suchtabellen, Ereignisparameter, Custom Templates) und ein Schalter zum Ausblenden der integrierten Variablen. Keine neuen Berechtigungen.
- **Hinweis zur Sortierung:** Sie erscheint nur an Tabellen, deren Zellen ausschließlich Textfelder enthalten. Enthält eine Spalte etwas anderes — etwa eine Auswahlliste —, bleibt der Schalter aus: Ein solcher Wert würde beim Umsortieren nicht mitwandern und aus seiner Zeile gerissen. Geschrieben wird ohnehin nur in die Eingabefelder; übernommen wird erst, wenn im GTM gespeichert wird.

### 3.4
- **Neu — CMP-Abdeckung deutlich ausgebaut:** Der Reset kennt jetzt ca. 130 CMPs (vorher 70+), darunter CookieAdmin, DSGVO-Pixelmate, Ezoic, clickskeks, Pressidium, Sellwerk, KookieTool, Cookie Cracker, LWD Cookie Master, mehrere TYPO3-Consent-Tools und viele weitere. ♥️ **h/t:** Die Quelle war eine freundlicherweise von Joachim Nickel bereitgestellte Liste von CMPs aus seinem Tool [exatics](https://www.exatics.de/). 

### 3.3
- **Neu — Warnung im GTM-Sende-Dialog:** Auf `tagmanager.google.com` färbt ein reiner CSS-Hinweis den Senden-Button orange und hinterlegt die gewählte Option „Version erstellen", sobald die Aktion nur eine Version erstellt statt zu veröffentlichen — so ist sofort erkennbar, wenn Änderungen nicht live gehen (z. B. bei Freigeben-, aber nicht Veröffentlichen-Recht), wo der Button in beiden Fällen nur „Senden" heißt. Keine neuen Berechtigungen.
- **Änderung:** Die Popup-Sektion „Erkannte Google-Tags & Container" nutzt jetzt Blau (passend zur Zahl auf der Toolbar-Badge) statt Warn-Orange, wirkt damit als Information statt Warnung und hebt sich vom orangen Checkup-Hinweis ab.

### 3.2
- **Fix:** Der vollständige CMP-Reset („alles löschen") bricht nicht mehr ab, bevor die Cookies entfernt sind. `window.close()` wurde synchron aufgerufen, während die asynchrone Löschkette noch lief, und zerstörte den Popup-Kontext, bevor die Cookies gelöscht wurden (timing-abhängige Race Condition). Das Popup schließt jetzt erst nach Abschluss der Kette, und der Reset funktioniert zuverlässig unabhängig von der erkannten CMP.

### 3.1
- **Neu — Google-Tag- & Container-Erkennung:** immer aktive Erkennung geladener GTM-Container und gtag.js-Tags mit Klassifikation des Ladewegs (standard, first-party/sGTM, custom-path, base64), angezeigt über Toolbar-Badge, Popup-Sektion und Konsolen-Log. Keine neuen Berechtigungen.
- **Fix:** Der Badge-Text folgt jetzt der eingestellten UI-Sprache.

### 3.0
- Refactoring & Umbenennung zu „GTM & CMP Helper": überarbeitete Oberfläche, GTM-Container-Injektion (mit `gtm_auth`/`gtm_preview`-Token), CMP-Erkennung & Reset für über 60 CMPs, Dark-/Light-Theme, deutsche/englische UI.

---

## Links

- **Dokumentation:** [Extension Homepage](https://www.markus-baersch.de/gtm-cmp-helper-extension.html)
- **Checkup-Tool:** Integrierter Shortcut zum [Analytrix GTM Checkup](https://www.analytrix.de/gtm-checkup-helper.html).
