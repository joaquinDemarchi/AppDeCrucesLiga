// Ejecutar con: node --test tests/*.test.js
const test = require('node:test');
const assert = require('node:assert');
const { DEFAULT_ORDER } = require('../js/data.js');
const B = require('../js/bracket.js');

const order = DEFAULT_ORDER;
const seed = (m) => `${m.home.pos}${m.home.zone}-${m.away.pos}${m.away.zone}`;

test('octavos: cada A(n) juega contra B(9-n) y el mejor ubicado es local', () => {
  const { matches } = B.buildBracket(order, {});
  const got = ['O1', 'O2', 'O3', 'O4', 'O5', 'O6', 'O7', 'O8'].map((id) => seed(matches[id]));
  assert.deepStrictEqual(got, ['1A-8B', '4B-5A', '2B-7A', '3A-6B', '1B-8A', '4A-5B', '2A-7B', '3B-6A']);
  for (const id of got) {
    const [a, b] = id.split('-');
    assert.strictEqual(Number(a[0]) + Number(b[0]), 9);
    assert.notStrictEqual(a[1], b[1]);
  }
});

test('winnerSide: goles, empate sin penales y penales', () => {
  assert.strictEqual(B.winnerSide({ g1: 2, g2: 1 }), 1);
  assert.strictEqual(B.winnerSide({ g1: 0, g2: 3 }), 2);
  assert.strictEqual(B.winnerSide({ g1: 1, g2: 1 }), null);
  assert.strictEqual(B.winnerSide({ g1: 1, g2: 1, p1: 4, p2: 5 }), 2);
  assert.strictEqual(B.winnerSide({ g1: '', g2: 1 }), null);
});

test('el ganador avanza al cruce correspondiente', () => {
  const { matches: m0 } = B.buildBracket(order, {});
  const results = {
    O1: { home: m0.O1.home.id, away: m0.O1.away.id, g1: 0, g2: 1 }, // gana 8B
    O2: { home: m0.O2.home.id, away: m0.O2.away.id, g1: 2, g2: 0 }, // gana 4B
  };
  const { matches } = B.buildBracket(order, results);
  assert.strictEqual(matches.C1.home.id, order.B[3]); // 4B mejor ubicado que 8B -> local
  assert.strictEqual(matches.C1.away.id, order.B[7]);
  assert.strictEqual(matches.C2.home, null);
});

test('resultado obsoleto se ignora si cambian los equipos del partido', () => {
  const { matches: m0 } = B.buildBracket(order, {});
  const results = { O1: { home: m0.O1.home.id, away: m0.O1.away.id, g1: 3, g2: 0 } };
  const swapped = { A: order.A.slice(), B: order.B.slice() };
  [swapped.A[0], swapped.A[1]] = [swapped.A[1], swapped.A[0]];
  const { matches } = B.buildBracket(swapped, results);
  assert.strictEqual(matches.O1.winner, null);
});

test('simulatePending completa el torneo y respeta resultados cargados', () => {
  const { matches: m0 } = B.buildBracket(order, {});
  const fixed = { O1: { home: m0.O1.home.id, away: m0.O1.away.id, g1: 0, g2: 5 } };
  let seedN = 42;
  const rand = () => ((seedN = (seedN * 16807) % 2147483647) / 2147483647);
  const results = B.simulatePending(order, fixed, rand);
  const br = B.buildBracket(order, results);
  assert.ok(br.champion, 'debe haber campeón');
  assert.deepStrictEqual(results.O1, fixed.O1);
  assert.strictEqual(br.matches.O1.winner.id, order.B[7]);
  Object.values(br.matches).forEach((m) => assert.ok(m.winner, `${m.id} sin ganador`));
});

test('1A y 1B sólo pueden cruzarse en la final', () => {
  const top = new Set(['O1', 'O2', 'O3', 'O4']);
  const pos = (z, p) => B.OCTAVOS.find((o) => [o.a, o.b].some(([zz, pp]) => zz === z && pp === p)).id;
  assert.ok(top.has(pos('A', 1)) && !top.has(pos('B', 1)));
  assert.ok(top.has(pos('B', 2)) && !top.has(pos('A', 2)));
});
