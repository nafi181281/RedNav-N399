import type { Metadata } from 'next';
// The stylesheet is resolved by Next.js at build time; the local TypeScript
// checker may not have a declaration for side-effect CSS imports.
// @ts-ignore -- CSS is handled by the Next.js bundler.
import './globals.css';

export const metadata: Metadata = {
  title: 'Mars EVA Helmet HUD',
  description:
    'Futuristic Mars astronaut helmet visor HUD with AR navigation, terrain hazard detection, environmental telemetry, and smart object scanning.',
  openGraph: {
    title: 'Mars EVA Helmet HUD',
    description:
      'Futuristic Mars astronaut helmet visor HUD with AR navigation, terrain hazard detection, environmental telemetry, and smart object scanning.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-black text-slate-100 overflow-hidden select-none">
        {children}
      </body>
    </html>
  );
}
