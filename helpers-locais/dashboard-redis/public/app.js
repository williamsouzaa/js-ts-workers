// ── State ─────────────────────────────────────────────────────────────────
const state = {
  overview: null,
  activeGroup: null,
  view: 'home', // 'home' | 'group' | 'package'
}

// ── DOM refs ───────────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id)
const groupList    = $('groupList')
const content      = $('content')
const breadcrumb   = $('breadcrumb')
const searchInput  = $('searchInput')
const refreshBtn   = $('refreshBtn')
const modalOverlay  = $('modalOverlay')
const modalTitle    = $('modalTitle')
const modalBody     = $('modalBody')
const modalClose    = $('modalClose')
const clearBtn      = $('clearBtn')
const confirmOverlay = $('confirmOverlay')
const confirmCancel  = $('confirmCancel')
const confirmOk      = $('confirmOk')

// ── API ────────────────────────────────────────────────────────────────────
async function api(path) {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// ── Render helpers ─────────────────────────────────────────────────────────
function loader() {
  return `<div class="loader"><div class="spinner"></div> Carregando…</div>`
}

function setBreadcrumb(parts) {
  breadcrumb.innerHTML = parts
    .map((p, i) => {
      if (i === parts.length - 1) return `<span class="current">${p.label}</span>`
      return `<span data-action="${p.action}">${p.label}</span><span class="sep">/</span>`
    })
    .join('')

  breadcrumb.querySelectorAll('[data-action]').forEach(el => {
    el.addEventListener('click', () => {
      const [fn, ...args] = el.dataset.action.split(':')
      if (fn === 'overview') renderOverview()
      if (fn === 'group') renderGroup(decodeURIComponent(args.join(':')))
    })
  })
}

function eventCountPill(n) {
  if (n === 0) return `<span class="pill yellow">${n}</span>`
  if (n >= 50) return `<span class="pill green">${n}</span>`
  return `<span class="pill blue">${n}</span>`
}

// ── Overview (sidebar) ─────────────────────────────────────────────────────
async function loadOverview() {
  refreshBtn.classList.add('spinning')
  try {
    state.overview = await api('/api/overview')
    $('statGroups').textContent   = state.overview.totalGroups
    $('statPackages').textContent = state.overview.totalPackages
    $('statEvents').textContent   = state.overview.totalEvents
    renderGroupList(state.overview.groups)
  } catch (e) {
    groupList.innerHTML = `<div class="list-empty">Erro ao conectar no Redis.<br>${e.message}</div>`
  } finally {
    refreshBtn.classList.remove('spinning')
  }
}

function renderGroupList(groups) {
  const q = searchInput.value.toLowerCase()
  const filtered = q
    ? groups.filter(g => g.keyGroup.toLowerCase().includes(q))
    : groups

  if (filtered.length === 0) {
    groupList.innerHTML = `<div class="list-empty">Nenhum grupo encontrado.</div>`
    return
  }

  groupList.innerHTML = filtered.map(g => `
    <div class="group-item ${state.activeGroup === g.keyGroup ? 'active' : ''}" data-key="${g.keyGroup}">
      <div class="group-title">${g.module} · ${g.layoutCode}</div>
      <div class="group-meta">
        <span class="badge blue">${g.packages} pacote${g.packages !== 1 ? 's' : ''}</span>
        <span class="badge green">${g.events} evento${g.events !== 1 ? 's' : ''}</span>
      </div>
      <div class="group-tags">
        <span class="tag">CNPJ: ${g.cnpj}</span>
        <span class="tag">${g.year}/${String(g.month).padStart(2,'0')}</span>
      </div>
    </div>
  `).join('')

  groupList.querySelectorAll('.group-item').forEach(el => {
    el.addEventListener('click', () => renderGroup(el.dataset.key))
  })
}

// ── Group view ─────────────────────────────────────────────────────────────
async function renderGroup(keyGroup) {
  state.activeGroup = keyGroup
  state.view = 'group'
  renderGroupList(state.overview?.groups ?? [])

  content.innerHTML = loader()
  setBreadcrumb([
    { label: 'Visão geral', action: 'overview' },
    { label: keyGroup },
  ])

  try {
    const data = await api(`/api/group?keyGroup=${encodeURIComponent(keyGroup)}`)
    renderGroupContent(data)
  } catch (e) {
    content.innerHTML = `<div class="loader">Erro: ${e.message}</div>`
  }
}

function renderGroupContent(data) {
  const { keyGroup, module, layoutCode, cnpj, year, month, packages } = data

  content.innerHTML = `
    <div class="section-title">Grupo</div>
    <div class="info-grid">
      <div class="info-card"><div class="label">Módulo</div><div class="value blue">${module}</div></div>
      <div class="info-card"><div class="label">Layout</div><div class="value accent">${layoutCode}</div></div>
      <div class="info-card"><div class="label">CNPJ</div><div class="value" style="font-size:15px">${cnpj}</div></div>
      <div class="info-card"><div class="label">Competência</div><div class="value yellow">${year}/${String(month).padStart(2,'0')}</div></div>
      <div class="info-card"><div class="label">Pacotes</div><div class="value green">${packages.length}</div></div>
      <div class="info-card"><div class="label">Eventos total</div><div class="value">${packages.reduce((s,p)=>s+p.events,0)}</div></div>
    </div>

    <div class="section-title">Pacotes</div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Chave Redis</th>
            <th>Eventos</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${packages.length === 0
            ? `<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">Nenhum pacote.</td></tr>`
            : packages.map(p => `
              <tr>
                <td class="mono text-muted">${p.packageId}</td>
                <td class="mono" style="font-size:11px;max-width:400px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.key}</td>
                <td>${eventCountPill(p.events)}</td>
                <td><button class="btn" data-pkg="${p.packageId}" data-kg="${encodeURIComponent(keyGroup)}">Ver eventos</button></td>
              </tr>
            `).join('')
          }
        </tbody>
      </table>
    </div>
  `

  content.querySelectorAll('[data-pkg]').forEach(btn => {
    btn.addEventListener('click', () =>
      renderPackage(decodeURIComponent(btn.dataset.kg), btn.dataset.pkg)
    )
  })
}

// ── Package view ───────────────────────────────────────────────────────────
async function renderPackage(keyGroup, packageId) {
  state.view = 'package'
  content.innerHTML = loader()
  setBreadcrumb([
    { label: 'Visão geral', action: 'overview' },
    { label: keyGroup, action: `group:${encodeURIComponent(keyGroup)}` },
    { label: `Pacote #${packageId}` },
  ])

  try {
    const data = await api(`/api/package?keyGroup=${encodeURIComponent(keyGroup)}&packageId=${encodeURIComponent(packageId)}`)
    renderPackageContent(data)
  } catch (e) {
    content.innerHTML = `<div class="loader">Erro: ${e.message}</div>`
  }
}

