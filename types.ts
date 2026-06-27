export type PageID = 'INTRO' | 'VIDEO_DISPLAY' | 'PROFILE' | 'STUDIO_VIEW' | 'STUDIO_DESK' | 'LINKS';

export interface MessageRecord {
  id: string;
  name: string;
  text: string;
  timestamp: string;
}
