export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  parentId: string | null;
  batchId: string;
  sessionId: string;
  timestamp: number;
}

export interface Session {
  id: string;
  name: string;
  timestamp: number;
  promptQueue: string[];
  currentPrompt: number;
}

export interface TranscriptWord {
  word: string;
  start: number;
  end: number;
}

export interface Transcript {
  text: string;
  words: TranscriptWord[];
  editedText?: string;
  pdfValidation?: {
    feedback: string;
    suggestedEdits: string;
    thumbnailPrompts: string[];
  };
}