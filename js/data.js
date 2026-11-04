/*
 * Equipos de la Liga Profesional de Fútbol (Primera División) — Torneo Clausura 2026.
 * 30 equipos divididos en dos zonas de 15.
 *
 * El orden de cada zona es la tabla de posiciones PROVISORIA antes de la última
 * fecha de la fase regular (noviembre 2026). Los primeros 8 de cada zona
 * clasifican a octavos. El usuario puede reordenar arrastrando.
 *
 * colors: [color principal, color secundario] del club (para el escudo genérico).
 */
(function (root) {
  const TEAMS = {
    // ---------- Zona A ----------
    instituto:    { name: 'Instituto',            short: 'INS', colors: ['#d2232a', '#ffffff'] },
    defensa:      { name: 'Defensa y Justicia',   short: 'DYJ', colors: ['#f6d400', '#007a3d'] },
    boca:         { name: 'Boca Juniors',         short: 'BOC', colors: ['#103f79', '#f3b229'] },
    lanus:        { name: 'Lanús',                short: 'LAN', colors: ['#7b1e2b', '#ffffff'] },
    velez:        { name: 'Vélez Sarsfield',      short: 'VEL', colors: ['#ffffff', '#1c3f94'] },
    newells:      { name: "Newell's Old Boys",    short: 'NOB', colors: ['#d71920', '#111111'] },
    gimnasiaM:    { name: 'Gimnasia (Mendoza)',   short: 'GIM', colors: ['#ffffff', '#111111'] },
    independiente:{ name: 'Independiente',        short: 'IND', colors: ['#e30613', '#ffffff'] },
    sanlorenzo:   { name: 'San Lorenzo',          short: 'SLO', colors: ['#1d2c5e', '#c8102e'] },
    talleres:     { name: 'Talleres',             short: 'TAL', colors: ['#0b2a5b', '#ffffff'] },
    estudiantes:  { name: 'Estudiantes (LP)',     short: 'EST', colors: ['#e30613', '#ffffff'] },
    centralcba:   { name: 'Central Córdoba (SdE)',short: 'CCO', colors: ['#111111', '#ffffff'] },
    union:        { name: 'Unión',                short: 'UNI', colors: ['#e30613', '#ffffff'] },
    platense:     { name: 'Platense',             short: 'PLA', colors: ['#5c3a1e', '#ffffff'] },
    riestra:      { name: 'Deportivo Riestra',    short: 'RIE', colors: ['#111111', '#ffffff'] },

    // ---------- Zona B ----------
    central:      { name: 'Rosario Central',      short: 'CEN', colors: ['#003a7d', '#f5c400'] },
    argentinos:   { name: 'Argentinos Juniors',   short: 'ARG', colors: ['#e30613', '#ffffff'] },
    gimnasiaLP:   { name: 'Gimnasia (LP)',        short: 'GLP', colors: ['#ffffff', '#002f6c'] },
    belgrano:     { name: 'Belgrano',             short: 'BEL', colors: ['#5fb4e5', '#ffffff'] },
    sarmiento:    { name: 'Sarmiento (Junín)',    short: 'SAR', colors: ['#00843d', '#ffffff'] },
    river:        { name: 'River Plate',          short: 'RIV', colors: ['#ffffff', '#e30613'] },
    barracas:     { name: 'Barracas Central',     short: 'BAR', colors: ['#e30613', '#ffffff'] },
    huracan:      { name: 'Huracán',              short: 'HUR', colors: ['#ffffff', '#e30613'] },
    racing:       { name: 'Racing Club',          short: 'RAC', colors: ['#6cace4', '#ffffff'] },
    banfield:     { name: 'Banfield',             short: 'BAN', colors: ['#00843d', '#ffffff'] },
    tigre:        { name: 'Tigre',                short: 'TIG', colors: ['#002f6c', '#e30613'] },
    tucuman:      { name: 'Atlético Tucumán',     short: 'ATU', colors: ['#6cace4', '#ffffff'] },
    aldosivi:     { name: 'Aldosivi',             short: 'ALD', colors: ['#00843d', '#f5c400'] },
    estudiantesRC:{ name: 'Estudiantes (RC)',     short: 'ERC', colors: ['#00a3e0', '#ffffff'] },
    rivadavia:    { name: 'Ind. Rivadavia',       short: 'IRI', colors: ['#002f6c', '#ffffff'] },
  };

  const DEFAULT_ORDER = {
    A: ['instituto', 'defensa', 'boca', 'lanus', 'velez', 'newells', 'gimnasiaM', 'independiente',
        'sanlorenzo', 'talleres', 'estudiantes', 'centralcba', 'union', 'platense', 'riestra'],
    B: ['central', 'argentinos', 'gimnasiaLP', 'belgrano', 'sarmiento', 'river', 'barracas', 'huracan',
        'racing', 'banfield', 'tigre', 'tucuman', 'aldosivi', 'estudiantesRC', 'rivadavia'],
  };

  const data = { TEAMS, DEFAULT_ORDER, QUALIFIERS_PER_ZONE: 8 };
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  else root.LigaData = data;
})(this);
