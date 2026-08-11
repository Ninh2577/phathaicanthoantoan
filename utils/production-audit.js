import fs from 'fs';
import path from 'path';
import { Logger } from './logger.js';

export class ProductionAudit {
  static run(distDir) {
    Logger.info('AuditEngine', 'Bắt đầu Production SEO Audit...');
    const results = {
      status: 'PASS',
      htmlFilesChecked: 0,
      indexablePages: 0,
      noindexPages: 0,
      canonicalValid: 0,
      canonicalInvalid: 0,
      schemaNodes: 0,
      orphanReferences: 0,
      internalLinks: 0,
      eagerImages: 0,
      lazyImages: 0,
      missingAlt: 0,
      errors: [],
      warnings: []
    };

    const scanDir = (dir) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          scanDir(fullPath);
        } else if (file.endsWith('.html') && !file.includes('-report.html')) {
          this.auditHtmlFile(fullPath, results);
        }
      }
    };
    scanDir(distDir);
    
    this.auditSitemap(path.join(distDir, 'sitemap.xml'), results);
    this.auditRobots(path.join(distDir, 'robots.txt'), results);

    if (results.errors.length > 0) {
      results.status = 'FAILED';
    } else if (results.warnings.length > 0) {
      results.status = 'PASS WITH WARNINGS';
    }

    const reportsDir = path.join(distDir, 'reports');
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
    
    fs.writeFileSync(
      path.join(reportsDir, 'production-audit.json'),
      JSON.stringify(results, null, 2)
    );

    this.printReport(results);
    return results;
  }

  static auditHtmlFile(filePath, results) {
    results.htmlFilesChecked++;
    const content = fs.readFileSync(filePath, 'utf8');
    const filename = path.basename(filePath);

    // Metadata
    const titleMatch = content.match(/<title>(.*?)<\/title>/);
    if (!titleMatch || !titleMatch[1].trim()) results.errors.push(`[${filename}] Thiếu hoặc trống <title>`);
    
    const descMatch = content.match(/<meta name="description" content="(.*?)">/);
    if (!descMatch || !descMatch[1].trim()) results.errors.push(`[${filename}] Thiếu hoặc trống meta description`);

    const robotsMatch = content.match(/<meta name="robots" content="(.*?)">/);
    const robots = robotsMatch ? robotsMatch[1] : 'index, follow';
    if (robots.includes('noindex')) {
      results.noindexPages++;
    } else {
      results.indexablePages++;
    }

    const canonicalMatch = content.match(/<link rel="canonical" href="(.*?)">/);
    if (filename === '404.html' && canonicalMatch) {
      results.errors.push(`[${filename}] Trang 404 không được có canonical: ${canonicalMatch[1]}`);
      results.canonicalInvalid++;
    } else if (filename !== '404.html' && !canonicalMatch) {
      results.errors.push(`[${filename}] Trang thiếu canonical`);
      results.canonicalInvalid++;
    } else if (canonicalMatch) {
      results.canonicalValid++;
    }

    const h1Matches = content.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi);
    if (!h1Matches) {
      if (filename !== '404.html') {
        results.errors.push(`[${filename}] Thiếu thẻ <h1>`);
      } else {
        results.warnings.push(`[${filename}] Thiếu thẻ <h1>`);
      }
    } else if (h1Matches.length > 1) results.warnings.push(`[${filename}] Có nhiều hơn một thẻ <h1>`);

    // Schema Check
    const schemaMatch = content.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    if (schemaMatch) {
      try {
        const schema = JSON.parse(schemaMatch[1]);
        if (!schema['@graph']) {
          results.errors.push(`[${filename}] Schema không sử dụng cấu trúc @graph`);
        } else {
          results.schemaNodes += schema['@graph'].length;
          const allIds = new Set();
          const extractIds = (obj) => {
            if (Array.isArray(obj)) {
              obj.forEach(extractIds);
            } else if (typeof obj === 'object' && obj !== null) {
              if (obj["@id"]) allIds.add(obj["@id"]);
              for (const key in obj) extractIds(obj[key]);
            }
          };
          schema['@graph'].forEach(extractIds);
          const refFields = ['author', 'reviewedBy', 'publisher', 'mainEntityOfPage', 'image', 'logo', 'isPartOf', 'about', 'breadcrumb'];
          schema['@graph'].forEach(node => {
            refFields.forEach(field => {
              if (node[field]) {
                const refs = Array.isArray(node[field]) ? node[field] : [node[field]];
                refs.forEach(r => {
                  if (r && r['@id'] && !allIds.has(r['@id'])) {
                    if (r["@id"].startsWith('http') && !r["@id"].includes('phathaicanthoantoan')) {
                      // External OK
                    } else {
                      results.orphanReferences++;
                      results.errors.push(`[${filename}] Schema Orphan Reference: ${node['@type']} -> ${field} trỏ tới ${r['@id']}`);
                    }
                  }
                });
              }
            });
          });
        }
      } catch (e) {
        results.errors.push(`[${filename}] Lỗi parse JSON-LD Schema: ${e.message}`);
      }
    }

    // Images Check
    const imgMatches = content.match(/<img[^>]+>/gi) || [];
    let isFirstImg = true;
    imgMatches.forEach(img => {
      if (img.includes('loading="lazy"')) results.lazyImages++;
      if (img.includes('loading="eager"') || img.includes('fetchpriority="high"')) results.eagerImages++;
      
      if (!/alt="([^"]*)"/i.test(img)) {
        results.missingAlt++;
        results.warnings.push(`[${filename}] Ảnh thiếu alt attribute`);
      }
      
      // Basic LCP check
      if (isFirstImg) {
        if (img.includes('loading="lazy"')) {
           results.errors.push(`[${filename}] Ảnh LCP (ảnh đầu tiên) đang bị lazy-load`);
        }
        isFirstImg = false;
      }
    });
  }

  static auditSitemap(sitemapPath, results) {
    if (!fs.existsSync(sitemapPath)) {
      results.errors.push('Thiếu file sitemap.xml');
      return;
    }
    const content = fs.readFileSync(sitemapPath, 'utf8');
    if (content.includes('<loc>http://localhost:3000/404</loc>') || content.includes('phathaicanthoantoan.vn/404')) {
      results.errors.push('Sitemap chứa URL 404.');
    }
  }

  static auditRobots(robotsPath, results) {
    if (!fs.existsSync(robotsPath)) {
      results.errors.push('Thiếu file robots.txt');
      return;
    }
  }

  static printReport(results) {
    console.log('\n=========================================');
    console.log('      PRODUCTION SEO AUDIT REPORT');
    console.log('=========================================');
    console.log(`Status: ${results.status === 'PASS' ? '\x1b[32mPASS\x1b[0m' : results.status === 'FAILED' ? '\x1b[31mFAILED\x1b[0m' : '\x1b[33mPASS WITH WARNINGS\x1b[0m'}`);
    console.log(`HTML Files Checked: ${results.htmlFilesChecked}`);
    console.log(`Indexable Pages:    ${results.indexablePages}`);
    console.log(`Noindex Pages:      ${results.noindexPages}`);
    console.log(`Canonical Valid:    ${results.canonicalValid}`);
    console.log(`Canonical Invalid:  ${results.canonicalInvalid}`);
    console.log(`Schema Nodes:       ${results.schemaNodes}`);
    console.log(`Orphan References:  ${results.orphanReferences}`);
    console.log(`Missing Alt Images: ${results.missingAlt}`);
    console.log('=========================================\n');

    if (results.errors.length > 0) {
      console.log('\x1b[31mCRITICAL ERRORS:\x1b[0m');
      results.errors.slice(0, 20).forEach(e => console.log(` - ${e}`));
      if (results.errors.length > 20) console.log(`   ... và ${results.errors.length - 20} lỗi khác.`);
    }

    if (results.warnings.length > 0) {
      console.log('\n\x1b[33mWARNINGS:\x1b[0m');
      results.warnings.slice(0, 10).forEach(w => console.log(` - ${w}`));
      if (results.warnings.length > 10) console.log(`   ... và ${results.warnings.length - 10} cảnh báo khác.`);
    }
  }
}
