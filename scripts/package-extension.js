const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

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
  'translations.js',
  'images/injectGTM.png',
  'images/injectGTM_128.png'
];

console.log('Copying files to dist...');
filesToInclude.forEach(file => {
  const src = path.join(rootDir, file);
  
  const dest = path.join(distDir, file.replace('/', path.sep));
  const destDir = path.dirname(dest);
  
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  
  if (fs.existsSync(src)) {
    if (fs.lstatSync(src).isDirectory()) {
       // logic for directories if needed, but we specify files
    } else {
       fs.copyFileSync(src, dest);
    }
  } else {
    console.warn(`Warning: File ${file} not found!`);
  }
});

// 3. Zip it using PowerShell (since we are on Windows)
console.log('Creating ZIP archive...');
try {
  // Compress-Archive expects absolute paths on Windows
  const psCommand = `powershell -Command "Compress-Archive -Path '${distDir}\*' -DestinationPath '${zipFile}' -Force"`;
  execSync(psCommand);
  console.log(`✅ Success! Extension packaged to: ${zipFile}`);
} catch (error) {
  console.error('Error creating ZIP:', error.message);
}

// 4. Cleanup
console.log('Cleaning up dist folder...');
fs.rmSync(distDir, { recursive: true });
