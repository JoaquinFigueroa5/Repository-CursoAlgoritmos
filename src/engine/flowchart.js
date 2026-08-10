// ============================================================
// flowchart.js — Diagrama de flujo: IR <-> grafo (React Flow)
// ============================================================

import {
  programa,
  programaDesde,
} from './ir.js'
import { partesDesdeCadena } from './textutils.js'

// -------- constantes de geometría --------
export const NODE_SIZES = {
  inicio: { w: 130, h: 58 },
  fin: { w: 130, h: 58 },
  proceso: { w: 180, h: 64 },
  entrada: { w: 180, h: 64 },
  salida: { w: 180, h: 64 },
  decision: { w: 190, h: 100 },
}
const GAP_V = 66
const GAP_BRANCH = 250

let idC = 0
const nid = () => `n${++idC}`
const eid = () => `e${++idC}`

function makeNode(id, x, y, type, label, extra = {}) {
  const size = NODE_SIZES[type]
  return {
    id,
    type,
    position: { x: x - size.w / 2, y },
    data: { label, size },
    sourcePosition: 'bottom',
    targetPosition: 'top',
    ...extra,
  }
}

// ============================================================
// IR -> flujo
// ============================================================

export function flujoDesdePrograma(program) {
  idC = 0
  const { nodes, edges } = layoutSecuencia(program.pasos, 400, 0)
  return { nodes, edges }
}

function layoutSecuencia(pasos, x0, y0) {
  const nodes = []
  const edges = []
  let cursorY = y0
  let prevExits = [{ id: '__entry__', label: null }]
  for (const paso of pasos) {
    const L = layoutPaso(paso, x0, cursorY)
    nodes.push(...L.nodes)
    edges.push(...L.edges)
    for (const pe of prevExits) {
      if (pe.id === '__entry__') continue
      edges.push({
        id: eid(),
        source: pe.id,
        target: L.entry.id,
        ...(pe.label ? { label: pe.label } : {}),
        ...(L.entry.animated ? {} : {}),
      })
    }
    cursorY += L.h + GAP_V
    prevExits = L.exits
  }
  return { nodes, edges, h: cursorY - y0, entry: nodes[0], exits: prevExits }
}

function layoutPaso(paso, x0, y0) {
  switch (paso.type) {
    case 'inicio':
      return layoutSimple(x0, y0, 'inicio', 'Inicio')
    case 'fin':
      return layoutSimple(x0, y0, 'fin', 'Fin')
    case 'declarar':
      return layoutSimple(x0, y0, 'proceso', `Declarar ${paso.nombre} como ${tipoNombreLocal(paso.tipo)}`)
    case 'asignar':
      return layoutSimple(x0, y0, 'proceso', `${paso.nombre} = ${paso.valor}`)
    case 'leer':
      return layoutSimple(x0, y0, 'entrada', `Leer ${paso.variables.join(', ')}`)
    case 'mostrar':
      return layoutSimple(x0, y0, 'salida', `Mostrar ${partesLocal(paso.partes)}`)
    case 'si':
      return layoutSi(paso, x0, y0)
    case 'para':
      return layoutPara(paso, x0, y0)
    case 'mientras':
      return layoutMientras(paso, x0, y0)
    case 'hacerMientras':
      return layoutHacerMientras(paso, x0, y0)
    default:
      return layoutSimple(x0, y0, 'proceso', '')
  }
}

function layoutSimple(x0, y0, type, label) {
  const id = nid()
  const size = NODE_SIZES[type]
  return {
    nodes: [makeNode(id, x0, y0, type, label)],
    edges: [],
    h: size.h,
    entry: { id },
    exits: [{ id, label: null }],
  }
}

function layoutSi(paso, x0, y0) {
  const dId = nid()
  const nodes = [makeNode(dId, x0, y0, 'decision', paso.condicion)]
  const edges = []
  const thenY = y0 + NODE_SIZES.decision.h + GAP_V
  const elseY = y0 + NODE_SIZES.decision.h + GAP_V
  let Lthen = null
  let Lelse = null
  if (paso.entonces.length) {
    Lthen = layoutSecuencia(paso.entonces, x0 - GAP_BRANCH, thenY)
    nodes.push(...Lthen.nodes)
    edges.push(...Lthen.edges)
    edges.push({ id: eid(), source: dId, target: Lthen.entry.id, label: 'Sí' })
  }
  if (paso.siNo.length) {
    Lelse = layoutSecuencia(paso.siNo, x0 + GAP_BRANCH, elseY)
    nodes.push(...Lelse.nodes)
    edges.push(...Lelse.edges)
    edges.push({ id: eid(), source: dId, target: Lelse.entry.id, label: 'No' })
  }
  const exits = []
  if (paso.entonces.length) exits.push(...Lthen.exits)
  else exits.push({ id: dId, label: 'Sí' })
  if (paso.siNo.length) exits.push(...Lelse.exits)
  else exits.push({ id: dId, label: 'No' })
  const branchH = Math.max(Lthen?.h ?? 0, Lelse?.h ?? 0)
  return {
    nodes,
    edges,
    h: NODE_SIZES.decision.h + GAP_V + branchH,
    entry: { id: dId },
    exits,
  }
}

