const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
}

function decodeEntities(text: string): string {
  return text.replace(
    /&(#x[0-9a-f]+|#\d+|[a-z]+);/gi,
    (entity: string, code: string) => {
      if (code[0] === '#') {
        const isHex = code[1] === 'x' || code[1] === 'X'
        const codePoint = parseInt(code.slice(isHex ? 2 : 1), isHex ? 16 : 10)
        return codePoint > 0 && codePoint <= 0x10ffff
          ? String.fromCodePoint(codePoint)
          : entity
      }
      return NAMED_ENTITIES[code.toLowerCase()] ?? entity
    },
  )
}

/**
 * Converts an HTML fragment (as found in NASA descriptions) into plain text.
 *
 * - `<br>` and closing block tags become line breaks
 * - all other tags are removed, `<script>`/`<style>` together with their content
 * - common HTML entities are decoded
 * - whitespace is normalised: at most one blank line between paragraphs
 *
 * The result is meant to be rendered as text (e.g. with `white-space: pre-line`),
 * never as HTML.
 */
export function stripHtml(html: string): string {
  const text = html
    .replace(/\r\n?/g, '\n')
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|blockquote|ul|ol|table)\s*>/gi, '\n\n')
    .replace(/<\/(li|tr)\s*>/gi, '\n')
    .replace(/<[^>]*>/g, '')

  return decodeEntities(text)
    .split('\n')
    .map((line) => line.replace(/[ \t\u00a0]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
