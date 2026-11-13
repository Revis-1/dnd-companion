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
      <body className="bg-[url('/bg-map.jpg')] bg-fixed bg-cover bg-center text-zinc-300 antialiased min-h-screen relative flex flex-col selection:bg-zinc-700 selection:text-white">
        <div className="fixed inset-0 bg-zinc-950/85 -z-10"></div>
        <Navbar />
        <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col justify-center">
          {children}
        </main>
      </body>
    </html>
  );
}
