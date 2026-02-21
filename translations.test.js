const assert = require('assert');
const { translations, getTranslation } = require('./translations.js');

// Test: Existenz der Sprachen
assert.ok(translations.de, 'Deutsch sollte vorhanden sein');
assert.ok(translations.en, 'Englisch sollte vorhanden sein');

// Test: Beispiel-Übersetzung (DE)
assert.strictEqual(getTranslation('de', 'save_btn'), '💾 Speichern & neu laden');
assert.strictEqual(getTranslation('de', 'reset_consent_btn'), '🗑️ Consent löschen');

// Test: Beispiel-Übersetzung (EN)
assert.strictEqual(getTranslation('en', 'save_btn'), '💾 Save & Reload');
assert.strictEqual(getTranslation('en', 'reset_consent_btn'), '🗑️ Clear Consent');

// Test: Neue Übersetzungen für CMP-Erkennung
assert.strictEqual(getTranslation('de', 'detected_cmp'), 'CMP erkannt:');
assert.strictEqual(getTranslation('en', 'detected_cmp'), 'CMP detected:');

console.log('✅ Alle Tests für translations.js bestanden!');
