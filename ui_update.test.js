const assert = require('assert');
const { translations, getTranslation } = require('./translations.js');

// Mock DOM
global.document = {
  elements: {},
  getElementById: function(id) {
    if (!this.elements[id]) {
      this.elements[id] = {
        innerHTML: '',
        innerText: '',
        placeholder: '',
        value: ''
      };
    }
    return this.elements[id];
  }
};

// Die zu testende Funktion (wird später in popup.js integriert)
function updateUI(lang) {
  const elementsToTranslate = [
    { id: 'hdng', key: 'hdng', type: 'innerHTML' },
    { id: 'option_hint', key: 'option_hint', type: 'innerHTML' },
    { id: 'igtm_inspect', key: 'igtm_inspect', type: 'innerText' },
    { id: 'igtm_gtm_code', key: 'igtm_gtm_code_placeholder', type: 'placeholder' },
    { id: 'igtm_save', key: 'save_btn', type: 'innerText' },
    { id: 'igtm_reset_consent', key: 'reset_consent_btn', type: 'innerText' },
    { id: 'igtm_help', key: 'help_link', type: 'innerText' }
  ];

  elementsToTranslate.forEach(item => {
    const el = document.getElementById(item.id);
    if (el) {
      const translation = getTranslation(lang, item.key);
      if (item.type === 'innerHTML') el.innerHTML = translation;
      else if (item.type === 'placeholder') el.placeholder = translation;
      else el.innerText = translation;
    }
  });
}

// Test: Update UI auf Englisch
updateUI('en');
assert.strictEqual(document.getElementById('igtm_save').innerText, '💾 Save & reload');
assert.strictEqual(document.getElementById('igtm_gtm_code').placeholder, 'Paste complete container code (no script tags required) here');

// Test: Update UI auf Deutsch
updateUI('de');
assert.strictEqual(document.getElementById('igtm_save').innerText, '💾 Speichern & neu laden');

console.log('✅ updateUI Tests bestanden!');
