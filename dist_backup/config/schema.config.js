// config/schema.config.js — Satellite Medical Content Site
import { siteConfig } from './site.config.js';

export const schemaConfig = {
  // 1. Versioning & Namespace
  versioning: {
    schemaVersion: "13.0",
    platformVersion: "2.0.0",
    generator: "Skedify Medical Enterprise Generator",
    buildNumber: process.env.VERCEL_GIT_COMMIT_SHA || "local-build",
    siteNamespace: siteConfig.url
  },

  // 2. Feature Flags — SATELLITE ISOLATION APPLIED
  features: {
    enableOrganization: true,     // OK — content brand organization
    enableMedicalClinic: false,   // OFF — satellite isolation (no clinic identity)
    enableWebSite: true,          // OK — content website
    enableLocalBusiness: false,   // OFF — satellite isolation (no local business)
    enableSearchAction: true,     // OK — site search
    enableBreadcrumb: true,       // OK — navigation
    enableFAQ: true,              // OK — educational content
    enableArticle: true,          // OK — medical articles
    enableMedicalWebPage: true,   // OK — medical info pages
    enableKnowledgeGraphPerson: false, // OFF — no personal data
    enableImageObject: true       // OK — image metadata
  },

  // 3. Entity Registry — Content Brand (NOT clinic)
  registry: {
    publisher: {
      name: siteConfig.name,      // "Sức Khỏe Phụ Khoa"
      logoUrl: siteConfig.url + siteConfig.logo,
      foundingDate: "2024-01-01",
      socialLinks: []
      // No clinic contact info
    },
    medicalSpecialty: [
      "Obstetric",
      "Gynecologic"
    ],
    availableLanguages: ["Vietnamese"],
    // NO: currency, priceRange, geo, openingHours, address, telephone
  },

  // 4. Default Schema Values
  defaults: {
    author: {
      name: "Ban biên tập Sức Khỏe Phụ Khoa",
      jobTitle: "Medical Content Editor",
      sameAs: [siteConfig.url]
    },
    reviewer: {
      name: "Ban kiểm duyệt y khoa",
      jobTitle: "Medical Reviewer",
      sameAs: [siteConfig.url]
    },
    image: {
      url: `${siteConfig.url}/assets/images/hero-editorial.jpg`,
      width: 1200,
      height: 630,
      caption: "Hình ảnh minh họa sức khỏe phụ khoa"
    }
  }
};
