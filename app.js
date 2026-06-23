'use strict';

/* ─── Default data ───────────────────────────────── */
const DEFAULT_DATA = {
  empresas: ['AiFink Lab SL', 'Inmensia', 'Capital4Trade', 'SL Propia', 'Personal', 'Holding'],
  personas: ['Jonatan', 'Ernesto', 'Equipo', 'Externo'],
  estrategias: [
    { id: 'e1', nombre: 'Estrat. 1', empresa: 'AiFink Lab SL', responsable: 'Jonatan', estado: 'Descartado', fecha: '2026-06-10', detalle: '' },
    { id: 'e2', nombre: 'Estrat. 2', empresa: 'Inmensia',      responsable: 'Ernesto', estado: 'Descartado', fecha: '2026-06-10', detalle: '' },
    { id: 'e3', nombre: 'Estrat. 3', empresa: '',              responsable: '',        estado: '',           fecha: '',           detalle: '' },
  ],
  proyectos: [
    { id: 'p1', estrategia: 'e1', nombre: 'Proyecto 1',          empresa: 'AiFink Lab SL', responsable: 'Jonatan', fechaInicio: '2026-01-30', fechaFin: '2026-02-13', descripcion: 'Adquisición de participaciones en gestorías de fincas', estado: 'Planificación', prioridad: 'Alta' },
    { id: 'p2', estrategia: 'e1', nombre: 'Proyecto 2',          empresa: 'AiFink Lab SL', responsable: 'Ernesto', fechaInicio: '2026-01-30', fechaFin: '2026-09-10', descripcion: 'Financiación logística para exportadores', estado: 'En Pausa', prioridad: 'Media' },
    { id: 'p3', estrategia: 'e1', nombre: 'Proyecto 3',          empresa: 'AiFink Lab SL', responsable: 'Jonatan', fechaInicio: '2026-01-30', fechaFin: '2026-09-11', descripcion: 'Optimización fiscal vía SL unipersonal + dividendos', estado: 'En Pausa', prioridad: 'Alta' },
    { id: 'p4', estrategia: 'e2', nombre: 'Proyecto 4 Inmensia', empresa: 'Inmensia',      responsable: 'Jonatan', fechaInicio: '2026-03-15', fechaFin: '2026-07-25', descripcion: 'Canal de educación financiera en español', estado: 'En Curso', prioridad: 'Media' },
  ],
  tareas: [
    { id: 't1', proyecto: 'p3', nombre: 'Tarea 1', asignada: 'Externo', fechaInicio: '2026-06-10', fechaFin: '2027-01-01', estado: 'Cerrado',       prioridad: 'Alta',  comentarios: 'Hacer seguimiento' },
    { id: 't2', proyecto: 'p1', nombre: 'Tarea 2', asignada: 'Equipo',  fechaInicio: '2026-05-13', fechaFin: '2026-05-13', estado: 'En Curso',      prioridad: 'Alta',  comentarios: 'Volcar datos' },
    { id: 't3', proyecto: 'p3', nombre: 'Tarea 3', asignada: 'Ernesto', fechaInicio: '2026-01-30', fechaFin: '2026-09-21', estado: 'En Curso',      prioridad: 'Media', comentarios: 'Esperar respuesta' },
    { id: 't4', proyecto: 'p4', nombre: 'Tarea 7', asignada: 'Externo', fechaInicio: '2026-02-23', fechaFin: '2026-08-15', estado: 'Planificación', prioridad: 'Media', comentarios: '' },
  ],
};

/* ─── State ──────────────────────────────────────── */
let data = JSON.parse(JSON.stringify(DEFAULT_DATA));
let expanded = {};
let currentTab = 'dashboard';
let modalMeta = {};
let chartProyectos = null;
let chartTareas    = null;
let chartEmpresas  = null;

/* ─── Firebase ───────────────────────────────────── */
const FIREBASE_CONFIG = {




  apiKey:            "AIzaSyCdcl1rxrFsKHtXis92fGAcNh_Tcbqwqic",
  authDomain:        "moore-market-e1476.firebaseapp.com",
  databaseURL:       "https://moore-market-e1476-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:         "moore-market-e1476",
  storageBucket:     "moore-market-e1476.firebasestorage.app",
  messagingSenderId: "809848515211",
  appId:             "1:809848515211:web:2d702f4ca8aff55523028e",
};

let fbDB = null;
let fbRef = null;
let fbConnected = false;

async function initFirebase() {
  try {
    const { initializeApp, getDatabase, ref, set, onValue } = window.__firebaseReady || {};
    if (!initializeApp) { console.warn('Firebase SDK no cargado'); return; }
    if (FIREBASE_CONFIG.apiKey === 'TU_API_KEY') {
      console.warn('⚠ Firebase no configurado — usando localStorage');
      showToast('⚠ Modo local: configura Firebase para sincronizar');
      return;
    }
    const app = initializeApp(FIREBASE_CONFIG);
    fbDB = getDatabase(app);
    fbRef = ref(fbDB, 'holding-data');
    fbConnected = true;

    // Escucha cambios en tiempo real
    onValue(fbRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        data = val;
        render();
      }
    });
  } catch(e) {
    console.error('Firebase error:', e);
  }
}

const STORAGE_KEY = 'holding-tracker-v2';

/* ─── Persistence ────────────────────────────────── */
function loadData() {
  // Firebase cargará los datos vía onValue; localStorage como fallback
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && !fbConnected) {
      data = JSON.parse(raw);
    } else if (!fbConnected) {
      // Seed data preloaded
      const seed = {"empresas":["Moretamar Inversiones","Grupo Moore 2019","Grupo Moore Market","Yumgu International Group","Serfisan","Serfisit","Aifink Lab","Moore Capital Partners","Inmensia Gestion","VGL Investments"],"personas":["Equipo","Mariano","Victor","Jonatan","Albert","Adrian","Mar","Arthur","Juan Carlos","Mario"],"estrategias":[{"id":"_62y8jjt","nombre":"DESARROLLO DE NEGOCIO (Moore Capital Partners)","empresa":"Moore Capital Partners","responsable":"Mariano","estado":"En Curso","fecha":"2026-06-18","detalle":""},{"id":"_etf3199","nombre":"DESARROLLO DE NEGOCIO (Grupo Moore Market)","empresa":"Grupo Moore Market","responsable":"Mariano","estado":"En Curso","fecha":"2026-06-18","detalle":""},{"id":"_ly30g5m","nombre":"DESARROLLO DE NEGOCIO (Yumgu Internacional Group)","empresa":"Yumgu International Group","responsable":"Mariano","estado":"En Curso","fecha":"2026-06-18","detalle":""},{"id":"_x8ykogy","nombre":"DESARROLLO DE NEGOCIO (Serfisan)","empresa":"Serfisan","responsable":"Mariano","estado":"En Curso","fecha":"2026-06-18","detalle":""},{"id":"_ihdymq0","nombre":"DESARROLLO DE NEGOCIO (Serfisit)","empresa":"Serfisit","responsable":"Mariano","estado":"En Curso","fecha":"2026-06-18","detalle":""},{"id":"_2g5md3i","nombre":"DESARROLLO DE NEGOCIO (Aifink)","empresa":"Aifink Lab","responsable":"Mariano","estado":"En Curso","fecha":"2026-06-18","detalle":""},{"id":"_v1rks3c","nombre":"DESARROLLO DE NEGOCIO (Inmensia Gestión)","empresa":"Inmensia Gestion","responsable":"Mariano","estado":"En Curso","fecha":"2026-06-18","detalle":""},{"id":"_bi8czkn","nombre":"DESARROLLO DE NEGOCIO (VGL Investments)","empresa":"VGL Investments","responsable":"Mariano","estado":"En Curso","fecha":"2026-06-18","detalle":""}],"proyectos":[{"id":"_t29uscs","nombre":"MIRAZUR","estrategia":"_62y8jjt","empresa":"Moore Capital Partners","responsable":"Mariano","estado":"En Curso","prioridad":"Alta","fechaInicio":"2026-06-18","fechaFin":"2026-12-31","descripcion":""},{"id":"_075n6vi","nombre":"Rock Museum","estrategia":"_62y8jjt","empresa":"Moore Capital Partners","responsable":"Mariano","estado":"En Curso","prioridad":"Baja","fechaInicio":"2026-06-18","fechaFin":"2026-12-31","descripcion":""},{"id":"_3bfqt1s","nombre":"Activo Santa Maria","estrategia":"_62y8jjt","empresa":"Moore Capital Partners","responsable":"Mariano","estado":"En Curso","prioridad":"Media","fechaInicio":"2026-06-18","fechaFin":"2026-12-31","descripcion":""},{"id":"_kmqnk1i","nombre":"Pisos Venta Juanjo","estrategia":"_62y8jjt","empresa":"Moore Capital Partners","responsable":"Mariano","estado":"En Curso","prioridad":"Media","fechaInicio":"2026-06-18","fechaFin":"2026-12-31","descripcion":""},{"id":"_atlb3ad","nombre":"Adequita (Josep Adsera)","estrategia":"_62y8jjt","empresa":"Moore Capital Partners","responsable":"Mariano","estado":"En Curso","prioridad":"Alta","fechaInicio":"2026-06-18","fechaFin":"2026-12-31","descripcion":""}],"tareas":[{"id":"_3r1ubzg","nombre":"Proyecto Eficiencia","proyecto":"_atlb3ad","asignada":"Jonatan","estado":"Cerrado","prioridad":"Alta","fechaInicio":"2026-06-18","fechaFin":"2026-12-31","comentarios":"Eficiencia constante. Configurar Claude conjunto grupo Moore Market"},{"id":"_h6nvx4q","nombre":"LBO 40M ADEQUITA","proyecto":"_atlb3ad","asignada":"Mariano","estado":"En Curso","prioridad":"Alta","fechaInicio":"2026-06-18","fechaFin":"2026-12-31","comentarios":""}]};
      data = seed;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch(e) {}
    }
  } catch(e) {}
}

