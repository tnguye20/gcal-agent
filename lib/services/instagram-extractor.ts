import type { Browser } from 'puppeteer-core';
import { InstagramPost } from '../types';

export class InstagramExtractor {
  /**
   * Extract Instagram post data from URL
   * Uses browser scraping to extract content
   */
  async extractFromUrl(url: string): Promise<InstagramPost> {
    // Validate Instagram URL
    if (!this.isValidInstagramUrl(url)) {
      throw new Error('Invalid Instagram URL');
    }

    return await this.extractViaScraping(url);
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
   * Extract via headless browser scraping
   */
  private async extractViaScraping(url: string): Promise<InstagramPost> {
    // Detect environment and dynamically import the appropriate puppeteer package
    const isProduction = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
    
    let browser: Browser;
    
    if (isProduction) {
      // Production: use puppeteer-core with @sparticuz/chromium
      const puppeteerCore = await import('puppeteer-core');
      const chromium = await import('@sparticuz/chromium');
      
      // Set chromium path for Vercel
      const executablePath = await chromium.default.executablePath('/tmp/chromium');
      
      browser = await puppeteerCore.default.launch({
        args: chromium.default.args,
        defaultViewport: chromium.default.defaultViewport,
        executablePath,
        headless: chromium.default.headless,
      });
    } else {
      // Development: use full puppeteer with bundled Chromium
      const puppeteer = await import('puppeteer');
      browser = await puppeteer.default.launch({
        headless: true,
      });
    }

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
