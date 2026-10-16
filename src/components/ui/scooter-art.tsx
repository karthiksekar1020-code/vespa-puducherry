/**
 * Original, hand-drawn SVG scooter illustration (not a photograph, not a 3D model and not an official Vespa asset).
 * Used as the hero visual and as the fallback whenever WebGL is unavailable.
 */
export function ScooterArt({ body = "#17684f", className = "" }: { body?: string; className?: string }) {
  return (
    <svg viewBox="0 0 800 450" role="img" aria-label="Illustration of a classic scooter in profile" className={className}>
      <defs>
        <linearGradient id="sa-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={body} />
          <stop offset="1" stopColor="#05241c" />
        </linearGradient>
        <linearGradient id="sa-chrome" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7f2e8" />
          <stop offset="1" stopColor="#8d9290" />
        </linearGradient>
        <radialGradient id="sa-shadow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000" stopOpacity="0.45" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="410" cy="398" rx="330" ry="22" fill="url(#sa-shadow)" />
      {/* wheels */}
      <g>
        <circle cx="205" cy="335" r="62" fill="#111" />
        <circle cx="205" cy="335" r="36" fill="url(#sa-chrome)" />
        <circle cx="205" cy="335" r="10" fill="#1c1d1c" />
        <circle cx="620" cy="335" r="55" fill="#111" />
        <circle cx="620" cy="335" r="32" fill="url(#sa-chrome)" />
        <circle cx="620" cy="335" r="9" fill="#1c1d1c" />
      </g>
      {/* floorboard + underbody */}
      <path d="M360 300 L525 300 C540 300 548 312 540 324 L370 332 Z" fill="#0a3a2c" />
      <rect x="372" y="296" width="150" height="8" rx="4" fill="#b8924a" opacity="0.9" />
      {/* rear cowl */}
      <path d="M140 335 C108 272 118 192 200 166 C262 148 332 150 372 172 L384 252 L362 332 Z" fill="url(#sa-body)" />
      <path d="M150 300 C140 250 160 205 215 190" stroke="#d4b36e" strokeOpacity="0.55" strokeWidth="2" fill="none" />
      {/* seat */}
      <path d="M198 163 C238 134 330 134 378 156 L372 174 C322 162 250 162 204 178 Z" fill="#1c1d1c" />
      {/* leg shield + steering column */}
      <path d="M498 322 C504 252 520 190 548 138 L582 138 C570 200 566 262 582 322 Z" fill="url(#sa-body)" />
      <path d="M552 138 L546 92" stroke="url(#sa-chrome)" strokeWidth="9" strokeLinecap="round" />
      <path d="M520 86 C540 80 575 80 600 92" stroke="url(#sa-chrome)" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M545 100 C548 96 570 96 575 100 L572 118 C562 122 552 122 545 118 Z" fill="#0a3a2c" />
      <circle cx="588" cy="112" r="18" fill="url(#sa-chrome)" />
      <circle cx="588" cy="112" r="10" fill="#f7f2e8" />
      {/* fork + fender */}
      <path d="M570 140 L618 330" stroke="url(#sa-chrome)" strokeWidth="9" strokeLinecap="round" />
      <path d="M560 300 C575 270 650 262 680 300 L670 306 C640 284 590 290 568 310 Z" fill="url(#sa-body)" />
      {/* engine cover + exhaust */}
      <rect x="150" y="300" width="110" height="34" rx="14" fill="#0a3a2c" />
      <path d="M135 335 L260 345" stroke="#b8924a" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}
