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
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen relative flex flex-col selection:bg-yellow-500/20 selection:text-yellow-200">
        {/* Příprava na pozadí: Základní temně modrá / obsidiánová barva + overlay pro budoucí bg-image */}
        <div 
          className="fixed inset-0 -z-20 bg-slate-950 bg-cover bg-center bg-no-repeat bg-fixed"
          id="custom-background-layer"
        />
        {/* Tmavý radiální overlay zachovávající perfektní čitelnost */}
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-slate-950/80 to-black pointer-events-none" />
        <div className="fixed inset-0 -z-10 bg-black/60 pointer-events-none" />

        {/* Hlavní obsah a navigace */}
        <Navbar />
        <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