async function saveData() {
  // Guardar en localStorage siempre (offline fallback)
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch(e) {}
  // Guardar en Firebase si está conectado
  if (fbConnected && fbDB && fbRef) {
    try {
      const { set } = window.__firebaseReady || {};
      if (set) await set(fbRef, data);
    } catch(e) { console.error('Firebase save error:', e); }
  }
}

/* ─── Utils ──────────────────────────────────────── */
function uid() { return '_' + Math.random().toString(36).slice(2,9); }

function esc(s) {
  return String(s||'')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function fmtDate(d) {
  if (!d) return '';
  try {
    return new Date(d+'T00:00:00').toLocaleDateString('es-ES',{day:'2-digit',month:'2-digit',year:'2-digit'});
  } catch(e) { return d; }
}

function isVencido(fechaFin, estado) {
  if (!fechaFin || estado==='Cerrado' || estado==='Descartado') return false;
  return new Date(fechaFin+'T00:00:00') < new Date();
}

function statusClass(s) {
  return { 'En Curso':'s-en-curso','En Pausa':'s-en-pausa','Planificación':'s-planificacion','Cerrado':'s-cerrado','Descartado':'s-descartado' }[s] || '';
}

function calcAvance(proyId) {
  const ts = data.tareas.filter(t=>t.proyecto===proyId);
  if (!ts.length) return 0;
  return Math.round(ts.filter(t=>t.estado==='Cerrado').length / ts.length * 100);
}

function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2500);
}

/* ─── Empresa filter sync ────────────────────────── */
function syncEmpresaFilters() {
  ['filter-empresa-dash','filter-empresa','filt-e-empresa','filt-p-empresa'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const cur = sel.value;
    sel.innerHTML = '<option value="">Todas las empresas</option>' +
      data.empresas.map(e=>`<option value="${esc(e)}"${cur===e?' selected':''}>${esc(e)}</option>`).join('');
  });
  // sync persona filters
  ['filt-e-responsable','filt-p-responsable','filt-t-responsable'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const cur = sel.value;
    sel.innerHTML = '<option value="">Todos los responsables</option>' +
      data.personas.map(p=>`<option value="${esc(p)}"${cur===p?' selected':''}>${esc(p)}</option>`).join('');
  });
}

/* ─── Dashboard: KPI cards ───────────────────────── */
function renderKPI() {
  const ps = data.proyectos;
  const ts = data.tareas;
  const emp = (document.getElementById('filter-empresa-dash')||{}).value||'';

  const filtPs = emp ? ps.filter(p=>p.empresa===emp) : ps;
  const filtTs = emp ? ts.filter(t=>{
    const p = ps.find(p=>p.id===t.proyecto);
    return p && p.empresa===emp;
  }) : ts;

  const activos   = filtPs.filter(p=>p.estado==='En Curso').length;
  const vencidos  = filtPs.filter(p=>isVencido(p.fechaFin,p.estado)).length;
  const tEnCurso  = filtTs.filter(t=>t.estado==='En Curso').length;
  const tVencidas = filtTs.filter(t=>isVencido(t.fechaFin,t.estado)).length;
  const estratAll = data.estrategias.filter(e=>e.nombre&&e.estado!=='Descartado');
  const estratAct = emp ? estratAll.filter(e=>e.empresa===emp).length : estratAll.length;
  const avanceTotal = filtPs.length ? Math.round(filtPs.reduce((acc,p)=>acc+calcAvance(p.id),0)/filtPs.length) : 0;

  document.getElementById('kpi-grid').innerHTML = `
    <div class="kpi-card kpi-purple kpi-clickable" data-kpi-goto="proyectos" data-kpi-filter="En Curso" title="Ver proyectos en curso">
      <div class="kpi-label">Proyectos activos</div>
      <div class="kpi-val">${activos}</div>
      <div class="kpi-sub">${vencidos>0?`<span class="kpi-warn">⚠ ${vencidos} vencidos</span>`:`de ${filtPs.length} total`}</div>
    </div>
    <div class="kpi-card kpi-teal kpi-clickable" data-kpi-goto="tareas" data-kpi-filter="En Curso" title="Ver tareas en curso">
      <div class="kpi-label">Tareas en curso</div>
      <div class="kpi-val">${tEnCurso}</div>
      <div class="kpi-sub">${tVencidas>0?`<span class="kpi-warn">⚠ ${tVencidas} vencidas</span>`:`de ${filtTs.length} total`}</div>
    </div>
    <div class="kpi-card kpi-amber kpi-clickable" data-kpi-goto="estrategias" title="Ver estrategias">
      <div class="kpi-label">Estrategias activas</div>
      <div class="kpi-val">${estratAct}</div>
      <div class="kpi-sub">${data.estrategias.filter(e=>e.nombre).length} totales</div>
    </div>
    <div class="kpi-card kpi-blue kpi-clickable" data-kpi-goto="proyectos" title="Ver todos los proyectos">
      <div class="kpi-label">Avance medio</div>
      <div class="kpi-val">${avanceTotal}%</div>
      <div class="kpi-sub">${data.empresas.length} empresas</div>
    </div>`;

  document.querySelectorAll('.kpi-clickable').forEach(card => {
    card.addEventListener('click', () => {
      const goto   = card.dataset.kpiGoto;
      const filter = card.dataset.kpiFilter || '';
      if (goto === 'estrategias') {
        switchTab('estrategia');
      } else {
        switchTab('tree');
        setTimeout(() => {
          const selEst = document.getElementById('filter-estado');
          if (selEst && filter) { selEst.value = filter; }
          renderTree();
        }, 50);
      }
    });
  });
}

