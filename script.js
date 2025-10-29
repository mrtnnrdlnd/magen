document.addEventListener('DOMContentLoaded', generateGrid);

const parsePair = s => {
  if (!s) return [0, 0];
  const cleaned = String(s).trim().replace(/\s+/g, '');
  const parts = cleaned.split(/[,x×]/).map(n => parseInt(n, 10)).filter(n => !Number.isNaN(n));
  if (parts.length === 1) return [parts[0], parts[0]];
  if (parts.length >= 2) return [parts[0] || 0, parts[1] || 0];
  const n = parseInt(cleaned, 10);
  return Number.isNaN(n) ? [0, 0] : [n, n];
};

const seededRandom = seedInput => {
  // Simple LCG seeded by string -> deterministic [0,1)
  let seed = 0;
  String(seedInput || '').split('').forEach(ch => seed = (seed * 31 + ch.charCodeAt(0)) >>> 0);
  if (!seed) seed = 2166136261;
  return () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 0x100000000;
};

const fillGenerators = {
  random: seed => {
    const rnd = seed ? seededRandom(seed) : Math.random;
    return () => Math.floor(rnd() * 10);
  },
  index: () => (r, c) => r + c + 1
};

const Matrix = {
  create: (rows = 0, cols = 0, fill = () => 0) =>
    Array.from({ length: Math.max(0, rows) }, (_, r) =>
      Array.from({ length: Math.max(0, cols) }, (_, c) => Number(fill(r, c)) || 0)
    ),

  multiply: (A, B) => {
    const rowsA = A.length;
    const colsA = A[0]?.length || 0;
    const colsB = B[0]?.length || 0;
    if (colsA !== B.length) return Matrix.create(rowsA, colsB, () => undefined);
    return Matrix.create(rowsA, colsB, (i, j) =>
      A[i].reduce((s, a, k) => s + a * (Number(B[k][j]) || 0), 0)
    );
  }
};

