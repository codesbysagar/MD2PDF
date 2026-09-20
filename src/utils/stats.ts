import type { DocumentStats } from '../types';

export function calculateDocumentStats(markdown: string): DocumentStats {
  if (!markdown || !markdown.trim()) {
    return {
      words: 0,
      characters: 0,
      lines: 0,
      readTimeMinutes: 0
    };
  }

  const lines = markdown.split(/\r\n|\r|\n/).length;
  const characters = markdown.length;

  // Clean markdown tokens for approximate word count
  const cleanText = markdown
    .replace(/```[\s\S]*?```/g, '') // strip code blocks
    .replace(/[#*`~_>\-[\]()]/g, ' ')
    .trim();

  const words = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;
  const readTimeMinutes = Math.max(1, Math.ceil(words / 200));

  return {
    words,
    characters,
    lines,
    readTimeMinutes
  };
}
