import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import SWRProvider from '@/components/SWRProvider';
import ChatWidget from '@/components/ChatWidget';

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  display: 'swap',
});

const mono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ticketify — Pesan Tiket Konser & Acara Terbesar',
  description:
    'Platform pesan tiket konser dan festival musik paling modern, cepat, dan aman. Dapatkan tiket eksklusif musisi favoritmu sekarang.',
  keywords: ['tiket konser', 'konser jakarta', 'tiket coldplay', 'tiket bruno mars', 'ticketify', 'tiket festival'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${jakarta.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <SWRProvider>
          <ThemeProvider>
            <AuthProvider>
              <LanguageProvider>
                {children}
                <ChatWidget />
              </LanguageProvider>
            </AuthProvider>
          </ThemeProvider>
        </SWRProvider>
      </body>
    </html>
  );
}
