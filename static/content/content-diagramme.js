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

DIAGRAMS['flach-steil-hierarchie'] = function () {
  return `<svg viewBox="0 0 320 165" role="img" aria-label="Flache vs. steile Organisation">
    <text x="80" y="12" text-anchor="middle" fill="var(--muted)" font-size="11" font-weight="600">Flache Organisation</text>
    <rect x="52" y="20" width="56" height="24" rx="6" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="80" y="36" text-anchor="middle" fill="var(--text)" font-size="10">Leitung</text>
    <rect x="8" y="90" width="30" height="24" rx="5" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <rect x="44" y="90" width="30" height="24" rx="5" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <rect x="80" y="90" width="30" height="24" rx="5" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <rect x="116" y="90" width="30" height="24" rx="5" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <line x1="80" y1="44" x2="23" y2="90" stroke="var(--icon)" stroke-width="1.2"/>
    <line x1="80" y1="44" x2="59" y2="90" stroke="var(--icon)" stroke-width="1.2"/>
    <line x1="80" y1="44" x2="95" y2="90" stroke="var(--icon)" stroke-width="1.2"/>
    <line x1="80" y1="44" x2="131" y2="90" stroke="var(--icon)" stroke-width="1.2"/>

    <line x1="160" y1="8" x2="160" y2="155" stroke="var(--border)" stroke-width="1"/>

    <text x="241" y="12" text-anchor="middle" fill="var(--muted)" font-size="11" font-weight="600">Steile Organisation</text>
    <rect x="213" y="20" width="56" height="22" rx="6" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="241" y="35" text-anchor="middle" fill="var(--text)" font-size="10">Leitung</text>
    <rect x="180" y="68" width="50" height="20" rx="5" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <rect x="250" y="68" width="50" height="20" rx="5" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <rect x="168" y="116" width="34" height="22" rx="5" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <rect x="206" y="116" width="34" height="22" rx="5" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <rect x="244" y="116" width="34" height="22" rx="5" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <rect x="282" y="116" width="34" height="22" rx="5" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <line x1="241" y1="42" x2="205" y2="68" stroke="var(--icon)" stroke-width="1.2"/>
    <line x1="241" y1="42" x2="275" y2="68" stroke="var(--icon)" stroke-width="1.2"/>
    <line x1="205" y1="88" x2="185" y2="116" stroke="var(--icon)" stroke-width="1.2"/>
    <line x1="205" y1="88" x2="223" y2="116" stroke="var(--icon)" stroke-width="1.2"/>
    <line x1="275" y1="88" x2="261" y2="116" stroke="var(--icon)" stroke-width="1.2"/>
    <line x1="275" y1="88" x2="299" y2="116" stroke="var(--icon)" stroke-width="1.2"/>
  </svg>`;
};

