import { useState } from 'react'
import { Check, X, Eye, Languages, ListChecks, Workflow, Braces, Lightbulb } from 'lucide-react'
import { irDesdeNatural } from '../engine/natural.js'
import { irDesdePseudo } from '../engine/pseudocode.js'
import { irDesdeCPP } from '../engine/cpp.js'
import { programaDesdeFlujo } from '../engine/flowchart.js'
import CmEditor, { NaturalEditor } from '../components/editors/Editors.jsx'
import FlowEditor from '../components/flow/FlowEditor.jsx'
import FourWays from '../components/course/FourWays.jsx'

const EJERCICIOS = [
  {
    titulo: 'Hola con tu nombre',
    consigna:
      'Declara una variable de tipo cadena llamada nombre, asígnale "Ana", y muestra "Hola Ana!".',
    pista: 'Declarar nombre como cadena, asignar el valor y mostrar un mensaje que incluya la variable.',
    programa: null,
  },
  {
    titulo: 'Edad y mensaje',
    consigna: 'Pide la edad al usuario y muestra "Tienes N años", donde N es el valor leído.',
    pista: 'Declarar edad entera, pedirla con Leer y mostrarla con %d.',
    programa: null,
  },
  {
    titulo: 'Positivo o negativo',
    consigna: 'Pide un número y muestra "Es positivo" o "Es negativo o cero" según corresponda.',
    pista: 'Usa un Si con condición num > 0.',
    programa: null,
  },
  {
    titulo: 'Contar del 1 al 10',
    consigna: 'Muestra los números del 1 al 10, uno por línea.',
    pista: 'Un ciclo Para con contador desde 1 hasta 10.',
    programa: null,
  },
  {
    titulo: 'Suma de pares',
    consigna: 'Suma los números pares del 2 al 10 y muestra el total.',
    pista: 'Acumulador + un Para que avance de 2 en 2.',
    programa: null,
  },
]

const MODOS = [
  { id: 'natural', label: 'Algoritmo', icono: Languages, color: 'text-neon-green' },
  { id: 'pseudo', label: 'Pseudocódigo', icono: ListChecks, color: 'text-neon-pink' },
  { id: 'flujo', label: 'Diagrama', icono: Workflow, color: 'text-neon-amber' },
  { id: 'cpp', label: 'C++', icono: Braces, color: 'text-neon-cyan' },
]

function contarTipo(pasos, tipo) {
  let n = 0
  for (const p of pasos) {
    if (p.type === tipo) n++
    if (p.type === 'si') {
      n += contarTipo(p.entonces, tipo) + contarTipo(p.siNo, tipo)
    }
    if (p.type === 'para' || p.type === 'mientras' || p.type === 'hacerMientras') {
      n += contarTipo(p.cuerpo, tipo)
    }
  }
  return n
}