function renderPackageContent(data) {
  const { keyGroup, packageId, key, events } = data

  content.innerHTML = `
    <div class="section-title">Pacote</div>
    <div class="info-grid">
      <div class="info-card"><div class="label">Package ID</div><div class="value accent">#${packageId}</div></div>
      <div class="info-card"><div class="label">Eventos</div><div class="value green">${events.length}</div></div>
      <div class="info-card" style="flex:1"><div class="label">Chave Redis</div><div class="value mono" style="font-size:11px;margin-top:6px;color:var(--text-muted)">${key}</div></div>
    </div>

    <div class="section-title">Eventos</div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Event ID</th>
            <th>idGov</th>
            <th>Competência</th>
            <th>CNPJ</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${events.length === 0
            ? `<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">Nenhum evento.</td></tr>`
            : events.map(e => {
                const ef = e.data?.entryDataString
                  ? (() => { try { return JSON.parse(e.data.entryDataString)?.event?.efinanceira } catch(_){return null} })()
                  : e.data?.event?.efinanceira
                const idGov = ef?.idGov ?? '—'
                const cnpj  = ef?.cnpjEmpresa ?? '—'
                const comp  = ef && ef.ano && ef.mes ? `${ef.ano}/${String(ef.mes).padStart(2,'0')}` : '—'
                return `
                  <tr>
                    <td class="mono" style="font-size:11px">${e.eventId}</td>
                    <td class="mono" style="font-size:11px">${idGov}</td>
                    <td>${comp}</td>
                    <td class="mono" style="font-size:11px">${cnpj}</td>
                    <td>
                      <button class="btn" data-event-idx="${events.indexOf(e)}">JSON</button>
                    </td>
                  </tr>
                `
              }).join('')
          }
        </tbody>
      </table>
    </div>
  `

  content.querySelectorAll('[data-event-idx]').forEach(btn => {
    btn.addEventListener('click', () => {
      const ev = events[Number(btn.dataset.eventIdx)]
      openModal(ev.eventId, JSON.stringify(ev.data, null, 2))
    })
  })
}

// ── Overview main content ──────────────────────────────────────────────────
function renderOverview() {
  state.activeGroup = null
  state.view = 'home'
  renderGroupList(state.overview?.groups ?? [])
  setBreadcrumb([{ label: 'Visão geral' }])

  if (!state.overview) { content.innerHTML = loader(); return }
  const { totalGroups, totalPackages, totalEvents, groups } = state.overview

  content.innerHTML = `
    <div class="section-title">Resumo</div>
    <div class="info-grid">
      <div class="info-card"><div class="label">Grupos</div><div class="value accent">${totalGroups}</div></div>
      <div class="info-card"><div class="label">Pacotes</div><div class="value blue">${totalPackages}</div></div>
      <div class="info-card"><div class="label">Eventos</div><div class="value green">${totalEvents}</div></div>
    </div>

    <div class="section-title">Todos os grupos</div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Módulo</th>
            <th>Layout</th>
            <th>CNPJ</th>
            <th>Competência</th>
            <th>Pacotes</th>
            <th>Eventos</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${groups.length === 0
            ? `<tr><td colspan="7" style="text-align:center;color:var(--text-muted)">Redis vazio.</td></tr>`
            : groups.map(g => `
              <tr>
                <td><span class="pill blue">${g.module}</span></td>
                <td class="mono">${g.layoutCode}</td>
                <td class="mono">${g.cnpj}</td>
                <td>${g.year}/${String(g.month).padStart(2,'0')}</td>
                <td>${eventCountPill(g.packages)}</td>
                <td>${eventCountPill(g.events)}</td>
                <td><button class="btn" data-kg="${encodeURIComponent(g.keyGroup)}">Abrir</button></td>
              </tr>
            `).join('')
          }
        </tbody>
      </table>
    </div>
  `

  content.querySelectorAll('[data-kg]').forEach(btn => {
    btn.addEventListener('click', () => renderGroup(decodeURIComponent(btn.dataset.kg)))
  })
}

// ── Modal ─────────────────────────────────────────────────────────────────
function openModal(title, body) {
  modalTitle.textContent = title
  modalBody.textContent  = body
  modalOverlay.classList.remove('hidden')
}
function closeModal() { modalOverlay.classList.add('hidden') }

modalClose.addEventListener('click', closeModal)
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal() })
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal() })

// ── Clear all ─────────────────────────────────────────────────────────────
clearBtn.addEventListener('click', () => confirmOverlay.classList.remove('hidden'))
confirmCancel.addEventListener('click', () => confirmOverlay.classList.add('hidden'))
confirmOverlay.addEventListener('click', (e) => { if (e.target === confirmOverlay) confirmOverlay.classList.add('hidden') })

confirmOk.addEventListener('click', async () => {
  confirmOk.disabled = true
  confirmOk.textContent = 'Limpando…'
  try {
    const res = await fetch('/api/clear', { method: 'POST' })
    const { deleted } = await res.json()
    confirmOverlay.classList.add('hidden')
    state.activeGroup = null
    state.view = 'home'
    await loadOverview()
    renderOverview()
    console.log(`[clear] ${deleted} chaves removidas`)
  } catch (e) {
    alert('Erro ao limpar: ' + e.message)
  } finally {
    confirmOk.disabled = false
    confirmOk.textContent = 'Limpar tudo'
  }
})

// ── Events ─────────────────────────────────────────────────────────────────
refreshBtn.addEventListener('click', async () => {
  await loadOverview()
  if (state.view === 'home') renderOverview()
  else if (state.view === 'group' && state.activeGroup) renderGroup(state.activeGroup)
})

searchInput.addEventListener('input', () => {
  if (state.overview) renderGroupList(state.overview.groups)
})

// ── Init ───────────────────────────────────────────────────────────────────
;(async () => {
  setBreadcrumb([{ label: 'Visão geral' }])
  content.innerHTML = loader()
  await loadOverview()
  renderOverview()
})()
