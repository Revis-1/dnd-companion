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
      <body className="bg-zinc-950 text-zinc-100 antialiased min-h-screen relative flex flex-col selection:bg-zinc-700 selection:text-white">
        {/* Příprava na pozadí: Vrstva pro obrázek kreslené mapy */}
        <div 
          className="fixed inset-0 -z-20 bg-zinc-950 bg-cover bg-center bg-no-repeat bg-fixed"
          id="custom-background-layer"
        />
        {/* Overlay vrstva, která mapu lehce ztlumí a rozostří pro perfektní čitelnost */}
        <div className="fixed inset-0 -z-10 bg-zinc-950/70 backdrop-blur-sm pointer-events-none" />

        {/* Hlavní navigace a obsah */}
        <Navbar />
        <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