export default function Practice() {
  const [idx, setIdx] = useState(0)
  const [modo, setModo] = useState('pseudo')
  const [texto, setTexto] = useState('')
  const [flujo, setFlujo] = useState({ nodes: [], edges: [] })
  const [resultado, setResultado] = useState(null)
  const [verSolucion, setVerSolucion] = useState(false)
  const ejercicio = EJERCICIOS[idx]

  const usarModo = (m) => {
    setModo(m)
    setResultado(null)
  }

  const validar = async () => {
    setResultado(null)
    await new Promise((r) => setTimeout(r, 30))
    let ir = null
    let error = null
    if (modo === 'natural') {
      const r = irDesdeNatural(texto)
      if (!r.ok) error = r.error
      else ir = r.programa
    } else if (modo === 'pseudo') {
      const r = irDesdePseudo(texto)
      if (!r.ok) error = r.error
      else ir = r.programa
    } else if (modo === 'cpp') {
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
      return
    }

    const lista = [
      { texto: 'El algoritmo comienza con Inicio', ok: ir.pasos[0]?.type === 'inicio' },
      { texto: 'El algoritmo termina con Fin', ok: ir.pasos[ir.pasos.length - 1]?.type === 'fin' },
    ]
    const tipos = [
      ['declarar', 'Declara variables cuando hace falta'],
      ['leer', 'Pide datos al usuario (Leer)'],
      ['mostrar', 'Muestra resultados (Mostrar)'],
      ['si', 'Usa una decisión condicional (Si)'],
      ['para', 'Usa un ciclo Para'],
      ['mientras', 'Usa un ciclo Mientras'],
      ['hacerMientras', 'Usa un ciclo Hacer-Mientras'],
    ]
    for (const [t, texto] of tipos) {
      const n = contarTipo(ir.pasos, t)
      lista.push({ texto, ok: n > 0 })
    }

    const okTotal = lista.every((x) => x.ok)
    setResultado({ ok: okTotal, lista, ir })
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-night-50">Práctica</h1>
        <p className="mt-2 max-w-2xl text-night-400">
          Resuelve cada ejercicio en la representación que prefieras. Al validar, revisamos si tu
          solución usa las instrucciones correctas.
        </p>
      </div>

      {/* selector de ejercicio */}
      <div className="mb-6 flex flex-wrap gap-2">
        {EJERCICIOS.map((e, i) => (
          <button
            key={i}
            onClick={() => {
              setIdx(i)
              setResultado(null)
              setVerSolucion(false)
              setTexto('')
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              i === idx
                ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/40'
                : 'border border-night-700 text-night-400 hover:text-night-200'
            }`}
          >
            {i + 1}. {e.titulo}
          </button>
        ))}
      </div>

      {/* consigna */}
      <div className="rounded-2xl border border-night-700 bg-night-900/60 p-5">
        <h2 className="text-lg font-bold text-night-50">{ejercicio.titulo}</h2>
        <p className="mt-1 text-sm leading-6 text-night-300">{ejercicio.consigna}</p>
        {!resultado && (
          <button
            onClick={() => setVerSolucion(true)}
            className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-neon-amber hover:underline"
          >
            <Lightbulb size={13} />
            Ver pista
          </button>
        )}
        {verSolucion && (
          <p className="mt-3 rounded-lg border border-neon-amber/30 bg-neon-amber/5 p-3 text-xs leading-5 text-neon-amber">
            💡 {ejercicio.pista}
          </p>
        )}
      </div>

      {/* modo */}
      <div className="mt-6 mb-4 flex flex-wrap gap-2">
        {MODOS.map((m) => {
          const Icono = m.icono
          const activo = modo === m.id
          return (
            <button
              key={m.id}
              onClick={() => usarModo(m.id)}
              className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                activo
                  ? 'border-neon-cyan/60 bg-neon-cyan/10 text-neon-cyan'
                  : 'border-night-700 text-night-400 hover:border-night-500 hover:text-night-200'
              }`}
            >
              <Icono size={15} className={m.color} />
              {m.label}
            </button>
          )
        })}
      </div>

      {/* editor */}
      {modo === 'natural' ? (
        <NaturalEditor value={texto} onChange={setTexto} minRows={8} />
      ) : modo === 'flujo' ? (
        <FlowEditor
          initialNodes={[
            { id: 'n1', type: 'inicio', position: { x: 250, y: 0 }, data: { label: 'Inicio', size: { w: 130, h: 58 }, tipo: 'inicio' } },
            { id: 'n2', type: 'fin', position: { x: 250, y: 300 }, data: { label: 'Fin', size: { w: 130, h: 58 }, tipo: 'fin' } },
          ]}
          initialEdges={[]}
          onCambio={(n, e) => setFlujo({ nodes: n, edges: e })}
        />
      ) : (
        <CmEditor value={texto} onChange={setTexto} lenguaje={modo} minHeight={240} />
      )}

      {/* validar */}
      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={validar}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon-cyan to-fuchsia-500 px-8 py-3 text-sm font-black text-night-950 shadow-[0_0_24px_rgba(34,211,238,0.3)] transition-all hover:shadow-[0_0_36px_rgba(34,211,238,0.5)]"
        >
          <Check size={16} />
          Validar solución
        </button>
        <button
          onClick={() => setVerSolucion((v) => !v)}
          className="flex items-center gap-2 rounded-xl border border-night-700 px-4 py-2.5 text-sm font-medium text-night-300 transition-colors hover:border-night-500 hover:text-night-100"
        >
          <Eye size={15} />
          {verSolucion ? 'Ocultar pista' : 'Ver pista'}
        </button>
      </div>

      {/* resultados */}
      {resultado && !resultado.ok && (
        <div className="mt-6 rounded-xl border border-neon-red/40 bg-neon-red/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-neon-red">
            <X size={16} />
            Tu solución aún no es válida
          </div>
          <pre className="whitespace-pre-wrap font-mono text-[13px] leading-6 text-neon-red/90">
            {resultado.error}
          </pre>
        </div>
      )}

      {resultado && resultado.ok && (
        <div className="mt-6 space-y-5">
          <div className="rounded-xl border border-neon-green/40 bg-neon-green/5 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-neon-green">
              <Check size={16} />
              ¡Tu solución es válida!
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {resultado.lista.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-night-300">
                  {item.ok ? (
                    <Check size={15} className="mt-0.5 shrink-0 text-neon-green" />
                  ) : (
                    <X size={15} className="mt-0.5 shrink-0 text-neon-red" />
                  )}
                  {item.texto}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-bold text-night-200">
              Tu algoritmo en las 4 representaciones
            </h3>
            <FourWays programa={resultado.ir} defaultTab={modo} />
          </div>
        </div>
      )}
    </div>
  )
}