/* ─── Dashboard: summary tables ─────────────────── */
function renderDashTables() {
  const emp = (document.getElementById('filter-empresa-dash')||{}).value||'';
  const ps  = emp ? data.proyectos.filter(p=>p.empresa===emp) : data.proyectos;
  const ts  = data.tareas.filter(t=>{
    if (!emp) return true;
    const p = data.proyectos.find(p=>p.id===t.proyecto);
    return p && p.empresa===emp;
  });
  const esAll = data.estrategias.filter(e=>e.nombre);
  const es = emp ? esAll.filter(e=>e.empresa===emp) : esAll;

  /* Estrategia */
  const eCurso  = es.filter(e=>e.estado&&e.estado!=='Descartado').length;
  const eDesc   = es.filter(e=>e.estado==='Descartado').length;
  const eVacias = es.filter(e=>!e.estado).length;
  document.getElementById('dash-estrategia-table').innerHTML = `
    <div class="sum-list">
      <div class="sum-row sum-clickable" data-goto="estrategia" data-estado="En Curso"><span class="sum-row-label"><span class="sum-dot c-teal"></span>Activas</span><span class="sum-row-num c-teal">${eCurso}</span></div>
      <div class="sum-row sum-clickable" data-goto="estrategia" data-estado=""><span class="sum-row-label"><span class="sum-dot c-blue"></span>Aprobadas</span><span class="sum-row-num c-blue">0</span></div>
      <div class="sum-row sum-clickable" data-goto="estrategia" data-estado=""><span class="sum-row-label"><span class="sum-dot c-amber"></span>En revisión</span><span class="sum-row-num c-amber">${eVacias}</span></div>
      <div class="sum-row sum-clickable" data-goto="estrategia" data-estado=""><span class="sum-row-label"><span class="sum-dot c-gray"></span>Por revisar</span><span class="sum-row-num c-gray">0</span></div>
      <div class="sum-row sum-clickable" data-goto="estrategia" data-estado="Descartado"><span class="sum-row-label"><span class="sum-dot c-red"></span>Descartadas</span><span class="sum-row-num c-red">${eDesc}</span></div>
      <div class="sum-total">${es.length} estrategias${emp?' en '+emp:' en total'} · ${eDesc} descartadas</div>
    </div>`;

  /* Proyectos */
  const pCurso = ps.filter(p=>p.estado==='En Curso').length;
  const pPausa = ps.filter(p=>p.estado==='En Pausa').length;
  const pPlan  = ps.filter(p=>p.estado==='Planificación').length;
  const pCerr  = ps.filter(p=>p.estado==='Cerrado').length;
  const pVenc  = ps.filter(p=>isVencido(p.fechaFin,p.estado)).length;
  document.getElementById('dash-proyectos-table').innerHTML = `
    <div class="sum-list">
      <div class="sum-row sum-clickable" data-goto="proyectos" data-estado="En Curso"><span class="sum-row-label"><span class="sum-dot c-teal"></span>En Curso</span><span class="sum-row-num c-teal">${pCurso}</span></div>
      <div class="sum-row sum-clickable" data-goto="proyectos" data-estado="En Pausa"><span class="sum-row-label"><span class="sum-dot c-amber"></span>En Pausa</span><span class="sum-row-num c-amber">${pPausa}</span></div>
      <div class="sum-row sum-clickable" data-goto="proyectos" data-estado="Planificación"><span class="sum-row-label"><span class="sum-dot c-blue"></span>Planificación</span><span class="sum-row-num c-blue">${pPlan}</span></div>
      <div class="sum-row sum-clickable" data-goto="proyectos" data-estado="Cerrado"><span class="sum-row-label"><span class="sum-dot c-green"></span>Cerrado</span><span class="sum-row-num c-green">${pCerr}</span></div>
      <div class="sum-row sum-clickable" data-goto="proyectos" data-estado="__vencido__"><span class="sum-row-label"><span class="sum-dot c-red"></span>⚠ Vencidos</span><span class="sum-row-num c-red">${pVenc}</span></div>
      <div class="sum-total">${ps.length} proyectos en total</div>
    </div>`;

  /* Tareas */
  const tCurso = ts.filter(t=>t.estado==='En Curso').length;
  const tPausa = ts.filter(t=>t.estado==='En Pausa').length;
  const tPlan  = ts.filter(t=>t.estado==='Planificación').length;
  const tCerr  = ts.filter(t=>t.estado==='Cerrado').length;
  const tVenc  = ts.filter(t=>isVencido(t.fechaFin,t.estado)).length;
  document.getElementById('dash-tareas-table').innerHTML = `
    <div class="sum-list">
      <div class="sum-row sum-clickable" data-goto="tareas" data-estado="En Curso"><span class="sum-row-label"><span class="sum-dot c-teal"></span>En Curso</span><span class="sum-row-num c-teal">${tCurso}</span></div>
      <div class="sum-row sum-clickable" data-goto="tareas" data-estado="En Pausa"><span class="sum-row-label"><span class="sum-dot c-amber"></span>En Pausa</span><span class="sum-row-num c-amber">${tPausa}</span></div>
      <div class="sum-row sum-clickable" data-goto="tareas" data-estado="Planificación"><span class="sum-row-label"><span class="sum-dot c-blue"></span>Planificación</span><span class="sum-row-num c-blue">${tPlan}</span></div>
      <div class="sum-row sum-clickable" data-goto="tareas" data-estado="Cerrado"><span class="sum-row-label"><span class="sum-dot c-green"></span>Cerrado</span><span class="sum-row-num c-green">${tCerr}</span></div>
      <div class="sum-row sum-clickable" data-goto="tareas" data-estado="__vencido__"><span class="sum-row-label"><span class="sum-dot c-red"></span>⚠ Vencidas</span><span class="sum-row-num c-red">${tVenc}</span></div>
      <div class="sum-total">${ts.length} tareas en total</div>
    </div>`;

  /* Wire table cell clicks — navigate with filter pre-applied */
  document.querySelectorAll('.sum-clickable').forEach(cell => {
    cell.addEventListener('click', () => {
      const tab    = cell.dataset.goto;
      const estado = cell.dataset.estado || '';
      // Set the right filter selector for each tab
      if (tab === 'estrategia') {
        const sel = document.getElementById('filt-e-estado');
        if (sel) sel.value = estado;
      } else if (tab === 'proyectos') {
        const selE = document.getElementById('filt-p-estado');
        if (selE) selE.value = (estado === '__vencido__') ? '' : estado;
      } else if (tab === 'tareas') {
        const selE = document.getElementById('filt-t-estado');
        if (selE) selE.value = (estado === '__vencido__') ? '' : estado;
      }
      switchTab(tab);
    });
  });
}

/* ─── Dashboard: charts ──────────────────────────── */
const CHART_COLORS = {
  'En Curso':      '#A07EC8',   /* violeta suave — morado AiFink */
  'En Pausa':      '#D47AB0',   /* rosa/fucsia tenue */
  'Planificación': '#6BAED4',   /* azul suave */
  'Cerrado':       '#5BB8C0',   /* cyan/teal suave */
  'Descartado':    '#B0AABF',   /* gris lavanda */
};

function destroyChart(ref) { if (ref) { try { ref.destroy(); } catch(e){} } return null; }

function buildDonut(canvasId, counts) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  const labels = Object.keys(counts).filter(k=>counts[k]>0);
  const values = labels.map(k=>counts[k]);
  const colors = labels.map(k=>CHART_COLORS[k]||'#aaa');
  const total  = values.reduce((a,b)=>a+b,0);

  return new Chart(canvas, {
    type: 'doughnut',
    data: { labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 2, borderColor: '#fff', hoverOffset: 6 }] },
    options: {
      cutout: '68%',
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.raw} (${total ? Math.round(ctx.raw/total*100) : 0}%)`
          }
        }
      }
    }
  });
}

function buildLegend(containerId, counts) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const labels = Object.keys(counts).filter(k=>counts[k]>0);
  const total  = labels.reduce((a,k)=>a+counts[k],0);
  el.innerHTML = labels.map(k=>`
    <span class="legend-item">
      <span class="legend-dot" style="background:${CHART_COLORS[k]||'#aaa'}"></span>
      ${esc(k)}: <strong>${counts[k]}</strong> (${total?Math.round(counts[k]/total*100):0}%)
    </span>`).join('');
}

function buildBarChart(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  const empresas = data.empresas;
  const estados = ['En Curso', 'En Pausa', 'Planificación'];
  const stateColors = { 'En Curso': '#A07EC8', 'En Pausa': '#D47AB0', 'Planificación': '#6BAED4' };

  const datasets = estados.map(est => ({
    label: est,
    data: empresas.map(emp => data.proyectos.filter(p=>p.empresa===emp&&p.estado===est).length),
    backgroundColor: stateColors[est],
    borderRadius: 4,
    borderSkipped: false,
  }));

  const maxVal = Math.max(...empresas.map(emp => data.proyectos.filter(p=>p.empresa===emp&&estados.includes(p.estado)).length), 1);

  return new Chart(canvas, {
    type: 'bar',
    data: { labels: empresas, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'bottom', labels: { font:{size:11}, color:'#5C5B60', boxWidth:12, padding:12 } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.raw}` } }
      },
      scales: {
        y: { beginAtZero: true, stacked: true, max: maxVal+1, ticks: { stepSize: 1, color: '#9B9A9E', font:{size:11} }, grid: { color: '#E2E0DA' } },
        x: { stacked: true, ticks: { color: '#5C5B60', font:{size:11} }, grid: { display: false } }
      }
    }
  });
}