DIAGRAMS['matrix-organisation'] = function () {
  return `<svg viewBox="0 0 320 195" role="img" aria-label="Matrixorganisation: Funktion x Projekt">
    <rect x="70" y="6" width="64" height="36" fill="none" stroke="var(--border)" stroke-width="1.2"/>
    <text x="102" y="28" text-anchor="middle" fill="var(--muted)" font-size="9.5">Projekt A</text>
    <rect x="134" y="6" width="64" height="36" fill="none" stroke="var(--border)" stroke-width="1.2"/>
    <text x="166" y="28" text-anchor="middle" fill="var(--muted)" font-size="9.5">Projekt B</text>
    <rect x="198" y="6" width="64" height="36" fill="none" stroke="var(--border)" stroke-width="1.2"/>
    <text x="230" y="28" text-anchor="middle" fill="var(--muted)" font-size="9.5">Projekt C</text>

    <rect x="6" y="42" width="64" height="38" fill="none" stroke="var(--border)" stroke-width="1.2"/>
    <text x="38" y="65" text-anchor="middle" fill="var(--muted)" font-size="9.5">Vertrieb</text>
    <rect x="6" y="80" width="64" height="38" fill="none" stroke="var(--border)" stroke-width="1.2"/>
    <text x="38" y="103" text-anchor="middle" fill="var(--muted)" font-size="9.5">Produktion</text>
    <rect x="6" y="118" width="64" height="38" fill="none" stroke="var(--border)" stroke-width="1.2"/>
    <text x="38" y="141" text-anchor="middle" fill="var(--muted)" font-size="9.5">IT</text>

    <rect x="70" y="42" width="64" height="38" fill="none" stroke="var(--border)" stroke-width="1"/>
    <rect x="198" y="42" width="64" height="38" fill="none" stroke="var(--border)" stroke-width="1"/>
    <rect x="70" y="118" width="64" height="38" fill="none" stroke="var(--border)" stroke-width="1"/>
    <rect x="134" y="118" width="64" height="38" fill="none" stroke="var(--border)" stroke-width="1"/>
    <rect x="198" y="118" width="64" height="38" fill="none" stroke="var(--border)" stroke-width="1"/>

    <rect x="134" y="80" width="64" height="38" fill="var(--bg2)" stroke="var(--accent)" stroke-width="2"/>
    <text x="166" y="103" text-anchor="middle" fill="var(--text)" font-size="10" font-weight="600">MA</text>

    <text x="160" y="180" text-anchor="middle" fill="var(--muted)" font-size="9.5">Markierte Zelle: doppelte Berichtslinie</text>
  </svg>`;
};

DIAGRAMS['business-partner-modell'] = function () {
  return `<svg viewBox="0 0 320 195" role="img" aria-label="Business-Partner-Modell mit CoE und Shared Services">
    <rect x="60" y="8" width="200" height="32" rx="8" fill="var(--bg2)" stroke="var(--border)" stroke-width="1.5"/>
    <text x="160" y="29" text-anchor="middle" fill="var(--text)" font-size="10.5">Business / Fachbereiche</text>

    <line x1="160" y1="40" x2="55" y2="88" stroke="var(--icon)" stroke-width="1.2"/>
    <line x1="160" y1="40" x2="160" y2="88" stroke="var(--icon)" stroke-width="1.2"/>
    <line x1="160" y1="40" x2="265" y2="88" stroke="var(--icon)" stroke-width="1.2"/>

    <rect x="10" y="88" width="90" height="78" rx="8" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="55" y="112" text-anchor="middle" fill="var(--text)" font-size="10" font-weight="600">Business</text>
    <text x="55" y="126" text-anchor="middle" fill="var(--text)" font-size="10" font-weight="600">Partner</text>
    <text x="55" y="146" text-anchor="middle" fill="var(--muted)" font-size="8.5"><tspan x="55" dy="0">Strategie,</tspan><tspan x="55" dy="11">vor Ort</tspan></text>

    <rect x="115" y="88" width="90" height="78" rx="8" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="160" y="112" text-anchor="middle" fill="var(--text)" font-size="10" font-weight="600">Center of</text>
    <text x="160" y="126" text-anchor="middle" fill="var(--text)" font-size="10" font-weight="600">Expertise</text>
    <text x="160" y="146" text-anchor="middle" fill="var(--muted)" font-size="8.5">Fachwissen</text>

    <rect x="220" y="88" width="90" height="78" rx="8" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="265" y="112" text-anchor="middle" fill="var(--text)" font-size="10" font-weight="600">Shared</text>
    <text x="265" y="126" text-anchor="middle" fill="var(--text)" font-size="10" font-weight="600">Services</text>
    <text x="265" y="146" text-anchor="middle" fill="var(--muted)" font-size="8.5"><tspan x="265" dy="0">Standard-</tspan><tspan x="265" dy="11">prozesse</tspan></text>
  </svg>`;
};

