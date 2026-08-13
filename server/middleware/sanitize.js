import mongoSanitize from 'express-mongo-sanitize';
import sanitizeHtml from 'sanitize-html';

/**
 * Composed hygiene middleware: strips $ operators (NoSQL injection) and
 * neutralises HTML/script in user-provided strings.
 */
export const rootSanitizer = mongoSanitize();

const SANITIZE_OPTS = {
  allowedTags: [],
  allowedAttributes: {},
  disallowedTagsMode: 'discard',
};

export function stringSanitizer(req, _res, next) {
  // Walk arrays and objects, sanitising string leaves in place. Crucially it
  // never iterates a *string primitive* (whose indices are read-only) — that
  // crashed on bodies containing arrays of strings (e.g. appointment services).
  const clean = (v) => sanitizeHtml(v, SANITIZE_OPTS).trim();

  const walk = (obj) => {
    if (!obj || typeof obj !== 'object') return;

    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        const v = obj[i];
        if (typeof v === 'string') obj[i] = clean(v);
        else if (v && typeof v === 'object') walk(v);
      }
      return;
    }

    for (const key of Object.keys(obj)) {
      const v = obj[key];
      if (typeof v === 'string') {
        obj[key] = clean(v);
      } else if (v && typeof v === 'object') {
        walk(v);
      }
    }
  };

  walk(req.body);
  walk(req.query);
  next();
}
