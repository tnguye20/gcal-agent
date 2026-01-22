import axios from 'axios';
import type { Browser } from 'puppeteer-core';
import OpenAI from 'openai';
import { InstagramPost } from '../types';

export class InstagramExtractor {
  /**
   * Extract Instagram post data from URL
   * Uses Perplexity AI to parse the URL, falls back to scraping if needed
   */
  async extractFromUrl(url: string): Promise<InstagramPost> {
    // Validate Instagram URL
    if (!this.isValidInstagramUrl(url)) {
      throw new Error('Invalid Instagram URL');
    }

    try {
      // Try Perplexity first - it can fetch and parse web content
      return await this.extractViaPerplexity(url);
    } catch (error) {
      console.log('Perplexity failed, trying scraping fallback...', error);
      // Fallback to scraping with Chromium
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
   * Extract via Perplexity AI (primary method)
   * Perplexity can fetch and parse web content intelligently
   */
  private async extractViaPerplexity(url: string): Promise<InstagramPost> {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      throw new Error('PERPLEXITY_API_KEY not configured');
    }

    const client = new OpenAI({
      apiKey,
      baseURL: 'https://api.perplexity.ai',
    });

    const systemPrompt = `You are an Instagram content extractor. Given an Instagram URL, fetch and extract the post information.

Return ONLY a valid JSON object with these fields:
- caption: The post caption/description text (string)
- username: The Instagram username who posted it (string)
- thumbnailUrl: The main image/video thumbnail URL (string, optional)

Return ONLY the JSON object, no additional text or markdown formatting.`;

    const userPrompt = `Extract the Instagram post information from this URL: ${url}

Fetch the page content and extract the caption, username, and thumbnail URL if available.`;

    try {
      const response = await client.chat.completions.create({
        model: 'sonar',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No response from Perplexity');
      }

      // Extract JSON from markdown code blocks if present
      let jsonString = content.trim();
      const codeBlockMatch = jsonString.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      if (codeBlockMatch) {
        jsonString = codeBlockMatch[1].trim();
      }
      jsonString = jsonString.replace(/^`+|`+$/g, '').trim();

      const parsed = JSON.parse(jsonString);

      return {
        url,
        caption: parsed.caption || '',
        username: parsed.username || '',
        thumbnailUrl: parsed.thumbnailUrl || '',
      };
    } catch (error) {
      throw new Error(`Perplexity extraction failed: ${error}`);
    }
  }

  /**
   * Extract via Instagram's public oEmbed API (alternative)
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
    // Detect environment and dynamically import the appropriate puppeteer package
    const isProduction = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
    
    let browser: Browser;
    
    if (isProduction) {
      // Production: use puppeteer-core with @sparticuz/chromium
      const puppeteerCore = await import('puppeteer-core');
      const chromium = await import('@sparticuz/chromium');
      
      browser = await puppeteerCore.default.launch({
        args: [...chromium.default.args, '--disable-gpu', '--single-process', '--no-zygote', '--no-sandbox'],
        executablePath: await chromium.default.executablePath(),
        headless: true,
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
