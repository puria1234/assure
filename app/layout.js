import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
});

export const metadata = {
  title: 'Assure',
  description: 'Track and manage all your product warranties in one place.',
  icons: {
    // Required: defining an `icons` object suppresses the file-based
    // app/icon.png link, so the favicon must be declared explicitly here.
    icon: '/favicon.png',
    apple: [
      { url: '/apple-touch-icon-180.png', sizes: '180x180', type: 'image/png' },
      { url: '/apple-touch-icon-152.png', sizes: '152x152', type: 'image/png' },
      { url: '/apple-touch-icon-120.png', sizes: '120x120', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Assure',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'theme-color': '#080808',
    'google-site-verification': '9_JzOdfOk3oOJkfW-pZ7t_XjlRBABpYdauzpEX9h1i0',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#080808',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.className} ${inter.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            if (typeof window !== 'undefined' && window.process === undefined) {
              console.log = function() {};
              console.warn = function() {};
              console.error = function() {};
              console.info = function() {};
              console.debug = function() {};
            }
          `
        }} />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
