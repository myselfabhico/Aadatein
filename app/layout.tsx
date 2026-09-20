import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Aadatein — Habit Tracker',
  description: 'A local-first browser habit tracker with deep dark aesthetic, yearly heatmap contribution grids, matrix view, performance analytics, and cookie-based persistence without login.',
  openGraph: {
    title: 'Aadatein — Habit Tracker',
    description: 'A local-first browser habit tracker with deep dark aesthetic, yearly heatmap contribution grids, matrix view, performance analytics, and cookie-based persistence without login.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aadatein — Habit Tracker',
    description: 'A local-first browser habit tracker with deep dark aesthetic, yearly heatmap contribution grids, matrix view, performance analytics, and cookie-based persistence without login.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
