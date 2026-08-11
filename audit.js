import path from 'path';
import { fileURLToPath } from 'url';
import { ProductionAudit } from './utils/production-audit.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, 'dist');

const results = ProductionAudit.run(DIST_DIR);

if (results.status === 'FAILED') {
  process.exit(1);
} else {
  process.exit(0);
}
