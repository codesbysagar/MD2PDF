export type PageSize = 'A4' | 'A3' | 'A5' | 'Letter';
export type PageOrientation = 'portrait' | 'landscape';
export type MarginPreset = 'normal' | 'narrow' | 'wide' | 'custom';

export interface MarginValues {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface PdfConfig {
  pageSize: PageSize;
  orientation: PageOrientation;
  marginPreset: MarginPreset;
  customMargins: MarginValues;
  wrapCode: boolean;
  showPageNumbers: boolean;
  documentTitle: string;
}

export interface DocumentStats {
  words: number;
  characters: number;
  lines: number;
  readTimeMinutes: number;
}

export type GenerationStep =
  | 'idle'
  | 'parsing'
  | 'highlighting'
  | 'paginating'
  | 'compiling'
  | 'ready'
  | 'error';

export interface GenerationState {
  step: GenerationStep;
  progress: number;
  message: string;
  pdfBlobUrl: string | null;
  pdfBlob: Blob | null;
  error: string | null;
  pageCount: number;
  generatedAt: Date | null;
}

export type ActiveTab = 'split' | 'editor' | 'preview' | 'pdf';
