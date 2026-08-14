DIAGRAMS['demo-kreislauf'] = function () {
  return `<svg viewBox="0 0 320 200" role="img" aria-label="Kreislauf Strategie, Struktur, Prozesse">
    <circle cx="80" cy="100" r="46" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="80" y="104" text-anchor="middle" fill="var(--text)" font-size="13">Strategie</text>
    <circle cx="240" cy="100" r="46" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="240" y="104" text-anchor="middle" fill="var(--text)" font-size="13">Struktur</text>
    <line x1="126" y1="100" x2="194" y2="100" stroke="var(--icon)" stroke-width="1.5" marker-end="url(#arrow)"/>
    <defs>
      <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 z" fill="var(--icon)"/>
      </marker>
    </defs>
  </svg>`;
};
