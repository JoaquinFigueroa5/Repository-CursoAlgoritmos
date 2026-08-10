import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  BookOpenText,
  Code2,
  ListChecks,
  Flag,
  ChevronLeft,
  ChevronRight,
  Target,
  Rocket,
} from 'lucide-react'
import { units, unidadPorId } from '../../data/units.js'
import { ACCENTS } from '../../lib/theme.js'
import RichText from '../common/RichText.jsx'
import FourWays from './FourWays.jsx'
import QuestionAccordion from './QuestionAccordion.jsx'
import CppLab from '../editors/CppLab.jsx'

const SECCIONES = [
  { id: 'teoria', label: 'Teoría', icono: BookOpenText },
  { id: 'ejemplos', label: 'Ejemplos', icono: Code2 },
  { id: 'preguntas', label: 'Preguntas', icono: ListChecks },
  { id: 'laboratorio', label: 'Laboratorio', icono: Rocket },
  { id: 'reto', label: 'Reto', icono: Flag },
]

export default function UnitView() {
  const { id } = useParams()
  const unidad = unidadPorId(id)
  const [seccion, setSeccion] = useState('teoria')

  if (!unidad) {
    return (
      <div className="py-24 text-center">
        <p className="text-night-300">Unidad no encontrada.</p>
        <Link to="/" className="text-neon-cyan underline">
          Volver al inicio
        </Link>
      </div>
    )
  }

  const acento = ACCENTS[unidad.color] ?? ACCENTS.cyan
  const idx = units.findIndex((u) => u.id === unidad.id)
  const prev = units[idx - 1]
  const next = units[idx + 1]

  return (
    <div className="pb-20">
      {/* encabezado */}
      <header
        className={`relative overflow-hidden border-b border-night-800 bg-gradient-to-b ${unidad.color === 'cyan' ? 'from-neon-cyan/15' : unidad.color === 'magenta' ? 'from-neon-pink/15' : unidad.color === 'green' ? 'from-neon-green/15' : 'from-neon-amber/15'} to-night-950`}
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-neon-cyan/10 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] ${acento.border} ${acento.text} ${acento.bgSoft}`}
          >
            Unidad {unidad.numero}
          </span>
          <h1 className="mt-4 text-3xl font-black leading-tight text-night-50 sm:text-4xl">
            {unidad.titulo}
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-night-300">{unidad.descripcion}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {unidad.objetivos.map((o, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 rounded-lg border border-night-700 bg-night-900/70 px-3 py-1.5 text-xs text-night-300"
              >
                <Target size={12} className={acento.text} />
                {o}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* navegación por secciones */}
      <nav className="sticky top-14 z-30 border-b border-night-800 bg-night-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
          {SECCIONES.map((s) => {
            const Icono = s.icono
            const activa = seccion === s.id
            return (
              <button
                key={s.id}
                onClick={() => setSeccion(s.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activa ? `${acento.bgSoft} ${acento.text} ${acento.border}` : 'text-night-400 hover:bg-night-800 hover:text-night-200'
                }`}
              >
                <Icono size={13} />
                {s.label}
              </button>
            )
          })}
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* TEORÍA */}
        {seccion === 'teoria' && (
          <div className="space-y-5">
            {unidad.teoria.map((bloque, i) => (
              <RichText key={i} bloque={bloque} />
            ))}
          </div>
        )}

        {/* EJEMPLOS */}
        {seccion === 'ejemplos' && (
          <div className="space-y-8">
            {unidad.ejemplos.map((ej, i) => (
              <div key={i} className="rounded-2xl border border-night-700 bg-night-900/40 p-4 sm:p-5">
                <div className="mb-3 flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${acento.bgSoft} ${acento.text} ${acento.border}`}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-night-50">{ej.titulo}</h3>
                    <p className="text-sm text-night-400">{ej.consigna}</p>
                  </div>
                </div>
                <FourWays programa={ej.programa} defaultTab="natural" />
              </div>
            ))}
          </div>
        )}

        {/* PREGUNTAS */}
        {seccion === 'preguntas' && (
          <div className="space-y-4">
            <p className="text-sm text-night-400">
              Toca una pregunta para ver la respuesta. Intenta responderla primero con tus palabras.
            </p>
            <QuestionAccordion preguntas={unidad.preguntas} />
          </div>
        )}

        {/* LABORATORIO */}
        {seccion === 'laboratorio' && (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-night-300">
              Compila y ejecuta C++ directamente en tu navegador. Prueba los ejemplos de la unidad o
              escribe tu propio código.
            </p>
            <CppLab />
          </div>
        )}

        {/* RETO */}
        {seccion === 'reto' && unidad.reto && (
          <div
            className={`rounded-2xl border-2 border-dashed p-6 ${acento.border} ${acento.bgSoft}`}
          >
            <span className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] ${acento.text}`}>
              <Flag size={14} />
              Reto de la unidad
            </span>
            <h3 className="mt-2 text-xl font-bold text-night-50">{unidad.reto.titulo}</h3>
            <p className="mt-2 leading-7 text-night-200">{unidad.reto.descripcion}</p>
            <button
              onClick={() => setSeccion('laboratorio')}
              className={`mt-4 rounded-lg px-4 py-2 text-sm font-bold text-night-950 ${acento.text === 'text-neon-cyan' ? 'bg-neon-cyan' : acento.text === 'text-neon-pink' ? 'bg-neon-pink' : acento.text === 'text-neon-green' ? 'bg-neon-green' : 'bg-neon-amber'} transition-opacity hover:opacity-90`}
            >
              Ir al laboratorio
            </button>
          </div>
        )}

        {/* navegación entre unidades */}
        <div className="mt-14 flex items-center justify-between gap-4">
          {prev ? (
            <Link
              to={`/unidad/${prev.id}`}
              className="flex items-center gap-2 rounded-xl border border-night-700 px-4 py-3 text-sm text-night-300 transition-colors hover:border-night-500 hover:text-night-100"
            >
              <ChevronLeft size={16} />
              <span>
                <span className="block text-[10px] uppercase tracking-widest text-night-500">Anterior</span>
                {prev.titulo}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              to={`/unidad/${next.id}`}
              className="flex items-center gap-2 rounded-xl border border-night-700 px-4 py-3 text-right text-sm text-night-300 transition-colors hover:border-night-500 hover:text-night-100"
            >
              <span>
                <span className="block text-[10px] uppercase tracking-widest text-night-500">Siguiente</span>
                {next.titulo}
              </span>
              <ChevronRight size={16} />
            </Link>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  )
}