const Table = {
  createElementFromMatrix(matrix = [[]], cls = '') {
    const table = document.createElement('table');
    if (cls) table.className = cls;
    const tbody = document.createElement('tbody');
    for (const row of matrix) {
      const tr = document.createElement('tr');
      for (const v of row) {
        const td = document.createElement('td');
        td.dataset.value = String(v);
        td.textContent = String(v);
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    return table;
  },

  applyModification(container, { type, probability = 0, seed } = {}) {
    if (!container || !probability) return;
    const table = container.querySelector('table') || (container.tagName === 'TABLE' ? container : null);
    if (!table) return;
    const cells = Array.from(table.querySelectorAll('td'));
    const rand = seed ? seededRandom(seed) : Math.random;
    const prob = Math.max(0, Math.min(100, Number(probability || 0))) / 100;
    cells.forEach(td => {
      if (type === 'hide') {
        if (rand() < prob) {
          td.textContent = '';
          td.dataset.hidden = '1';
        } else {
          td.textContent = td.dataset.value;
          delete td.dataset.hidden;
        }
      } else if (type === 'cross') {
        if (rand() < prob) {
          td.classList.add('crossed-out');
          td.setAttribute('aria-pressed', 'true');
        } else {
          td.classList.remove('crossed-out');
          td.removeAttribute('aria-pressed');
        }
      }
    });
  }
};

function makeMatrices(Ar, Ac, Br, Bc, fillName = 'index', seedBase, copies = 1) {
  const fillFactory = fillGenerators[fillName] || fillGenerators.index;
  return Array.from({ length: Math.max(1, copies || 1) }, (_, i) => {
    const instanceSeed = seedBase != null ? `${seedBase}:${i}` : undefined;
    const fillFn = fillFactory(instanceSeed);
    const A = Matrix.create(Ar, Ac, fillFn);
    const B = Matrix.create(Br, Bc, fillFn);
    return { A, B, C: Matrix.multiply(A, B) };
  });
}

function getMatrixParameters() {
  const params = new URLSearchParams(location.search);
  const read = id => (params.has(id) ? Number(params.get(id)) : Number(document.getElementById(id)?.value || 0));
  const dims = {
    A: parsePair(params.get('A') || ''),
    B: parsePair(params.get('B') || '')
  };
  const hide = ['A', 'B', 'C'].reduce((acc, m) => { acc[m] = read(`hide-prob-${m}`); return acc; }, {});
  const cross = ['A', 'B', 'C'].reduce((acc, m) => { acc[m] = read(`cross-prob-${m}`); return acc; }, {});
  return {
    dimensions: dims,
    hideProbs: hide,
    crossProbs: cross,
    fill: params.get('fill') || 'index',
    seed: params.get('seed'),
    copies: Math.max(1, parseInt(params.get('copies'), 10) || Number(document.getElementById('copies')?.value || 1))
  };
}

function generateGrid() {
  const wrapper = document.getElementById('wrapper');
  if (!wrapper) return;
  wrapper.innerHTML = '';

  const p = getMatrixParameters();
  const seedBase = p.seed === 'date' ? new Date().toISOString().slice(0, 10) : p.seed;

  // prioritera URL-params, fallback till inputs om tomt
  let [Ar, Ac] = p.dimensions.A;
  let [Br, Bc] = p.dimensions.B;
  if (!Ar && !Ac) { Ar = Number(document.getElementById('A-rows')?.value) || 0; Ac = Number(document.getElementById('A-cols')?.value) || 0; }
  if (!Br && !Bc) { Br = Number(document.getElementById('B-rows')?.value) || 0; Bc = Number(document.getElementById('B-cols')?.value) || 0; }

  console.debug('generateGrid input dims', { A: [Ar, Ac], B: [Br, Bc], url: location.href });

  // Om A.cols != B.rows, försök gälla en enkel auto-korrigering (swap/transponera) om det gör multiplikationen möjlig
  if (Ac !== Br) {
    // om en transponering av båda skulle lösa det (Ar==Bc) — byt rakt av
    if (Ar === Bc && Ac === Br === false) {
      console.warn('Auto-fixer: byter rader<->kolumner (troligen transponerade inputs).');
      [Ar, Ac] = [Ac, Ar];
      [Br, Bc] = [Bc, Br];
    } else if (Ar === Bc) {
      // mer konservativ: byt A dims om det gör rader/kolumner kompatibla
      console.warn('Auto-fixer: byter A dims.');
      [Ar, Ac] = [Ac, Ar];
    } else {
      // visa tydlig varning i UI men fortsätt (multiplikationen kan ge "undefined" celler)
      const note = document.createElement('div');
      note.style.cssText = 'color:#b45309;background:#fff7ed;padding:8px;border-radius:6px;margin-bottom:8px;border:1px solid #fcd34d';
      note.textContent = `Dimension mismatch: A kolumner (${Ac}) ≠ B rader (${Br}). Kontrollera URL eller formulär.`;
      wrapper.appendChild(note);
      console.warn('Dimension mismatch, proceeding anyway', { Ar, Ac, Br, Bc });
    }
  }

  const instances = makeMatrices(Ar, Ac, Br, Bc, p.fill, seedBase, p.copies);

  instances.forEach((inst, idx) => {
    const block = document.createElement('div');
    block.className = 'matrix-multiplication';

    for (const ch of ['A', 'B', 'C']) {
      const wrap = document.createElement('div');
      wrap.className = ch;
      wrap.appendChild(Table.createElementFromMatrix(inst[ch], 'matrix-table'));
      block.appendChild(wrap);

      const seedFor = seedBase != null ? `${seedBase}:${idx}` : undefined;
      Table.applyModification(wrap, { type: 'hide', probability: p.hideProbs[ch], seed: seedFor ? `${seedFor}:hide:${ch}` : undefined });
      Table.applyModification(wrap, { type: 'cross', probability: p.crossProbs[ch], seed: seedFor ? `${seedFor}:cross:${ch}` : undefined });
    }

    wrapper.appendChild(block);
  });
}
