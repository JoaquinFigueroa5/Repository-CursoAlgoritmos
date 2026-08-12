import { useMemo, useState } from 'react'
import { ArrowRightLeft, Languages, ListChecks, Workflow, Braces, Loader2, TriangleAlert } from 'lucide-react'
import { naturalDesdePrograma, irDesdeNatural } from '../engine/natural.js'
import { pseudoDesdePrograma, irDesdePseudo } from '../engine/pseudocode.js'
import { cppDesdePrograma, irDesdeCPP } from '../engine/cpp.js'
import { flujoDesdePrograma, programaDesdeFlujo, flujoEjemplo, altoDelFlujo } from '../engine/flowchart.js'
import { unidadPorId } from '../data/units.js'
import CmEditor, { NaturalEditor } from '../components/editors/Editors.jsx'
import FlowEditor from '../components/flow/FlowEditor.jsx'
import FlowCanvas from '../components/flow/FlowCanvas.jsx'
import CodeBlock from '../components/common/CodeBlock.jsx'

function FlowCanvasSimple({ nodes, edges }) {
  return <FlowCanvas nodes={nodes} edges={edges} editable={false} minHeight={Math.max(380, Math.min(altoDelFlujo(nodes) + 90, 1100))} />
}

const FUENTES = [
  { id: 'natural', label: 'Algoritmo', icono: Languages, color: 'text-neon-green' },
  { id: 'pseudo', label: 'Pseudocódigo', icono: ListChecks, color: 'text-neon-pink' },
  { id: 'flujo', label: 'Diagrama', icono: Workflow, color: 'text-neon-amber' },
  { id: 'cpp', label: 'C++', icono: Braces, color: 'text-neon-cyan' },
]

const EJEMPLO_INICIAL = {
  consigna: 'Pedir un número y decir si es positivo o negativo.',
  programa: unidadPorId('unidad-3').ejemplos[0].programa,
}

