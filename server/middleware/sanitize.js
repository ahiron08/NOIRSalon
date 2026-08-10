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
  const walk = (obj) => {
    for (const key of Object.keys(obj || {})) {
      const value = obj[key];
      if (typeof value === 'string') {
        obj[key] = sanitizeHtml(value, SANITIZE_OPTS).trim();
      } else if (Array.isArray(value)) {
        value.forEach(walk);
      } else if (value && typeof value === 'object') {
        walk(value);
      }
    }
  };
  walk(req.body);
  walk(req.query);
  next();
}
