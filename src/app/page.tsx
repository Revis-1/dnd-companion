'use client';

import Link from 'next/link';
import { Shield, Sparkles, Scroll, Users, Box, Feather, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="py-10 space-y-14 max-w-5xl mx-auto">
      {/* Hlavní Hero sekce */}
      <div className="text-center max-w-2xl mx-auto space-y-6 pt-4">
        {/* Neutrální odznáček */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/5 border border-zinc-500/20 text-zinc-300 text-xs font-semibold backdrop-blur-md shadow-sm uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
          <span>Oficiální pravidla D&D 2024</span>
        </div>

        {/* Hlavní nadpis ve stříbrno-šedém gradientu bez zlaté */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-wider uppercase font-fantasy drop-shadow-sm leading-tight">
          <span className="bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Chytrý deník dobrodruha
          </span>
        </h1>

        <p className="text-zinc-400 text-base sm:text-lg max-w-xl mx-auto font-light leading-relaxed">
          Živý digitální list postavy a správce družiny pro uzavřenou skupinu přátel. Okamžitá synchronizace životů, truhly a poznámek u stolu.
        </p>

        {/* Neutrální oddělovací linka do ztracena */}
        <div className="h-[1px] w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-zinc-600/40 to-transparent my-6" />

        {/* Tlačítka v čistých odstínech šedi */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {/* Hlavní prémiové tlačítko: výrazné světlé proti tmavému sklu */}
          <Link
            href="/vault"
            className="group relative inline-flex items-center space-x-2.5 px-8 py-3.5 rounded-xl font-bold text-sm text-zinc-950 bg-zinc-100 hover:bg-white transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(255,255,255,0.18)] shadow-lg shadow-black/50"
          >
            <Scroll className="w-4 h-4 text-zinc-950 transition-transform duration-300 group-hover:rotate-12" />
            <span>Otevřít Trezor postav</span>
            <ArrowRight className="w-4 h-4 text-zinc-950 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          {/* Sekundární tlačítko: čistý outline */}
          <Link
            href="/campaigns"
            className="inline-flex items-center space-x-2.5 px-8 py-3.5 rounded-xl font-semibold text-sm text-zinc-300 border border-zinc-600 bg-white/5 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-zinc-800/50 hover:border-zinc-400 hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.06)]"
          >
            <Shield className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
            <span>Spravovat Kampaně (DM)</span>
          </Link>
        </div>
      </div>

      {/* Oddělovací linka mezi sekcemi */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-zinc-600/40 to-transparent" />

      {/* Glassmorphism karty s neutrální ledovou září */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Karta 1 */}
        <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-500/20 hover:border-zinc-400/40 p-7 rounded-2xl space-y-4 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(255,255,255,0.07)] group">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-zinc-500/20 flex items-center justify-center text-zinc-300 group-hover:border-zinc-400/40 group-hover:bg-white/10 group-hover:text-white transition-all duration-300">
            <Feather className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <h3 className="text-lg font-bold text-zinc-100 group-hover:text-white transition-colors duration-300 font-fantasy">
            Pravidla 2024 & Wizard
          </h3>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Automatické výpočty statistik podle Původu (Background), volba Origin Featu a odemknutí podtříd (Subclass) na 3. úrovni.
          </p>
        </div>

        {/* Karta 2 */}
        <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-500/20 hover:border-zinc-400/40 p-7 rounded-2xl space-y-4 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(255,255,255,0.07)] group">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-zinc-500/20 flex items-center justify-center text-zinc-300 group-hover:border-zinc-400/40 group-hover:bg-white/10 group-hover:text-white transition-all duration-300">
            <Users className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <h3 className="text-lg font-bold text-zinc-100 group-hover:text-white transition-colors duration-300 font-fantasy">
            Živý deník & DM Dashboard
          </h3>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Okamžitá synchronizace životů (HP), dočasných HP, Death Saves a odpočinku (Short/Long Rest) mezi hráčem a Pánem jeskyně.
          </p>
        </div>

        {/* Karta 3 */}
        <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-500/20 hover:border-zinc-400/40 p-7 rounded-2xl space-y-4 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(255,255,255,0.07)] group">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-zinc-500/20 flex items-center justify-center text-zinc-300 group-hover:border-zinc-400/40 group-hover:bg-white/10 group-hover:text-white transition-all duration-300">
            <Box className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <h3 className="text-lg font-bold text-zinc-100 group-hover:text-white transition-colors duration-300 font-fantasy">
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
