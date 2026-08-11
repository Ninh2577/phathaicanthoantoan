// utils/sitemap.js
import fs from 'fs';
import path from 'path';
import { siteConfig } from '../config/site.config.js';
import { Logger } from './logger.js';

export class GeneratorEngine {
  
  /**
   * Tạo XML Sitemap (Pages & Posts)
   */
  static generateSitemap(pages = [], outputDir) {
    Logger.info('GeneratorEngine', 'Đang khởi tạo sitemap.xml...');
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

    pages.forEach(page => {
      // 404 URL must not be in sitemap
      if (page.slug === '404') return;
      
      const url = `${siteConfig.url}/${page.slug === 'index' ? '' : page.slug}`;
      const lastmod = page.updatedAt ? `<lastmod>${new Date(page.updatedAt).toISOString()}</lastmod>` : '';
      const priority = page.slug === 'index' ? '1.0' : '0.8';
      const imageNode = page.image ? `\n    <image:image>\n      <image:loc>${page.image}</image:loc>\n    </image:image>` : '';

      xml += `
  <url>
    <loc>${url}</loc>
    ${lastmod ? lastmod + '\n    ' : ''}<changefreq>daily</changefreq>
    <priority>${priority}</priority>${imageNode}
  </url>`;
    });

    xml += `\n</urlset>`;
    
    fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), xml);
    Logger.success('GeneratorEngine', 'Tạo sitemap.xml thành công.');
  }

  /**
   * Tạo RSS Feed
   */
  static generateRss(articles = [], outputDir) {
    Logger.info('GeneratorEngine', 'Đang khởi tạo rss.xml...');
    
    let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>${siteConfig.name}</title>
  <link>${siteConfig.url}</link>
  <description>${siteConfig.description}</description>`;

    articles.forEach(article => {
      const url = `${siteConfig.url}/${article.slug}`;
      const dateNode = article.createdAt ? `\n    <pubDate>${new Date(article.createdAt).toUTCString()}</pubDate>` : '';
      
      rss += `
  <item>
    <title>${article.title}</title>
    <link>${url}</link>
    <description>${article.description || ''}</description>${dateNode}
  </item>`;
    });

    rss += `\n</channel>\n</rss>`;
    
    fs.writeFileSync(path.join(outputDir, 'rss.xml'), rss);
    Logger.success('GeneratorEngine', 'Tạo rss.xml thành công.');
  }

  /**
   * Tạo JSON Feed
   */
  static generateJsonFeed(articles = [], outputDir) {
    Logger.info('GeneratorEngine', 'Đang khởi tạo feed.json...');
    
    const feed = {
      version: "https://jsonfeed.org/version/1",
      title: siteConfig.name,
      home_page_url: siteConfig.url,
      feed_url: `${siteConfig.url}/feed.json`,
      items: articles.map(a => {
        const item = {
          id: `${siteConfig.url}/${a.slug}`,
          url: `${siteConfig.url}/${a.slug}`,
          title: a.title,
          content_text: a.description
        };
        if (a.createdAt) {
          item.date_published = new Date(a.createdAt).toISOString();
        }
        return item;
      })
    };

    fs.writeFileSync(path.join(outputDir, 'feed.json'), JSON.stringify(feed, null, 2));
    Logger.success('GeneratorEngine', 'Tạo feed.json thành công.');
  }
}
