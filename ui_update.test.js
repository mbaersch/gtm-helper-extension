const assert = require('assert');
const { translations, getTranslation } = require('./translations.js');

// Mock DOM
global.document = {
  elements: {},
  getElementById: function(id) {
    if (!this.elements[id]) {
      this.elements[id] = {
        style: { display: 'none' },
        innerHTML: '',
        innerText: '',
        placeholder: '',
        value: '',
        querySelector: function(selector) {
          return { innerText: '' };
        }
      };
    }
    return this.elements[id];
  },
  querySelector: function(selector) {
    if (selector === '#show_checkup b') {
      return this.getElementById('show_checkup_b');
    }
    return { innerText: '' };
  }
};

function updateUI(lang) {
  const elementsToTranslate = [
    { id: 'hdng', key: 'hdng', type: 'innerText' },
    { id: 'option_hint', key: 'option_hint', type: 'innerHTML' },
    { id: 'igtm_inspect', key: 'igtm_inspect', type: 'innerText' },
    { id: 'checkup_desc', key: 'checkup_desc', type: 'innerText' },
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

  const checkupLabel = document.querySelector('#show_checkup b');
  if (checkupLabel) checkupLabel.innerText = getTranslation(lang, 'show_checkup_b');
}

// Test: Checkup-Anzeige Logik (Simuliert)
function testCheckupDisplay(hasCheckup) {
  const showCheckup = document.getElementById("show_checkup");
  if (hasCheckup) {
    showCheckup.style.display = "block";
  } else {
    showCheckup.style.display = "none";
  }
}

// Test Case 1: Checkup vorhanden
testCheckupDisplay(true);
assert.strictEqual(document.getElementById('show_checkup').style.display, 'block');

// Test Case 2: Checkup NICHT vorhanden
testCheckupDisplay(false);
assert.strictEqual(document.getElementById('show_checkup').style.display, 'none');

console.log('✅ UI Checkup Display Tests bestanden!');
