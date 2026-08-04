const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const vm = require('vm');
const { stripJs, stripCss, stripHtml } = require('./strip-comments');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
// Version aus manifest.json lesen
const manifest = JSON.parse(fs.readFileSync(path.resolve(rootDir, 'manifest.json'), 'utf8'));
const version = manifest.version;
const zipFile = path.resolve(rootDir, `gtm-cmp-helper-v${version}.zip`);

// 1. Clean up
console.log('Cleaning up...');
if (fs.existsSync(distDir)) fs.rmSync(distDir, { recursive: true });
if (fs.existsSync(zipFile)) fs.unlinkSync(zipFile);
fs.mkdirSync(distDir);

// 2. Define files to include (only what's needed for the browser)
const filesToInclude = [
  'manifest.json',
  'background.js',
  'content.js',
  'popup.html',
  'popup.js',
  'popup.css',
  'gtm-ui.css',
  'gtm-ui.js',
  'gtm-ui-features.js',
  'gtm-var-edit.js',
  'gtm-list-state.js',
  'translations.js',
  'detect/classify.js',
  'detect/gtm-detect.js',
  'detect/gtm-relay.js',
  'images/injectGTM.png',
  'images/injectGTM_big.png'
];

// Jede gestrippte JS-Datei gegen den Parser prüfen: Bei Zweifeln lieber das
// Original ins Paket als eine kaputte Extension.
function strip(file, inhalt) {
  if (file.endsWith('.js')) {
    const kurz = stripJs(inhalt);
    try {
      new vm.Script(kurz, { filename: file });
    } catch (e) {
      console.warn(`Warning: ${file} nach dem Entfernen der Kommentare nicht mehr parsebar (${e.message}) – Original übernommen.`);
      return inhalt;
    }
    return kurz;
  }
  if (file.endsWith('.css')) return stripCss(inhalt);
  if (file.endsWith('.html')) return stripHtml(inhalt);
  return inhalt;
}

console.log('Copying files to dist...');
let bytesVorher = 0;
let bytesNachher = 0;

filesToInclude.forEach(file => {
  const src = path.join(rootDir, file);

  const dest = path.join(distDir, file.replace('/', path.sep));
  const destDir = path.dirname(dest);

  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  if (fs.existsSync(src)) {
    if (fs.lstatSync(src).isDirectory()) {
       // logic for directories if needed, but we specify files
    } else if (/\.(js|css|html)$/.test(file)) {
       const inhalt = fs.readFileSync(src, 'utf8');
       const kurz = strip(file, inhalt);
       fs.writeFileSync(dest, kurz);
       bytesVorher += Buffer.byteLength(inhalt);
       bytesNachher += Buffer.byteLength(kurz);
    } else {
       fs.copyFileSync(src, dest);
    }
  } else {
    console.warn(`Warning: File ${file} not found!`);
  }
});

if (bytesVorher > 0) {
  const kb = (n) => (n / 1024).toFixed(1) + ' KB';
  const anteil = Math.round((1 - bytesNachher / bytesVorher) * 100);
  console.log(`Kommentare entfernt: ${kb(bytesVorher)} -> ${kb(bytesNachher)} (${anteil}% weniger)`);
}

// 3. Zip it using PowerShell (since we are on Windows)
// Mit --no-zip bleibt dist/ stehen: die Extension in Auslieferungsform, ladbar
// und testbar.
if (process.argv.includes('--no-zip')) {
  console.log(`Fertig ohne ZIP – die entpackte Extension liegt in: ${distDir}`);
  return;
}

console.log('Creating ZIP archive...');
try {
  // Compress-Archive expects absolute paths on Windows.
  // Inhalt von dist/ packen (nicht den Ordner selbst) -> manifest.json liegt im ZIP-Root.
  const zipSource = path.join(distDir, '*');
  const psCommand = `powershell -Command "Compress-Archive -Path '${zipSource}' -DestinationPath '${zipFile}' -Force"`;
  execSync(psCommand);
  console.log(`✅ Success! Extension packaged to: ${zipFile}`);
} catch (error) {
  console.error('Error creating ZIP:', error.message);
}

// 4. Cleanup
console.log('Cleaning up dist folder...');
fs.rmSync(distDir, { recursive: true });
