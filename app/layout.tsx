import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Instagram to Google Calendar Converter',
  description: 'Convert Instagram posts and text to Google Calendar invites using AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
