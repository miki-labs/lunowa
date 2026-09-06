export {sanitizeSourceHtml} from '@/lib/source-html';

export function sourcePreview(textBody: string | null | undefined, htmlBody: string | null | undefined): string {
  const source = textBody ?? htmlBody ?? '';
  return source
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 240);
}
