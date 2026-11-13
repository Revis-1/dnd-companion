'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Sparkles } from 'lucide-react';

interface MagicPasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  className?: string;
}

// Pevné pozice částeček magického prachu v oblaku větru
const DUST_PARTICLES = [
  { top: '18%', left: '15%', size: 3, delay: 0 },
  { top: '72%', left: '25%', size: 2, delay: 40 },
  { top: '38%', left: '42%', size: 3.5, delay: 20 },
  { top: '62%', left: '55%', size: 2.5, delay: 60 },
  { top: '24%', left: '68%', size: 2, delay: 10 },
  { top: '80%', left: '75%', size: 3, delay: 50 },
  { top: '48%', left: '85%', size: 4, delay: 30 },
  { top: '15%', left: '92%', size: 2.5, delay: 70 },
  { top: '68%', left: '95%', size: 3, delay: 15 },
];

export default function MagicPasswordInput({
  className = '',
  value,
  onChange,
  ...props
}: MagicPasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0); // 0 -> 1 během odkrývání
  const [internalVal, setInternalVal] = useState('');

  const rafRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentText =
    typeof value === 'string'
      ? value
      : inputRef.current?.value ?? internalVal;

  const stopAnimation = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopAnimation();
  }, []);

  const handleToggle = () => {
    stopAnimation();

    if (showPassword || isAnimating) {
      // Asymetrická interakce: OKAMŽITÉ skrytí zpět na tečky bez jakékoliv animace
      setIsAnimating(false);
      setShowPassword(false);
      setProgress(0);
      return;
    }

    // Spuštění efektu odhalení (prach/vítr postupně odkrývá písmena zleva doprava)
    setIsAnimating(true);
    setProgress(0);

    const duration = 680; // ms – dostatečně plynulé, aby byl prach i postupné odkrývání krásně vidět
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const raw = Math.min(1, elapsed / duration);
      // Jemný ease-out průběh
      const eased = 1 - Math.pow(1 - raw, 2.2);

      setProgress(eased);

      if (raw < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        setShowPassword(true);
        setProgress(1);
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(animate);
  };

  // Výpočet postupně odhaleného textu během přejezdu prachu
  const renderProgressiveText = () => {
    const len = currentText.length;
    if (len === 0) return '';
    const revealedCount = Math.floor(progress * (len + 1));
    const revealedPart = currentText.slice(0, revealedCount);
    const hiddenPart = '•'.repeat(Math.max(0, len - revealedCount));
    return revealedPart + hiddenPart;
  };

  const displayValue = isAnimating ? renderProgressiveText() : value;

  return (
    <div className="relative w-full overflow-hidden rounded-xl group">
      <input
        ref={inputRef}
        {...props}
        value={displayValue}
        onChange={(e) => {
          setInternalVal(e.target.value);
          onChange?.(e);
        }}
        readOnly={isAnimating}
        type={showPassword || isAnimating ? 'text' : 'password'}
        className={`w-full bg-black/20 backdrop-blur-md border border-zinc-700/80 rounded-xl px-4 py-2.5 pr-11 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors ${className}`}
      />

      {/* Efekt magického prachu a větru přejíždějící zleva doprava pouze při odhalení */}
      {isAnimating && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl z-10"
        >
          {/* Jemná mlžná stopa za vlnou větru */}
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-zinc-200/15 to-zinc-100/35 blur-[2px] transform-gpu"
            style={{
              width: `${Math.max(12, progress * 105)}%`,
            }}
          />

          {/* Hlavní svítící vlna prachu + letící zrnka prachu na hranici odkrývání */}
          <div
            className="absolute inset-y-0 w-24 -ml-12 transform-gpu flex items-center justify-center"
            style={{
              left: `${progress * 105}%`,
            }}
          >
            {/* Záře větru */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-100/85 to-transparent blur-[3px]" />
            <div className="absolute inset-y-1 w-8 bg-white/60 blur-[6px] rounded-full" />

            {/* Zrnka magického prachu */}
            {DUST_PARTICLES.map((p, idx) => (
              <span
                key={idx}
                className="absolute rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.95)]"
                style={{
                  top: p.top,
                  left: p.left,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  opacity: Math.sin(progress * Math.PI),
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tlačítko s ikonou oka napravo uvnitř inputu */}
      <button
        type="button"
        onClick={handleToggle}
        tabIndex={-1}
        aria-label={showPassword ? 'Skrýt heslo' : 'Zobrazit heslo'}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors z-20"
      >
        {showPassword ? (
          <EyeOff className="w-4 h-4" />
        ) : isAnimating ? (
          <Sparkles className="w-4 h-4 text-zinc-100 animate-spin" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
