// Lógica compartida para tablas con búsqueda, orden y paginación
(function () {
  window.TableView = function (opts) {
    // opts: { data, columns, pageSize, searchField, onRowClick, tbodyEl, theadEl, searchEl, paginationEl }
    const state = {
      raw: opts.data,
      filtered: opts.data.slice(),
      sortKey: null,
      sortDir: 1, // 1 asc, -1 desc
      page: 1,
      pageSize: opts.pageSize || 20,
      query: ''
    };

    function renderHead() {
      opts.theadEl.innerHTML = '<tr>' + opts.columns.map(c => {
        const sorted = state.sortKey === c.key ? 'sorted' : '';
        const ind = state.sortKey === c.key ? (state.sortDir === 1 ? '▲' : '▼') : '↕';
        return `<th data-key="${c.key}" class="${sorted}">${c.label}<span class="sort-ind">${ind}</span></th>`;
      }).join('') + '</tr>';
      opts.theadEl.querySelectorAll('th').forEach(th => {
        th.addEventListener('click', () => {
          const k = th.dataset.key;
          if (state.sortKey === k) state.sortDir *= -1;
          else { state.sortKey = k; state.sortDir = 1; }
          apply();
        });
      });
    }

    function renderBody() {
      const start = (state.page - 1) * state.pageSize;
      const rows = state.filtered.slice(start, start + state.pageSize);
      if (!rows.length) {
        opts.tbodyEl.innerHTML = `<tr><td colspan="${opts.columns.length}" class="empty">Sin resultados</td></tr>`;
        return;
      }
      opts.tbodyEl.innerHTML = rows.map(r =>
        `<tr data-id="${r.id}">` +
        opts.columns.map(c => `<td>${c.render ? c.render(r) : (r[c.key] ?? '—')}</td>`).join('') +
        `</tr>`
      ).join('');
      opts.tbodyEl.querySelectorAll('tr').forEach(tr => {
        tr.addEventListener('click', () => opts.onRowClick && opts.onRowClick(tr.dataset.id));
      });
    }

    function renderPagination() {
      const total = state.filtered.length;
      const pages = Math.max(1, Math.ceil(total / state.pageSize));
      if (state.page > pages) state.page = pages;
      opts.paginationEl.innerHTML = `
        <button class="btn btn-ghost" ${state.page === 1 ? 'disabled' : ''} data-act="prev">← Anterior</button>
        <span class="page-info">Página ${state.page} de ${pages} · ${total} resultados</span>
        <button class="btn btn-ghost" ${state.page === pages ? 'disabled' : ''} data-act="next">Siguiente →</button>
      `;
      opts.paginationEl.querySelectorAll('button').forEach(b => {
        b.addEventListener('click', () => {
          if (b.dataset.act === 'prev' && state.page > 1) state.page--;
          if (b.dataset.act === 'next' && state.page < pages) state.page++;
          renderBody(); renderPagination();
        });
      });
    }

    function apply() {
      const q = state.query.trim().toLowerCase();
      state.filtered = state.raw.filter(r => {
        if (!q) return true;
        const v = String(r[opts.searchField] || '').toLowerCase();
        return v.includes(q);
      });
      if (state.sortKey) {
        state.filtered.sort((a, b) => {
          const av = a[state.sortKey], bv = b[state.sortKey];
          if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * state.sortDir;
          return String(av || '').localeCompare(String(bv || ''), 'es', { numeric: true }) * state.sortDir;
        });
      }
      state.page = 1;
      renderHead(); renderBody(); renderPagination();
    }

    opts.searchEl.addEventListener('input', (e) => {
      state.query = e.target.value;
      apply();
    });

    apply();
    return { refresh: apply, state };
  };
})();
