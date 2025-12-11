export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export type ExplanationStyle = 'simple' | 'steps' | 'visual';

export type ViewMode = 'homework' | 'essay';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  isError?: boolean;
  style?: ExplanationStyle; // Track which style was used for this interaction
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}