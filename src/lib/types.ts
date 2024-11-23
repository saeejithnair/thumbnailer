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