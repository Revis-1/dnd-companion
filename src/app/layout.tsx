import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'D&D 2024 Deník dobrodruha',
  description: 'Chytrý digitální deník a správce kampaní pro stolní RPG D&D 2024',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs" className="dark">
      <body className="bg-zinc-950 text-zinc-100 antialiased min-h-screen selection:bg-zinc-700 selection:text-white">
        <div className="relative min-h-screen bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')] bg-cover bg-center">
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-[2px]"></div>
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col justify-center">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
