# GTM & CMP Helper - Chrome Extension

[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-Installieren-blue?logo=google-chrome&logoColor=white)](https://chromewebstore.google.com/detail/gtm-helper/kbnbkogeeackdjiibllebnpdccbmepil)
[![Version](https://img.shields.io/badge/version-3.3-blue.svg)](#)

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

### 4. Benutzeroberfläche
- **Design:** Standardmäßig im Dark Mode mit manuellem Umschalter für das Light Theme.
- **Sprache:** Verfügbar in Deutsch und Englisch.
- **Architektur:** Erstellt mit CSS Grid unter Einhaltung aktueller Extension-Standards (Manifest V3).

---

## Bedienung

1. **GTM-Injektion:** Container-Code in das Textfeld eingeben, Checkbox aktivieren und auf **Speichern & neu laden** klicken.
2. **Erweiterte Einstellungen:** Akkordeon öffnen, um umgebungsspezifische Token einzugeben.
3. **Consent-Reset:** Den Link **CMP Reset** in der Erkennungs-Box oder den Button **Consent löschen** im Footer nutzen.

---

## Changelog

> Seit 2019 im Chrome Web Store verfügbar; dieses Changelog beginnt mit dem 3.x-Refactoring.

### 3.4 (unveröffentlicht)
- **Neu — CMP-Abdeckung deutlich ausgebaut:** Der Reset kennt jetzt ca. 130 CMPs (vorher 70+), darunter CookieAdmin, DSGVO-Pixelmate, Ezoic, clickskeks, Pressidium, Sellwerk, KookieTool, Cookie Cracker, LWD Cookie Master, mehrere TYPO3-Consent-Tools und viele weitere. 

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

- **Dokumentation:** [analytrix.de/gtm-helper](https://www.analytrix.de/gtm-helper-chrome-extension.html)
- **Checkup-Tool:** Integrierter Shortcut zum Analytrix GTM Checkup.

---

*Entwickelt von [Analytrix](https://www.analytrix.de).*
