import axios from 'axios';
import { chromium } from 'playwright';
import { InstagramPost } from '../types';

export class InstagramExtractor {
  /**
   * Extract Instagram post data from URL
   * Tries oEmbed API first, falls back to scraping
   */
  async extractFromUrl(url: string): Promise<InstagramPost> {
    // Validate Instagram URL
    if (!this.isValidInstagramUrl(url)) {
      throw new Error('Invalid Instagram URL');
    }

    try {
      // Try oEmbed API first (fast, public)
      return await this.extractViaOEmbed(url);
    } catch (error) {
      console.log('oEmbed failed, trying scraping...', error);
      // Fallback to scraping
      return await this.extractViaScraping(url);
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
   * Extract via Instagram's public oEmbed API
   */
  private async extractViaOEmbed(url: string): Promise<InstagramPost> {
    const oembedUrl = `https://graph.facebook.com/v18.0/instagram_oembed?url=${encodeURIComponent(url)}&access_token=&fields=thumbnail_url,author_name,title`;
    
    try {
      const response = await axios.get(oembedUrl, {
        timeout: 10000,
      });

      return {
        url,
        caption: response.data.title || '',
        username: response.data.author_name || '',
        thumbnailUrl: response.data.thumbnail_url || '',
      };
    } catch (error) {
      throw new Error('oEmbed extraction failed');
    }
  }

  /**
   * Extract via headless browser scraping (fallback)
   */
  private async extractViaScraping(url: string): Promise<InstagramPost> {
    const browser = await chromium.launch({ 
      headless: true,
    });

    try {
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });
      
      const page = await context.newPage();
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      // Wait for content to load
      await page.waitForTimeout(2000);

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
      throw new Error(`Scraping failed: ${error}`);
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
