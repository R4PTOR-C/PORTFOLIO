'use client';

export default function DevIllustration({ frontness = 0.5 }) {
  const f = frontness;

  // Accent color interpolation (blue → neon green)
  const lerp = (a, b, t) => Math.round(a + (b - a) * t);
  const neon  = [0, 229, 160];
  const blue  = [59, 130, 246];
  const acc   = neon.map((n, i) => lerp(blue[i], n, f));
  const accent      = `rgb(${acc.join(',')})`;
  const accentFade  = `rgba(${acc.join(',')},0.25)`;
  const accentDim   = `rgba(${acc.join(',')},0.12)`;

  // Hoodie colors shift per side
  const hoodieBase   = f > 0.5 ? '#071c12' : '#07111e';
  const hoodieStripe = f > 0.5 ? '#0d2d1c' : '#0d1e30';
  const hoodieRim    = f > 0.5 ? '#0f3522' : '#0f2640';
  const screenBg     = f > 0.5 ? '#040f09' : '#040910';

  return (
    <svg
      viewBox="0 0 200 275"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full drop-shadow-xl"
    >
      {/* ── AMBIENT GLOW ── */}
      <ellipse cx="100" cy="270" rx="60" ry="7" fill={accentFade} />

      {/* ── FLOATING CODE ELEMENTS ── */}
      <text x="4"   y="90"  fontFamily="monospace" fontSize="13" fontWeight="700" fill={accent} opacity="0.35">&lt;/&gt;</text>
      <text x="168" y="85"  fontFamily="monospace" fontSize="13" fontWeight="700" fill={accent} opacity="0.35">&#123; &#125;</text>
      <text x="6"   y="140" fontFamily="monospace" fontSize="9"  fill={accent} opacity="0.2">#</text>
      <text x="181" y="135" fontFamily="monospace" fontSize="9"  fill={accent} opacity="0.2">( )</text>

      {/* Floating dots */}
      <circle cx="18"  cy="55"  r="3"   fill={accent} opacity="0.2" />
      <circle cx="182" cy="50"  r="2.5" fill={accent} opacity="0.2" />
      <circle cx="14"  cy="170" r="2"   fill={accent} opacity="0.15" />
      <circle cx="186" cy="165" r="2"   fill={accent} opacity="0.15" />
      <circle cx="32"  cy="30"  r="1.5" fill={accent} opacity="0.2" />
      <circle cx="170" cy="28"  r="1.5" fill={accent} opacity="0.2" />

      {/* ── HAIR ── */}
      <path
        d="M 74 67
           C 72 38 78 18 100 15
           C 122 18 128 38 126 67
           C 119 54 112 49 100 49
           C 88 49 81 54 74 67 Z"
        fill="#2a1200"
      />
      {/* Hair side wisps */}
      <path d="M 74 67 C 70 60 68 52 70 44 C 72 50 73 58 74 67 Z" fill="#1e0d00" />
      <path d="M 126 67 C 130 60 132 52 130 44 C 128 50 127 58 126 67 Z" fill="#1e0d00" />

      {/* ── HEAD ── */}
      <circle cx="100" cy="68" r="28" fill="#FDBCB4" />

      {/* Ears */}
      <ellipse cx="72"  cy="70" rx="5.5" ry="7" fill="#F2A898" />
      <ellipse cx="128" cy="70" rx="5.5" ry="7" fill="#F2A898" />
      <ellipse cx="72"  cy="70" rx="3"   ry="4.5" fill="#FDBCB4" />
      <ellipse cx="128" cy="70" rx="3"   ry="4.5" fill="#FDBCB4" />

      {/* ── FACE ── */}
      {/* Eyebrows */}
      <path d="M 83 55 Q 89 52 95 55" stroke="#3d1a00" strokeWidth="2"   strokeLinecap="round" />
      <path d="M 105 55 Q 111 52 117 55" stroke="#3d1a00" strokeWidth="2" strokeLinecap="round" />

      {/* Eyes */}
      <ellipse cx="89"  cy="63" rx="5"   ry="5.5" fill="#1a1a2e" />
      <ellipse cx="111" cy="63" rx="5"   ry="5.5" fill="#1a1a2e" />
      {/* Iris */}
      <ellipse cx="89"  cy="64" rx="3"   ry="3.5" fill="#2c3e8c" />
      <ellipse cx="111" cy="64" rx="3"   ry="3.5" fill="#2c3e8c" />
      {/* Shine */}
      <circle cx="91"  cy="61" r="1.8" fill="white" />
      <circle cx="113" cy="61" r="1.8" fill="white" />

      {/* Nose */}
      <path d="M 100 68 C 97 72 95 74 97 75 C 99 76 101 76 103 75 C 105 74 103 72 100 68 Z"
        fill="#F0A090" opacity="0.6" />

      {/* Smile */}
      <path d="M 89 75 Q 100 84 111 75"
        stroke="#d4876a" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Cheek blush */}
      <ellipse cx="80"  cy="73" rx="7" ry="4.5" fill="rgba(230,100,100,0.13)" />
      <ellipse cx="120" cy="73" rx="7" ry="4.5" fill="rgba(230,100,100,0.13)" />

      {/* ── NECK ── */}
      <rect x="94" y="93" width="12" height="11" rx="2" fill="#FDBCB4" />

      {/* ── HOODIE ── */}
      {/* Main body shape */}
      <path
        d="M 60 103
           C 46 104 34 118 34 136
           L 34 178
           L 166 178
           L 166 136
           C 166 118 154 104 140 103
           L 128 94
           C 118 88 82 88 72 94
           Z"
        fill={hoodieBase}
      />
      {/* Center stripe (zipper area) */}
      <path
        d="M 94 95 L 92 178 L 108 178 L 106 95
           C 104 92 96 92 94 95 Z"
        fill={hoodieStripe}
      />
      {/* Shoulder seams */}
      <path d="M 72 94 C 78 98 88 100 100 100 C 112 100 122 98 128 94"
        stroke={hoodieRim} strokeWidth="2" fill="none" />
      {/* Kangaroo pocket */}
      <rect x="78" y="138" width="44" height="30" rx="6" fill={hoodieStripe} />
      <rect x="80" y="140" width="40" height="26" rx="5" fill={hoodieBase} />
      {/* Pocket stitch line */}
      <path d="M 100 140 L 100 166" stroke={hoodieStripe} strokeWidth="1" strokeDasharray="3 2" />
      {/* Ribbed cuffs at wrists */}
      <rect x="26" y="172" width="16" height="8" rx="3" fill={hoodieRim} />
      <rect x="158" y="172" width="16" height="8" rx="3" fill={hoodieRim} />

      {/* ── ARMS ── */}
      {/* Left arm */}
      <path
        d="M 34 136 C 30 152 26 165 28 178
           L 44 178 C 46 166 50 153 60 138 Z"
        fill={hoodieBase}
      />
      {/* Right arm */}
      <path
        d="M 166 136 C 170 152 174 165 172 178
           L 156 178 C 154 166 150 153 140 138 Z"
        fill={hoodieBase}
      />

      {/* ── HANDS ── */}
      <ellipse cx="36"  cy="181" rx="12" ry="7" fill="#FDBCB4" />
      <ellipse cx="164" cy="181" rx="12" ry="7" fill="#FDBCB4" />
      {/* Fingers hint */}
      <path d="M 26 180 Q 29 176 33 178" stroke="#F2A898" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M 174 180 Q 171 176 167 178" stroke="#F2A898" strokeWidth="1.2" strokeLinecap="round" />

      {/* ── LAPTOP ── */}
      {/* Screen outer frame */}
      <rect x="24" y="184" width="152" height="72" rx="7" fill="#0c1a2e" />
      {/* Screen bg */}
      <rect x="27" y="187" width="146" height="66" rx="5" fill={screenBg} />
      {/* Screen border glow */}
      <rect x="24" y="184" width="152" height="72" rx="7"
        stroke={accent} strokeWidth="1" strokeOpacity="0.3" fill="none" />

      {/* ─ Screen content (FRONT — colorful UI/CSS) ─ */}
      <g opacity={f} style={{ transition: 'opacity 0.5s ease' }}>
        {/* Window chrome dots */}
        <circle cx="36" cy="195" r="3" fill="#ff5f57" />
        <circle cx="46" cy="195" r="3" fill="#febc2e" />
        <circle cx="56" cy="195" r="3" fill="#28c840" />
        <rect x="64" y="193" width="70" height="4" rx="2" fill="#142238" />
        {/* Code lines */}
        <rect x="32" y="204" width="55" height="4" rx="1.5" fill={accent}      fillOpacity="0.6" />
        <rect x="32" y="212" width="35" height="4" rx="1.5" fill="#a78bfa"     fillOpacity="0.5" />
        <rect x="40" y="220" width="75" height="4" rx="1.5" fill="#3b82f6"     fillOpacity="0.5" />
        <rect x="40" y="228" width="50" height="4" rx="1.5" fill={accent}      fillOpacity="0.35" />
        <rect x="32" y="236" width="90" height="4" rx="1.5" fill="#60a5fa"     fillOpacity="0.4" />
        <rect x="32" y="244" width="40" height="4" rx="1.5" fill="#a78bfa"     fillOpacity="0.3" />
        {/* Color swatches */}
        <circle cx="148" cy="208" r="7"   fill="#00e5a0" fillOpacity="0.75" />
        <circle cx="160" cy="208" r="7"   fill="#3b82f6" fillOpacity="0.75" />
        <circle cx="154" cy="220" r="7"   fill="#a78bfa" fillOpacity="0.75" />
        <circle cx="148" cy="232" r="5"   fill="#f97316" fillOpacity="0.6"  />
        <circle cx="160" cy="232" r="5"   fill="#ec4899" fillOpacity="0.6"  />
      </g>

      {/* ─ Screen content (BACK — terminal) ─ */}
      <g opacity={1 - f} style={{ transition: 'opacity 0.5s ease' }}>
        {/* Terminal header */}
        <rect x="27" y="187" width="146" height="14" rx="5 5 0 0" fill="#0c1a2e" />
        <circle cx="36" cy="194" r="3" fill="#ff5f5780" />
        <circle cx="46" cy="194" r="3" fill="#febc2e80" />
        <circle cx="56" cy="194" r="3" fill="#28c84080" />
        <text x="65" y="197" fontFamily="monospace" fontSize="6" fill="#475569">~/rafael/portfolio</text>
        {/* Terminal lines */}
        <text x="31" y="210" fontFamily="monospace" fontSize="6.5" fill="#00e5a0" opacity="0.85">$ rails server -p 3000</text>
        <text x="31" y="220" fontFamily="monospace" fontSize="6.5" fill="#60a5fa" opacity="0.65">→ Listening on localhost:3000</text>
        <text x="31" y="230" fontFamily="monospace" fontSize="6.5" fill="#94a3b8" opacity="0.55">GET  /api/users  200  12ms</text>
        <text x="31" y="240" fontFamily="monospace" fontSize="6.5" fill="#00e5a0" opacity="0.85">$ git commit -m "feat: ✨"</text>
        <text x="31" y="250" fontFamily="monospace" fontSize="6.5" fill="#3b82f6" opacity="0.65">[main 3f8a2d1] feat: ✨</text>
        {/* Blinking cursor */}
        <rect x="31" y="254" width="6" height="8" rx="1" fill="#00e5a0" opacity="0.7">
          <animate attributeName="opacity" values="0.7;0;0.7" dur="1.2s" repeatCount="indefinite" />
        </rect>
      </g>

      {/* ── KEYBOARD ── */}
      <rect x="18"  y="254" width="164" height="14" rx="5" fill="#0a1628" />
      <rect x="18"  y="254" width="164" height="14" rx="5"
        stroke={accent} strokeWidth="0.8" strokeOpacity="0.15" fill="none" />
      {/* Key rows hints */}
      {[30,48,66,84,102,120,138,156].map((x) => (
        <rect key={x} x={x} y="258" width="10" height="5" rx="1.5" fill="#142238" key={x} />
      ))}
      {/* Trackpad */}
      <rect x="76" y="258" width="48" height="7" rx="3" fill="#0d1f38" />
    </svg>
  );
}
