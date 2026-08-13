import { useState } from 'react'
import {
  CircleDot,
  Square,
  Triangle,
  Box,
  TextCursorInput,
  CornerDownRight,
  ListOrdered,
} from 'lucide-react'
import {
  applyEdgeChanges,
  applyNodeChanges,
  addEdge,
} from '@xyflow/react'
import { NODE_SIZES } from '../../engine/flowchart.js'
import FlowCanvas from './FlowCanvas.jsx'
import { SpecLabel } from '../common/SchematicFrame.jsx'

let idSeq = 0
const nid = () => `e${++idSeq}n`

const PALETA = [
  { tipo: 'inicio', label: 'Inicio', icono: CircleDot, color: 'text-neon-cyan' },
  { tipo: 'proceso', label: 'Proceso', icono: Square, color: 'text-neon-green' },
  { tipo: 'entrada', label: 'Entrada', icono: Triangle, color: 'text-neon-pink' },
  { tipo: 'salida', label: 'Salida', icono: TextCursorInput, color: 'text-neon-amber' },
  { tipo: 'decision', label: 'Decisión', icono: Box, color: 'text-neon-cyan' },
  { tipo: 'switch', label: 'Según', icono: ListOrdered, color: 'text-neon-purple' },
  { tipo: 'fin', label: 'Fin', icono: CornerDownRight, color: 'text-neon-red' },
]

const ETIQUETA_POR_TIPO = {
  inicio: 'Inicio',
  fin: 'Fin',
  proceso: 'a = b',
  entrada: 'Leer a',
  salida: 'Mostrar a',
  decision: 'a > 0',
  switch: 'opción',
}

export default function FlowEditor({ nodes, edges, onCambio, alto = 460 }) {
  const [sel, setSel] = useState(null)

  const nodesConGuardar = nodes.map((n) => ({
    ...n,
    data: { ...n.data, onGuardar: guardarEtiqueta },
  }))

  function guardarEtiqueta(id, valor) {
    const next = nodes.map((n) =>
      n.id === id ? { ...n, data: { ...n.data, label: valor, editando: false } } : n,
    )
    onCambio(next, edges)
  }

  const onNodesChange = (cambios) => {
    const next = applyNodeChanges(cambios, nodes)
    for (const c of cambios) {
      if (c.type === 'select' && !c.selected) {
        setSel((s) => (s && s.tipo === 'nodo' && s.id === c.id ? null : s))
      }
    }
    onCambio(next, edges)
  }

  const onEdgesChange = (cambios) => {
    const next = applyEdgeChanges(cambios, edges)
    for (const c of cambios) {
      if (c.type === 'select') {
        if (c.selected) setSel({ tipo: 'arista', id: c.id })
        else setSel((s) => (s && s.tipo === 'arista' && s.id === c.id ? null : s))
      }
    }
    onCambio(nodes, next)
  }

  const onConnect = (params) => {
    const origen = nodes.find((n) => n.id === params.source)
    onCambio(
      nodes,
      addEdge(
        { ...params, label: origen?.type === 'decision' ? 'Sí' : undefined },
        edges,
      ),
    )
  }

  const onNodeDoubleClick = (_, nodo) => {
    onCambio(
      nodes.map((n) => (n.id === nodo.id ? { ...n, data: { ...n.data, editando: true } } : n)),
      edges,
    )
  }

  const agregar = (tipo) => {
    const id = nid()
    const size = NODE_SIZES[tipo] ?? { w: 160, h: 60 }
    const pos = { x: 120 + (nodes.length % 3) * 60, y: 60 + Math.floor(nodes.length / 3) * 40 }
    onCambio(
      [
        ...nodes,
        {
          id,
          type: tipo,
          position: pos,
          data: { label: ETIQUETA_POR_TIPO[tipo], size, tipo },
          sourcePosition: 'bottom',
          targetPosition: 'top',
        },
      ],
      edges,
    )
    setSel({ tipo: 'nodo', id })
  }

  const aristaSel = sel && sel.tipo === 'arista' ? edges.find((e) => e.id === sel.id) : null

  return (
    <div className="space-y-3">
      <div className="rounded-sm border border-night-700/70 bg-night-900/40 p-3">
        <SpecLabel color="cyan">Componentes · Nodos</SpecLabel>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {PALETA.map((p) => {
            const Icono = p.icono
            return (
              <button
                key={p.tipo}
                onClick={() => agregar(p.tipo)}
                title={`Agregar ${p.label}`}
                className="group flex flex-col items-center gap-1 rounded-sm border border-night-700/70 bg-night-950 px-3 py-2 transition-colors hover:border-neon-cyan/50 hover:bg-night-900"
              >
                <Icono size={14} className={`${p.color} transition-transform group-hover:-translate-y-px`} />
                <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-night-400 transition-colors group-hover:text-night-200">
                  {p.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <FlowCanvas
        nodes={nodesConGuardar}
        edges={edges}
        editable
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={onNodeDoubleClick}
        minHeight={alto}
      />

      <p className="text-xs leading-5 text-night-500">
        Doble clic sobre un nodo para renombrarlo. Haz clic en una flecha para editar su etiqueta
        (usa <span className="font-mono text-neon-cyan">Sí</span> /{' '}
        <span className="font-mono text-neon-pink">No</span> en las ramas de una decisión). Presiona{' '}
        <span className="font-mono">Supr</span> para borrar lo seleccionado.
      </p>

      {aristaSel && (
        <div className="rounded-sm border border-neon-cyan/30 bg-night-900 p-4">
          <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-night-400">
            Etiqueta de la flecha
          </label>
          <input
            value={aristaSel.label ?? ''}
            onChange={(e) =>
              onCambio(
                nodes,
                edges.map((ed) => (ed.id === aristaSel.id ? { ...ed, label: e.target.value } : ed)),
              )
            }
            className="w-full rounded-sm border border-night-700 bg-night-950 px-3 py-2 font-mono text-sm text-night-100 outline-none focus:border-neon-cyan/50"
            placeholder="Sí / No / vacío"
          />
        </div>
      )}
    </div>
  )
}
