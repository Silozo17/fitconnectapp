import DOMPurify from "dompurify";

/**
 * Parse simple markdown to HTML with sanitization
 * Supports: ## headings, ### headings, **bold**, > blockquotes, ---, newlines
 */
export function parseSimpleMarkdown(text: string): string {
  if (!text) return "";

  let html = text
    // Escape HTML first
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Then restore our markdown blockquotes
    .replace(/^&gt; (.+)$/gm, '<blockquote class="border-l-4 border-primary pl-4 italic my-2 text-muted-foreground">$1</blockquote>')
    // Headings
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-4 mb-2 text-foreground">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-5 mb-2 text-foreground">$1</h2>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="my-4 border-border">')
    // Paragraphs (double newlines)
    .replace(/\n\n/g, '</p><p class="mb-3 text-muted-foreground">')
    // Single newlines to line breaks
    .replace(/\n/g, '<br>');

  // Wrap in paragraph if not starting with a block element
  if (!html.startsWith('<h') && !html.startsWith('<blockquote') && !html.startsWith('<hr')) {
    html = `<p class="mb-3 text-muted-foreground">${html}</p>`;
  }

  // Sanitize the HTML
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['h2', 'h3', 'p', 'strong', 'blockquote', 'hr', 'br'],
    ALLOWED_ATTR: ['class'],
  });
}