export default function Converter() {
  const [fuente, setFuente] = useState('natural')
  const [texto, setTexto] = useState(() => naturalDesdePrograma(EJEMPLO_INICIAL.programa))
  const [flujo, setFlujo] = useState(() => flujoEjemplo())
  const [cargando, setCargando] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [ejemploSel, setEjemploSel] = useState('')

  const cargarEjemplo = (ej) => {
    if (fuente === 'flujo') {
      setFlujo(flujoDesdePrograma(ej.programa))
    } else {
      setTexto(
        fuente === 'natural'
          ? naturalDesdePrograma(ej.programa)
          : fuente === 'pseudo'
            ? pseudoDesdePrograma(ej.programa)
            : cppDesdePrograma(ej.programa),
      )
    }
    setResultado(null)
  }

  const cambiarFuente = (destino) => {
    if (destino === fuente) return
    let ir = null
    let error = null
    if (fuente === 'flujo') {
      const r = programaDesdeFlujo(flujo.nodes, flujo.edges)
      if (!r.ok) error = r.error
      else ir = r.programa
    } else {
      const r =
        fuente === 'natural' ? irDesdeNatural(texto) : fuente === 'pseudo' ? irDesdePseudo(texto) : irDesdeCPP(texto)
      if (!r.ok) error = r.error
      else ir = r.programa
    }
    if (error) {
      setResultado({ ok: false, error })
      return
    }
    if (destino === 'flujo') {
      setFlujo(flujoDesdePrograma(ir))
    } else if (destino === 'natural') {
      setTexto(naturalDesdePrograma(ir))
    } else if (destino === 'pseudo') {
      setTexto(pseudoDesdePrograma(ir))
    } else {
      setTexto(cppDesdePrograma(ir))
    }
    setFuente(destino)
    setResultado(null)
  }

  const convert = useMemo(() => {
    const fn = async () => {
      setCargando(true)
      setResultado(null)
      await new Promise((r) => setTimeout(r, 30))
      try {
        let ir = null
        let error = null
        if (fuente === 'natural') {
          const r = irDesdeNatural(texto)
          if (!r.ok) error = r.error
          else ir = r.programa
        } else if (fuente === 'pseudo') {
          const r = irDesdePseudo(texto)
          if (!r.ok) error = r.error
          else ir = r.programa
        } else if (fuente === 'cpp') {
          const r = irDesdeCPP(texto)
          if (!r.ok) error = r.error
          else ir = r.programa
        } else {
          const r = programaDesdeFlujo(flujo.nodes, flujo.edges)
          if (!r.ok) error = r.error
          else ir = r.programa
        }
        if (error) {
          setResultado({ ok: false, error })
        } else {
          const reps = {}
          if (fuente !== 'natural') reps.natural = naturalDesdePrograma(ir)
          if (fuente !== 'pseudo') reps.pseudo = pseudoDesdePrograma(ir)
          if (fuente !== 'flujo') {
            try {
              reps.flujo = flujoDesdePrograma(ir)
            } catch {
              reps.flujo = null
            }
          }
          if (fuente !== 'cpp') reps.cpp = cppDesdePrograma(ir)
          setResultado({ ok: true, reps })
        }
      } catch (e) {
        setResultado({ ok: false, error: String(e?.message ?? e) })
      } finally {
        setCargando(false)
      }
    }
    return fn
  }, [fuente, texto, flujo])

  const ejemplos = [
    { label: 'Hola mundo', programa: unidadPorId('unidad-1').ejemplos[0].programa },
    { label: 'Suma de dos números', programa: unidadPorId('unidad-2').ejemplos[0].programa },
    { label: 'Positivo o negativo', programa: EJEMPLO_INICIAL.programa },
    { label: 'Contar del 1 al 10', programa: unidadPorId('unidad-4').ejemplos[0].programa },
    { label: 'Suma los primeros N', programa: unidadPorId('unidad-4').ejemplos[3].programa },
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-night-50">Convertidor</h1>
        <p className="mt-2 max-w-2xl text-night-400">
          Escribe un algoritmo en cualquiera de las 4 representaciones y conviértelo a las demás. El
          convertidor entiende todo el vocabulario del curso.
        </p>
      </div>

      {/* selector de fuente */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FUENTES.map((f) => {
          const Icono = f.icono
          const activo = fuente === f.id
          return (
            <button
              key={f.id}
              onClick={() => cambiarFuente(f.id)}
              className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                activo
                  ? 'border-neon-cyan/60 bg-neon-cyan/10 text-neon-cyan'
                  : 'border-night-700 text-night-400 hover:border-night-500 hover:text-night-200'
              }`}
            >
              <Icono size={15} className={f.color} />
              {f.label}
            </button>
          )
        })}
        <span className="mx-1 hidden text-night-600 sm:block">|</span>
        <select
          value={ejemploSel}
          onChange={(e) => {
            cargarEjemplo(ejemplos[e.target.value])
            setEjemploSel('')
          }}
          className="rounded-xl border border-night-700 bg-night-900 px-3 py-2 text-sm text-night-300 outline-none focus:border-neon-cyan/50"
        >
          <option value="" disabled>
            Cargar ejemplo…
          </option>
          {ejemplos.map((ej, i) => (
            <option key={i} value={i}>
              {ej.label}
            </option>
          ))}
        </select>
      </div>

      {/* editor fuente */}
      {fuente === 'natural' ? (
        <NaturalEditor value={texto} onChange={setTexto} minRows={8} />
      ) : fuente === 'flujo' ? (
        <FlowEditor
          nodes={flujo.nodes}
          edges={flujo.edges}
          onCambio={(n, e) => setFlujo({ nodes: n, edges: e })}
        />
      ) : (
        <CmEditor value={texto} onChange={setTexto} lenguaje={fuente} minHeight={240} />
      )}

      {/* convertir */}
      <div className="mt-5 flex justify-center">
        <button
          onClick={convert}
          disabled={cargando}
          className="flex items-center gap-2 rounded-xl bg-linear-to-b from-neon-cyan to-fuchsia-500 px-8 py-3 text-sm font-black text-night-950 shadow-[0_0_24px_rgba(34,211,238,0.35)] transition-all hover:shadow-[0_0_36px_rgba(34,211,238,0.55)] disabled:cursor-wait disabled:opacity-60"
        >
          {cargando ? <Loader2 size={16} className="animate-spin" /> : <ArrowRightLeft size={16} />}
          Convertir
        </button>
      </div>

      {/* resultados */}
      {resultado && !resultado.ok && (
        <div className="mt-6 rounded-xl border border-neon-red/40 bg-neon-red/5 p-4">
          <div className="mb-1 flex items-center gap-2 text-sm font-bold text-neon-red">
            <TriangleAlert size={16} />
            No se pudo convertir
          </div>
          <pre className="whitespace-pre-wrap font-mono text-[13px] leading-6 text-neon-red/90">
            {resultado.error}
          </pre>
        </div>
      )}

      {resultado && resultado.ok && (
        <div className="mt-8 grid gap-6">
          {resultado.reps.natural && (
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-neon-green">
                <Languages size={15} /> Algoritmo en lenguaje natural
              </h3>
              <CodeBlock code={resultado.reps.natural} label="algoritmo.txt" />
            </div>
          )}
          {resultado.reps.pseudo && (
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-neon-pink">
                <ListChecks size={15} /> Pseudocódigo
              </h3>
              <CodeBlock code={resultado.reps.pseudo} label="algoritmo.pseudo" />
            </div>
          )}
          {resultado.reps.cpp && (
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-neon-cyan">
                <Braces size={15} /> Código C++
              </h3>
              <CodeBlock code={resultado.reps.cpp} label="programa.cpp" />
            </div>
          )}
          {resultado.reps.flujo && (
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-neon-amber">
                <Workflow size={15} /> Diagrama de flujo
              </h3>
              <FlowCanvasSimple nodes={resultado.reps.flujo.nodes} edges={resultado.reps.flujo.edges} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

