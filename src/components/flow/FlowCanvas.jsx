import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { nodeTypes } from './nodeTypes.jsx'

const COLOR_EDGE = '#7a8aa5'
const COLOR_ARROW = '#22d3ee'

const defaultEdgeOptions = {
  type: 'smoothstep',
  markerEnd: { type: MarkerType.ArrowClosed, color: COLOR_ARROW },
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
}) {
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
      className="relative overflow-hidden rounded-xl border border-night-700 bg-[#08080f]"
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
        <Background variant={BackgroundVariant.Dots} gap={22} size={1.5} color="#1b2331" />
        <Controls showInteractive={false} className="bg-night-900! border! border-night-700!" />
      </ReactFlow>
    </div>
  )
}