function renderCharts() {
  const emp = (document.getElementById('filter-empresa-dash')||{}).value||'';
  const ps = emp ? data.proyectos.filter(p=>p.empresa===emp) : data.proyectos;
  const ts = data.tareas.filter(t=>{
    if (!emp) return true;
    const p = data.proyectos.find(p=>p.id===t.proyecto);
    return p && p.empresa===emp;
  });

  const pCounts = { 'En Curso':0,'En Pausa':0,'Planificación':0,'Cerrado':0 };
  ps.forEach(p=>{ if (pCounts[p.estado]!==undefined) pCounts[p.estado]++; });

  const tCounts = { 'En Curso':0,'En Pausa':0,'Planificación':0,'Cerrado':0 };
  ts.forEach(t=>{ if (tCounts[t.estado]!==undefined) tCounts[t.estado]++; });

  chartProyectos = destroyChart(chartProyectos);
  chartTareas    = destroyChart(chartTareas);
  chartEmpresas  = destroyChart(chartEmpresas);

  chartProyectos = buildDonut('chart-proyectos', pCounts);
  buildLegend('legend-proyectos', pCounts);

  chartTareas    = buildDonut('chart-tareas', tCounts);
  buildLegend('legend-tareas', tCounts);

  chartEmpresas  = buildBarChart('chart-empresas');
}

/* ─── Tree ───────────────────────────────────────── */
function getFilters() {
  return {
    emp: (document.getElementById('filter-empresa')||{}).value||'',
    est: (document.getElementById('filter-estado')||{}).value||'',
  };
}

function renderTree() {
  const root = document.getElementById('tree-root');
  if (!root) return;
  const { emp, est } = getFilters();
  let html = '';

  data.estrategias.forEach(e => {
    if (!e.nombre) return;
    const proys = data.proyectos.filter(p=>p.estrategia===e.id);
    const filtP = proys.filter(p=>(!emp||p.empresa===emp)&&(!est||p.estado===est));
    const eMatch = (!emp||e.empresa===emp)&&(!est||e.estado===est);
    if (!eMatch && !filtP.length) return;

    const eKey  = 'e_'+e.id;
    const eOpen = expanded[eKey]!==false;

    html += `<div class="tree-row strategy">
      <div class="row-header" data-toggle="${eKey}">
        <span class="row-toggle ${eOpen?'open':'closed'}"><i class="ti ti-chevron-down" aria-hidden="true"></i></span>
        <i class="ti ti-target row-icon" style="color:var(--purple)" aria-hidden="true"></i>
        <span class="row-name">${esc(e.nombre)}</span>
        <span class="row-meta">
          ${e.empresa?`<span class="bdg bdg-empresa">${esc(e.empresa)}</span>`:''}
          ${e.responsable?`<span class="bdg bdg-resp">${esc(e.responsable)}</span>`:''}
          ${e.estado?`<span class="bdg ${statusClass(e.estado)}">${esc(e.estado)}</span>`:''}
          <div class="row-actions">
            <button class="row-act-btn" data-edit-e="${e.id}" title="Editar"><i class="ti ti-edit" aria-hidden="true"></i></button>
            <button class="row-act-btn del" data-del-e="${e.id}" title="Eliminar"><i class="ti ti-trash" aria-hidden="true"></i></button>
          </div>
        </span>
      </div>`;

    if (eOpen) {
      html += `<div class="tree-children">`;
      if (!filtP.length) html += `<div class="empty-sub">Sin proyectos vinculados a esta estrategia.</div>`;

      filtP.forEach(p => {
        const tareas  = data.tareas.filter(t=>t.proyecto===p.id);
        const filtT   = tareas.filter(t=>!est||t.estado===est);
        const pKey    = 'p_'+p.id;
        const pOpen   = expanded[pKey]!==false;
        const avance  = calcAvance(p.id);
        const venc    = isVencido(p.fechaFin,p.estado);

        html += `<div class="tree-row project">
          <div class="row-header" data-toggle="${pKey}">
            <span class="row-toggle ${pOpen?'open':'closed'}"><i class="ti ti-chevron-down" aria-hidden="true"></i></span>
            <i class="ti ti-clipboard-list row-icon" style="color:var(--teal)" aria-hidden="true"></i>
            <span class="row-name">${esc(p.nombre)}</span>
            <span class="row-meta">
              ${p.empresa?`<span class="bdg bdg-empresa">${esc(p.empresa)}</span>`:''}
              ${p.responsable?`<span class="bdg bdg-resp">${esc(p.responsable)}</span>`:''}
              ${p.prioridad?`<span class="bdg bdg-prio">${esc(p.prioridad)}</span>`:''}
              ${p.estado?`<span class="bdg ${statusClass(p.estado)}">${esc(p.estado)}</span>`:''}
              ${venc?`<span class="bdg s-vencido">⚠ Vencido</span>`:''}
              ${p.fechaFin?`<span class="bdg bdg-date">${fmtDate(p.fechaFin)}</span>`:''}
              <div class="row-actions">
                <button class="row-act-btn" data-add-task="${p.id}" title="Nueva tarea"><i class="ti ti-plus" aria-hidden="true"></i></button>
                <button class="row-act-btn" data-edit-p="${p.id}" title="Editar"><i class="ti ti-edit" aria-hidden="true"></i></button>
                <button class="row-act-btn del" data-del-p="${p.id}" title="Eliminar"><i class="ti ti-trash" aria-hidden="true"></i></button>
              </div>
            </span>
          </div>
          ${avance>0?`<div class="progress-bar"><div class="progress-fill" style="width:${avance}%"></div></div>`:''}`;

        if (pOpen) {
          html += `<div class="tree-children">`;
          if (!filtT.length) html += `<div class="empty-sub">Sin tareas${tareas.length?` que coincidan con el filtro`:` — usa + para añadir`}.</div>`;
          filtT.forEach(t => {
            const tv = isVencido(t.fechaFin,t.estado);
            html += `<div class="tree-row task">
              <div class="row-header">
                <span class="row-toggle" style="visibility:hidden"><i class="ti ti-chevron-down"></i></span>
                <i class="ti ti-checkbox row-icon" style="color:#E09030" aria-hidden="true"></i>
                <span class="row-name">${esc(t.nombre)}</span>
                <span class="row-meta">
                  ${t.asignada?`<span class="bdg bdg-resp">${esc(t.asignada)}</span>`:''}
                  ${t.prioridad?`<span class="bdg bdg-prio">${esc(t.prioridad)}</span>`:''}
                  ${t.estado?`<span class="bdg ${statusClass(t.estado)}">${esc(t.estado)}</span>`:''}
                  ${tv?`<span class="bdg s-vencido">⚠ Vencida</span>`:''}
                  ${t.fechaFin?`<span class="bdg bdg-date">${fmtDate(t.fechaFin)}</span>`:''}
                  <div class="row-actions">
                    <button class="row-act-btn" data-edit-t="${t.id}" title="Editar"><i class="ti ti-edit" aria-hidden="true"></i></button>
                    <button class="row-act-btn del" data-del-t="${t.id}" title="Eliminar"><i class="ti ti-trash" aria-hidden="true"></i></button>
                  </div>
                </span>
              </div>
            </div>`;
          });
          html += `</div>`;
        }
        html += `</div>`;
      });
      html += `</div>`;
    }
    html += `</div>`;
  });

  if (!html) html = `<div class="empty-state">No hay datos. Usa los botones del panel izquierdo para crear estrategias, proyectos y tareas.</div>`;
  root.innerHTML = html;

  root.querySelectorAll('[data-toggle]').forEach(el => {
    el.addEventListener('click', ev => {
      if (ev.target.closest('[data-edit-e],[data-del-e],[data-edit-p],[data-del-p],[data-add-task],[data-edit-t],[data-del-t]')) return;
      const k = el.dataset.toggle;
      expanded[k] = expanded[k]===false ? true : false;
      renderTree();
    });
  });
  root.querySelectorAll('[data-edit-e]').forEach(b=>b.addEventListener('click',ev=>{ev.stopPropagation();openModal('estrategia',b.dataset.editE);}));
  root.querySelectorAll('[data-del-e]').forEach(b=>b.addEventListener('click',ev=>{ev.stopPropagation();confirmDelete('estrategia',b.dataset.delE);}));
  root.querySelectorAll('[data-edit-p]').forEach(b=>b.addEventListener('click',ev=>{ev.stopPropagation();openModal('proyecto',b.dataset.editP);}));
  root.querySelectorAll('[data-del-p]').forEach(b=>b.addEventListener('click',ev=>{ev.stopPropagation();confirmDelete('proyecto',b.dataset.delP);}));
  root.querySelectorAll('[data-add-task]').forEach(b=>b.addEventListener('click',ev=>{ev.stopPropagation();openModal('tarea',null,b.dataset.addTask);}));
  root.querySelectorAll('[data-edit-t]').forEach(b=>b.addEventListener('click',ev=>{ev.stopPropagation();openModal('tarea',b.dataset.editT);}));
  root.querySelectorAll('[data-del-t]').forEach(b=>b.addEventListener('click',ev=>{ev.stopPropagation();confirmDelete('tarea',b.dataset.delT);}));
}

