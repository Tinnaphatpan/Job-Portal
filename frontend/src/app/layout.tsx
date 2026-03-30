import type { Metadata } from 'next';
import { Noto_Sans_Thai } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import NextAuthProvider from '@/components/providers/NextAuthProvider';

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-noto',
});

export const metadata: Metadata = {
  title: 'JobPortal — หางานดี มีคุณภาพ',
  description: 'แพลตฟอร์มหางานและรับสมัครงานออนไลน์',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className={`${notoSansThai.variable} font-sans antialiased`}>
        <NextAuthProvider>
          {children}
          <Toaster richColors position="top-right" />
        </NextAuthProvider>
      </body>
    </html>
  );
}
