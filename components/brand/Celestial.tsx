import type { CSSProperties, ReactNode } from "react";

// Deterministic pseudo-random numbers, so the starfield is identical on the server and in the browser.
function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

type Star = { x: number; y: number; r: number; o: number; twinkle: boolean; delay: number };

function makeStars(count: number, seed: number): Star[] {
  const rand = seeded(seed);
  return Array.from({ length: count }, () => {
    const big = rand() > 0.93;
    return {
      x: rand() * 1200,
      y: rand() * 800,
      r: big ? 1.3 + rand() * 0.9 : 0.4 + rand() * 0.7,
      o: big ? 0.9 : 0.25 + rand() * 0.5,
      twinkle: rand() > 0.82,
      delay: rand() * 4,
    };
  });
}

/** A quiet field of stars that fills its parent (place it absolutely). */
export function Starfield({ count = 140, seed = 7, className = "" }: { count?: number; seed?: number; className?: string }) {
  const stars = makeStars(count, seed);
  return (
    <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" className={`pointer-events-none ${className}`} aria-hidden="true">
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="#efede7"
          opacity={s.o}
          className={s.twinkle ? "twinkle" : undefined}
          style={s.twinkle ? ({ animationDelay: `${s.delay}s` } as CSSProperties) : undefined}
        />
      ))}
    </svg>
  );
}

/** Line-art orrery: zodiac ring with 12 divisions, orbits and slowly moving planets. */
export function OrbitArt({ className = "", stroke = "#efede7", accent = "#d9a55b" }: { className?: string; stroke?: string; accent?: string }) {
  const ticks = Array.from({ length: 72 }, (_, i) => i * 5);
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden="true">
      <g fill="none" stroke={stroke}>
        <circle cx="200" cy="200" r="190" strokeOpacity="0.55" strokeWidth="0.8" />
        <circle cx="200" cy="200" r="172" strokeOpacity="0.3" strokeWidth="0.8" />
        <g className="slow-spin" strokeOpacity="0.5">
          {ticks.map((deg) => {
            const long = deg % 30 === 0;
            const a = (deg * Math.PI) / 180;
            const r1 = long ? 172 : 184;
            return (
              <line key={deg} x1={200 + 190 * Math.cos(a)} y1={200 + 190 * Math.sin(a)} x2={200 + r1 * Math.cos(a)} y2={200 + r1 * Math.sin(a)} strokeWidth={long ? 0.9 : 0.6} />
            );
          })}
        </g>
        <circle cx="200" cy="200" r="132" strokeOpacity="0.35" strokeWidth="0.7" strokeDasharray="1 5" />
        <circle cx="200" cy="200" r="92" strokeOpacity="0.45" strokeWidth="0.7" />
        <circle cx="200" cy="200" r="54" strokeOpacity="0.35" strokeWidth="0.7" />
        <ellipse cx="200" cy="200" rx="150" ry="58" strokeOpacity="0.25" strokeWidth="0.7" transform="rotate(-24 200 200)" />
      </g>
      <g className="slow-spin">
        <circle cx="332" cy="200" r="5" fill={stroke} />
      </g>
      <g className="spin-reverse">
        <circle cx="200" cy="108" r="3.5" fill={stroke} />
        <circle cx="200" cy="108" r="9" fill="none" stroke={stroke} strokeOpacity="0.4" strokeWidth="0.7" />
      </g>
      <g className="slow-spin" style={{ animationDuration: "90s" }}>
        <circle cx="146" cy="200" r="2.6" fill={stroke} />
      </g>
      <circle cx="200" cy="200" r="15" fill={accent} />
      <circle cx="200" cy="200" r="24" fill="none" stroke={accent} strokeOpacity="0.5" strokeWidth="0.8" />
    </svg>
  );
}

/** A small ring of orbit lines around any content (used for icons and numerals). */
export function Halo({ children, className = "", stroke = "currentColor" }: { children: ReactNode; className?: string; stroke?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <g fill="none" stroke={stroke}>
          <circle cx="100" cy="100" r="96" strokeOpacity="0.5" strokeWidth="0.8" />
          <circle cx="100" cy="100" r="80" strokeOpacity="0.25" strokeWidth="0.8" strokeDasharray="1 4" />
          <ellipse cx="100" cy="100" rx="96" ry="34" strokeOpacity="0.3" strokeWidth="0.8" transform="rotate(-30 100 100)" />
        </g>
        <g className="slow-spin" style={{ animationDuration: "60s" }}>
          <circle cx="196" cy="100" r="3" fill={stroke} />
        </g>
      </svg>
      <div className="relative">{children}</div>
    </div>
  );
}