/* ─── Proyectos tab ──────────────────────────────── */
function renderProyectosTab() {
  const el = document.getElementById('proyectos-list');
  if (!el) return;
  const fEmp  = (document.getElementById('filt-p-empresa')||{}).value||'';
  const fResp = (document.getElementById('filt-p-responsable')||{}).value||'';
  const fEst  = (document.getElementById('filt-p-estado')||{}).value||'';
  const fPrio = (document.getElementById('filt-p-prioridad')||{}).value||'';
  let ps = data.proyectos;
  if (fEmp)  ps = ps.filter(p=>p.empresa===fEmp);
  if (fResp) ps = ps.filter(p=>p.responsable===fResp);
  if (fEst)  ps = ps.filter(p=>p.estado===fEst);
  if (fPrio) ps = ps.filter(p=>p.prioridad===fPrio);
  if (!ps.length) { el.innerHTML='<div class="empty-state">No hay proyectos que coincidan.</div>'; return; }
  el.innerHTML = ps.map(p => {
    const est = data.estrategias.find(e=>e.id===p.estrategia);
    const avance = calcAvance(p.id);
    const venc = isVencido(p.fechaFin, p.estado);
    const tareas = data.tareas.filter(t => t.proyecto === p.id);
    return `
    <div class="estrat-card estrat-drillable" data-drill-p="${p.id}">
      <div class="row-header" style="cursor:pointer" title="Ver tareas de este proyecto">
        <span class="row-toggle"><i class="ti ti-chevron-right" style="font-size:13px;color:var(--text-3)"></i></span>
        <i class="ti ti-clipboard-list row-icon" style="color:var(--teal)" aria-hidden="true"></i>
        <span class="row-name">${esc(p.nombre)}</span>
        <span class="row-meta">
          ${p.empresa?`<span class="bdg bdg-empresa">${esc(p.empresa)}</span>`:''}
          ${p.responsable?`<span class="bdg bdg-resp">${esc(p.responsable)}</span>`:''}
          ${p.prioridad?`<span class="bdg bdg-prio">${esc(p.prioridad)}</span>`:''}
          ${p.estado?`<span class="bdg ${statusClass(p.estado)}">${esc(p.estado)}</span>`:''}
          ${venc?`<span class="bdg s-vencido">⚠ Vencido</span>`:''}
          ${p.fechaFin?`<span class="bdg bdg-date">${fmtDate(p.fechaFin)}</span>`:''}
          ${est?`<span class="bdg bdg-empresa" title="Estrategia"><i class="ti ti-target" style="font-size:10px;margin-right:3px"></i>${esc(est.nombre)}</span>`:''}
          <span class="bdg bdg-empresa" style="opacity:0.7">${tareas.length} tarea${tareas.length!==1?'s':''}</span>
          <div class="row-actions" style="opacity:1">
            <button class="row-act-btn" data-edit-p="${p.id}"><i class="ti ti-edit" aria-hidden="true"></i></button>
            <button class="row-act-btn del" data-del-p="${p.id}"><i class="ti ti-trash" aria-hidden="true"></i></button>
          </div>
        </span>
      </div>
      ${avance>0?`<div class="progress-bar"><div class="progress-fill" style="width:${avance}%"></div></div>`:''}
      ${p.descripcion?`<div style="padding:0 14px 10px;font-size:12px;color:var(--text-3)">${esc(p.descripcion)}</div>`:''}
      <div class="drill-panel" id="drill-pt-${p.id}" style="display:none"></div>
    </div>`;
  }).join('');
  
  // Wire drill-down: click row → toggle tareas panel
  el.querySelectorAll('.estrat-drillable').forEach(card => {
    const pId = card.dataset.drillP;
    const header = card.querySelector('.row-header');
    const panel = card.querySelector('.drill-panel');
    const chevron = card.querySelector('.ti-chevron-right');
    header.addEventListener('click', ev => {
      if (ev.target.closest('.row-act-btn')) return;
      const open = panel.style.display !== 'none' && panel.style.display !== '';
      if (open) {
        panel.style.display = 'none';
        chevron.style.transform = '';
      } else {
        panel.style.display = 'block';
        chevron.style.transform = 'rotate(90deg)';
        renderProyectoTareas(pId, panel);
      }
    });
  });
  
  el.querySelectorAll('[data-edit-p]').forEach(b=>b.addEventListener('click',ev=>{ev.stopPropagation();openModal('proyecto',b.dataset.editP);}));
  el.querySelectorAll('[data-del-p]').forEach(b=>b.addEventListener('click',ev=>{ev.stopPropagation();confirmDelete('proyecto',b.dataset.delP);}));
}

/* ─── Tareas tab ─────────────────────────────────── */
function renderTareasTab() {
  const el = document.getElementById('tareas-list');
  if (!el) return;
  const fResp = (document.getElementById('filt-t-responsable')||{}).value||'';
  const fEst  = (document.getElementById('filt-t-estado')||{}).value||'';
  const fPrio = (document.getElementById('filt-t-prioridad')||{}).value||'';
  let ts = data.tareas;
  if (fResp) ts = ts.filter(t=>t.asignada===fResp);
  if (fEst)  ts = ts.filter(t=>t.estado===fEst);
  if (fPrio) ts = ts.filter(t=>t.prioridad===fPrio);
  if (!ts.length) { el.innerHTML='<div class="empty-state">No hay tareas que coincidan.</div>'; return; }
  el.innerHTML = ts.map(t => {
    const proy = data.proyectos.find(p=>p.id===t.proyecto);
    const tv = isVencido(t.fechaFin, t.estado);
    return `
    <div class="estrat-card" style="border-left-color:#E09030">
      <div class="row-header" style="cursor:default">
        <span class="row-toggle" style="visibility:hidden"></span>
        <i class="ti ti-checkbox row-icon" style="color:#E09030" aria-hidden="true"></i>
        <span class="row-name">${esc(t.nombre)}</span>
        <span class="row-meta">
          ${t.asignada?`<span class="bdg bdg-resp">${esc(t.asignada)}</span>`:''}
          ${t.prioridad?`<span class="bdg bdg-prio">${esc(t.prioridad)}</span>`:''}
          ${t.estado?`<span class="bdg ${statusClass(t.estado)}">${esc(t.estado)}</span>`:''}
          ${tv?`<span class="bdg s-vencido">⚠ Vencida</span>`:''}
          ${t.fechaFin?`<span class="bdg bdg-date">${fmtDate(t.fechaFin)}</span>`:''}
          ${proy?`<span class="bdg bdg-empresa" title="Proyecto"><i class="ti ti-clipboard-list" style="font-size:10px;margin-right:3px"></i>${esc(proy.nombre)}</span>`:''}
          <div class="row-actions" style="opacity:1">
            <button class="row-act-btn" data-edit-t="${t.id}"><i class="ti ti-edit" aria-hidden="true"></i></button>
            <button class="row-act-btn del" data-del-t="${t.id}"><i class="ti ti-trash" aria-hidden="true"></i></button>
          </div>
        </span>
      </div>
      ${t.comentarios?`<div style="padding:0 14px 10px;font-size:12px;color:var(--text-3)">${esc(t.comentarios)}</div>`:''}
    </div>`;
  }).join('');
  el.querySelectorAll('[data-edit-t]').forEach(b=>b.addEventListener('click',()=>openModal('tarea',b.dataset.editT)));
  el.querySelectorAll('[data-del-t]').forEach(b=>b.addEventListener('click',()=>confirmDelete('tarea',b.dataset.delT)));
}


