'use client';

import Link from 'next/link';
import { Shield, Sparkles, Scroll, Users, Box, Feather, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="py-8 sm:py-12 space-y-12 sm:space-y-16 max-w-5xl mx-auto w-full">
      {/* Hlavní Hero sekce */}
      <div className="text-center max-w-2xl mx-auto space-y-6 pt-2">
        {/* Neutrální odznáček */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-zinc-900/40 border border-white/10 text-zinc-300 text-xs font-semibold backdrop-blur-md shadow-sm uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
          <span>Oficiální pravidla D&D 2024</span>
        </div>

        {/* Hlavní nadpis - vertikální gradient z100 -> z500 dle zadání */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-wider uppercase font-fantasy drop-shadow-md leading-tight">
          <span className="bg-gradient-to-b from-zinc-100 to-zinc-500 bg-clip-text text-transparent block">
            Chytrý deník
          </span>
          <span className="bg-gradient-to-b from-zinc-100 to-zinc-500 bg-clip-text text-transparent block">
            dobrodruha
          </span>
        </h1>

        <p className="text-zinc-300 text-base sm:text-lg max-w-xl mx-auto font-light leading-relaxed">
          Živý digitální list postavy a správce družiny pro uzavřenou skupinu přátel. Okamžitá synchronizace životů, truhly a poznámek u stolu.
        </p>

        {/* Tlačítka v odstínech šedi pro maximální kontrast */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {/* Hlavní tlačítko: světle stříbrné s glow efektem */}
          <Link
            href="/vault"
            className="bg-zinc-200 text-zinc-900 hover:bg-white border border-transparent hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all font-bold px-7 py-3.5 rounded-xl inline-flex items-center space-x-2.5 text-sm"
          >
            <Scroll className="w-4 h-4 text-zinc-900" />
            <span>Otevřít Trezor postav</span>
            <ArrowRight className="w-4 h-4 text-zinc-900" />
          </Link>

          {/* Sekundární tlačítko: čistý glassmorphic outline */}
          <Link
            href="/campaigns"
            className="bg-zinc-900/40 text-zinc-300 hover:text-white border border-white/10 hover:border-white/20 backdrop-blur-md hover:bg-zinc-900/60 transition-all font-semibold px-7 py-3.5 rounded-xl inline-flex items-center space-x-2.5 text-sm"
          >
            <Shield className="w-4 h-4 text-zinc-400" />
            <span>Spravovat Kampaně (DM)</span>
          </Link>
        </div>
      </div>

      {/* Glassmorphism karty s hover efekty dle zadání */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Karta 1: Pravidla 2024 & Wizard */}
        <div className="bg-zinc-900/30 backdrop-blur-md border border-white/10 shadow-2xl p-7 rounded-2xl space-y-4 transition-all duration-300 hover:-translate-y-1 hover:bg-zinc-900/40 hover:border-white/20 group">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 group-hover:border-white/20 group-hover:bg-white/10 group-hover:text-white transition-all duration-300">
            <Feather className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <h3 className="text-lg font-bold text-zinc-100 group-hover:text-white transition-colors duration-300 font-fantasy uppercase tracking-wider">
            Pravidla 2024 & Wizard
          </h3>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Automatické výpočty statistik podle Původu (Background), volba Origin Featu a odemknutí podtříd (Subclass) na 3. úrovni.
          </p>
        </div>

        {/* Karta 2: Živý deník & DM Dashboard */}
        <div className="bg-zinc-900/30 backdrop-blur-md border border-white/10 shadow-2xl p-7 rounded-2xl space-y-4 transition-all duration-300 hover:-translate-y-1 hover:bg-zinc-900/40 hover:border-white/20 group">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 group-hover:border-white/20 group-hover:bg-white/10 group-hover:text-white transition-all duration-300">
            <Users className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <h3 className="text-lg font-bold text-zinc-100 group-hover:text-white transition-colors duration-300 font-fantasy uppercase tracking-wider">
            Živý deník & DM Dashboard
          </h3>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Okamžitá synchronizace životů (HP), dočasných HP, Death Saves a odpočinku (Short/Long Rest) mezi hráčem a Pánem jeskyně.
          </p>
        </div>

        {/* Karta 3: Společná truhla & Kořist */}
        <div className="bg-zinc-900/30 backdrop-blur-md border border-white/10 shadow-2xl p-7 rounded-2xl space-y-4 transition-all duration-300 hover:-translate-y-1 hover:bg-zinc-900/40 hover:border-white/20 group">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 group-hover:border-white/20 group-hover:bg-white/10 group-hover:text-white transition-all duration-300">
            <Box className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <h3 className="text-lg font-bold text-zinc-100 group-hover:text-white transition-colors duration-300 font-fantasy uppercase tracking-wider">
            Společná truhla & Kořist
          </h3>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Loot pool v reálném čase. Pán jeskyně může tajně připravit kořist, hráči si berou věci do batohu a dělí mince jedním klikem.
          </p>
        </div>
      </div>
    </div>
  );
}
