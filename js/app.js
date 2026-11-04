/* Interfaz: zonas arrastrables + cuadro de playoffs. */
(function () {
  'use strict';

  const { TEAMS, DEFAULT_ORDER, QUALIFIERS_PER_ZONE } = window.LigaData;
  const B = window.Bracket;
  const STORAGE_KEY = 'cruces-lpf-v2';

  // ---------- Estado ----------
  let state = loadState();

  function freshState() {
    return { order: { A: DEFAULT_ORDER.A.slice(), B: DEFAULT_ORDER.B.slice() }, results: {} };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return freshState();
      const s = JSON.parse(raw);
      // Validar que las zonas sigan teniendo exactamente los mismos equipos.
      const ok = ['A', 'B'].every((z) =>
        Array.isArray(s.order && s.order[z]) &&
        s.order[z].length === DEFAULT_ORDER[z].length &&
        DEFAULT_ORDER[z].every((id) => s.order[z].includes(id)));
      return ok ? { order: s.order, results: s.results || {} } : freshState();
    } catch (e) {
      return freshState();
    }
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* sin storage */ }
  }

  // ---------- Helpers de render ----------
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach((k) => {
        const v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else if (k === 'style') node.style.cssText = v;
        else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
        else node.setAttribute(k, v === true ? '' : v);
      });
    }
    (children || []).forEach((c) => c && node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return node;
  }

  function badge(teamId) {
    const t = TEAMS[teamId];
    return el('span', {
      class: 'badge',
      'aria-hidden': 'true',
      style: `--c1:${t.colors[0]};--c2:${t.colors[1]}`,
    });
  }

  // ---------- Zonas ----------
  function renderZones() {
    ['A', 'B'].forEach((zone) => {
      const list = document.getElementById('zone-' + zone);
      list.innerHTML = '';
      state.order[zone].forEach((id, i) => list.appendChild(zoneRow(zone, id, i)));
    });
  }

  function zoneRow(zone, id, index) {
    const pos = index + 1;
    const last = state.order[zone].length;
    return el('li', {
      class: 'zone-row' + (pos <= QUALIFIERS_PER_ZONE ? ' qualified' : ''),
      'data-id': id,
    }, [
      el('span', { class: 'grip', title: 'Arrastrar', 'aria-hidden': 'true' }, ['⋮⋮']),
      el('span', { class: 'pos', text: pos }),
      badge(id),
      el('span', { class: 'team-name', text: TEAMS[id].name }),
      el('span', { class: 'row-btns' }, [
        el('button', {
          type: 'button', class: 'mv', 'aria-label': `Subir ${TEAMS[id].name}`, disabled: pos === 1,
          onclick: () => move(zone, index, -1),
        }, ['▲']),
        el('button', {
          type: 'button', class: 'mv', 'aria-label': `Bajar ${TEAMS[id].name}`, disabled: pos === last,
          onclick: () => move(zone, index, 1),
        }, ['▼']),
      ]),
    ]);
  }

  function move(zone, index, delta) {
    const arr = state.order[zone];
    const j = index + delta;
    if (j < 0 || j >= arr.length) return;
    [arr[index], arr[j]] = [arr[j], arr[index]];
    commitOrder();
    const btn = document.querySelectorAll(`#zone-${zone} .zone-row`)[j]
      .querySelectorAll('.mv')[delta < 0 ? 0 : 1];
    if (btn && !btn.disabled) btn.focus();
  }

  function commitOrder() {
    saveState();
    renderZones();
    renderBracket();
  }

  // Arrastrar y soltar con Pointer Events (mouse y táctil).
  function setupDrag(list) {
    let dragging = null;

    list.addEventListener('pointerdown', (e) => {
      const row = e.target.closest('.zone-row');
      if (!row || e.target.closest('button')) return;
      // En táctil sólo se arrastra desde el grip, para no bloquear el scroll.
      if (e.pointerType !== 'mouse' && !e.target.closest('.grip')) return;
      if (e.button !== 0) return;
      e.preventDefault();
      dragging = row;
      row.classList.add('dragging');
      list.classList.add('is-dragging');
      list.setPointerCapture(e.pointerId);
    });

    list.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const others = Array.from(list.children).filter((c) => c !== dragging);
      const next = others.find((c) => {
        const r = c.getBoundingClientRect();
        return e.clientY < r.top + r.height / 2;
      });
      if ((next || null) !== dragging.nextElementSibling) list.insertBefore(dragging, next || null);
      Array.from(list.children).forEach((c, i) => {
        c.querySelector('.pos').textContent = i + 1;
        c.classList.toggle('qualified', i < QUALIFIERS_PER_ZONE);
      });
    });

    function end() {
      if (!dragging) return;
      dragging.classList.remove('dragging');
      list.classList.remove('is-dragging');
      dragging = null;
      state.order[list.dataset.zone] = Array.from(list.children).map((c) => c.dataset.id);
      commitOrder();
    }
    list.addEventListener('pointerup', end);
    list.addEventListener('pointercancel', end);
  }

  // ---------- Cuadro ----------
  // Columnas de izquierda a derecha: parte alta | final | parte baja (espejada).
  const LAYOUT = [
    { round: 'octavos', ids: ['O1', 'O2', 'O3', 'O4'], side: 'left' },
    { round: 'cuartos', ids: ['C1', 'C2'], side: 'left' },
    { round: 'semis',   ids: ['S1'], side: 'left' },
    { round: 'final',   ids: ['F'], side: 'center' },
    { round: 'semis',   ids: ['S2'], side: 'right' },
    { round: 'cuartos', ids: ['C3', 'C4'], side: 'right' },
    { round: 'octavos', ids: ['O5', 'O6', 'O7', 'O8'], side: 'right' },
  ];

  function seedLabel(t) { return t ? `${t.pos}°${t.zone}` : ''; }

  function renderBracket() {
    // Preservar el foco si el usuario está escribiendo un resultado.
    const active = document.activeElement;
    const focusKey = active && active.dataset ? active.dataset.key : null;
    const selStart = focusKey ? active.selectionStart : null;

    const { matches, champion, runnerUp } = B.buildBracket(state.order, state.results);
    const root = document.getElementById('bracket');
    root.innerHTML = '';

    LAYOUT.forEach((col) => {
      root.appendChild(el('div', { class: `round round-${col.round} side-${col.side}` }, [
        el('h3', { class: 'round-title' }, [
          B.ROUND_NAMES[col.round],
          col.side === 'center' ? null : el('small', { class: 'half', text: col.side === 'left' ? ' · Parte alta' : ' · Parte baja' }),
        ]),
        el('div', { class: 'round-matches' }, col.ids.map((id) => matchCard(matches[id]))),
      ]));
    });

    const champ = document.getElementById('champion');
    if (champion) {
      champ.hidden = false;
      champ.innerHTML = '';
      champ.append(
        el('span', { class: 'trophy', 'aria-hidden': 'true', text: '🏆' }),
        el('div', {}, [
          el('div', { class: 'champ-label', text: 'Campeón' }),
          el('div', { class: 'champ-name' }, [badge(champion.id), TEAMS[champion.id].name]),
          el('div', { class: 'champ-sub', text: `Subcampeón: ${TEAMS[runnerUp.id].name}` }),
        ]),
      );
    } else {
      champ.hidden = true;
    }

    if (focusKey) {
      const again = root.querySelector(`[data-key="${focusKey}"]`);
      if (again) {
        again.focus();
        try { if (selStart !== null) again.setSelectionRange(selStart, selStart); } catch (e) { /* type=number */ }
      }
    }
  }

  function matchCard(m) {
    const ready = m.home && m.away;
    const r = m.result || {};
    const tie = ready && r.g1 !== '' && r.g1 !== undefined && r.g1 !== null && String(r.g1) === String(r.g2);

    let meta;
    if (m.round === 'octavos') meta = `${seedLabel(m.home)} vs ${seedLabel(m.away)}`;
    else if (m.neutral) meta = 'Cancha neutral';
    else meta = ready ? `Local: ${TEAMS[m.home.id].short}` : `Ganadores ${m.from.join(' / ')}`;

    return el('article', {
      class: 'match' + (m.winner ? ' decided' : '') + (ready ? '' : ' pending'),
      'aria-label': `Partido ${m.id}`,
    }, [
      el('header', { class: 'match-head' }, [
        el('span', { class: 'match-id', text: m.id }),
        el('span', { class: 'match-meta', text: meta }),
      ]),
      teamLine(m, 'home', 1, tie),
      teamLine(m, 'away', 2, tie),
    ]);
  }

  function teamLine(m, slot, side, tie) {
    const t = m[slot];
    const r = m.result || {};
    const isWinner = m.winner && t && m.winner.id === t.id;
    const isLoser = m.winner && t && !isWinner;
    const ready = m.home && m.away;

    return el('div', { class: 'team-line' + (isWinner ? ' win' : '') + (isLoser ? ' lose' : '') + (t ? '' : ' tbd') }, [
      t ? badge(t.id) : el('span', { class: 'badge empty', 'aria-hidden': 'true' }),
      el('span', { class: 'seed', text: t ? seedLabel(t) : '' }),
      el('span', { class: 'team-name', text: t ? TEAMS[t.id].name : 'A definir' }),
      tie ? scoreInput(m, 'p' + side, r['p' + side], 'pen', `Penales ${t ? TEAMS[t.id].name : ''}`) : null,
      ready ? scoreInput(m, 'g' + side, r['g' + side], 'goals', `Goles ${t ? TEAMS[t.id].name : ''}`) : el('span', { class: 'score-ph' }),
    ]);
  }

  function scoreInput(m, field, value, kind, label) {
    return el('input', {
      type: 'number', inputmode: 'numeric', min: '0', max: '99',
      class: 'score ' + kind,
      value: value === undefined || value === null ? '' : value,
      placeholder: kind === 'pen' ? 'pen' : '-',
      'aria-label': label,
      'data-key': `${m.id}-${field}`,
      oninput: (e) => setScore(m, field, e.target.value),
    });
  }

  function setScore(m, field, raw) {
    const v = raw === '' ? '' : Math.max(0, Math.min(99, parseInt(raw, 10) || 0));
    const prev = state.results[m.id];
    const r = prev && prev.home === m.home.id && prev.away === m.away.id
      ? Object.assign({}, prev)
      : { home: m.home.id, away: m.away.id, g1: '', g2: '', p1: '', p2: '' };
    r[field] = v;
    if (String(r.g1) !== String(r.g2)) { r.p1 = ''; r.p2 = ''; }
    state.results[m.id] = r;
    saveState();
    renderBracket();
  }

  // ---------- Toolbar ----------
  document.getElementById('btn-simulate').addEventListener('click', () => {
    state.results = B.simulatePending(state.order, state.results);
    saveState();
    renderBracket();
  });

  document.getElementById('btn-clear-results').addEventListener('click', () => {
    state.results = {};
    saveState();
    renderBracket();
  });

  document.getElementById('btn-reset').addEventListener('click', () => {
    if (!confirm('¿Restaurar las posiciones originales y borrar los resultados?')) return;
    state = freshState();
    commitOrder();
  });

  // ---------- Init ----------
  setupDrag(document.getElementById('zone-A'));
  setupDrag(document.getElementById('zone-B'));
  renderZones();
  renderBracket();
})();
