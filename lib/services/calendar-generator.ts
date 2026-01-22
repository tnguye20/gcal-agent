import { CalendarEvent, ParsedEventInfo } from '../types';

export class CalendarGenerator {
  /**
   * Generate Google Calendar URL from event info
   */
  generateGoogleCalendarUrl(eventInfo: ParsedEventInfo, sourceUrl?: string): string {
    const baseUrl = 'https://calendar.google.com/calendar/render';
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: eventInfo.title,
      dates: this.formatDateRange(eventInfo.startDateTime, eventInfo.endDateTime),
    });

    // Add description with source link
    let description = eventInfo.description || '';
    if (sourceUrl) {
      description += `\n\nSource: ${sourceUrl}`;
    }
    if (description) {
      params.append('details', description);
    }

    // Add location
    if (eventInfo.location) {
      params.append('location', eventInfo.location);
    }

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Format date range for Google Calendar
   * Format: YYYYMMDDTHHmmssZ/YYYYMMDDTHHmmssZ
   */
  private formatDateRange(startDateTime: string, endDateTime: string): string {
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    return `${this.formatDateForGoogle(start)}/${this.formatDateForGoogle(end)}`;
  }

  /**
   * Format a single date for Google Calendar
   * Format: YYYYMMDDTHHmmssZ
   */
  private formatDateForGoogle(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  }

  /**
   * Generate multiple calendar service URLs
   */
  generateMultipleUrls(eventInfo: ParsedEventInfo, sourceUrl?: string): {
    google: string;
    outlook: string;
    apple: string;
  } {
    return {
      google: this.generateGoogleCalendarUrl(eventInfo, sourceUrl),
      outlook: this.generateOutlookUrl(eventInfo, sourceUrl),
      apple: this.generateICalFile(eventInfo, sourceUrl),
    };
  }

  /**
   * Generate Outlook/Office365 calendar URL
   */
  private generateOutlookUrl(eventInfo: ParsedEventInfo, sourceUrl?: string): string {
    const baseUrl = 'https://outlook.live.com/calendar/0/deeplink/compose';
    
    let description = eventInfo.description || '';
    if (sourceUrl) {
      description += `\n\nSource: ${sourceUrl}`;
    }

    const params = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      subject: eventInfo.title,
      startdt: new Date(eventInfo.startDateTime).toISOString(),
      enddt: new Date(eventInfo.endDateTime).toISOString(),
    });

    if (description) {
      params.append('body', description);
    }

    if (eventInfo.location) {
      params.append('location', eventInfo.location);
    }

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Generate iCal format for Apple Calendar (returns data URL)
   */
  private generateICalFile(eventInfo: ParsedEventInfo, sourceUrl?: string): string {
    const start = new Date(eventInfo.startDateTime);
    const end = new Date(eventInfo.endDateTime);

    let description = eventInfo.description || '';
    if (sourceUrl) {
      description += `\\n\\nSource: ${sourceUrl}`;
    }

    const ical = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//gcal-agent//EN',
      'BEGIN:VEVENT',
      `DTSTART:${this.formatDateForGoogle(start)}`,
      `DTEND:${this.formatDateForGoogle(end)}`,
      `SUMMARY:${eventInfo.title}`,
      description ? `DESCRIPTION:${description.replace(/\n/g, '\\n')}` : '',
      eventInfo.location ? `LOCATION:${eventInfo.location}` : '',
      `DTSTAMP:${this.formatDateForGoogle(new Date())}`,
      `UID:${Date.now()}@gcal-agent`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].filter(Boolean).join('\r\n');

    return `data:text/calendar;charset=utf8,${encodeURIComponent(ical)}`;
  }
}
