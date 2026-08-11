// utils/schema-validator.js

export class SchemaValidator {
  /**
   * Validate toàn bộ mảng schema (đã lấy ra từ @graph)
   * Trả về danh sách errors, warnings
   */
  static validate(schemas, pageUrl) {
    const results = {
      errors: [],
      warnings: [],
      stats: {
        total: schemas.length,
        types: schemas.map(s => Array.isArray(s["@type"]) ? s["@type"].join(', ') : s["@type"])
      }
    };

    const allIds = new Set();
    const extractIds = (obj) => {
      if (Array.isArray(obj)) {
        obj.forEach(extractIds);
      } else if (typeof obj === 'object' && obj !== null) {
        if (obj["@id"]) allIds.add(obj["@id"]);
        for (const key in obj) extractIds(obj[key]);
      }
    };
    schemas.forEach(extractIds);

    schemas.forEach(schema => {
      this.validateSchema(schema, pageUrl, results, allIds);
    });

    return results;
  }

  static validateSchema(schema, pageUrl, results, allIds) {
    if (!schema["@type"]) {
      results.errors.push(`[${pageUrl}] Schema thiếu @type`);
      return;
    }

    if (!schema["@id"]) {
      results.warnings.push(`[${pageUrl}] Schema ${schema["@type"]} thiếu @id để liên kết Entity.`);
    }

    // Validate absolute URL
    if (schema.url && !schema.url.startsWith('http')) {
      results.errors.push(`[${pageUrl}] Schema ${schema["@type"]} có url không phải tuyệt đối (Absolute URL): ${schema.url}`);
    }

    // Orphan Reference Check
    const refFields = ['author', 'reviewedBy', 'publisher', 'mainEntityOfPage', 'image', 'logo', 'isPartOf', 'about', 'breadcrumb'];
    refFields.forEach(field => {
      const ref = schema[field];
      if (ref) {
        const refsArray = Array.isArray(ref) ? ref : [ref];
        refsArray.forEach(r => {
          if (r && r["@id"] && !allIds.has(r["@id"])) {
            // Check if it's an external absolute URL that is not part of our site
            if (r["@id"].startsWith('http') && !r["@id"].includes(pageUrl.split('#')[0]) && !r["@id"].includes('phathaicanthoantoan')) {
              // External reference (e.g. sameAs or external entity), skip orphan check
            } else {
              results.errors.push(`[${pageUrl}] Schema Orphan Reference: ${schema["@type"]} có ${field} trỏ tới @id "${r["@id"]}" không tồn tại trong @graph.`);
            }
          }
        });
      }
    });

    const type = Array.isArray(schema["@type"]) ? schema["@type"][0] : schema["@type"];

    switch (type) {
      case 'Article':
      case 'MedicalWebPage':
        if (!schema.headline) results.errors.push(`[${pageUrl}] Article thiếu headline (Required)`);
        if (!schema.author) results.errors.push(`[${pageUrl}] Article thiếu author (E-E-A-T Critical)`);
        if (!schema.reviewedBy) results.warnings.push(`[${pageUrl}] Article nên có reviewedBy để tăng E-E-A-T`);
        if (!schema.image) results.errors.push(`[${pageUrl}] Article thiếu image (Required by Google)`);
        break;
      
      case 'Organization':
      case 'MedicalClinic':
        if (!schema.logo) results.errors.push(`[${pageUrl}] Organization/Clinic thiếu logo (Required)`);
        if (!schema.contactPoint && !schema.telephone) results.warnings.push(`[${pageUrl}] Organization thiếu contactPoint/telephone`);
        break;

      case 'Person':
        if (!schema.name) results.errors.push(`[${pageUrl}] Person thiếu name`);
        if (!schema.jobTitle) results.warnings.push(`[${pageUrl}] Person nên có jobTitle (vd: Doctor)`);
        break;
        
      case 'ImageObject':
        if (!schema.url) results.errors.push(`[${pageUrl}] ImageObject thiếu url`);
        break;
    }
  }
}
