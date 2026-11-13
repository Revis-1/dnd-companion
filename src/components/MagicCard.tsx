'use client';

import React, { useRef } from 'react';

interface MagicCardProps {
  children: React.ReactNode;
  className?: string;
  /** RGB hodnoty hlavní barvy záře, např. "34, 211, 238" (výchozí: cyan-400) */
  glowColor?: string;
  /** RGB hodnoty sekundární barvy záře, např. "59, 130, 246" (výchozí: blue-500) */
  glowSecondaryColor?: string;
  /** Zda je karta aktuálně vybraná (např. ve wizardu tvorby postavy) */
  selected?: boolean;
  onClick?: () => void;
}

export default function MagicCard({
  children,
  className = '',
  glowColor = '34, 211, 238',
  glowSecondaryColor,
  selected = false,
  onClick,
}: MagicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const secondary = glowSecondaryColor || glowColor;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      style={
        selected
          ? {
              borderColor: `rgba(${glowColor}, 0.55)`,
              boxShadow: `0 0 20px rgba(${glowColor}, 0.15)`,
            }
          : undefined
      }
      className={`relative rounded-2xl backdrop-blur-md border shadow-2xl transition-all duration-200 ease-out transform-gpu hover:-translate-y-1 group overflow-hidden ${
        selected
          ? 'bg-zinc-900/65 border-white/30'
          : 'bg-zinc-900/40 border-white/10 hover:bg-zinc-900/50'
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Jemný vnitřní odlesk skla sledující kurzor */}
      <div
        className={`pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300 ${
          selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
        style={{
          background: `radial-gradient(350px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(${glowColor}, 0.11), rgba(${secondary}, 0.05) 45%, transparent 80%)`,
        }}
      />

      {/* Neonový rámeček maskovaný pouze na okraj karty */}
      <div
        className={`pointer-events-none absolute inset-0 rounded-2xl p-[1.5px] transition-opacity duration-300 ${
          selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
        style={{
          background: `radial-gradient(260px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(${glowColor}, 1), rgba(${secondary}, 0.75) 40%, transparent 75%)`,
          WebkitMask:
            'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />

      {/* Samotný vnitřek karty */}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
