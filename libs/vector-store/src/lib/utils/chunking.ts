import { Document } from '@langchain/core/documents';

/**
 * Split markdown content by headers (##, ###)
 * Each section becomes a separate chunk
 */
export function chunkMarkdownByHeaders(
  content: string,
  metadata: Record<string, unknown> = {}
): Document[] {
  const chunks: Document[] = [];

  // Split by markdown headers (## and ###)
  const headerRegex = /^(#{2,3})\s+(.+)$/gm;
  const sections: Array<{
    title: string;
    level: number;
    start: number;
    end: number;
  }> = [];

  let match;
  const positions: Array<{ level: number; title: string; position: number }> =
    [];

  while ((match = headerRegex.exec(content)) !== null) {
    const level = match[1].length; // ## = 2, ### = 3
    const title = match[2].trim();
    const position = match.index;
    positions.push({ level, title, position });
  }

  // Create sections
  for (let i = 0; i < positions.length; i++) {
    const current = positions[i];
    const next = positions[i + 1];

    const start = current.position;
    const end = next ? next.position : content.length;

    sections.push({
      title: current.title,
      level: current.level,
      start,
      end,
    });
  }

  // If no headers found, create a single chunk
  if (sections.length === 0) {
    chunks.push(
      new Document({
        pageContent: content.trim(),
        metadata: {
          ...metadata,
          section: 'Introduction',
          level: 0,
        },
      })
    );
    return chunks;
  }

  // Create chunks from sections
  for (const section of sections) {
    const sectionContent = content.slice(section.start, section.end).trim();

    if (sectionContent.length > 0) {
      chunks.push(
        new Document({
          pageContent: sectionContent,
          metadata: {
            ...metadata,
            section: section.title,
            level: section.level,
          },
        })
      );
    }
  }

  return chunks;
}
