'use client';

import Link from 'next/link';
import { Shield, Sparkles, Scroll, Users, Award, Box } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="py-8 space-y-12">
      {/* Hero section */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-fantasy-card border border-fantasy-gold/30 text-fantasy-gold text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Optimalizováno pro pravidla D&D 2024</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          Chytrý deník <span className="text-fantasy-gold">dobrodruha</span>
        </h1>
        <p className="text-gray-400 text-base sm:text-lg">
          Živý digitální list postavy a správce družiny pro uzavřenou skupinu přátel. Okamžitá synchronizace životů, truhly a poznámek u stolu.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            href="/vault"
            className="bg-fantasy-gold text-black font-bold px-6 py-3 rounded-lg hover:bg-fantasy-goldHover transition shadow-lg shadow-fantasy-gold/10"
          >
            Otevřít Trezor postav
          </Link>
          <Link
            href="/create"
            className="bg-fantasy-card border border-fantasy-border text-fantasy-parchment font-semibold px-6 py-3 rounded-lg hover:border-fantasy-gold/50 transition"
          >
            Vytvořit novou postavu
          </Link>
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="bg-fantasy-card/70 border border-fantasy-border p-6 rounded-xl space-y-3">
          <div className="w-10 h-10 rounded-lg bg-fantasy-gold/10 border border-fantasy-gold/30 flex items-center justify-center text-fantasy-gold">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Pravidla 2024 & Wizard</h3>
          <p className="text-gray-400 text-sm">
            Automatické výpočty statistik podle Původu (Background), volba Origin Featu a odemknutí podtříd (Subclass) na 3. úrovni.
          </p>
        </div>

        <div className="bg-fantasy-card/70 border border-fantasy-border p-6 rounded-xl space-y-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Živý deník & DM Dashboard</h3>
          <p className="text-gray-400 text-sm">
            Okamžitá synchronizace životů (HP), dočasných HP, Death Saves a odpočinku (Short/Long Rest) mezi hráčem a Pánem jeskyně.
          </p>
        </div>

        <div className="bg-fantasy-card/70 border border-fantasy-border p-6 rounded-xl space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Box className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Společná truhla & Kořist</h3>
          <p className="text-gray-400 text-sm">
            Loot pool v reálném čase. Pán jeskyně může tajně připravit kořist, hráči si berou věci do batohu a dělí mince jedním klikem.
          </p>
        </div>
      </div>
    </div>
  );
}
