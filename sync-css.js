import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đồng bộ CSS
const syncList = [
  {
    src: path.join(__dirname, 'assets/css/home.css'),
    dest: path.join(__dirname, 'dist/assets/css/home.css')
  },
  {
    src: path.join(__dirname, 'assets/css/layout.css'),
    dest: path.join(__dirname, 'dist/assets/css/layout.css')
  }
];

syncList.forEach(file => {
  if (fs.existsSync(file.src) && fs.existsSync(path.dirname(file.dest))) {
    fs.copyFileSync(file.src, file.dest);
    console.log(`[SUCCESS] Đã đồng bộ file: ${path.basename(file.src)}`);
  }
});

// Mini-build cho index.html để Inject Header và Footer
const indexSrc = path.join(__dirname, 'pages/index.html');
const indexDist = path.join(__dirname, 'dist/pages/index.html');

if (fs.existsSync(indexSrc) && fs.existsSync(path.dirname(indexDist))) {
  let content = fs.readFileSync(indexSrc, 'utf-8');
  
  // Inject Header
  const headerPath = path.join(__dirname, 'components/header.html');
  if (fs.existsSync(headerPath)) {
    const headerContent = fs.readFileSync(headerPath, 'utf-8');
    content = content.replace(/<!--\s*INJECT_COMPONENT:\s*components\/header\.html\s*-->/g, headerContent);
  }

  // Inject Footer
  const footerPath = path.join(__dirname, 'components/footer.html');
  if (fs.existsSync(footerPath)) {
    const footerContent = fs.readFileSync(footerPath, 'utf-8');
    content = content.replace(/<!--\s*INJECT_COMPONENT:\s*components\/footer\.html\s*-->/g, footerContent);
  }

  // Ghi đè file ra dist
  fs.writeFileSync(indexDist, content, 'utf-8');
  console.log('[SUCCESS] Đã build nhanh index.html (đã nhúng menu & footer).');
}

console.log('\n✅ Khắc phục xong lỗi mất Menu! Hãy Refresh (F5) trình duyệt nhé!');
