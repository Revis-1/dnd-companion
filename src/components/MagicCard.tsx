'use client';

import React, { useRef } from 'react';

interface MagicCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function MagicCard({ children, className = '' }: MagicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

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
      onMouseMove={handleMouseMove}
      className={`relative rounded-2xl bg-zinc-900/40 backdrop-blur-md border border-white/10 shadow-2xl transition-all duration-200 ease-out transform-gpu hover:-translate-y-1 hover:bg-zinc-900/50 group overflow-hidden ${className}`}
    >
      {/* Jemný vnitřní odlesk skla sledující kurzor */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background:
            'radial-gradient(350px circle at var(--mouse-x, -500px) var(--mouse-y, -500px), rgba(34, 211, 238, 0.09), rgba(59, 130, 246, 0.04) 45%, transparent 80%)',
        }}
      />

      {/* Neonový modro-azurový rámeček (cyan-400 -> blue-500) maskovaný pouze na okraj karty */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl p-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background:
            'radial-gradient(260px circle at var(--mouse-x, -500px) var(--mouse-y, -500px), rgba(34, 211, 238, 1), rgba(59, 130, 246, 0.75) 40%, transparent 75%)',
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