/* ─── Estrategia drill-down: proyectos & tareas ── */
function renderEstrategiaProyectos(eId, container) {
  const proyectos = data.proyectos.filter(p => p.estrategia === eId);
  if (!proyectos.length) {
    container.innerHTML = '<div class="empty-state" style="padding:12px 16px;font-size:12px">No hay proyectos en esta estrategia.</div>';
    return;
  }
  container.innerHTML = `<div style="padding:8px 12px 12px;border-top:1px solid var(--border)">
    ${proyectos.map(p => {
      const avance = calcAvance(p.id);
      const venc = isVencido(p.fechaFin, p.estado);
      const tareas = data.tareas.filter(t => t.proyecto === p.id);
      return `
      <div class="drill-proy-card" style="background:var(--surface-2);border-radius:var(--r);margin-bottom:6px;border:1px solid var(--border)">
        <div class="row-header drill-proy-header" data-drill-p="${p.id}" style="cursor:pointer;padding:10px 12px">
          <span class="row-toggle"><i class="ti ti-chevron-right dp-chev" style="font-size:12px;color:var(--text-3)"></i></span>
          <i class="ti ti-clipboard-list row-icon" style="color:var(--teal)" aria-hidden="true"></i>
          <span class="row-name">${esc(p.nombre)}</span>
          <span class="row-meta">
            ${p.empresa?`<span class="bdg bdg-empresa">${esc(p.empresa)}</span>`:''}
            ${p.responsable?`<span class="bdg bdg-resp">${esc(p.responsable)}</span>`:''}
            ${p.estado?`<span class="bdg ${statusClass(p.estado)}">${esc(p.estado)}</span>`:''}
            ${venc?`<span class="bdg s-vencido">⚠ Vencido</span>`:''}
            <span class="bdg bdg-empresa" style="opacity:0.7">${tareas.length} tarea${tareas.length!==1?'s':''}</span>
            <div class="row-actions" style="opacity:1">
              <button class="row-act-btn" data-edit-p="${p.id}" onclick="event.stopPropagation();openModal('proyecto','${p.id}')"><i class="ti ti-edit"></i></button>
              <button class="row-act-btn del" data-del-p="${p.id}" onclick="event.stopPropagation();confirmDelete('proyecto','${p.id}')"><i class="ti ti-trash"></i></button>
            </div>
          </span>
        </div>
        ${avance>0?`<div class="progress-bar" style="margin:0 12px"><div class="progress-fill" style="width:${avance}%"></div></div>`:''}
        <div class="drill-task-panel" id="drill-p-${p.id}" style="display:none"></div>
      </div>`;
    }).join('')}
  </div>`;
  
  // Wire proyecto drill-down
  container.querySelectorAll('.drill-proy-header').forEach(header => {
    const pId = header.dataset.drillP;
    const card = header.closest('.drill-proy-card');
    const panel = card.querySelector('.drill-task-panel');
    const chevron = header.querySelector('.dp-chev');
    header.addEventListener('click', ev => {
      if (ev.target.closest('.row-act-btn')) return;
      const open = panel.style.display !== 'none' && panel.style.display !== '';
      if (open) {
        panel.style.display = 'none';
        chevron.style.transform = '';
      } else {
        panel.style.display = 'block';
        chevron.style.transform = 'rotate(90deg)';
        renderProyectoTareas(pId, panel);
      }
    });
  });
}

function renderProyectoTareas(pId, container) {
  const tareas = data.tareas.filter(t => t.proyecto === pId);
  if (!tareas.length) {
    container.innerHTML = '<div class="empty-state" style="padding:10px 16px;font-size:12px">No hay tareas en este proyecto.</div>';
    return;
  }
  container.innerHTML = `<div style="padding:6px 12px 10px;border-top:1px solid var(--border)">
    ${tareas.map(t => {
      const tv = isVencido(t.fechaFin, t.estado);
      return `
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--surface);border-radius:var(--r);margin-bottom:4px;border:1px solid var(--border)">
        <i class="ti ti-checkbox" style="color:#E09030;flex-shrink:0" aria-hidden="true"></i>
        <span style="flex:1;font-size:13px;font-weight:500">${esc(t.nombre)}</span>
        <span class="row-meta" style="gap:4px">
          ${t.asignada?`<span class="bdg bdg-resp">${esc(t.asignada)}</span>`:''}
          ${t.prioridad?`<span class="bdg bdg-prio">${esc(t.prioridad)}</span>`:''}
          ${t.estado?`<span class="bdg ${statusClass(t.estado)}">${esc(t.estado)}</span>`:''}
          ${tv?`<span class="bdg s-vencido">⚠</span>`:''}
          <div class="row-actions" style="opacity:1">
            <button class="row-act-btn" onclick="openModal('tarea','${t.id}')"><i class="ti ti-edit"></i></button>
            <button class="row-act-btn del" onclick="confirmDelete('tarea','${t.id}')"><i class="ti ti-trash"></i></button>
          </div>
        </span>
      </div>`;
    }).join('')}
  </div>`;
}

/* ─── Estrategia tab ─────────────────────────────── */
function renderEstrategiaTab() {
  const el = document.getElementById('estrategia-list');
  if (!el) return;
  const fEmp  = (document.getElementById('filt-e-empresa')||{}).value||'';
  const fResp = (document.getElementById('filt-e-responsable')||{}).value||'';
  const fEst  = (document.getElementById('filt-e-estado')||{}).value||'';
  let activas = data.estrategias.filter(e=>e.nombre);
  if (fEmp)  activas = activas.filter(e=>e.empresa===fEmp);
  if (fResp) activas = activas.filter(e=>e.responsable===fResp);
  if (fEst)  activas = activas.filter(e=>e.estado===fEst);
  if (!activas.length) { el.innerHTML='<div class="empty-state">No hay estrategias que coincidan.</div>'; return; }
  el.innerHTML = activas.map(e=>{
    const proys = data.proyectos.filter(p=>p.estrategia===e.id);
    return `
    <div class="estrat-card estrat-drillable" data-drill-e="${e.id}">
      <div class="row-header" style="cursor:pointer" title="Ver proyectos de esta estrategia">
        <span class="row-toggle"><i class="ti ti-chevron-right" style="font-size:13px;color:var(--text-3)"></i></span>
        <i class="ti ti-target row-icon" style="color:var(--purple)" aria-hidden="true"></i>
        <span class="row-name">${esc(e.nombre)}</span>
        <span class="row-meta">
          ${e.empresa?`<span class="bdg bdg-empresa">${esc(e.empresa)}</span>`:''}
          ${e.responsable?`<span class="bdg bdg-resp">${esc(e.responsable)}</span>`:''}
          ${e.estado?`<span class="bdg ${statusClass(e.estado)}">${esc(e.estado)}</span>`:''}
          ${e.fecha?`<span class="bdg bdg-date">${fmtDate(e.fecha)}</span>`:''}
          <span class="bdg bdg-empresa" style="opacity:0.7">${proys.length} proyecto${proys.length!==1?'s':''}</span>
          <div class="row-actions" style="opacity:1">
            <button class="row-act-btn" data-edit-e="${e.id}"><i class="ti ti-edit" aria-hidden="true"></i></button>
            <button class="row-act-btn del" data-del-e="${e.id}"><i class="ti ti-trash" aria-hidden="true"></i></button>
          </div>
        </span>
      </div>
      <div class="drill-panel" id="drill-e-${e.id}" style="display:none"></div>
    </div>`;
  }).join('');
  
  // Wire drill-down: click row → toggle proyectos panel
  el.querySelectorAll('.estrat-drillable').forEach(card => {
    const eId = card.dataset.drillE;
    const header = card.querySelector('.row-header');
    const panel = card.querySelector('.drill-panel');
    const chevron = card.querySelector('.ti-chevron-right');
    header.addEventListener('click', ev => {
      if (ev.target.closest('.row-act-btn')) return;
      const open = panel.style.display !== 'none' && panel.style.display !== '';
      if (open) {
        panel.style.display = 'none';
        chevron.style.transform = '';
      } else {
        panel.style.display = 'block';
        chevron.style.transform = 'rotate(90deg)';
        renderEstrategiaProyectos(eId, panel);
      }
    });
  });
  
  el.querySelectorAll('[data-edit-e]').forEach(b=>b.addEventListener('click',ev=>{ev.stopPropagation();openModal('estrategia',b.dataset.editE);}));
  el.querySelectorAll('[data-del-e]').forEach(b=>b.addEventListener('click',ev=>{ev.stopPropagation();confirmDelete('estrategia',b.dataset.delE);}));
}

