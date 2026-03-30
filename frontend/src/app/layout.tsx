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
  title: {
    default: 'JobPortal — หางานดี มีคุณภาพ',
    template: '%s | JobPortal',
  },
  description: 'แพลตฟอร์มหางานออนไลน์ เชื่อมต่อผู้หางานกับบริษัทชั้นนำกว่า 5,000 แห่ง ค้นหางานตามทักษะ จังหวัด และประเภทงาน สมัครงานง่าย ได้งานเร็ว',
  keywords: ['หางาน', 'สมัครงาน', 'งานออนไลน์', 'job portal', 'หางานออนไลน์', 'ประกาศงาน', 'งานพาร์ทไทม์', 'งานประจำ', 'ฝึกงาน'],
  authors: [{ name: 'JobPortal' }],
  creator: 'JobPortal',
  metadataBase: new URL('https://tinnaphatjobportal.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    url: 'https://tinnaphatjobportal.vercel.app',
    siteName: 'JobPortal',
    title: 'JobPortal — หางานดี มีคุณภาพ',
    description: 'แพลตฟอร์มหางานออนไลน์ เชื่อมต่อผู้หางานกับบริษัทชั้นนำกว่า 5,000 แห่ง',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JobPortal — หางานดี มีคุณภาพ',
    description: 'แพลตฟอร์มหางานออนไลน์ เชื่อมต่อผู้หางานกับบริษัทชั้นนำกว่า 5,000 แห่ง',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
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
