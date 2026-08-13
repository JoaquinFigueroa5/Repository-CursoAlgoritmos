import { useCallback, useMemo, useRef } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  Panel,
  useReactFlow,
  getViewportForBounds,
} from '@xyflow/react'
import { toPng } from 'html-to-image'
import { Download } from 'lucide-react'
import '@xyflow/react/dist/style.css'
import { nodeTypes } from './nodeTypes.jsx'

const COLOR_EDGE = '#7a8aa5'
const COLOR_ARROW = '#22d3ee'

const defaultEdgeOptions = {
  type: 'smoothstep',
  markerEnd: { type: MarkerType.ArrowClosed, color: COLOR_ARROW },
}

function DescargarDiagrama({ contenedorRef }) {
  const { getNodes, getNodesBounds } = useReactFlow()

  const descargar = useCallback(async () => {
    const viewportEl = contenedorRef.current?.querySelector('.react-flow__viewport')
    if (!viewportEl) return
    try {
      const bounds = getNodesBounds(getNodes())
      const pad = 60
      const ancho = Math.round(Math.max(bounds.width + pad * 2, 400))
      const alto = Math.round(Math.max(bounds.height + pad * 2, 300))
      const viewport = getViewportForBounds(bounds, ancho, alto, 0.25, 2, 0)
      const dataUrl = await toPng(viewportEl, {
        backgroundColor: '#07070d',
        width: ancho,
        height: alto,
        style: {
          width: `${ancho}px`,
          height: `${alto}px`,
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        },
      })
      const enlace = document.createElement('a')
      enlace.download = 'diagrama-de-flujo.png'
      enlace.href = dataUrl
      enlace.click()
    } catch {
      // captura fallida: se ignora silenciosamente
    }
  }, [contenedorRef, getNodes, getNodesBounds])

  return (
    <Panel position="top-right">
      <button
        onClick={descargar}
        title="Descargar el diagrama como imagen PNG"
        className="flex items-center gap-1.5 rounded-sm border border-night-600 bg-night-900/90 px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-night-300 transition-colors hover:border-neon-cyan/50 hover:text-neon-cyan"
      >
        <Download size={12} />
        Export PNG
      </button>
    </Panel>
  )
}

export default function FlowCanvas({
  nodes,
  edges,
  editable = false,
  onNodesChange: onNodesChangeExt,
  onEdgesChange: onEdgesChangeExt,
  onConnect: onConnectExt,
  onNodeDoubleClick,
  minHeight = 380,
  fitView = true,
  className = '',
}) {
  const contenedorRef = useRef(null)
  const handleNodesChange = useCallback(
    (changes) => {
      if (onNodesChangeExt) onNodesChangeExt(changes)
    },
    [onNodesChangeExt],
  )

  const handleEdgesChange = useCallback(
    (changes) => {
      if (onEdgesChangeExt) onEdgesChangeExt(changes)
    },
    [onEdgesChangeExt],
  )

  const handleConnect = useCallback(
    (params) => {
      if (onConnectExt) onConnectExt(params)
    },
    [onConnectExt],
  )

  const renderEdges = useMemo(
    () =>
      edges.map((e) => ({
        ...e,
        type: 'smoothstep',
        style: { stroke: e.animated ? COLOR_ARROW : COLOR_EDGE, strokeWidth: e.animated ? 1.8 : 1.4 },
        markerEnd: e.markerEnd ?? defaultEdgeOptions.markerEnd,
        labelStyle: { fill: '#9aa5bd', fontSize: 11, fontWeight: 600 },
        labelBgStyle: { fill: 'rgba(9,10,20,0.95)', fillOpacity: 1, stroke: '#232c3c', strokeWidth: 1 },
        labelBgPadding: [6, 3],
      })),
    [edges],
  )

  return (
    <div
      ref={contenedorRef}
      className={`relative overflow-hidden rounded-sm border border-night-700/70 bg-night-950 ${className}`}
      style={{ height: minHeight, width: '100%' }}
    >
      <ReactFlow
        nodes={nodes}
        edges={renderEdges}
        nodeTypes={nodeTypes}
        onNodesChange={editable ? handleNodesChange : undefined}
        onEdgesChange={editable ? handleEdgesChange : undefined}
        onConnect={editable ? handleConnect : undefined}
        onNodeDoubleClick={editable ? onNodeDoubleClick : undefined}
        defaultEdgeOptions={defaultEdgeOptions}
        nodesDraggable={editable}
        nodesConnectable={editable}
        elementsSelectable
        minZoom={0.1}
        maxZoom={2}
        fitView={fitView}
        fitViewOptions={{ padding: 0.25 }}
        proOptions={{ hideAttribution: true }}
        colorMode="dark"
      >
        <Background variant={BackgroundVariant.Lines} gap={20} size={1} color="rgba(34,211,238,0.08)" />
        <Controls showInteractive={false} className="bg-night-900! border! border-night-700!" />
        <DescargarDiagrama contenedorRef={contenedorRef} />
      </ReactFlow>
    </div>
  )
}
