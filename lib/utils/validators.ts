import { z } from 'zod';

export const ExtractionRequestSchema = z.object({
  instagramUrl: z.string().url().optional(),
  text: z.string().optional(),
  imageUrl: z.string().url().optional(),
}).refine(
  (data) => data.instagramUrl || data.text || data.imageUrl,
  {
    message: 'At least one of instagramUrl, text, or imageUrl must be provided',
  }
);

export function validateInstagramUrl(url: string): boolean {
  const patterns = [
    /^https?:\/\/(www\.)?instagram\.com\/p\/[\w-]+/,
    /^https?:\/\/(www\.)?instagram\.com\/reel\/[\w-]+/,
    /^https?:\/\/(www\.)?instagram\.com\/tv\/[\w-]+/,
  ];
  return patterns.some(pattern => pattern.test(url));
}

export function normalizeInstagramUrl(url: string): string {
  // Remove query parameters and trailing slashes
  return url.split('?')[0].replace(/\/$/, '');
}