function layoutPara(paso, x0, y0) {
  const iId = nid()
  const dId = nid()
  const nodes = [
    makeNode(iId, x0, y0, 'proceso', paso.inicializacion),
    makeNode(dId, x0, y0 + NODE_SIZES.proceso.h + GAP_V, 'decision', paso.condicion),
  ]
  const edges = [{ id: eid(), source: iId, target: dId }]
  const bodyY = y0 + NODE_SIZES.proceso.h + GAP_V + NODE_SIZES.decision.h + GAP_V
  let Lbody = null
  if (paso.cuerpo.length) {
    Lbody = layoutSecuencia(paso.cuerpo, x0, bodyY)
    nodes.push(...Lbody.nodes)
    edges.push(...Lbody.edges)
    edges.push({ id: eid(), source: dId, target: Lbody.entry.id, label: 'Sí' })
  }
  const uY = bodyY + (Lbody?.h ?? 0) + GAP_V
  const uId = nid()
  nodes.push(makeNode(uId, x0, uY, 'proceso', paso.actualizacion))
  if (Lbody) {
    for (const ex of Lbody.exits) {
      edges.push({ id: eid(), source: ex.id, target: uId })
    }
  } else {
    edges.push({ id: eid(), source: dId, target: uId, label: 'Sí' })
  }
  edges.push({ id: eid(), source: uId, target: dId, animated: true })
  const h = (Lbody?.h ?? 0) + NODE_SIZES.decision.h + NODE_SIZES.proceso.h + GAP_V * 2 + NODE_SIZES.proceso.h
  return { nodes, edges, h, entry: { id: iId }, exits: [{ id: dId, label: 'No' }] }
}

function layoutMientras(paso, x0, y0) {
  const dId = nid()
  const nodes = [makeNode(dId, x0, y0, 'decision', paso.condicion)]
  const edges = []
  const bodyY = y0 + NODE_SIZES.decision.h + GAP_V
  let Lbody = null
  if (paso.cuerpo.length) {
    Lbody = layoutSecuencia(paso.cuerpo, x0, bodyY)
    nodes.push(...Lbody.nodes)
    edges.push(...Lbody.edges)
    edges.push({ id: eid(), source: dId, target: Lbody.entry.id, label: 'Sí' })
  }
  if (Lbody) {
    for (const ex of Lbody.exits) {
      edges.push({ id: eid(), source: ex.id, target: dId, animated: true })
    }
  }
  const h = NODE_SIZES.decision.h + (Lbody?.h ? GAP_V + Lbody.h : 0)
  return { nodes, edges, h, entry: { id: dId }, exits: [{ id: dId, label: 'No' }] }
}

function layoutHacerMientras(paso, x0, y0) {
  const nodes = []
  const edges = []
  let Lbody = null
  if (paso.cuerpo.length) {
    Lbody = layoutSecuencia(paso.cuerpo, x0, y0)
    nodes.push(...Lbody.nodes)
    edges.push(...Lbody.edges)
  }
  const dY = y0 + (Lbody?.h ?? 0) + GAP_V
  const dId = nid()
  nodes.push(makeNode(dId, x0, dY, 'decision', paso.condicion))
  if (Lbody) {
    for (const ex of Lbody.exits) {
      edges.push({ id: eid(), source: ex.id, target: dId })
    }
    edges.push({ id: eid(), source: dId, target: Lbody.entry.id, label: 'Sí', animated: true })
  }
  const h = (Lbody?.h ?? 0) + GAP_V + NODE_SIZES.decision.h
  return { nodes, edges, h, entry: Lbody ? Lbody.entry : { id: dId }, exits: [{ id: dId, label: 'No' }] }
}

const TIPO_NOMBRE_LOCAL = { int: 'entero', float: 'real', char: 'caracter', string: 'cadena' }
function tipoNombreLocal(t) {
  return TIPO_NOMBRE_LOCAL[t] ?? t
}