/* ─── Config tab ─────────────────────────────────── */
function renderConfig() {
  ['empresas','personas'].forEach(type => {
    const el = document.getElementById(type+'-chips');
    if (!el) return;
    el.innerHTML = data[type].map((v,i)=>
      `<span class="chip">${esc(v)}<button data-del="${type}:${i}" aria-label="Eliminar ${esc(v)}">×</button></span>`
    ).join('');
    el.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click',()=>{
      const [t,i] = b.dataset.del.split(':');
      data[t].splice(+i,1);
      saveData(); render();
    }));
  });
}

/* ─── Delete ─────────────────────────────────────── */
function confirmDelete(type, id) {
  const msg = {
    estrategia: '¿Eliminar esta estrategia? Se eliminarán también sus proyectos y tareas asociadas.',
    proyecto: '¿Eliminar este proyecto y todas sus tareas?',
    tarea: '¿Eliminar esta tarea?',
  }[type];
  if (!confirm(msg)) return;
  if (type==='estrategia') {
    const pIds = data.proyectos.filter(p=>p.estrategia===id).map(p=>p.id);
    data.tareas = data.tareas.filter(t=>!pIds.includes(t.proyecto));
    data.proyectos = data.proyectos.filter(p=>p.estrategia!==id);
    data.estrategias = data.estrategias.filter(e=>e.id!==id);
  } else if (type==='proyecto') {
    data.tareas = data.tareas.filter(t=>t.proyecto!==id);
    data.proyectos = data.proyectos.filter(p=>p.id!==id);
  } else {
    data.tareas = data.tareas.filter(t=>t.id!==id);
  }
  saveData(); render();
  showToast('Eliminado correctamente');
}

/* ─── Modal ──────────────────────────────────────── */
const ESTADOS_FULL  = ['En Curso','En Pausa','Planificación','Cerrado','Descartado'];
const ESTADOS_TAREA = ['En Curso','En Pausa','Planificación','Cerrado'];
const PRIORIDADES   = ['Alta','Media','Baja'];

function optList(list, cur, valKey) {
  return list.map(x=>{
    const val   = valKey ? x[valKey] : x;
    const label = valKey ? (x.nombre||x[valKey]) : x;
    return `<option value="${esc(val)}"${cur===val?' selected':''}>${esc(label)}</option>`;
  }).join('');
}

function openModal(type, id, parentId) {
  modalMeta = { type, id, parentId };
  let item = null;
  if (id) {
    if (type==='estrategia') item = data.estrategias.find(e=>e.id===id);
    else if (type==='proyecto') item = data.proyectos.find(p=>p.id===id);
    else item = data.tareas.find(t=>t.id===id);
  }

  const titles = { estrategia:'estrategia', proyecto:'proyecto', tarea:'tarea' };
  document.getElementById('modal-title').textContent = (id?'Editar ':'Nueva ')+titles[type];

  let body = '';
  if (type==='estrategia') {
    body = `
      <div class="form-group"><label>Nombre *</label><input id="f-nombre" value="${esc(item?.nombre||'')}" placeholder="Ej. Estrategia de expansión" autofocus></div>
      <div class="form-row">
        <div class="form-group"><label>Empresa</label><select id="f-empresa"><option value="">—</option>${optList(data.empresas,item?.empresa||'')}</select></div>
        <div class="form-group"><label>Responsable</label><select id="f-responsable"><option value="">—</option>${optList(data.personas,item?.responsable||'')}</select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Estado</label><select id="f-estado"><option value="">—</option>${optList(ESTADOS_FULL,item?.estado||'')}</select></div>
        <div class="form-group"><label>Fecha</label><input type="date" id="f-fecha" value="${esc(item?.fecha||'')}"></div>
      </div>
      <div class="form-group"><label>Detalle / contexto</label><textarea id="f-detalle" placeholder="Descripción, objetivos…">${esc(item?.detalle||'')}</textarea></div>`;
  } else if (type==='proyecto') {
    body = `
      <div class="form-group"><label>Nombre *</label><input id="f-nombre" value="${esc(item?.nombre||'')}" placeholder="Nombre del proyecto" autofocus></div>
      <div class="form-group"><label>Estrategia vinculada</label><select id="f-estrategia"><option value="">Sin estrategia</option>${optList(data.estrategias.filter(e=>e.nombre),item?.estrategia||'','id')}</select></div>
      <div class="form-row">
        <div class="form-group"><label>Empresa</label><select id="f-empresa"><option value="">—</option>${optList(data.empresas,item?.empresa||'')}</select></div>
        <div class="form-group"><label>Responsable</label><select id="f-responsable"><option value="">—</option>${optList(data.personas,item?.responsable||'')}</select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Estado</label><select id="f-estado"><option value="">—</option>${optList(ESTADOS_FULL,item?.estado||'')}</select></div>
        <div class="form-group"><label>Prioridad</label><select id="f-prioridad"><option value="">—</option>${optList(PRIORIDADES,item?.prioridad||'')}</select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Fecha inicio</label><input type="date" id="f-fecha-inicio" value="${esc(item?.fechaInicio||'')}"></div>
        <div class="form-group"><label>Fecha fin est.</label><input type="date" id="f-fecha-fin" value="${esc(item?.fechaFin||'')}"></div>
      </div>
      <div class="form-group"><label>Descripción / objetivo</label><textarea id="f-descripcion" placeholder="Objetivo del proyecto…">${esc(item?.descripcion||'')}</textarea></div>`;
  } else {
    const defP = parentId||item?.proyecto||(data.proyectos[0]||{}).id||'';
    body = `
      <div class="form-group"><label>Nombre *</label><input id="f-nombre" value="${esc(item?.nombre||'')}" placeholder="Nombre de la tarea" autofocus></div>
      <div class="form-group"><label>Proyecto</label><select id="f-proyecto">${data.proyectos.map(p=>`<option value="${p.id}"${defP===p.id?' selected':''}>${esc(p.nombre)}</option>`).join('')}</select></div>
      <div class="form-row">
        <div class="form-group"><label>Asignada a</label><select id="f-asignada"><option value="">—</option>${optList(data.personas,item?.asignada||'')}</select></div>
        <div class="form-group"><label>Prioridad</label><select id="f-prioridad"><option value="">—</option>${optList(PRIORIDADES,item?.prioridad||'')}</select></div>
      </div>
      <div class="form-group"><label>Estado</label><select id="f-estado"><option value="">—</option>${optList(ESTADOS_TAREA,item?.estado||'')}</select></div>
      <div class="form-row">
        <div class="form-group"><label>Fecha inicio</label><input type="date" id="f-fecha-inicio" value="${esc(item?.fechaInicio||'')}"></div>
        <div class="form-group"><label>Fecha fin</label><input type="date" id="f-fecha-fin" value="${esc(item?.fechaFin||'')}"></div>
      </div>
      <div class="form-group"><label>Comentarios / resultado</label><textarea id="f-comentarios" placeholder="Notas, resultados…">${esc(item?.comentarios||'')}</textarea></div>`;
  }

  document.getElementById('modal-body').innerHTML = body;
  document.getElementById('modal-bg').style.display = 'flex';
  setTimeout(()=>{ const f=document.querySelector('#modal-body input'); if(f)f.focus(); },50);

  /* Auto-fill empresa when estrategia changes (only for proyecto modal) */
  if (type==='proyecto') {
    const selEst = document.getElementById('f-estrategia');
    const selEmp = document.getElementById('f-empresa');
    if (selEst && selEmp) {
      selEst.addEventListener('change', () => {
        const est = data.estrategias.find(e=>e.id===selEst.value);
        if (est && est.empresa) selEmp.value = est.empresa;
      });
    }
  }
}

function closeModal() {
  document.getElementById('modal-bg').style.display = 'none';
  document.getElementById('modal-body').innerHTML = '';
  modalMeta = {};
}