DIAGRAMS['hay-faktoren'] = function () {
  return `<svg viewBox="0 0 320 165" role="img" aria-label="Hay-Methode: drei Faktoren ergeben den Gesamtpunktwert">
    <defs>
      <marker id="arrowhay" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 z" fill="var(--icon)"/>
      </marker>
    </defs>
    <rect x="8" y="14" width="90" height="54" rx="8" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="53" y="46" text-anchor="middle" fill="var(--text)" font-size="10">Know-how</text>

    <text x="106" y="46" text-anchor="middle" fill="var(--icon)" font-size="14">+</text>

    <rect x="115" y="14" width="90" height="54" rx="8" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="160" y="38" text-anchor="middle" fill="var(--text)" font-size="10"><tspan x="160" dy="0">Problem-</tspan><tspan x="160" dy="13">lösung</tspan></text>

    <text x="213" y="46" text-anchor="middle" fill="var(--icon)" font-size="14">+</text>

    <rect x="222" y="14" width="90" height="54" rx="8" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="267" y="38" text-anchor="middle" fill="var(--text)" font-size="10"><tspan x="267" dy="0">Verant-</tspan><tspan x="267" dy="13">wortung</tspan></text>

    <line x1="160" y1="70" x2="160" y2="106" stroke="var(--icon)" stroke-width="1.5" marker-end="url(#arrowhay)"/>

    <rect x="60" y="112" width="200" height="46" rx="8" fill="var(--bg2)" stroke="var(--border)" stroke-width="1.5"/>
    <text x="160" y="132" text-anchor="middle" fill="var(--text)" font-size="10" font-weight="600">Gesamtpunktwert</text>
    <text x="160" y="147" text-anchor="middle" fill="var(--muted)" font-size="9">→ Job Grade</text>
  </svg>`;
};

DIAGRAMS['reorg-phasenmodell'] = function () {
  return `<svg viewBox="0 0 320 215" role="img" aria-label="Phasenmodell einer Reorganisation">
    <defs>
      <marker id="arrowphase" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
        <path d="M0,0 L7,3.5 L0,7 z" fill="var(--icon)"/>
      </marker>
    </defs>
    <rect x="70" y="6" width="180" height="26" rx="6" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="160" y="23" text-anchor="middle" fill="var(--text)" font-size="10.5">1. Diagnose</text>
    <line x1="160" y1="32" x2="160" y2="46" stroke="var(--icon)" stroke-width="1.3" marker-end="url(#arrowphase)"/>

    <rect x="70" y="48" width="180" height="26" rx="6" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="160" y="65" text-anchor="middle" fill="var(--text)" font-size="10.5">2. Zielbild</text>
    <line x1="160" y1="74" x2="160" y2="88" stroke="var(--icon)" stroke-width="1.3" marker-end="url(#arrowphase)"/>

    <rect x="70" y="90" width="180" height="26" rx="6" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="160" y="107" text-anchor="middle" fill="var(--text)" font-size="10.5">3. Konzeption</text>
    <line x1="160" y1="116" x2="160" y2="130" stroke="var(--icon)" stroke-width="1.3" marker-end="url(#arrowphase)"/>

    <rect x="70" y="132" width="180" height="26" rx="6" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="160" y="149" text-anchor="middle" fill="var(--text)" font-size="10.5">4. Umsetzung</text>
    <line x1="160" y1="158" x2="160" y2="172" stroke="var(--icon)" stroke-width="1.3" marker-end="url(#arrowphase)"/>

    <rect x="70" y="174" width="180" height="26" rx="6" fill="var(--bg2)" stroke="var(--border)" stroke-width="1.5"/>
    <text x="160" y="191" text-anchor="middle" fill="var(--text)" font-size="10.5">5. Verankerung</text>
  </svg>`;
};

