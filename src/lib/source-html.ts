import sanitizeHtml from 'sanitize-html';

const MAX_SOURCE_HTML_BYTES = 2 * 1024 * 1024;

/**
 * Provider-authored HTML is data, never application markup. The Source
 * renderer deliberately permits no attributes, which removes navigation,
 * tracking, event handlers, forms, and embedded content in one boundary.
 */
export function sanitizeSourceHtml(value: string | null | undefined): string | null {
  if (!value) return null;
  return sanitizeHtml(value, {
    allowedTags: [
      'p', 'br', 'div', 'span', 'strong', 'em', 'b', 'i', 'u', 's',
      'blockquote', 'pre', 'code', 'ul', 'ol', 'li', 'table', 'thead',
      'tbody', 'tr', 'td', 'th', 'hr'
    ],
    allowedAttributes: {},
    disallowedTagsMode: 'discard'
  }).slice(0, MAX_SOURCE_HTML_BYTES);
}
