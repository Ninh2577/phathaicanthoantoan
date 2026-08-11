// config/seo.config.js — Satellite Medical Content Site
export const seoConfig = {
  defaultTitle: "Sức Khỏe Phụ Khoa — Kiến Thức Y Khoa Dành Cho Phụ Nữ",
  defaultDescription: "Thông tin y khoa dễ hiểu về bệnh cổ tử cung, rối loạn kinh nguyệt, bệnh tử cung, viêm phụ khoa, sức khỏe sinh sản và các vấn đề phụ khoa thường gặp.",
  defaultOGImage: "/assets/images/hero-editorial.jpg",
  twitterCard: "summary_large_image",
  themeColor: "#9D3862", // Deep Medical Rose-Teal

  // Environment Specifics
  environments: {
    production: {
      robots: "index, follow",
    },
    preview: {
      robots: "noindex, nofollow",
    },
    development: {
      robots: "noindex, nofollow",
    }
  },

  // Canonical Strategy
  canonicalStrategy: {
    forceHttps: true,
    removeWww: true,
    removeTrailingSlash: true,
    forceLowercase: true
  },

  // Hreflang
  hreflang: {
    defaultLanguage: "vi-VN",
    supportedLanguages: ["vi"]
  },

  // Schema configs — Satellite site: NO clinic, NO local business
  schema: {
    organization: true,     // OK — represents content brand
    medicalClinic: false,   // OFF — satellite isolation
    localBusiness: false,   // OFF — satellite isolation
  },

  // Plugin-ready settings
  plugins: {
    analytics: true,
    tagManager: false
  }
};
