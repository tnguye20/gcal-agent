import type { Browser } from 'puppeteer-core';
import { InstagramPost } from '../types';

export class InstagramExtractor {
  /**
   * Extract Instagram post data from URL
   * Uses fetch-based scraping for serverless environments
   */
  async extractFromUrl(url: string): Promise<InstagramPost> {
    // Validate Instagram URL
    if (!this.isValidInstagramUrl(url)) {
      throw new Error('Invalid Instagram URL');
    }

    // Try fetch-based extraction first (works on Vercel)
    try {
      return await this.extractViaFetch(url);
    } catch (fetchError) {
      // Fall back to browser scraping in development
      if (!process.env.VERCEL) {
        return await this.extractViaBrowser(url);
      }
      throw fetchError;
    }
  }

  private isValidInstagramUrl(url: string): boolean {
    const patterns = [
      /^https?:\/\/(www\.)?instagram\.com\/p\/[\w-]+/,
      /^https?:\/\/(www\.)?instagram\.com\/reel\/[\w-]+/,
      /^https?:\/\/(www\.)?instagram\.com\/tv\/[\w-]+/,
    ];
    return patterns.some(pattern => pattern.test(url));
  }

  /**
   * Extract via fetch - works on Vercel serverless
   * Instagram embeds OG meta tags in initial HTML response
   */
  private async extractViaFetch(url: string): Promise<InstagramPost> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Instagram post: ${response.status}`);
    }

    const html = await response.text();

    // Extract OG meta tags using regex
    const getMetaContent = (property: string): string => {
      const regex = new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i');
      const altRegex = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${property}["']`, 'i');
      const match = html.match(regex) || html.match(altRegex);
      return match ? match[1] : '';
    };

    const caption = getMetaContent('og:description') || getMetaContent('og:title') || '';
    const thumbnailUrl = getMetaContent('og:image') || '';
    const siteName = getMetaContent('og:site_name') || '';
    
    // Extract username from the caption or URL
    const usernameMatch = caption.match(/^([^:]+):/);
    const username = usernameMatch ? usernameMatch[1].trim() : siteName;

    if (!caption && !thumbnailUrl) {
      throw new Error('Could not extract Instagram post data - page may require login');
    }

    return {
      url,
      caption: caption.trim(),
      thumbnailUrl,
      username,
    };
  }

  /**
   * Extract via headless browser (development only)
   */
  private async extractViaBrowser(url: string): Promise<InstagramPost> {
    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.default.launch({ headless: true });

    try {
      const page = await browser.newPage();
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

      // Wait for content to load
      await page.waitForSelector('meta[property="og:description"]', { timeout: 5000 }).catch(() => {});

      // Extract data from meta tags
      const caption = await page.evaluate(() => {
        const metaDesc = document.querySelector('meta[property="og:description"]');
        const metaTitle = document.querySelector('meta[property="og:title"]');
        return metaDesc?.getAttribute('content') || metaTitle?.getAttribute('content') || '';
      });

      const thumbnailUrl = await page.evaluate(() => {
        const metaImage = document.querySelector('meta[property="og:image"]');
        return metaImage?.getAttribute('content') || '';
      });

      const username = await page.evaluate(() => {
        const metaSite = document.querySelector('meta[property="og:site_name"]');
        return metaSite?.getAttribute('content') || '';
      });

      await browser.close();

      return {
        url,
        caption: caption.trim(),
        thumbnailUrl,
        username,
      };
    } catch (error) {
      await browser.close();
      throw new Error(`Browser scraping failed: ${error}`);
    }
  }

  /**
   * Extract from plain text
   */
  async extractFromText(text: string): Promise<InstagramPost> {
    return {
      url: '',
      caption: text,
    };
  }
}
