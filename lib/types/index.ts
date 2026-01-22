export interface InstagramPost {
  url: string;
  caption?: string;
  timestamp?: string;
  location?: string;
  thumbnailUrl?: string;
  username?: string;
}

export interface CalendarEvent {
  title: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  location?: string;
  url?: string;
}

export interface ParsedEventInfo {
  title: string;
  startDateTime: string;
  endDateTime: string;
  location?: string;
  description?: string;
}

export interface ExtractionRequest {
  instagramUrl?: string;
  text?: string;
  imageUrl?: string;
}

export interface ExtractionResponse {
  success: boolean;
  calendarUrl?: string;
  eventInfo?: ParsedEventInfo;
  error?: string;
}
