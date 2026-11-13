'use client';

import Link from 'next/link';
import { Shield, Sparkles, Scroll, Users, Box, BookOpen, Feather } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="py-8 space-y-12 max-w-5xl mx-auto">
      {/* Hlavní sekce - Kniha dobrodruha */}
      <div className="text-center max-w-2xl mx-auto space-y-5 pt-4">
        {/* Fantasy odznáček jako pergamenový štítek */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#24170e] border border-[#6b451d] text-[#e5c158] text-xs font-semibold shadow-inner uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-fantasy-gold" />
          <span>Oficiální pravidla D&D 2024</span>
        </div>

        {/* Hlavní nadpis ve stylu fantasy knihy */}
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-wide text-white drop-shadow-md">
          Chytrý deník <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fae29c] via-[#d4af37] to-[#ba932e]">dobrodruha</span>
        </h1>

        <p className="text-fantasy-parchmentDark text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
          Živý digitální list postavy a správce družiny pro uzavřenou skupinu přátel. Okamžitá synchronizace životů, truhly a poznámek u stolu.
        </p>

        {/* Tlačítka s efektem starého zlata a dřeva */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
          <Link
            href="/vault"
            className="btn-gold px-7 py-3 rounded-xl text-sm font-bold shadow-xl flex items-center space-x-2"
          >
            <Scroll className="w-4 h-4" />
            <span>Otevřít Trezor postav</span>
          </Link>

          <Link
            href="/campaigns"
            className="bg-[#21140b] hover:bg-[#2d1b0f] border border-[#5c3a1b] text-fantasy-parchment hover:text-white px-7 py-3 rounded-xl text-sm font-semibold transition shadow-lg flex items-center space-x-2"
          >
            <Shield className="w-4 h-4 text-fantasy-gold" />
            <span>Spravovat Kampaně (DM)</span>
          </Link>
        </div>
      </div>

      {/* Karty funkcí stylizované jako starobylé listy deníku */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Karta 1 */}
        <div className="tome-page p-6 rounded-2xl space-y-3.5 transition hover:border-[#855728] group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#3b2412] to-[#1e1208] border border-[#7a4e23] flex items-center justify-center text-fantasy-gold shadow-md">
            <Feather className="w-5 h-5 text-fantasy-goldBright group-hover:scale-110 transition" />
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-fantasy-goldBright transition">
            Pravidla 2024 & Wizard
          </h3>
          <p className="text-fantasy-parchmentMuted text-xs leading-relaxed">
            Automatické výpočty statistik podle Původu (Background), volba Origin Featu a odemknutí podtříd (Subclass) na 3. úrovni.
          </p>
        </div>

        {/* Karta 2 */}
        <div className="tome-page p-6 rounded-2xl space-y-3.5 transition hover:border-[#855728] group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#3b1212] to-[#200909] border border-[#7a2323] flex items-center justify-center text-red-400 shadow-md">
            <Users className="w-5 h-5 text-red-300 group-hover:scale-110 transition" />
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-red-300 transition">
            Živý deník & DM Dashboard
          </h3>
          <p className="text-fantasy-parchmentMuted text-xs leading-relaxed">
            Okamžitá synchronizace životů (HP), dočasných HP, Death Saves a odpočinku (Short/Long Rest) mezi hráčem a Pánem jeskyně.
          </p>
        </div>

        {/* Karta 3 */}
        <div className="tome-page p-6 rounded-2xl space-y-3.5 transition hover:border-[#855728] group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#12301c] to-[#081a0e] border border-[#23703c] flex items-center justify-center text-emerald-400 shadow-md">
            <Box className="w-5 h-5 text-emerald-300 group-hover:scale-110 transition" />
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition">
            Společná truhla & Kořist
          </h3>
          <p className="text-fantasy-parchmentMuted text-xs leading-relaxed">
            Loot pool v reálném čase. Pán jeskyně může tajně připravit kořist, hráči si berou věci do batohu a dělí mince jedním klikem.
          </p>
        </div>
      </div>
    </div>
  );
}
