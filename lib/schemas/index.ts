import { z } from 'zod';

/**
 * Schema for Instagram post extraction
 */
export const instagramPostSchema = z.object({
  caption: z.string().describe('The post caption/description text'),
  username: z.string().describe('The Instagram username who posted it'),
  thumbnailUrl: z.string().optional().describe('The main image/video thumbnail URL'),
});

/**
 * Schema for parsed event information
 */
export const parsedEventInfoSchema = z.object({
  title: z.string().describe('Event name/title'),
  startDateTime: z.string().describe('Event start date and time in ISO 8601 format'),
  endDateTime: z.string().describe('Event end date and time in ISO 8601 format'),
  location: z.string().optional().describe('Physical or virtual location'),
  description: z.string().optional().describe('Brief description of the event'),
});

export type InstagramPostSchema = z.infer<typeof instagramPostSchema>;
export type ParsedEventInfoSchema = z.infer<typeof parsedEventInfoSchema>;