DIAGRAMS['swot-matrix'] = function () {
  return `<svg viewBox="0 0 320 200" role="img" aria-label="SWOT-Matrix">
    <rect x="5" y="5" width="150" height="85" rx="8" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="80" y="45" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="600">Stärken</text>
    <text x="80" y="60" text-anchor="middle" fill="var(--muted)" font-size="9">(intern)</text>

    <rect x="165" y="5" width="150" height="85" rx="8" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="240" y="45" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="600">Schwächen</text>
    <text x="240" y="60" text-anchor="middle" fill="var(--muted)" font-size="9">(intern)</text>

    <rect x="5" y="100" width="150" height="85" rx="8" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="80" y="140" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="600">Chancen</text>
    <text x="80" y="155" text-anchor="middle" fill="var(--muted)" font-size="9">(extern)</text>

    <rect x="165" y="100" width="150" height="85" rx="8" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="240" y="140" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="600">Risiken</text>
    <text x="240" y="155" text-anchor="middle" fill="var(--muted)" font-size="9">(extern)</text>
  </svg>`;
};

DIAGRAMS['raci-matrix'] = function () {
  return `<svg viewBox="0 0 320 140" role="img" aria-label="RACI-Matrix Beispiel">
    <rect x="4" y="4" width="86" height="26" fill="var(--bg2)" stroke="var(--border)" stroke-width="1"/>
    <rect x="90" y="4" width="56" height="26" fill="var(--bg2)" stroke="var(--border)" stroke-width="1"/>
    <text x="118" y="21" text-anchor="middle" fill="var(--muted)" font-size="9.5">Linie</text>
    <rect x="146" y="4" width="56" height="26" fill="var(--bg2)" stroke="var(--border)" stroke-width="1"/>
    <text x="174" y="21" text-anchor="middle" fill="var(--muted)" font-size="9.5">HR</text>
    <rect x="202" y="4" width="56" height="26" fill="var(--bg2)" stroke="var(--border)" stroke-width="1"/>
    <text x="230" y="21" text-anchor="middle" fill="var(--muted)" font-size="9.5">Finance</text>
    <rect x="258" y="4" width="56" height="26" fill="var(--bg2)" stroke="var(--border)" stroke-width="1"/>
    <text x="286" y="21" text-anchor="middle" fill="var(--muted)" font-size="9.5">IT</text>

    <rect x="4" y="30" width="86" height="34" fill="none" stroke="var(--border)" stroke-width="1"/>
    <text x="10" y="51" fill="var(--muted)" font-size="9.5">Aufgabe 1</text>
    <rect x="90" y="30" width="56" height="34" fill="none" stroke="var(--border)" stroke-width="1"/>
    <text x="118" y="51" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="700">R</text>
    <rect x="146" y="30" width="56" height="34" fill="none" stroke="var(--border)" stroke-width="1"/>
    <text x="174" y="51" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="700">A</text>
    <rect x="202" y="30" width="56" height="34" fill="none" stroke="var(--border)" stroke-width="1"/>
    <text x="230" y="51" text-anchor="middle" fill="var(--muted)" font-size="12">C</text>
    <rect x="258" y="30" width="56" height="34" fill="none" stroke="var(--border)" stroke-width="1"/>
    <text x="286" y="51" text-anchor="middle" fill="var(--muted)" font-size="12">I</text>

    <rect x="4" y="64" width="86" height="34" fill="none" stroke="var(--border)" stroke-width="1"/>
    <text x="10" y="85" fill="var(--muted)" font-size="9.5">Aufgabe 2</text>
    <rect x="90" y="64" width="56" height="34" fill="none" stroke="var(--border)" stroke-width="1"/>
    <text x="118" y="85" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="700">A</text>
    <rect x="146" y="64" width="56" height="34" fill="none" stroke="var(--border)" stroke-width="1"/>
    <text x="174" y="85" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="700">R</text>
    <rect x="202" y="64" width="56" height="34" fill="none" stroke="var(--border)" stroke-width="1"/>
    <text x="230" y="85" text-anchor="middle" fill="var(--muted)" font-size="12">I</text>
    <rect x="258" y="64" width="56" height="34" fill="none" stroke="var(--border)" stroke-width="1"/>
    <text x="286" y="85" text-anchor="middle" fill="var(--muted)" font-size="12">C</text>

    <rect x="4" y="98" width="86" height="34" fill="none" stroke="var(--border)" stroke-width="1"/>
    <text x="10" y="119" fill="var(--muted)" font-size="9.5">Aufgabe 3</text>
    <rect x="90" y="98" width="56" height="34" fill="none" stroke="var(--border)" stroke-width="1"/>
    <text x="118" y="119" text-anchor="middle" fill="var(--muted)" font-size="12">C</text>
    <rect x="146" y="98" width="56" height="34" fill="none" stroke="var(--border)" stroke-width="1"/>
    <text x="174" y="119" text-anchor="middle" fill="var(--muted)" font-size="12">I</text>
    <rect x="202" y="98" width="56" height="34" fill="none" stroke="var(--border)" stroke-width="1"/>
    <text x="230" y="119" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="700">R</text>
    <rect x="258" y="98" width="56" height="34" fill="none" stroke="var(--border)" stroke-width="1"/>
    <text x="286" y="119" text-anchor="middle" fill="var(--text)" font-size="12" font-weight="700">A</text>
  </svg>`;
};

