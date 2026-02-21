# GTM Helper - Chrome Extension

[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-Installieren-blue?logo=google-chrome&logoColor=white)](https://chromewebstore.google.com/detail/gtm-helper/kbnbkogeeackdjiibllebnpdccbmepil)
[![Version](https://img.shields.io/badge/version-3.0-blue.svg)](#)

GTM Helper ist eine Chrome-Extension zum Injizieren von Google Tag Manager Containern und zum Verwalten von Consent Management Platform (CMP) Daten während der Entwicklung und beim Debugging.

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
- **Globaler Reset:** Option zum Löschen aller bekannten Consent-Daten (unterstützt über 60 CMPs).

### 3. Benutzeroberfläche
- **Design:** Standardmäßig im Dark Mode mit manuellem Umschalter für das Light Theme.
- **Sprache:** Verfügbar in Deutsch und Englisch.
- **Architektur:** Erstellt mit CSS Grid unter Einhaltung aktueller Extension-Standards (Manifest V3).

---

## Bedienung

1. **GTM-Injektion:** Container-Code in das Textfeld eingeben, Checkbox aktivieren und auf **Speichern & neu laden** klicken.
2. **Erweiterte Einstellungen:** Akkordeon öffnen, um umgebungsspezifische Token einzugeben.
3. **Consent-Reset:** Den Link **CMP Reset** in der Erkennungs-Box oder den Button **Consent löschen** im Footer nutzen.

---

## Links

- **Dokumentation:** [analytrix.de/gtm-helper](https://www.analytrix.de/gtm-helper-chrome-extension.html)
- **Checkup-Tool:** Integrierter Shortcut zum Analytrix GTM Checkup.

---

*Entwickelt von [Analytrix](https://www.analytrix.de).*
