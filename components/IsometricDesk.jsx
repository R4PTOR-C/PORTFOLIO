'use client';

// side="front" → design/UI workspace (neon green)
// side="back"  → server/terminal workspace (blue)
export default function IsometricDesk({ side = 'front' }) {
  const isFront = side === 'front';
  const accent  = isFront ? 'rgba(0,229,160,0.9)'  : 'rgba(59,130,246,0.9)';
  const accentG = isFront ? 'rgba(0,229,160,0.15)' : 'rgba(59,130,246,0.15)';
  const accentF = isFront ? 'rgba(0,229,160,0.05)' : 'rgba(59,130,246,0.05)';

  return (
    <svg viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">

      {/* Ambient glow */}
      <ellipse cx="160" cy="234" rx="100" ry="8" fill={accentG} />
      <ellipse cx="160" cy="135" rx="115" ry="82" fill={accentF} />

      {isFront ? (
        <>
          {/* ══ FRONT-END SCENE ══ */}

          {/* Floating tags */}
          <text x="8"   y="16" fontFamily="monospace" fontSize="12" fontWeight="800" fill="rgba(0,229,160,0.22)">&lt;/&gt;</text>
          <text x="278" y="16" fontFamily="monospace" fontSize="12" fontWeight="800" fill="rgba(0,229,160,0.14)">&#123; &#125;</text>

          {/* Browser window — top left */}
          <rect x="4" y="20" width="90" height="62" rx="5" fill="#0c1a2e" stroke="rgba(0,229,160,0.28)" strokeWidth="0.8" />
          <rect x="4" y="20" width="90" height="13" rx="5" fill="#081422" />
          <circle cx="13" cy="26.5" r="2.5" fill="#ff5f57" opacity="0.85" />
          <circle cx="20" cy="26.5" r="2.5" fill="#febc2e" opacity="0.85" />
          <circle cx="27" cy="26.5" r="2.5" fill="#28c840" opacity="0.85" />
          <rect x="33" y="22.5" width="40" height="7" rx="3" fill="#0d1e30" />
          <text x="36" y="28" fontFamily="monospace" fontSize="4.5" fill="rgba(0,229,160,0.65)">localhost:3000</text>
          <rect x="9"  y="37" width="78" height="6"  rx="2" fill="rgba(0,229,160,0.45)" />
          <rect x="9"  y="46" width="50" height="5"  rx="2" fill="#3b82f6" fillOpacity="0.4" />
          <rect x="9"  y="54" width="66" height="4"  rx="2" fill="#a78bfa" fillOpacity="0.35" />
          <rect x="9"  y="61" width="38" height="4"  rx="2" fill="rgba(0,229,160,0.3)" />
          <circle cx="79" cy="47" r="5.5" fill="rgba(0,229,160,0.7)" />
          <circle cx="79" cy="59" r="5.5" fill="rgba(167,139,250,0.7)" />

          {/* Component panel — top right */}
          <rect x="226" y="12" width="88" height="64" rx="5" fill="#0c1a2e" stroke="rgba(0,229,160,0.22)" strokeWidth="0.8" />
          <text x="232" y="24" fontFamily="monospace" fontSize="5" fill="rgba(0,229,160,0.5)">Components</text>
          <rect x="232" y="28" width="36" height="11" rx="4" fill="rgba(0,229,160,0.55)" />
          <text x="237" y="36" fontFamily="monospace" fontSize="5.5" fill="#050b14" fontWeight="bold">Button</text>
          <rect x="272" y="28" width="36" height="11" rx="2.5" fill="#081422" stroke="rgba(0,229,160,0.3)" strokeWidth="0.7" />
          <text x="275" y="36" fontFamily="monospace" fontSize="4.5" fill="rgba(0,229,160,0.4)">input...</text>
          <rect x="232" y="43" width="36" height="25" rx="3" fill="#081422" stroke="rgba(0,229,160,0.2)" strokeWidth="0.6" />
          <rect x="234" y="45" width="32" height="8"  rx="1.5" fill="rgba(0,229,160,0.3)" />
          <rect x="234" y="55" width="22" height="3"  rx="1" fill="#94a3b8" fillOpacity="0.35" />
          <rect x="234" y="60" width="28" height="3"  rx="1" fill="#94a3b8" fillOpacity="0.25" />
          <rect x="272" y="43" width="36" height="12" rx="6" fill="rgba(0,229,160,0.12)" stroke="rgba(0,229,160,0.35)" strokeWidth="0.7" />
          <text x="278" y="51.5" fontFamily="monospace" fontSize="5" fill="rgba(0,229,160,0.75)">badge</text>
          <text x="274" y="66" fontFamily="monospace" fontSize="7" fill="rgba(0,229,160,0.5)" fontWeight="bold">Aa</text>
          <text x="284" y="66" fontFamily="monospace" fontSize="5.5" fill="rgba(0,229,160,0.35)">Bb Cc</text>

          {/* CSS snippet — bottom left */}
          <rect x="4" y="174" width="82" height="54" rx="4" fill="#0a1828" stroke="rgba(0,229,160,0.18)" strokeWidth="0.7" />
          <text x="9"  y="186" fontFamily="monospace" fontSize="5" fill="rgba(0,229,160,0.75)">.card &#123;</text>
          <text x="13" y="195" fontFamily="monospace" fontSize="5" fill="#a78bfa" opacity="0.7">  display: flex;</text>
          <text x="13" y="204" fontFamily="monospace" fontSize="5" fill="#60a5fa" opacity="0.7">  gap: 1.5rem;</text>
          <text x="13" y="213" fontFamily="monospace" fontSize="5" fill="rgba(0,229,160,0.6)">  color: #00e5a0;</text>
          <text x="9"  y="222" fontFamily="monospace" fontSize="5" fill="rgba(0,229,160,0.75)">&#125;</text>

          {/* Color palette — bottom right */}
          <rect x="234" y="182" width="80" height="40" rx="4" fill="#0a1828" stroke="rgba(0,229,160,0.18)" strokeWidth="0.7" />
          <text x="239" y="194" fontFamily="monospace" fontSize="4.5" fill="rgba(0,229,160,0.5)">Palette</text>
          {['rgba(0,229,160,0.85)','rgba(59,130,246,0.85)','rgba(167,139,250,0.85)','rgba(249,115,22,0.8)','rgba(236,72,153,0.8)'].map((c, i) => (
            <rect key={i} x={239 + i * 13} y="199" width="11" height="11" rx="3" fill={c} />
          ))}
          <text x="239" y="215" fontFamily="monospace" fontSize="3.8" fill="rgba(0,229,160,0.3)">#00e5a0  #3b82f6  #a78bfa</text>

          {/* ── DESK ── */}
          <polygon points="160,180 252,138 252,160 160,202" fill="#0a1828" />
          <polygon points="68,138 160,180 160,202 68,160"   fill="#081422" />
          <polygon points="68,138 160,96 252,138 160,180"   fill="#0d1e30" />
          <polyline points="68,138 160,96 252,138" stroke={accent} strokeWidth="0.7" strokeOpacity="0.2" />
          <line x1="68"  y1="138" x2="160" y2="180" stroke={accent} strokeWidth="0.5" strokeOpacity="0.12" />
          <line x1="160" y1="180" x2="252" y2="138" stroke={accent} strokeWidth="0.5" strokeOpacity="0.12" />

          {/* Plant — left of desk */}
          <polygon points="100,158 112,164 112,175 100,169" fill="#081422" />
          <polygon points="88,152 100,158 100,169 88,163"   fill="#0a1828" />
          <polygon points="88,152 100,158 112,152 100,146"  fill="#0d1e30" />
          <ellipse cx="100" cy="148" rx="10" ry="4.5" fill="#060e18" />
          <line x1="100" y1="148" x2="98" y2="120" stroke="#1a3a22" strokeWidth="1.8" strokeLinecap="round" />
          <ellipse cx="90"  cy="132" rx="10" ry="4.5" fill="rgba(0,210,80,0.65)" transform="rotate(-35 90 132)" />
          <ellipse cx="108" cy="126" rx="10" ry="4.5" fill="rgba(0,190,60,0.55)" transform="rotate(35 108 126)" />
          <ellipse cx="92"  cy="121" rx="9"  ry="4"   fill="rgba(0,220,90,0.6)"  transform="rotate(-15 92 121)" />
          <ellipse cx="104" cy="116" rx="9"  ry="4"   fill="rgba(0,200,70,0.55)" transform="rotate(20 104 116)" />

          {/* Monitor */}
          <polygon points="148,126 168,134 168,146 148,138" fill="#081422" />
          <polygon points="148,126 168,134 170,130 150,122" fill="#0d1e30" />
          <polygon points="138,140 172,154 176,151 142,137" fill="#0d1e30" />
          <polygon points="138,140 172,154 172,157 138,143" fill="#0a1828" />
          <polygon points="198,68 201,63 201,118 198,123"   fill="#060e18" />
          <polygon points="108,44 198,68 201,63 111,39"     fill="#081420" />
          <polygon points="108,44 198,68 198,123 108,99"    fill="#040c16" />
          <polygon points="112,49 194,71 194,118 112,96"    fill="#030910" />
          {/* Screen — colorful UI */}
          <rect x="114" y="52" width="78" height="6" rx="1.5" fill="#0d1e30" />
          <circle cx="119" cy="55" r="2" fill="#ff5f57" opacity="0.8" />
          <circle cx="126" cy="55" r="2" fill="#febc2e" opacity="0.8" />
          <circle cx="133" cy="55" r="2" fill="#28c840" opacity="0.8" />
          <rect x="114" y="63" width="46" height="5"   rx="1.5" fill="rgba(0,229,160,0.5)" />
          <rect x="114" y="72" width="30" height="4.5" rx="1.5" fill="#a78bfa" fillOpacity="0.45" />
          <rect x="114" y="80" width="55" height="4.5" rx="1.5" fill="#3b82f6" fillOpacity="0.45" />
          <rect x="114" y="88" width="36" height="4.5" rx="1.5" fill="rgba(0,229,160,0.35)" />
          <rect x="114" y="96" width="50" height="4.5" rx="1.5" fill="#60a5fa" fillOpacity="0.35" />
          <rect x="164" y="71" width="24" height="24" rx="3" fill="rgba(0,229,160,0.06)" stroke="rgba(0,229,160,0.4)" strokeWidth="0.7" />
          <circle cx="176" cy="83" r="7" fill="rgba(0,229,160,0.55)" />
          <circle cx="169" cy="99" r="5" fill="#a78bfa" fillOpacity="0.5" />
          <circle cx="181" cy="99" r="5" fill="#3b82f6"  fillOpacity="0.5" />

          {/* Keyboard */}
          <polygon points="121,163 180,136 204,148 145,175" fill="#0a1828" />
          <polygon points="121,163 180,136 182,133 123,160" fill="#0d1e30" />
          <polygon points="124,162 180,138 200,148 144,172" fill="#0c1c2c" stroke={accent} strokeWidth="0.4" strokeOpacity="0.12" />
          {[0,1,2,3].map(i => (
            <line key={i} x1={128+i*6} y1={160-i*3} x2={198+i*2} y2={141+i*3} stroke={accent} strokeWidth="0.35" strokeOpacity="0.12" />
          ))}
          <polygon points="145,168 168,157 175,161 152,172" fill="#0c1c2c" />

          {/* Drawing tablet — right of desk */}
          <polygon points="210,150 245,133 252,137 217,154" fill="#0c1c2c" stroke="rgba(0,229,160,0.2)" strokeWidth="0.6" />
          <polygon points="210,150 245,133 245,137 210,154" fill="#0a1828" />
          <ellipse cx="218" cy="150" rx="4" ry="2" fill="rgba(0,229,160,0.4)" />
        </>
      ) : (
        <>
          {/* ══ BACK-END SCENE ══ */}

          {/* Floating tags */}
          <text x="8"   y="16" fontFamily="monospace" fontSize="12" fontWeight="800" fill="rgba(59,130,246,0.2)">&#123; &#125;</text>
          <text x="278" y="16" fontFamily="monospace" fontSize="12" fontWeight="800" fill="rgba(59,130,246,0.14)">&lt;/&gt;</text>

          {/* Terminal window — top left */}
          <rect x="4" y="12" width="94" height="72" rx="5" fill="#040c16" stroke="rgba(59,130,246,0.28)" strokeWidth="0.8" />
          <rect x="4" y="12" width="94" height="14" rx="5" fill="#060e18" />
          <circle cx="13" cy="19" r="2.5" fill="#ff5f5780" />
          <circle cx="20" cy="19" r="2.5" fill="#febc2e80" />
          <circle cx="27" cy="19" r="2.5" fill="#28c84080" />
          <text x="33" y="22.5" fontFamily="monospace" fontSize="4.5" fill="#475569">~/rafael/api</text>
          <text x="9"  y="35" fontFamily="monospace" fontSize="5.2" fill="rgba(59,130,246,0.9)">$ rails server</text>
          <text x="9"  y="44" fontFamily="monospace" fontSize="5.2" fill="#475569" opacity="0.8">→ Puma listening :3000</text>
          <text x="9"  y="53" fontFamily="monospace" fontSize="5.2" fill="#94a3b8" opacity="0.55">GET /api/users 200 8ms</text>
          <text x="9"  y="62" fontFamily="monospace" fontSize="5.2" fill="rgba(59,130,246,0.85)">$ rails db:migrate</text>
          <text x="9"  y="71" fontFamily="monospace" fontSize="5.2" fill="#475569" opacity="0.7">== 3 migrations done</text>
          <rect x="9" y="75" width="5" height="7" rx="1" fill="rgba(59,130,246,0.8)" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0;0.8" dur="1.1s" repeatCount="indefinite" />
          </rect>

          {/* Database cylinders — top right */}
          {[0,1,2].map(i => (
            <g key={i} transform={`translate(222, ${10 + i * 19})`}>
              <ellipse cx="40" cy="7"  rx="34" ry="8"  fill="#060e18" stroke="rgba(59,130,246,0.28)" strokeWidth="0.8" />
              <rect x="6" y="7" width="68" height="12" fill="#060e18" />
              <line x1="6"  y1="7"  x2="6"  y2="19" stroke="rgba(59,130,246,0.18)" strokeWidth="0.8" />
              <line x1="74" y1="7"  x2="74" y2="19" stroke="rgba(59,130,246,0.18)" strokeWidth="0.8" />
              <ellipse cx="40" cy="19" rx="34" ry="8"  fill="#081422" stroke="rgba(59,130,246,0.22)" strokeWidth="0.7" />
              <text x="18" y="15" fontFamily="monospace" fontSize="5.5" fill="rgba(59,130,246,0.6)">{['users','sessions','posts'][i]}</text>
            </g>
          ))}
          <text x="240" y="77" fontFamily="monospace" fontSize="5" fill="rgba(59,130,246,0.35)">PostgreSQL 16</text>

          {/* API routes — bottom left */}
          <rect x="4" y="170" width="90" height="60" rx="4" fill="#040c16" stroke="rgba(59,130,246,0.22)" strokeWidth="0.7" />
          <text x="9" y="182" fontFamily="monospace" fontSize="4.5" fill="rgba(59,130,246,0.5)">routes.rb</text>
          {[
            { m: 'GET',    r: '/api/users',     c: '#28c84080' },
            { m: 'POST',   r: '/api/users',     c: '#3b82f680' },
            { m: 'PUT',    r: '/api/users/:id', c: '#febc2e80' },
            { m: 'DELETE', r: '/api/users/:id', c: '#ff5f5780' },
          ].map((row, i) => (
            <g key={i}>
              <rect x="9" y={187 + i * 10} width="18" height="7" rx="1.5" fill={row.c} />
              <text x="10" y={193.5 + i * 10} fontFamily="monospace" fontSize="4" fill="#050b14" fontWeight="bold">{row.m}</text>
              <text x="29" y={193.5 + i * 10} fontFamily="monospace" fontSize="4.5" fill="#60a5fa" opacity="0.6">{row.r}</text>
            </g>
          ))}

          {/* Server metrics — bottom right */}
          <rect x="228" y="178" width="86" height="50" rx="4" fill="#040c16" stroke="rgba(59,130,246,0.22)" strokeWidth="0.7" />
          <text x="233" y="190" fontFamily="monospace" fontSize="4.5" fill="rgba(59,130,246,0.5)">server metrics</text>
          {[
            { label: 'CPU',    pct: 0.38, color: '#3b82f6' },
            { label: 'MEM',    pct: 0.61, color: '#a78bfa' },
            { label: 'REQ/s',  pct: 0.72, color: '#00e5a0' },
            { label: 'UPTIME', pct: 0.99, color: '#28c840' },
          ].map((m, i) => (
            <g key={i}>
              <text x="233" y={200 + i * 9} fontFamily="monospace" fontSize="4" fill="#475569">{m.label}</text>
              <rect x="255" y={194 + i * 9} width="52" height="5" rx="2" fill="#0c1a2e" />
              <rect x="255" y={194 + i * 9} width={52 * m.pct} height="5" rx="2" fill={m.color} fillOpacity="0.7" />
            </g>
          ))}

          {/* ── DESK ── */}
          <polygon points="160,180 252,138 252,160 160,202" fill="#0a1828" />
          <polygon points="68,138 160,180 160,202 68,160"   fill="#081422" />
          <polygon points="68,138 160,96 252,138 160,180"   fill="#0d1e30" />
          <polyline points="68,138 160,96 252,138" stroke={accent} strokeWidth="0.7" strokeOpacity="0.2" />
          <line x1="68"  y1="138" x2="160" y2="180" stroke={accent} strokeWidth="0.5" strokeOpacity="0.12" />
          <line x1="160" y1="180" x2="252" y2="138" stroke={accent} strokeWidth="0.5" strokeOpacity="0.12" />

          {/* Coffee mug — right of desk */}
          <polygon points="218,142 230,136 230,152 218,158" fill="#081422" />
          <polygon points="206,136 218,142 218,158 206,152" fill="#0a1828" />
          <polygon points="206,136 218,142 230,136 218,130" fill="#0d1e30" />
          <ellipse cx="218" cy="131" rx="10" ry="4.5" fill="#060e18" />
          <ellipse cx="218" cy="131" rx="7"  ry="3"   fill="#04090f" />
          <path d="M 230 142 C 240 142 240 156 230 156" stroke="#0d1e30" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M 230 142 C 236 142 236 156 230 156" stroke="#142238" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 214 124 C 213 119 215 115 214 111" stroke={accent} strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.35">
            <animate attributeName="opacity" values="0.35;0.08;0.35" dur="2.2s" repeatCount="indefinite" />
          </path>
          <path d="M 219 122 C 218 117 220 113 219 109" stroke={accent} strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.25">
            <animate attributeName="opacity" values="0.25;0.05;0.25" dur="1.8s" repeatCount="indefinite" />
          </path>

          {/* Monitor */}
          <polygon points="148,126 168,134 168,146 148,138" fill="#081422" />
          <polygon points="148,126 168,134 170,130 150,122" fill="#0d1e30" />
          <polygon points="138,140 172,154 176,151 142,137" fill="#0d1e30" />
          <polygon points="138,140 172,154 172,157 138,143" fill="#0a1828" />
          <polygon points="198,68 201,63 201,118 198,123"   fill="#060e18" />
          <polygon points="108,44 198,68 201,63 111,39"     fill="#081420" />
          <polygon points="108,44 198,68 198,123 108,99"    fill="#040c16" />
          <polygon points="112,49 194,71 194,118 112,96"    fill="#030910" />
          {/* Screen — terminal */}
          <rect x="114" y="52" width="78" height="6" rx="1.5" fill="#0c1a2e" />
          <circle cx="119" cy="55" r="2" fill="#ff5f5780" />
          <circle cx="126" cy="55" r="2" fill="#febc2e80" />
          <circle cx="133" cy="55" r="2" fill="#28c84080" />
          <text x="115" y="68"  fontFamily="monospace" fontSize="5.5" fill="rgba(59,130,246,0.9)">$ rails s -p 3000</text>
          <text x="115" y="77"  fontFamily="monospace" fontSize="5.5" fill="#60a5fa"            opacity="0.65">→ Listening :3000</text>
          <text x="115" y="86"  fontFamily="monospace" fontSize="5.5" fill="#94a3b8"            opacity="0.5">GET /api/users 200</text>
          <text x="115" y="95"  fontFamily="monospace" fontSize="5.5" fill="rgba(59,130,246,0.9)">$ git push origin main</text>
          <text x="115" y="104" fontFamily="monospace" fontSize="5.5" fill="#3b82f6"            opacity="0.65">✓ Deployed</text>
          <rect x="115" y="108" width="5" height="7" rx="1" fill="rgba(59,130,246,0.8)" opacity="0.75">
            <animate attributeName="opacity" values="0.75;0;0.75" dur="1.1s" repeatCount="indefinite" />
          </rect>

          {/* Keyboard */}
          <polygon points="121,163 180,136 204,148 145,175" fill="#0a1828" />
          <polygon points="121,163 180,136 182,133 123,160" fill="#0d1e30" />
          <polygon points="124,162 180,138 200,148 144,172" fill="#0c1c2c" stroke={accent} strokeWidth="0.4" strokeOpacity="0.12" />
          {[0,1,2,3].map(i => (
            <line key={i} x1={128+i*6} y1={160-i*3} x2={198+i*2} y2={141+i*3} stroke={accent} strokeWidth="0.35" strokeOpacity="0.12" />
          ))}
          <polygon points="145,168 168,157 175,161 152,172" fill="#0c1c2c" />

          {/* External HD — left of desk */}
          <polygon points="96,150 128,134 136,139 104,155"  fill="#081422" />
          <polygon points="96,150 128,134 128,142 96,158"   fill="#0a1828" />
          <polygon points="96,150 104,155 104,158 96,153"   fill="#060e18" />
          <rect x="99" y="140" width="6" height="4" rx="1" fill="rgba(59,130,246,0.6)" />
          <rect x="99" y="146" width="4" height="2" rx="0.5" fill="rgba(59,130,246,0.3)" />
        </>
      )}
    </svg>
  );
}
