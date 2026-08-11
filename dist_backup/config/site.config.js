export const siteConfig = {
  // Satellite Medical Content Hub — NOT a clinic website
  name: "Sức Khỏe Phụ Khoa",
  shortName: "Phụ Khoa Khỏe",
  description: "Nền tảng thông tin và giáo dục sức khỏe phụ khoa. Kiến thức y khoa dễ hiểu về bệnh cổ tử cung, kinh nguyệt, bệnh tử cung, viêm phụ khoa và sức khỏe sinh sản.",
  url: "https://phathaicanthoantoan.vercel.app",
  logo: "/assets/images/logo.png",
  favicon: "/favicon.ico",
  cmsEndpoint: "https://us-west-2.cdn.hygraph.com/content/cmrwmihwf00e908w4mn88wx6u/master",

  // Feature Flags — Satellite Medical Content Site
  features: {
    enableSearch: true,
    enableFAQ: true,
    enableDoctorProfile: false,   // OFF — satellite isolation
    enableAppointment: false,     // OFF — satellite isolation
    enableChat: false,            // OFF — satellite isolation
    enableClinicContact: false,   // OFF — satellite isolation
    enableLocalBusiness: false,   // OFF — satellite isolation
    enableMedicalClinic: false,   // OFF — satellite isolation
    enableReview: false,
    enableAnalytics: true,
  }
};
