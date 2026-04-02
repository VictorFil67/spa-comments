import * as sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = ['a', 'code', 'i', 'strong'];
const ALLOWED_ATTRIBUTES = {
  a: ['href', 'title'],
};

export function sanitizeCommentHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ['http', 'https'],
  });
}

export function validateHtmlTags(html: string): string[] {
  const errors: string[] = [];

  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
  let match: RegExpExecArray | null;
  const openTags: string[] = [];

  while ((match = tagRegex.exec(html)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();

    if (!ALLOWED_TAGS.includes(tagName)) {
      errors.push(`Tag <${tagName}> is not allowed`);
      continue;
    }

    if (fullTag.startsWith('</')) {
      const last = openTags.pop();
      if (last !== tagName) {
        errors.push(
          `Invalid closing tag: expected </${last || 'none'}>, got </${tagName}>`,
        );
      }
    } else if (!fullTag.endsWith('/>')) {
      openTags.push(tagName);
    }
  }

  if (openTags.length > 0) {
    errors.push(`Unclosed tags: ${openTags.map((t) => `<${t}>`).join(', ')}`);
  }

  return errors;
}
