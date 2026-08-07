import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = __dirname;
const DIST_DIR = path.join(__dirname, 'dist');

// Copy static assets
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

['assets', 'config', 'services', 'utils'].forEach(folder => {
  const src = path.join(SRC_DIR, folder);
  if (fs.existsSync(src)) {
    copyDir(src, path.join(DIST_DIR, folder));
  }
});

// Compile index.html
const indexHtmlPath = path.join(SRC_DIR, 'pages', 'index.html');
if (fs.existsSync(indexHtmlPath)) {
  let indexContent = fs.readFileSync(indexHtmlPath, 'utf8');
  
  // Inject components
  const componentRegex = /<!--\s*INJECT_COMPONENT:\s*([^>]+)\s*-->/g;
  indexContent = indexContent.replace(componentRegex, (match, compPath) => {
    const fullPath = path.join(SRC_DIR, compPath.trim());
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath, 'utf8');
    }
    return match;
  });

  // Inject variables
  indexContent = indexContent
    .replace(/<!--\s*INJECT_SITE_NAME\s*-->/g, 'Phá Thai An Toàn Cần Thơ')
    .replace(/<!--\s*INJECT_BRAND\s*-->/g, 'Phá Thai An Toàn Cần Thơ')
    .replace(/<!--\s*INJECT_HOTLINE\s*-->/g, '0901.234.567')
    .replace(/<!--\s*INJECT_HOTLINE_RAW\s*-->/g, '0901234567')
    .replace(/<!--\s*INJECT_HOTLINE_FORMATTED\s*-->/g, '0901.234.567');

  const distIndexDir = path.join(DIST_DIR, 'pages');
  if (!fs.existsSync(distIndexDir)) fs.mkdirSync(distIndexDir, { recursive: true });
  
  fs.writeFileSync(path.join(DIST_DIR, 'pages', 'index.html'), indexContent, 'utf8');
  console.log('✅ Compiled dist/pages/index.html successfully!');
}
