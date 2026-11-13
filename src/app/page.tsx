'use client';

import Link from 'next/link';
import { Shield, Sparkles, Scroll, Users, Box, Feather, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="py-10 space-y-14 max-w-5xl mx-auto">
      {/* Hlavní Hero sekce */}
      <div className="text-center max-w-2xl mx-auto space-y-6 pt-4">
        {/* Fantasy odznáček */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-yellow-400/90 text-xs font-semibold backdrop-blur-md shadow-sm uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>Oficiální pravidla D&D 2024</span>
        </div>

        {/* Hlavní nadpis s gradientem od sytě zlaté po jantarovou */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-wider uppercase font-fantasy drop-shadow-sm leading-tight">
          <span className="bg-gradient-to-r from-yellow-500 via-amber-300 to-amber-200 bg-clip-text text-transparent">
            Chytrý deník dobrodruha
          </span>
        </h1>

        <p className="text-slate-300/80 text-base sm:text-lg max-w-xl mx-auto font-light leading-relaxed">
          Živý digitální list postavy a správce družiny pro uzavřenou skupinu přátel. Okamžitá synchronizace životů, truhly a poznámek u stolu.
        </p>

        {/* Gradientová oddělovací linka */}
        <div className="h-[1px] w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-yellow-600/50 to-transparent my-6" />

        {/* Tlačítka: Zlatý gradient s glow + elegantní glass outline */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {/* Hlavní tlačítko se zlatavým gradientem, tmavým textem a glow efektem */}
          <Link
            href="/vault"
            className="group relative inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(234,179,8,0.45)]"
          >
            <Scroll className="w-4 h-4 text-slate-950 transition-transform duration-300 group-hover:rotate-12" />
            <span>Otevřít Trezor postav</span>
            <ArrowRight className="w-4 h-4 text-slate-950 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          {/* Sekundární elegantní outline verze */}
          <Link
            href="/campaigns"
            className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl font-semibold text-sm text-yellow-200/90 border border-yellow-500/30 bg-white/5 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 hover:border-yellow-500/70 hover:bg-yellow-500/10 hover:text-yellow-100 hover:shadow-[0_0_20px_rgba(234,179,8,0.2)]"
          >
            <Shield className="w-4 h-4 text-yellow-500" />
            <span>Spravovat Kampaně (DM)</span>
          </Link>
        </div>
      </div>

      {/* Oddělovací linka mezi sekcemi */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-yellow-600/50 to-transparent" />

      {/* Glassmorphism karty s plynulou interakcí na hover */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Karta 1 */}
        <div className="bg-black/40 backdrop-blur-md border border-white/10 hover:border-yellow-500/30 p-7 rounded-2xl space-y-4 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(234,179,8,0.15)] group">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-yellow-400 group-hover:border-yellow-500/40 group-hover:bg-yellow-500/10 group-hover:shadow-[0_0_15px_rgba(234,179,8,0.25)] transition-all duration-300">
            <Feather className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-yellow-300 transition-colors duration-300 font-fantasy">
            Pravidla 2024 & Wizard
          </h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Automatické výpočty statistik podle Původu (Background), volba Origin Featu a odemknutí podtříd (Subclass) na 3. úrovni.
          </p>
        </div>

        {/* Karta 2 */}
        <div className="bg-black/40 backdrop-blur-md border border-white/10 hover:border-red-500/30 p-7 rounded-2xl space-y-4 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] group">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-red-400 group-hover:border-red-500/40 group-hover:bg-red-500/10 group-hover:shadow-[0_0_15px_rgba(239,68,68,0.25)] transition-all duration-300">
            <Users className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-red-300 transition-colors duration-300 font-fantasy">
            Živý deník & DM Dashboard
          </h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Okamžitá synchronizace životů (HP), dočasných HP, Death Saves a odpočinku (Short/Long Rest) mezi hráčem a Pánem jeskyně.
          </p>
        </div>

        {/* Karta 3 */}
        <div className="bg-black/40 backdrop-blur-md border border-white/10 hover:border-emerald-500/30 p-7 rounded-2xl space-y-4 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] group">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/10 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all duration-300">
            <Box className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-emerald-300 transition-colors duration-300 font-fantasy">
            Společná truhla & Kořist
          </h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Loot pool v reálném čase. Pán jeskyně může tajně připravit kořist, hráči si berou věci do batohu a dělí mince jedním klikem.
          </p>
        </div>
      </div>
    </div>
  );
}
