/*
 * Lógica pura del cuadro de playoffs (sin DOM). Se puede testear con Node.
 *
 * Formato Liga Profesional (Apertura/Clausura):
 *  - Clasifican los 8 primeros de cada zona.
 *  - Octavos cruzados entre zonas: 1A-8B, 2A-7B, 3A-6B, 4A-5B, 1B-8A, 2B-7A, 3B-6A, 4B-5A.
 *  - Cuadro fijo: los dos primeros de zona sólo pueden cruzarse en la final.
 *      Parte alta:  [1A-8B vs 4B-5A]  [2B-7A vs 3A-6B]
 *      Parte baja:  [1B-8A vs 4A-5B]  [2A-7B vs 3B-6A]
 *  - Partido único. Empate en 90' -> alargue de 30' -> penales.
 *  - Es local el mejor ubicado en su zona; la final es en cancha neutral.
 */
(function (root) {
  // Cada slot de octavos: [zona, posición]
  const OCTAVOS = [
    { id: 'O1', a: ['A', 1], b: ['B', 8] },
    { id: 'O2', a: ['B', 4], b: ['A', 5] },
    { id: 'O3', a: ['B', 2], b: ['A', 7] },
    { id: 'O4', a: ['A', 3], b: ['B', 6] },
    { id: 'O5', a: ['B', 1], b: ['A', 8] },
    { id: 'O6', a: ['A', 4], b: ['B', 5] },
    { id: 'O7', a: ['A', 2], b: ['B', 7] },
    { id: 'O8', a: ['B', 3], b: ['A', 6] },
  ];

  const LATER = [
    { id: 'C1', round: 'cuartos', from: ['O1', 'O2'] },
    { id: 'C2', round: 'cuartos', from: ['O3', 'O4'] },
    { id: 'C3', round: 'cuartos', from: ['O5', 'O6'] },
    { id: 'C4', round: 'cuartos', from: ['O7', 'O8'] },
    { id: 'S1', round: 'semis',   from: ['C1', 'C2'] },
    { id: 'S2', round: 'semis',   from: ['C3', 'C4'] },
    { id: 'F',  round: 'final',   from: ['S1', 'S2'] },
  ];

  const ROUND_NAMES = { octavos: 'Octavos de final', cuartos: 'Cuartos de final', semis: 'Semifinales', final: 'Final' };

  function toInt(v) {
    if (v === '' || v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isInteger(n) && n >= 0 ? n : null;
  }

  /**
   * Determina el ganador de un partido a partir de su resultado.
   * result: { g1, g2, p1, p2 } — goles (incluye alargue) y penales.
   * Devuelve 1, 2 o null (sin definir).
   */
  function winnerSide(result) {
    if (!result) return null;
    const g1 = toInt(result.g1), g2 = toInt(result.g2);
    if (g1 === null || g2 === null) return null;
    if (g1 !== g2) return g1 > g2 ? 1 : 2;
    const p1 = toInt(result.p1), p2 = toInt(result.p2);
    if (p1 === null || p2 === null || p1 === p2) return null;
    return p1 > p2 ? 1 : 2;
  }

  /** Ordena a los dos equipos: el mejor ubicado (menor posición) es local. */
  function homeAway(t1, t2) {
    if (!t1 || !t2) return [t1, t2];
    if (t2.pos < t1.pos) return [t2, t1];
    return [t1, t2];
  }

  /**
   * Construye el cuadro completo.
   * order: { A: [teamId x15], B: [teamId x15] }
   * results: { [matchId]: { home, away, g1, g2, p1, p2 } }  (home/away = ids de equipo)
   * Un resultado sólo se aplica si sus equipos coinciden con los actuales del partido;
   * así, si se reordenan las zonas, los resultados viejos quedan sin efecto.
   */
  function buildBracket(order, results) {
    results = results || {};
    const matches = {};

    function seed(zone, pos) {
      return { id: order[zone][pos - 1], zone, pos };
    }

    function finish(match) {
      const r = results[match.id];
      const valid = r && match.home && match.away && r.home === match.home.id && r.away === match.away.id;
      match.result = valid ? r : null;
      const side = valid ? winnerSide(r) : null;
      match.winner = side === 1 ? match.home : side === 2 ? match.away : null;
      match.loser = side === 1 ? match.away : side === 2 ? match.home : null;
      matches[match.id] = match;
    }

    OCTAVOS.forEach((def) => {
      const [home, away] = homeAway(seed(...def.a), seed(...def.b));
      finish({ id: def.id, round: 'octavos', home, away, neutral: false });
    });

    LATER.forEach((def) => {
      const w1 = matches[def.from[0]].winner || null;
      const w2 = matches[def.from[1]].winner || null;
      const neutral = def.round === 'final';
      const [home, away] = neutral ? [w1, w2] : homeAway(w1, w2);
      finish({ id: def.id, round: def.round, home, away, neutral, from: def.from });
    });

    return {
      matches,
      champion: matches.F.winner,
      runnerUp: matches.F.loser,
    };
  }

  // ---------- Simulación ----------

  function poisson(lambda, rand) {
    const L = Math.exp(-lambda);
    let k = 0, p = 1;
    do { k++; p *= rand(); } while (p > L);
    return k - 1;
  }

  /**
   * Simula un partido. Los mejor ubicados tienen algo más de chance
   * (fuerza = 9 - posición) y el local suma una pequeña ventaja.
   */
  function simulateMatch(home, away, neutral, rand) {
    rand = rand || Math.random;
    const sH = 9 - home.pos + (neutral ? 0 : 0.8);
    const sA = 9 - away.pos;
    const base = 1.15;
    const diff = (sH - sA) / 8; // -1 .. 1 aprox.
    const g1 = poisson(Math.max(0.3, base + diff * 0.6), rand);
    const g2 = poisson(Math.max(0.3, base - diff * 0.6), rand);
    const r = { home: home.id, away: away.id, g1, g2, p1: '', p2: '' };
    if (g1 === g2) {
      // Penales: 5 tiros cada uno, luego muerte súbita.
      let p1 = 0, p2 = 0;
      for (let i = 0; i < 5; i++) { if (rand() < 0.75) p1++; if (rand() < 0.75) p2++; }
      while (p1 === p2) { if (rand() < 0.75) p1++; if (rand() < 0.75) p2++; }
      r.p1 = p1; r.p2 = p2;
    }
    return r;
  }

  /**
   * Completa con resultados simulados todos los partidos sin definir
   * (los ya cargados se respetan). Devuelve un nuevo objeto results.
   */
  function simulatePending(order, results, rand) {
    const out = Object.assign({}, results);
    const ids = OCTAVOS.map((d) => d.id).concat(LATER.map((d) => d.id));
    // Una pasada por ronda alcanza porque los ids están en orden de ronda.
    ids.forEach((id) => {
      const m = buildBracket(order, out).matches[id];
      if (m.home && m.away && !m.winner) out[id] = simulateMatch(m.home, m.away, m.neutral, rand);
    });
    return out;
  }

  const api = { OCTAVOS, LATER, ROUND_NAMES, winnerSide, buildBracket, simulateMatch, simulatePending };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Bracket = api;
})(this);
