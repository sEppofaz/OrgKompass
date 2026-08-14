DIAGRAMS['einlinien-mehrlinien'] = function () {
  return `<svg viewBox="0 0 320 210" role="img" aria-label="Einliniensystem vs. Mehrliniensystem">
    <text x="80" y="16" text-anchor="middle" fill="var(--muted)" font-size="12" font-weight="600">Einliniensystem</text>
    <rect x="45" y="26" width="70" height="30" rx="6" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="80" y="45" text-anchor="middle" fill="var(--text)" font-size="11">Leitung</text>
    <rect x="20" y="120" width="55" height="28" rx="6" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="47" y="138" text-anchor="middle" fill="var(--text)" font-size="10">Stelle A</text>
    <rect x="85" y="120" width="55" height="28" rx="6" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="112" y="138" text-anchor="middle" fill="var(--text)" font-size="10">Stelle B</text>
    <line x1="80" y1="56" x2="47" y2="120" stroke="var(--icon)" stroke-width="1.5"/>
    <line x1="80" y1="56" x2="112" y2="120" stroke="var(--icon)" stroke-width="1.5"/>

    <line x1="160" y1="10" x2="160" y2="200" stroke="var(--border)" stroke-width="1"/>

    <text x="240" y="16" text-anchor="middle" fill="var(--muted)" font-size="12" font-weight="600">Mehrliniensystem</text>
    <rect x="180" y="26" width="55" height="28" rx="6" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="207" y="44" text-anchor="middle" fill="var(--text)" font-size="10">Linie</text>
    <rect x="245" y="26" width="55" height="28" rx="6" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="272" y="44" text-anchor="middle" fill="var(--text)" font-size="10">Fachlich</text>
    <rect x="212" y="120" width="60" height="28" rx="6" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="242" y="138" text-anchor="middle" fill="var(--text)" font-size="10">Stelle</text>
    <line x1="207" y1="54" x2="242" y2="120" stroke="var(--icon)" stroke-width="1.5"/>
    <line x1="272" y1="54" x2="242" y2="120" stroke="var(--icon)" stroke-width="1.5"/>
  </svg>`;
};

DIAGRAMS['mckinsey-7s'] = function () {
  return `<svg viewBox="0 0 320 320" role="img" aria-label="McKinsey 7S-Modell">
    <defs>
      <marker id="arrow7s" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
        <path d="M0,0 L7,3.5 L0,7 z" fill="var(--icon)"/>
      </marker>
    </defs>
    <line x1="160" y1="160" x2="160" y2="70" stroke="var(--icon)" stroke-width="1.2" marker-end="url(#arrow7s)"/>
    <line x1="160" y1="160" x2="238" y2="115" stroke="var(--icon)" stroke-width="1.2" marker-end="url(#arrow7s)"/>
    <line x1="160" y1="160" x2="238" y2="205" stroke="var(--icon)" stroke-width="1.2" marker-end="url(#arrow7s)"/>
    <line x1="160" y1="160" x2="160" y2="250" stroke="var(--icon)" stroke-width="1.2" marker-end="url(#arrow7s)"/>
    <line x1="160" y1="160" x2="82" y2="205" stroke="var(--icon)" stroke-width="1.2" marker-end="url(#arrow7s)"/>
    <line x1="160" y1="160" x2="82" y2="115" stroke="var(--icon)" stroke-width="1.2" marker-end="url(#arrow7s)"/>

    <circle cx="160" cy="160" r="46" fill="var(--bg2)" stroke="var(--border)" stroke-width="1.5"/>
    <text x="160" y="155" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="600"><tspan x="160" dy="0">Shared</tspan><tspan x="160" dy="13">Values</tspan></text>

    <circle cx="160" cy="40" r="34" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="160" y="44" text-anchor="middle" fill="var(--text)" font-size="11">Strategy</text>

    <circle cx="264" cy="100" r="34" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="264" y="104" text-anchor="middle" fill="var(--text)" font-size="11">Structure</text>

    <circle cx="264" cy="220" r="34" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="264" y="224" text-anchor="middle" fill="var(--text)" font-size="11">Systems</text>

    <circle cx="160" cy="280" r="34" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="160" y="284" text-anchor="middle" fill="var(--text)" font-size="11">Skills</text>

    <circle cx="56" cy="220" r="34" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="56" y="224" text-anchor="middle" fill="var(--text)" font-size="11">Style</text>

    <circle cx="56" cy="100" r="34" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="56" y="104" text-anchor="middle" fill="var(--text)" font-size="11">Staff</text>
  </svg>`;
};

DIAGRAMS['mintzberg-5-konfigurationen'] = function () {
  return `<svg viewBox="0 0 320 190" role="img" aria-label="Mintzberg fünf Organisationskonfigurationen">
    <rect x="8" y="16" width="96" height="64" rx="8" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="56" y="52" text-anchor="middle" fill="var(--text)" font-size="10"><tspan x="56" dy="0">Einfache</tspan><tspan x="56" dy="13">Struktur</tspan></text>

    <rect x="116" y="16" width="96" height="64" rx="8" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="164" y="45" text-anchor="middle" fill="var(--text)" font-size="10"><tspan x="164" dy="0">Maschinen-</tspan><tspan x="164" dy="13">bürokratie</tspan></text>

    <rect x="224" y="16" width="96" height="64" rx="8" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="272" y="45" text-anchor="middle" fill="var(--text)" font-size="10"><tspan x="272" dy="0">Profi-</tspan><tspan x="272" dy="13">bürokratie</tspan></text>

    <rect x="58" y="106" width="96" height="64" rx="8" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="106" y="135" text-anchor="middle" fill="var(--text)" font-size="10"><tspan x="106" dy="0">Divisionalisierte</tspan><tspan x="106" dy="13">Form</tspan></text>

    <rect x="166" y="106" width="96" height="64" rx="8" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="214" y="142" text-anchor="middle" fill="var(--text)" font-size="10">Adhokratie</text>
  </svg>`;
};
