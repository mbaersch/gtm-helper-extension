const assert = require('assert');

// Wir simulieren die translations.js, da sie noch nicht existiert
try {
    const { translations, getTranslation } = require('./translations.js');

    // Test: Existenz der Sprachen
    assert.ok(translations.de, 'Deutsch sollte vorhanden sein');
    assert.ok(translations.en, 'Englisch sollte vorhanden sein');

    // Test: Beispiel-Übersetzung
    assert.strictEqual(getTranslation('de', 'save_btn'), '💾 Speichern & neu laden');
    assert.strictEqual(getTranslation('en', 'save_btn'), '💾 Save & reload');

    console.log('✅ Alle Tests für translations.js bestanden!');
} catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
        console.error('❌ Red Phase: translations.js existiert noch nicht.');
        process.exit(1);
    } else {
        console.error('❌ Test fehlgeschlagen:', e.message);
        process.exit(1);
    }
}
