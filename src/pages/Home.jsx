import { useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight } from 'lucide-react'
import { units, unidadPorId } from '../data/units.js'
import { ACCENTS, MODE_META } from '../lib/theme.js'
import { flujoDesdePrograma } from '../engine/flowchart.js'
import SchematicFrame, { SpecLabel } from '../components/common/SchematicFrame.jsx'
import FlowCanvas from '../components/flow/FlowCanvas.jsx'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function Home() {
  const raiz = useRef(null)

  const flujoHero = useMemo(
    () => flujoDesdePrograma(unidadPorId('unidad-1').ejemplos[0].programa),
    [],
  )

  useGSAP(
    () => {
      gsap.fromTo(
        '.hero-titulo',
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' },
      )
      gsap.fromTo(
        '.hero-sub',
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 0.12, ease: 'power3.out' },
      )
      gsap.fromTo(
        '.hero-cta',
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, delay: 0.24, ease: 'power3.out' },
      )
      gsap.utils.toArray('.card-unidad').forEach((card) => {
        gsap.fromTo(
          card,
          { y: 32, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 88%' },
          },
        )
      })
      gsap.fromTo(
        '.seccion-como',
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.seccion-como', start: 'top 88%' },
        },
      )
    },
    { scope: raiz },
  )

  return (
    <div ref={raiz}>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-night-700/70 bg-blueprint">
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-10 flex-col items-center justify-between border-r border-night-700/50 py-6 lg:flex">
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-night-600 [writing-mode:vertical-rl]">
            plano n°001
          </span>
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-night-600">
            40PX
          </span>
        </div>

        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24 lg:pl-16">
          <div>
            <SpecLabel color="cyan">Curso de algoritmos · Univ. Mariano Gálvez</SpecLabel>
            <h1 className="hero-titulo mt-5 font-heading text-[2.7rem] font-bold uppercase leading-[0.95] tracking-tight text-night-50 sm:text-6xl lg:text-7xl">
              Un mismo algoritmo,
              <br />
              <span className="text-neon-cyan">cuatro formas de decirlo</span>
            </h1>
            <p className="hero-sub mt-6 max-w-xl text-base leading-7 text-night-300 sm:text-lg sm:leading-8">
              Domina la programación desde cero: escribes cada algoritmo como texto, en
              pseudocódigo, como diagrama de flujo y en C++ real — y el convertidor traduce entre
              las cuatro. (Proximamente más lenguajes)
            </p>
            <div className="hero-cta mt-9 flex flex-wrap items-center gap-3">
              <Link
                to="/unidad/unidad-1"
                className="flex items-center gap-2 rounded-sm bg-neon-cyan px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-night-950 shadow-[0_0_24px_rgba(34,211,238,0.28)] transition-shadow hover:shadow-[0_0_36px_rgba(34,211,238,0.45)]"
              >
                Empezar el curso
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/convertidor"
                className="flex items-center gap-2 rounded-sm border border-night-600 px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-night-200 transition-colors hover:border-neon-cyan/60 hover:text-neon-cyan"
              >
                Probar el convertidor
              </Link>
            </div>
          </div>

          <div className="hero-schematic">
            <SchematicFrame tag="FIG-01 · HOLAMUNDO.C" accent="cyan" className="bg-blueprint">
              <div className="p-3 sm:p-4">
                <FlowCanvas
                  nodes={flujoHero.nodes}
                  edges={flujoHero.edges}
                  editable={false}
                  minHeight={360}
                />
              </div>
            </SchematicFrame>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-night-700/70 pt-3">
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-night-500">
                4 representaciones · 1 intención
              </span>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                {[MODE_META.natural, MODE_META.pseudo, MODE_META.flujo, MODE_META.cpp].map((m) => (
                  <span
                    key={m.label}
                    className="inline-flex items-center gap-1.5 font-mono text-[9px] font-semibold uppercase tracking-widest text-night-400"
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: m.fill }} />
                    {m.corto}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* UNIDADES */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:pl-16">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <SpecLabel>Sección 01 · Contenido</SpecLabel>
            <h2 className="mt-3 font-heading text-3xl font-bold uppercase tracking-tight text-night-50 sm:text-4xl">
              El camino de 4 unidades
            </h2>
            <p className="mt-2 text-night-400">Cada unidad suma una herramienta nueva a tu caja.</p>
          </div>
          <Link
            to="/unidad/unidad-1"
            className="hidden items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-widest text-neon-cyan hover:underline sm:flex"
          >
            Comenzar <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {units.map((u) => {
            const acento = ACCENTS[u.color]
            return (
              <Link
                key={u.id}
                to={`/unidad/${u.id}`}
                className="card-unidad group relative rounded-sm border border-night-700/70 bg-night-900/40 p-5 transition-colors hover:border-night-500"
              >
                <span
                  className="pointer-events-none absolute inset-y-4 left-0 w-0.75 opacity-70 transition-opacity group-hover:opacity-100"
                  style={{ backgroundColor: acento.fill }}
                />
                <span className="pointer-events-none absolute -left-px -top-px h-2 w-2 border-l-2 border-t-2 border-night-500 transition-colors group-hover:border-night-300" />
                <span className="pointer-events-none absolute -right-px -top-px h-2 w-2 border-r-2 border-t-2 border-night-500 transition-colors group-hover:border-night-300" />
                <span className="pointer-events-none absolute -left-px -bottom-px h-2 w-2 border-l-2 border-b-2 border-night-500 transition-colors group-hover:border-night-300" />
                <span className="pointer-events-none absolute -right-px -bottom-px h-2 w-2 border-r-2 border-b-2 border-night-500 transition-colors group-hover:border-night-300" />

                <SpecLabel color={u.color}>
                  U-0{u.numero} · {u.corto}
                </SpecLabel>
                <h3 className="mt-4 font-heading text-xl font-bold uppercase leading-5 tracking-wide text-night-50 transition-colors group-hover:text-white">
                  {u.titulo}
                </h3>
                <p className="mt-2 text-xs leading-5 text-night-400">{u.descripcion}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-night-400 transition-colors group-hover:text-neon-cyan">
                  Entrar
                  <ArrowRight size={12} />
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="seccion-como border-t border-night-700/70 bg-night-900/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:pl-16">
          <SpecLabel>Sección 02 · Proceso</SpecLabel>
          <h2 className="mt-3 font-heading text-3xl font-bold uppercase tracking-tight text-night-50 sm:text-4xl">
            ¿Cómo funciona?
          </h2>
          <div className="relative mt-9 grid gap-4 md:grid-cols-3">
            {[
              {
                t: 'Aprende el concepto',
                d: 'Cada unidad explica la teoría con ejemplos y los muestra en las 4 representaciones.',
              },
              {
                t: 'Practica y valida',
                d: 'Escribe tus soluciones en cualquier lenguaje del curso y valida su estructura al instante.',
              },
              {
                t: 'Compila C++ real',
                d: 'El laboratorio compila y ejecuta tu código C++ dentro del navegador. Sin instalar nada.',
              },
            ].map((paso, i) => (
              <div key={paso.t} className="relative rounded-sm border border-night-700/70 bg-night-900/40 p-6">
                <SpecLabel color={['cyan', 'green', 'amber'][i]}>
                  PASO {i + 1}/3
                </SpecLabel>
                <h3 className="mt-3 font-heading text-2xl font-bold uppercase tracking-wide text-night-50">
                  {paso.t}
                </h3>
                <p className="mt-2 text-sm leading-6 text-night-400">{paso.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
