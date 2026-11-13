'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface MagicPasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  className?: string;
}

export default function MagicPasswordInput({
  className = '',
  ...props
}: MagicPasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const revealTimerRef = useRef<NodeJS.Timeout | null>(null);
  const endTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = () => {
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    if (endTimerRef.current) clearTimeout(endTimerRef.current);
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const handleToggle = () => {
    clearTimers();

    if (showPassword) {
      // Asymetrická interakce: OKAMŽITÉ skrytí zpět na tečky bez jakékoliv animace
      setIsAnimating(false);
      setShowPassword(false);
    } else {
      // Efekt odhalení: spustí přejezd magického prachu/záře zleva doprava
      setIsAnimating(true);

      // Uprostřed přejezdu prachu (160ms) se odhalí text hesla
      revealTimerRef.current = setTimeout(() => {
        setShowPassword(true);
      }, 160);

      // Po dokončení přejezdu (450ms) se animace ukončí a vrátí na start
      endTimerRef.current = setTimeout(() => {
        setIsAnimating(false);
      }, 450);
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      <input
        {...props}
        type={showPassword ? 'text' : 'password'}
        className={`w-full bg-black/20 backdrop-blur-md border border-zinc-700/80 rounded-xl px-4 py-2.5 pr-11 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors ${className}`}
      />

      {/* Magický prach / záře přejíždějící zleva doprava pouze při odhalení */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-zinc-200/75 to-transparent blur-[2px] transform-gpu ${
          isAnimating
            ? 'translate-x-[300%] opacity-100 transition-transform duration-[450ms] ease-out'
            : '-translate-x-full opacity-0 transition-none'
        }`}
      />

      {/* Tlačítko s ikonou oka napravo uvnitř inputu */}
      <button
        type="button"
        onClick={handleToggle}
        tabIndex={-1}
        aria-label={showPassword ? 'Skrýt heslo' : 'Zobrazit heslo'}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors z-10"
      >
        {showPassword ? (
          <EyeOff className="w-4 h-4" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