DIAGRAMS['kotter-8-stufen'] = function () {
  const stufen = [
    '1. Dringlichkeit erzeugen',
    '2. Führungskoalition aufbauen',
    '3. Vision & Strategie entwickeln',
    '4. Vision kommunizieren',
    '5. Mitarbeitende befähigen',
    '6. Kurzfristige Erfolge sichern',
    '7. Erfolge konsolidieren',
    '8. In Kultur verankern',
  ];
  const rows = stufen.map((s, i) => {
    const y = 6 + i * 24;
    return `<rect x="20" y="${y}" width="280" height="20" rx="5" fill="${i === 7 ? 'var(--bg2)' : 'none'}" stroke="var(--border)" stroke-width="1.2"/>
    <text x="30" y="${y + 14}" fill="var(--text)" font-size="9.5">${s}</text>`;
  }).join('');
  return `<svg viewBox="0 0 320 204" role="img" aria-label="Kotters 8-Stufen-Modell">${rows}</svg>`;
};

DIAGRAMS['change-curve'] = function () {
  return `<svg viewBox="0 0 320 200" role="img" aria-label="Kübler-Ross Change Curve">
    <line x1="30" y1="12" x2="30" y2="165" stroke="var(--border)" stroke-width="1.2"/>
    <line x1="30" y1="165" x2="310" y2="165" stroke="var(--border)" stroke-width="1.2"/>
    <text x="30" y="8" fill="var(--muted)" font-size="9">Leistung/Emotion</text>
    <text x="300" y="178" text-anchor="end" fill="var(--muted)" font-size="9">Zeit →</text>

    <path d="M40,70 C90,95 120,150 160,155 C200,150 250,90 295,55" fill="none" stroke="var(--icon)" stroke-width="2"/>

    <text x="40" y="188" text-anchor="middle" fill="var(--muted)" font-size="8">Schock</text>
    <text x="105" y="188" text-anchor="middle" fill="var(--muted)" font-size="8">Widerstand</text>
    <text x="160" y="198" text-anchor="middle" fill="var(--muted)" font-size="8">Ausprobieren</text>
    <text x="225" y="188" text-anchor="middle" fill="var(--muted)" font-size="8">Erkenntnis</text>
    <text x="290" y="188" text-anchor="middle" fill="var(--muted)" font-size="8">Integration</text>
  </svg>`;
};