function saveModal() {
  const { type, id, parentId } = modalMeta;
  const nombre = (document.getElementById('f-nombre')||{}).value?.trim()||'';
  if (!nombre) { alert('El nombre es obligatorio.'); return; }

  if (type==='estrategia') {
    const obj = { id:id||uid(), nombre,
      empresa: document.getElementById('f-empresa')?.value||'',
      responsable: document.getElementById('f-responsable')?.value||'',
      estado: document.getElementById('f-estado')?.value||'',
      fecha: document.getElementById('f-fecha')?.value||'',
      detalle: document.getElementById('f-detalle')?.value||'',
    };
    if (id) { const i=data.estrategias.findIndex(e=>e.id===id); data.estrategias[i]=obj; }
    else data.estrategias.push(obj);
  } else if (type==='proyecto') {
    const estId = document.getElementById('f-estrategia')?.value||'';
    const obj = { id:id||uid(), nombre, estrategia:estId,
      empresa: document.getElementById('f-empresa')?.value||'',
      responsable: document.getElementById('f-responsable')?.value||'',
      estado: document.getElementById('f-estado')?.value||'',
      prioridad: document.getElementById('f-prioridad')?.value||'',
      fechaInicio: document.getElementById('f-fecha-inicio')?.value||'',
      fechaFin: document.getElementById('f-fecha-fin')?.value||'',
      descripcion: document.getElementById('f-descripcion')?.value||'',
    };
    if (id) { const i=data.proyectos.findIndex(p=>p.id===id); data.proyectos[i]=obj; }
    else { data.proyectos.push(obj); if(estId) expanded['e_'+estId]=true; }
  } else {
    const pId = document.getElementById('f-proyecto')?.value||parentId||'';
    const obj = { id:id||uid(), nombre, proyecto:pId,
      asignada: document.getElementById('f-asignada')?.value||'',
      estado: document.getElementById('f-estado')?.value||'',
      prioridad: document.getElementById('f-prioridad')?.value||'',
      fechaInicio: document.getElementById('f-fecha-inicio')?.value||'',
      fechaFin: document.getElementById('f-fecha-fin')?.value||'',
      comentarios: document.getElementById('f-comentarios')?.value||'',
    };
    if (id) { const i=data.tareas.findIndex(t=>t.id===id); data.tareas[i]=obj; }
    else { data.tareas.push(obj); if(pId) expanded['p_'+pId]=true; }
  }

  saveData();
  closeModal();
  render();
  showToast('Guardado correctamente');
}

/* ─── Export / Import ────────────────────────────── */
function exportData() {
  const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `holding-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
}
function importData(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!parsed.estrategias||!parsed.proyectos||!parsed.tareas) throw new Error('Formato inválido');
      data = parsed;
      saveData(); render();
      showToast('Datos importados');
    } catch(err) { alert('Error al importar: '+err.message); }
  };
  reader.readAsText(file);
}

/* ─── Full render ────────────────────────────────── */
function renderDashboard() {
  renderKPI();
  renderDashTables();
  renderCharts();
}

function render() {
  syncEmpresaFilters();
  renderDashboard();
  renderTree();
  renderEstrategiaTab();
  renderProyectosTab();
  renderTareasTab();
  renderConfig();
}

/* ─── Tab switching ──────────────────────────────── */
function switchTab(tab) {
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active', n.dataset.tab===tab));
  document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active', p.id==='tab-'+tab));
  currentTab = tab;
  if (tab==='dashboard') renderDashboard();
  if (tab==='proyectos') renderProyectosTab();
  if (tab==='tareas') renderTareasTab();
  if (tab==='estrategia') renderEstrategiaTab();
}

/* ─── Init ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  render();

  // Firebase
  initFirebase();

  /* Navigation */
  document.querySelectorAll('.nav-item').forEach(n=>n.addEventListener('click',()=>switchTab(n.dataset.tab)));

  /* Quick-nav buttons (sidebar desktop) */
  document.querySelectorAll('.quicknav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  /* Mobile nav buttons */
  document.querySelectorAll('.mob-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
  document.getElementById('mob-btn-estrategia')?.addEventListener('click',()=>{ switchTab('estrategia'); setTimeout(()=>openModal('estrategia',null),50); });
  document.getElementById('mob-btn-proyecto')?.addEventListener('click',()=>{ switchTab('proyectos'); setTimeout(()=>openModal('proyecto',null),50); });
  document.getElementById('mob-btn-tarea')?.addEventListener('click',()=>{ switchTab('tareas'); setTimeout(()=>openModal('tarea',null),50); });

  /* Create buttons in sidebar — open modal directly */
  document.getElementById('btn-new-estrategia').addEventListener('click',()=>{ switchTab('estrategia'); setTimeout(()=>openModal('estrategia',null),50); });
  document.getElementById('btn-new-proyecto').addEventListener('click',()=>{ switchTab('proyectos'); setTimeout(()=>openModal('proyecto',null),50); });
  document.getElementById('btn-new-tarea').addEventListener('click',()=>{ switchTab('tareas'); setTimeout(()=>openModal('tarea',null),50); });

  /* Estrategia tab button */
  document.getElementById('btn-add-strat').addEventListener('click',()=>openModal('estrategia',null));

  /* Proyectos tab button */
  document.getElementById('btn-add-proyecto-page')?.addEventListener('click',()=>openModal('proyecto',null));

  /* Tareas tab button */
  document.getElementById('btn-add-tarea-page')?.addEventListener('click',()=>openModal('tarea',null));

  /* Filters — dashboard */
  document.getElementById('filter-empresa-dash')?.addEventListener('change',()=>renderDashboard());
  document.getElementById('filter-empresa')?.addEventListener('change',()=>renderTree());
  document.getElementById('filter-estado')?.addEventListener('change',()=>renderTree());

  /* Filters — Estrategia tab */
  ['filt-e-empresa','filt-e-responsable','filt-e-estado'].forEach(id=>{
    document.getElementById(id)?.addEventListener('change',()=>renderEstrategiaTab());
  });
  /* Filters — Proyectos tab */
  ['filt-p-empresa','filt-p-responsable','filt-p-estado','filt-p-prioridad'].forEach(id=>{
    document.getElementById(id)?.addEventListener('change',()=>renderProyectosTab());
  });
  /* Filters — Tareas tab */
  ['filt-t-responsable','filt-t-estado','filt-t-prioridad'].forEach(id=>{
    document.getElementById(id)?.addEventListener('change',()=>renderTareasTab());
  });

  /* Expand/collapse */
  document.getElementById('btn-expand-all')?.addEventListener('click',()=>{
    data.estrategias.forEach(e=>expanded['e_'+e.id]=true);
    data.proyectos.forEach(p=>expanded['p_'+p.id]=true);
    renderTree();
  });
  document.getElementById('btn-collapse-all')?.addEventListener('click',()=>{
    data.estrategias.forEach(e=>expanded['e_'+e.id]=false);
    data.proyectos.forEach(p=>expanded['p_'+p.id]=false);
    renderTree();
  });

  /* Modal */
  document.getElementById('modal-close').addEventListener('click',closeModal);
  document.getElementById('modal-cancel').addEventListener('click',closeModal);
  document.getElementById('modal-save').addEventListener('click',saveModal);
  document.getElementById('modal-bg').addEventListener('click',e=>{ if(e.target.id==='modal-bg') closeModal(); });
  document.addEventListener('keydown',e=>{
    if (e.key==='Escape') closeModal();
    if (e.key==='Enter'&&e.ctrlKey&&document.getElementById('modal-bg').style.display!=='none') saveModal();
  });

  /* Config inputs */
  ['empresa','persona'].forEach(type=>{
    document.getElementById('btn-add-'+type).addEventListener('click',()=>{
      const inp = document.getElementById('new-'+type);
      const v = inp.value.trim();
      const key = type+'s';
      if (v && !data[key].includes(v)) { data[key].push(v); saveData(); render(); inp.value=''; }
    });
    document.getElementById('new-'+type).addEventListener('keydown',e=>{ if(e.key==='Enter') document.getElementById('btn-add-'+type).click(); });
  });

  /* Export/Import/Reset — hidden from UI but kept for data safety */
  const btnExport = document.getElementById('btn-export');
  const btnImport = document.getElementById('btn-import');
  const btnReset  = document.getElementById('btn-reset');
  if (btnExport) btnExport.addEventListener('click',exportData);
  if (btnImport) btnImport.addEventListener('change',e=>{ if(e.target.files[0]) importData(e.target.files[0]); });
  if (btnReset)  btnReset.addEventListener('click',()=>{
    if (!confirm('¿Restaurar datos de demo? Se perderán los cambios actuales.')) return;
    data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    expanded = {};
    saveData(); render();
    showToast('Datos de demo restaurados');
  });
});
