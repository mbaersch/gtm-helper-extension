# Hilfe-Seite: GTM Helper Chrome Extension

**URL:** `https://www.analytrix.de/gtm-helper-chrome-extension.html`

---

## Übersicht
Der GTM Helper unterstützt bei der Arbeit mit dem Google Tag Manager und Consent Management Plattformen. Er ermöglicht das Einfügen von Containern und das Verwalten von Consent-Cookies direkt im Browser.

---

## 1. GTM Injektion
Diese Funktion fügt einen GTM-Container auf einer Seite ein, ohne den Quellcode der Website dauerhaft zu ändern.

### Schritte:
1. GTM-Container-Code kopieren.
2. Im Feld "GTM-Container einfügen" einfügen.
3. Checkbox aktivieren.
4. **Speichern & neu laden** klicken.

### [Screenshot: GTM Injektion]

---

## 2. Erweiterte Einstellungen
Optionen für spezifische GTM-Setups.

### GTM Auth & GTM Preview
Diese Parameter werden für GTM-Umgebungen (Environments) genutzt. 
- **GA4 DebugView:** Durch Angabe dieser Token kann die GA4 DebugView ohne den Google Tag Assistant aktiviert werden.

### Injektions-Position
Festlegung, ob das Script im `<head>` oder im `<body>` platziert wird. Standard ist die Injektion im Header.

---

## 3. CMP-Erkennung & Consent Reset
Die Extension prüft die Seite auf bekannte Consent Management Plattformen (CMPs).

### Spezifischer Reset
Wird eine CMP erkannt (z.B. Cookiebot, UserCentrics), erscheint ein Hinweis im Hauptbereich. Der Link **"CMP Reset"** löscht gezielt die Cookies und Storage-Keys dieser Plattform.

### Globaler Reset
Der Button **"Consent löschen"** im Footer führt einen Reset für alle in der Extension hinterlegten CMP-Daten (über 60 Anbieter) durch.

### [Screenshot: CMP-Box]

---

## FAQ
- **GTM wird nicht geladen:** Prüfen Sie die Content Security Policy (CSP) der Website.
- **Speicherung der Daten:** Die Einstellungen werden pro Host im `localStorage` gespeichert.

---

*Weitere Informationen auf [analytrix.de](https://www.analytrix.de).*