DIAGRAMS['stakeholder-matrix'] = function () {
  return `<svg viewBox="0 0 320 200" role="img" aria-label="Stakeholder Macht-Interesse-Matrix">
    <rect x="5" y="5" width="150" height="85" rx="8" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="80" y="42" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="600">Eng einbinden</text>
    <text x="80" y="58" text-anchor="middle" fill="var(--muted)" font-size="8.5">Macht hoch · Interesse hoch</text>

    <rect x="165" y="5" width="150" height="85" rx="8" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="240" y="42" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="600">Zufriedenstellen</text>
    <text x="240" y="58" text-anchor="middle" fill="var(--muted)" font-size="8.5">Macht hoch · Interesse gering</text>

    <rect x="5" y="100" width="150" height="85" rx="8" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="80" y="137" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="600">Informiert halten</text>
    <text x="80" y="153" text-anchor="middle" fill="var(--muted)" font-size="8.5">Macht gering · Interesse hoch</text>

    <rect x="165" y="100" width="150" height="85" rx="8" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="240" y="137" text-anchor="middle" fill="var(--text)" font-size="11" font-weight="600">Minimaler Aufwand</text>
    <text x="240" y="153" text-anchor="middle" fill="var(--muted)" font-size="8.5">Macht gering · Interesse gering</text>
  </svg>`;
};

DIAGRAMS['holokratie-kreise'] = function () {
  return `<svg viewBox="0 0 320 220" role="img" aria-label="Holokratie: verschachtelte Kreise">
    <circle cx="160" cy="115" r="98" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="160" y="26" text-anchor="middle" fill="var(--muted)" font-size="9.5">General Company Circle</text>

    <circle cx="160" cy="80" r="38" fill="var(--bg2)" stroke="var(--border)" stroke-width="1.5"/>
    <text x="160" y="84" text-anchor="middle" fill="var(--text)" font-size="10">Produkt</text>

    <circle cx="112" cy="155" r="34" fill="var(--bg2)" stroke="var(--border)" stroke-width="1.5"/>
    <text x="112" y="159" text-anchor="middle" fill="var(--text)" font-size="10">Marketing</text>

    <circle cx="208" cy="155" r="34" fill="var(--bg2)" stroke="var(--border)" stroke-width="1.5"/>
    <text x="208" y="159" text-anchor="middle" fill="var(--text)" font-size="10">Betrieb</text>
  </svg>`;
};

DIAGRAMS['spotify-modell'] = function () {
  return `<svg viewBox="0 0 320 200" role="img" aria-label="Spotify-Modell: Squads, Tribes, Chapters">
    <text x="15" y="12" fill="var(--muted)" font-size="10" font-weight="600">Tribe A</text>
    <rect x="15" y="18" width="80" height="46" rx="6" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="55" y="45" text-anchor="middle" fill="var(--text)" font-size="9.5">Squad 1</text>
    <rect x="115" y="18" width="80" height="46" rx="6" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="155" y="45" text-anchor="middle" fill="var(--text)" font-size="9.5">Squad 2</text>
    <rect x="215" y="18" width="80" height="46" rx="6" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="255" y="45" text-anchor="middle" fill="var(--text)" font-size="9.5">Squad 3</text>

    <line x1="55" y1="64" x2="55" y2="128" stroke="var(--icon)" stroke-width="1.2" stroke-dasharray="3,3"/>
    <line x1="155" y1="64" x2="155" y2="128" stroke="var(--icon)" stroke-width="1.2" stroke-dasharray="3,3"/>
    <line x1="255" y1="64" x2="255" y2="128" stroke="var(--icon)" stroke-width="1.2" stroke-dasharray="3,3"/>
    <text x="8" y="99" fill="var(--muted)" font-size="8.5">Chapters</text>

    <text x="15" y="122" fill="var(--muted)" font-size="10" font-weight="600">Tribe B</text>
    <rect x="15" y="128" width="80" height="46" rx="6" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="55" y="155" text-anchor="middle" fill="var(--text)" font-size="9.5">Squad 1</text>
    <rect x="115" y="128" width="80" height="46" rx="6" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="155" y="155" text-anchor="middle" fill="var(--text)" font-size="9.5">Squad 2</text>
    <rect x="215" y="128" width="80" height="46" rx="6" fill="none" stroke="var(--border)" stroke-width="1.5"/>
    <text x="255" y="155" text-anchor="middle" fill="var(--text)" font-size="9.5">Squad 3</text>
  </svg>`;
};
