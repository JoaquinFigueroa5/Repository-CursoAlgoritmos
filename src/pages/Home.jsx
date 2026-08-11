import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, Sparkles, Monitor, Keyboard, GitBranch, Repeat } from 'lucide-react'
import { units } from '../data/units.js'
import { ACCENTS } from '../lib/theme.js'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const ICONOS = { Monitor, Keyboard, GitBranch, Repeat }

export default function Home() {
  const raiz = useRef(null)

  useGSAP(
    () => {
      gsap.fromTo(
        '.hero-titulo',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' },
      )
      gsap.fromTo(
        '.hero-sub',
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.15, ease: 'power3.out' },
      )
      gsap.fromTo(
        '.hero-cta',
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, delay: 0.3, stagger: 0.1, ease: 'power3.out' },
      )
      gsap.utils.toArray('.card-unidad').forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            delay: 0.1 * i,
            ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 85%' },
          },
        )
      })
      gsap.fromTo(
        '.seccion-como',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.seccion-como', start: 'top 85%' },
        },
      )
    },
    { scope: raiz },
  )

  return (
    <div ref={raiz}>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-night-800">
        <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-neon-cyan/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-4 py-24 text-center sm:px-6 sm:py-32">
          <div className="hero-titulo">
            <span className="inline-flex items-center gap-2 rounded-full border border-neon-cyan/40 bg-neon-cyan/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-neon-cyan">
              <Sparkles size={13} />
              Curso de AlgoritmosUMG
            </span>
            <h1 className="mt-6 text-4xl font-black leading-tight text-night-50 sm:text-6xl">
              Un mismo algoritmo,
              <br />
              <span className="bg-linear-to-b from-neon-cyan via-fuchsia-400 to-neon-amber bg-clip-text text-transparent">
                cuatro formas de decirlo
              </span>
            </h1>
          </div>
          <p className="hero-sub mx-auto mt-6 max-w-2xl text-lg leading-8 text-night-300">
            Domina la programación desde cero: escribes cada algoritmo como texto, en pseudocódigo,
            como diagrama de flujo y en C++ real — y el convertidor traduce entre las cuatro.
          </p>
          <div className="hero-cta mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/unidad/unidad-1"
              className="flex items-center gap-2 rounded-xl bg-neon-cyan px-8 py-3.5 text-sm font-black text-night-950 shadow-[0_0_28px_rgba(34,211,238,0.4)] transition-shadow hover:shadow-[0_0_44px_rgba(34,211,238,0.6)]"
            >
              Empezar el curso
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/convertidor"
              className="rounded-xl border border-night-600 px-8 py-3.5 text-sm font-bold text-night-200 transition-colors hover:border-neon-cyan/60 hover:text-neon-cyan"
            >
              Probar el convertidor
            </Link>
          </div>
        </div>
      </section>

      {/* UNIDADES */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black text-night-50 sm:text-3xl">El camino de 4 unidades</h2>
            <p className="mt-2 text-night-400">Cada unidad suma una herramienta nueva a tu caja.</p>
          </div>
          <Link to="/unidad/unidad-1" className="hidden items-center gap-1 text-sm font-semibold text-neon-cyan hover:underline sm:flex">
            Comenzar <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {units.map((u) => {
            const acento = ACCENTS[u.color]
            const Icono = ICONOS[u.icono] ?? Monitor
            return (
              <Link
                key={u.id}
                to={`/unidad/${u.id}`}
                className="card-unidad group relative overflow-hidden rounded-2xl border border-night-700 bg-night-900/60 p-5 transition-all hover:-translate-y-1 hover:border-night-500"
              >
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-neon-cyan/0 blur-2xl transition-all group-hover:bg-neon-cyan/15" />
                <div className="relative">
                  <span
                    className={`inline-flex rounded-lg border p-2 ${acento.border} ${acento.bgSoft}`}
                  >
                    <Icono size={20} className={acento.text} />
                  </span>
                  <p className={`mt-4 text-[11px] font-bold uppercase tracking-[0.2em] ${acento.text}`}>
                    Unidad {u.numero}
                  </p>
                  <h3 className="mt-1 text-base font-bold leading-5 text-night-50">{u.titulo}</h3>
                  <p className="mt-2 text-xs leading-5 text-night-400">{u.descripcion}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-night-300 transition-colors group-hover:text-neon-cyan">
                    Entrar
                    <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="seccion-como border-t border-night-800">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-black text-night-50 sm:text-3xl">¿Cómo funciona?</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              {
                n: '01',
                t: 'Aprende el concepto',
                d: 'Cada unidad explica la teoría con ejemplos y los muestra en las 4 representaciones.',
              },
              {
                n: '02',
                t: 'Practica y valida',
                d: 'Escribe tus soluciones en cualquier lenguaje del curso y valida su estructura al instante.',
              },
              {
                n: '03',
                t: 'Compila C++ real',
                d: 'El laboratorio compila y ejecuta tu código C++ dentro del navegador. Sin instalar nada.',
              },
            ].map((paso) => (
              <div key={paso.n} className="rounded-2xl border border-night-700 bg-night-900/50 p-6">
                <span className="bg-linear-to-b from-neon-cyan to-fuchsia-500 bg-clip-text text-4xl font-black text-transparent">
                  {paso.n}
                </span>
                <h3 className="mt-3 font-bold text-night-50">{paso.t}</h3>
                <p className="mt-2 text-sm leading-6 text-night-400">{paso.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
