// Optional: PLAYWRIGHT_OUTPUT_DIR legt die Testausgaben außerhalb des Projektordners ab.
const path = require('path');

module.exports = {
  testDir: './tests',
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR
    ? path.join(process.env.PLAYWRIGHT_OUTPUT_DIR, 'gtm-helper-extension', 'test-results')
    : 'test-results',
  timeout: 60000,
  workers: 1,
  reporter: process.env.CI ? 'line' : 'list'
};