function partesLocal(partes) {
  return partes.map((p) => (p.tipo === 'texto' ? `"${p.valor}"` : p.valor)).join(', ')
}

// ============================================================
// flujo -> IR
// ============================================================

export function programaDesdeFlujo(nodes, edges) {
  try {
    const val = validarFlujo(nodes, edges)
    if (!val.ok) return { ok: false, error: val.errores.join(' ') }

    const adjacency = construirGrafo(nodes, edges)
    const inicios = nodes.filter((n) => n.type === 'inicio')
    const inicioId = inicios[0].id

    const loops = detectarLoops(nodes, adjacency)
    const loopMap = {}
    const absorbed = new Set()
    for (const L of loops) {
      loopMap[L.entryId] = L
      if (L.initNodeId) absorbed.add(L.initNodeId)
    }

    const result = walk(inicioId, new Set(), new Set(), null, {
      nodes,
      adjacency,
      loopMap,
      absorbed,
    })
    const pasos = result.pasos
    return { ok: true, programa: programaDesde(pasos) }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

function construirGrafo(nodes, edges) {
  const adjacency = {}
  for (const n of nodes) {
    adjacency[n.id] = []
  }
  for (const e of edges) {
    if (adjacency[e.source]) {
      adjacency[e.source].push({ id: e.id, source: e.source, target: e.target, label: e.label })
    }
  }
  return adjacency
}

// ---------------- validación ----------------

export function validarFlujo(nodes, edges) {
  const errores = []
  const inicios = nodes.filter((n) => n.type === 'inicio')
  const fines = nodes.filter((n) => n.type === 'fin')
  if (inicios.length === 0) errores.push('Falta un nodo de Inicio.')
  if (inicios.length > 1) errores.push('Solo debe existir un nodo de Inicio.')
  if (fines.length === 0) errores.push('Falta al menos un nodo de Fin.')

  const adjacency = construirGrafo(nodes, edges)
  for (const n of nodes) {
    const out = adjacency[n.id] ?? []
    if (n.type === 'decision' && out.length !== 2) {
      errores.push(`La decisión "${n.data.label}" debe tener exactamente 2 salidas (Sí y No).`)
    }
    if (n.type !== 'decision' && n.type !== 'fin' && out.length > 1) {
      errores.push(`El nodo "${n.data.label}" no puede tener más de una salida.`)
    }
    if (out.length === 0 && n.type !== 'fin') {
      errores.push(`El nodo "${n.data.label}" no tiene salida.`)
    }
  }

  // alcanzabilidad desde inicio
  if (inicios.length === 1) {
    const inicioId = inicios[0].id
    const visitados = new Set()
    const pila = [inicioId]
    while (pila.length) {
      const u = pila.pop()
      if (visitados.has(u)) continue
      visitados.add(u)
      for (const e of adjacency[u] ?? []) pila.push(e.target)
    }
    for (const n of nodes) {
      if (!visitados.has(n.id)) {
        errores.push(`El nodo "${n.data.label}" no está conectado al flujo.`)
      }
    }
    // todo nodo debe poder llegar a un Fin
    for (const n of nodes) {
      if (n.type === 'fin') continue
      if (!puedeLlegarAFin(n.id, adjacency, nodes, new Set())) {
        errores.push(`El nodo "${n.data.label}" no lleva a un nodo de Fin.`)
      }
    }
  }

  // validación de textos
  for (const n of nodes) {
    const err = validarTextoNodo(n)
    if (err) errores.push(err)
  }

  return { ok: errores.length === 0, errores }
}

function puedeLlegarAFin(id, adjacency, nodes, visitados) {
  if (visitados.has(id)) return false
  visitados.add(id)
  const out = adjacency[id] ?? []
  for (const e of out) {
    const target = nodes.find((n) => n.id === e.target)
    if (target && target.type === 'fin') return true
    if (puedeLlegarAFin(e.target, adjacency, nodes, visitados)) return true
  }
  return false
}

function validarTextoNodo(n) {
  const label = (n.data.label || '').trim()
  if (n.type === 'proceso') {
    if (!label) return `El proceso sin texto debe tener una asignación (ej. "x = 5").`
    if (!/^Declarar\s+/i.test(label) && !label.includes('=')) {
      return `El proceso "${label}" debe ser una asignación (ej. "x = x + 1").`
    }
  }
  if (n.type === 'entrada' && !/^Leer\b/i.test(label) && !/^[A-Za-z_][A-Za-z0-9_]*(,\s*[A-Za-z_][A-Za-z0-9_]*)*$/.test(label)) {
    return `La entrada "${label}" debe ser "Leer x" o solo el nombre de la variable.`
  }
  if (n.type === 'salida' && !label) {
    return `La salida sin texto no es válida.`
  }
  if (n.type === 'decision' && !label) {
    return `La decisión debe tener una condición (ej. "x > 0").`
  }
  return null
}

// ---------------- detección de ciclos ----------------

function detectarLoops(nodes, adjacency) {
  const colores = {}
  const parent = {}
  const backEdges = []

  const dfs = (u, path) => {
    colores[u] = 'gray'
    path.add(u)
    for (const e of adjacency[u] ?? []) {
      if (!colores[e.target]) {
        parent[e.target] = u
        dfs(e.target, path)
      } else if (colores[e.target] === 'gray') {
        backEdges.push(e)
      }
    }
    path.delete(u)
    colores[u] = 'black'
  }

  const inicios = nodes.filter((n) => n.type === 'inicio')
  if (inicios.length === 1) {
    dfs(inicios[0].id, new Set())
  }
  // también detecta ciclos en componentes no alcanzables (serán reportados como error)
  for (const n of nodes) {
    if (!colores[n.id]) dfs(n.id, new Set())
  }

  const loops = []
  for (const be of backEdges) {
    const L = construirLoop(be, parent, nodes, adjacency)
    if (L) loops.push(L)
  }
  return loops
}

function construirLoop(be, parent, nodes, adjacency) {
  // ciclo: camino target -> ... -> source (subiendo por parent)
  const ciclo = new Set()
  let cur = be.source
  while (cur && cur !== be.target) {
    ciclo.add(cur)
    cur = parent[cur]
  }
  if (!cur) return null
  ciclo.add(be.target)

  const dTarget = nodes.find((n) => n.id === be.target)
  const dSource = nodes.find((n) => n.id === be.source)
  const esDowhile = dSource?.type === 'decision'
  const esMientras = !esDowhile && dTarget?.type === 'decision'
  if (!esDowhile && !esMientras) return null
  const decisionId = esDowhile ? be.source : be.target
  const tipo = esDowhile ? 'dowhile' : 'mientras'

  const out = adjacency[decisionId] ?? []
  // borde de salida = el que no va al ciclo
  let exitId = null
  for (const e of out) {
    if (!ciclo.has(e.target)) exitId = e.target
  }
  // borde del cuerpo = el que va al ciclo
  let bodyStartId = null
  for (const e of out) {
    if (ciclo.has(e.target)) bodyStartId = e.target
  }

  const L = {
    id: `L${decisionId}`,
    entryId: tipo === 'dowhile' ? be.target : decisionId,
    decisionId,
    bodyStartId,
    exitId,
    tipo,
    ciclo,
    initNodeId: null,
    initText: null,
    updateText: null,
  }

  if (tipo === 'mientras') {
    // patrón de ciclo "para": predecesor externo que inicializa y fuente del back-edge que actualiza
    const predecesoresExternos = []
    for (const n of nodes) {
      for (const e of adjacency[n.id] ?? []) {
        if (e.target === decisionId && !ciclo.has(n.id)) predecesoresExternos.push(n)
      }
    }
    const initNode = predecesoresExternos.length === 1 ? predecesoresExternos[0] : null
    const backSource = nodes.find((n) => n.id === be.source)
    if (initNode && backSource) {
      const mInit = /^(\w+)\s*=\s*(.+)$/.exec(initNode.data.label || '')
      const mUpd = /^(\w+)\s*=\s*\1\s*\+\s*(.+)$/.exec(backSource.data.label || '')
      if (mInit && mUpd && mInit[1] === mUpd[1]) {
        L.tipo = 'para'
        L.initNodeId = initNode.id
        L.initText = initNode.data.label
        L.updateText = backSource.data.label
      }
    }
  }

  return L
}

// ---------------- caminata estructurada ----------------

function esSi(e) {
  return /^(si|sí|s|v|verdadero|true|yes|1)$/i.test((e?.label || '').trim())
}
function esNo(e) {
  return /^(no|n|f|falso|false|0)$/i.test((e?.label || '').trim())
}

function edgeTrue(edges) {
  if (esNo(edges[0]) && !esNo(edges[1])) return edges[1]
  if (esSi(edges[0])) return edges[0]
  if (esSi(edges[1])) return edges[1]
  return edges[0]
}
function edgeFalse(edges) {
  if (esNo(edges[0])) return edges[0]
  if (esNo(edges[1])) return edges[1]
  if (esSi(edges[0])) return edges[1]
  return edges[0]
}

function calcularJoin(a, b, stopAt, adjacency) {
  if (!a || !b) return null
  if (a === b) return a
  const bfs = (start) => {
    const orden = []
    const visit = new Set()
    const pila = [start]
    while (pila.length) {
      const u = pila.shift()
      if (visit.has(u)) continue
      visit.add(u)
      if (u !== stopAt) orden.push(u)
      for (const e of adjacency[u] ?? []) {
        if (!visit.has(e.target)) pila.push(e.target)
      }
    }
    return { orden, set: visit }
  }
  const { orden, set: setA } = bfs(a)
  const { set: setB } = bfs(b)
  for (const id of orden) {
    if (setB.has(id)) return id
  }
  if (stopAt != null && setA.has(stopAt) && setB.has(stopAt)) return stopAt
  return null
}

function walk(id, path, suppress, stopAt, ctx) {
  if (id == null) return { pasos: [], nextId: null }
  if (id === stopAt) return { pasos: [], nextId: stopAt }
  const node = ctx.nodes.find((n) => n.id === id)
  if (!node) return { pasos: [], nextId: null }
  if (node.type === 'fin') return { pasos: [], nextId: null }

  const L = ctx.loopMap[id]
  if (L && !suppress.has(L.id)) {
    const suppress2 = new Set(suppress)
    suppress2.add(L.id)
    const decisionNode = ctx.nodes.find((n) => n.id === L.decisionId)
    const cond = (decisionNode?.data.label ?? node.data.label).trim()
    const pathLoop = new Set(path)
    pathLoop.add(L.decisionId)
    let loopStep
    if (L.tipo === 'para' || L.tipo === 'mientras') {
      const cuerpo = walkBody(L.bodyStartId, L.decisionId, pathLoop, suppress2, ctx, L.tipo === 'para')
      loopStep =
        L.tipo === 'para'
          ? { type: 'para', inicializacion: L.initText, condicion: cond, actualizacion: L.updateText, cuerpo }
          : { type: 'mientras', condicion: cond, cuerpo }
    } else {
      const cuerpo = walkBody(L.entryId, L.decisionId, pathLoop, suppress2, ctx)
      loopStep = { type: 'hacerMientras', condicion: cond, cuerpo }
    }
    const next = walk(L.exitId, path, suppress, stopAt, ctx)
    return { pasos: [loopStep, ...next.pasos], nextId: next.nextId }
  }

  const out = ctx.adjacency[id] ?? []
  if (node.type === 'decision') {
    if (out.length !== 2) throw new Error(`La decisión "${node.data.label}" debe tener dos salidas.`)
    const tE = edgeTrue(out)
    const fE = edgeFalse(out)
    if (path.has(tE.target) || path.has(fE.target)) {
      throw new Error(`No se pudo convertir el diagrama: ciclo no reconocido en "${node.data.label}".`)
    }
    const join = calcularJoin(tE.target, fE.target, stopAt, ctx.adjacency)
    if (!join) {
      throw new Error(`No se encuentra el punto donde se unen las ramas del Si "${node.data.label}".`)
    }
    const thenRes = walk(tE.target, new Set([...path, id]), suppress, join, ctx)
    const elseRes = walk(fE.target, new Set([...path, id]), suppress, join, ctx)
    const paso = {
      type: 'si',
      condicion: node.data.label.trim(),
      entonces: thenRes.pasos,
      siNo: elseRes.pasos,
    }
    const next = walk(join, path, suppress, stopAt, ctx)
    return { pasos: [paso, ...next.pasos], nextId: next.nextId }
  }

  // nodo simple
  const paso = pasoDesdeNodo(node)
  if (out.length === 0) return { pasos: paso ? [paso] : [], nextId: null }
  if (out.length > 1) {
    throw new Error(`El nodo "${node.data.label}" no puede tener más de una salida.`)
  }
  if (ctx.absorbed.has(id)) {
    // nodo consumido (inicialización de un Para): no genera paso
    return walk(out[0].target, new Set([...path, id]), suppress, stopAt, ctx)
  }
  const rest = walk(out[0].target, new Set([...path, id]), suppress, stopAt, ctx)
  return { pasos: paso ? [paso, ...rest.pasos] : rest.pasos, nextId: rest.nextId }
}

function walkBody(startId, boundaryId, path, suppress, ctx, saltarUltimo) {
  const pasos = []
  let current = startId
  const visto = new Set()
  while (current && current !== boundaryId) {
    if (visto.has(current)) throw new Error('El cuerpo del ciclo no avanza hacia el nodo de decisión.')
    visto.add(current)
    const out = ctx.adjacency[current] ?? []
    if (out.length === 0) throw new Error('El flujo se corta sin cerrar el ciclo.')
    if (out.length === 1) {
      const paso = pasoDesdeNodo(ctx.nodes.find((n) => n.id === current))
      if (out[0].target === boundaryId) {
        if (!saltarUltimo && paso) pasos.push(paso)
        break
      }
      if (paso) pasos.push(paso)
      current = out[0].target
    } else {
      const sub = walk(current, path, suppress, boundaryId, ctx)
      pasos.push(...sub.pasos)
      current = sub.nextId
    }
  }
  return pasos
}

function pasoDesdeNodo(node) {
  const label = (node.data.label || '').trim()
  switch (node.type) {
    case 'inicio':
    case 'fin':
      return null
    case 'decision':
      return null
    case 'proceso': {
      if (/^Declarar\s+/i.test(label)) {
        const contenido = label.replace(/^Declarar\s+/i, '')
        const m = /^(\w+)\s+como\s+(.+)$/i.exec(contenido)
        const m2 = /^(\w+)$/.exec(contenido)
        if (m) return { type: 'declarar', nombre: m[1], tipo: tipoDesdeNombreLocal(m[2]), valor: null }
        if (m2) return { type: 'declarar', nombre: m2[1], tipo: 'int', valor: null }
        throw new Error(`Declaración no válida: "${label}"`)
      }
      const eq = label.indexOf('=')
      if (eq === -1) throw new Error(`El proceso "${label}" debe ser una asignación.`)
      return { type: 'asignar', nombre: label.slice(0, eq).trim(), valor: label.slice(eq + 1).trim() }
    }
    case 'entrada': {
      const content = /^Leer\s+/i.test(label) ? label.replace(/^Leer\s+/i, '') : label
      const variables = content.split(',').map((v) => v.trim()).filter(Boolean)
      return { type: 'leer', variables }
    }
    case 'salida': {
      const content = /^Mostrar\s+/i.test(label) ? label.replace(/^Mostrar\s+/i, '') : label
      return { type: 'mostrar', partes: partesDesdeCadena(content) }
    }
    default:
      return null
  }
}

const TIPO_NOMBRE_LOCAL_INV = { entero: 'int', real: 'float', caracter: 'char', cadena: 'string', int: 'int', float: 'float', char: 'char', string: 'string' }
function tipoDesdeNombreLocal(nombre) {
  return TIPO_NOMBRE_LOCAL_INV[nombre.toLowerCase()] ?? 'int'
}

// ============================================================
// plantillas
// ============================================================

export function flujoVacio() {
  idC = 0
  const inicio = makeNode(nid(), 400, 0, 'inicio', 'Inicio')
  const fin = makeNode(nid(), 400, 220, 'fin', 'Fin')
  return {
    nodes: [inicio, fin],
    edges: [{ id: eid(), source: inicio.id, target: fin.id }],
  }
}

export function flujoEjemplo() {
  idC = 0
  const nInicio = makeNode(nid(), 400, 0, 'inicio', 'Inicio')
  const nLeer = makeNode(nid(), 400, 120, 'entrada', 'Leer num')
  const nDec = makeNode(nid(), 400, 240, 'decision', 'num > 0')
  const nPos = makeNode(nid(), 400 - 200, 400, 'salida', 'Mostrar "Positivo"')
  const nNeg = makeNode(nid(), 400 + 200, 400, 'salida', 'Mostrar "Negativo"')
  const nFin = makeNode(nid(), 400, 520, 'fin', 'Fin')
  const e = []
  e.push({ id: eid(), source: nInicio.id, target: nLeer.id })
  e.push({ id: eid(), source: nLeer.id, target: nDec.id })
  e.push({ id: eid(), source: nDec.id, target: nPos.id, label: 'Sí' })
  e.push({ id: eid(), source: nDec.id, target: nNeg.id, label: 'No' })
  e.push({ id: eid(), source: nPos.id, target: nFin.id })
  e.push({ id: eid(), source: nNeg.id, target: nFin.id })
  return { nodes: [nInicio, nLeer, nDec, nPos, nNeg, nFin], edges: e }
}

export { programa }
