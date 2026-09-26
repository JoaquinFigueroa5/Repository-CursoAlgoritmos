import { NavLink, Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Home, ArrowRightLeft, PenTool, Terminal } from 'lucide-react'
import { units } from '../data/units.js'
import { MODE_META } from '../lib/theme.js'
import RouteTransition from './RouteTransition.jsx'

const NAV = [
  { to: '/', label: 'Inicio', icono: Home },
  { to: '/convertidor', label: 'Convertidor', icono: ArrowRightLeft },
  { to: '/practica', label: 'Práctica', icono: PenTool },
  { to: '/laboratorio', label: 'Laboratorio', icono: Terminal },
]

const CLAVE = [MODE_META.natural, MODE_META.pseudo, MODE_META.flujo, MODE_META.cpp]

const MARCA = () => (
  <span className="relative flex h-8 w-8 items-center justify-center border border-night-600 bg-night-900">
    <span className="absolute -left-px -top-px h-1.5 w-1.5 border-l-2 border-t-2 border-night-400" />
    <span className="absolute -right-px -top-px h-1.5 w-1.5 border-r-2 border-t-2 border-night-400" />
    <span className="absolute -left-px -bottom-px h-1.5 w-1.5 border-l-2 border-b-2 border-night-400" />
    <span className="absolute -right-px -bottom-px h-1.5 w-1.5 border-r-2 border-b-2 border-night-400" />
    <span className="font-heading text-lg font-bold leading-none text-neon-cyan">A</span>
  </span>
)

export default function Layout({ children }) {
  const { pathname } = useLocation()
  const [menuAbierto, setMenuAbierto] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-screen bg-night-950 text-night-100">
      {/* barra de clave de las 4 representaciones */}
      <div className="flex h-0.5 w-full">
        {CLAVE.map((c) => (
          <span key={c.label} className="flex-1" style={{ backgroundColor: c.fill }} />
        ))}
      </div>

      {/* barra superior */}
      <header className="sticky top-0 z-40 border-b border-night-700/70 bg-night-950/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <MARCA />
            <span className="flex items-baseline gap-1.5">
              <span className="font-heading text-lg font-bold uppercase tracking-wide text-night-50">
                Algoritmos<span className="text-neon-cyan">UMG</span>
              </span>
              <span className="font-mono text-[10px] font-semibold tracking-widest text-night-500">
                ·LAB
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => {
              const Icono = n.icono
              return (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 border-b-2 px-3 py-1 text-sm font-semibold transition-colors ${
                      isActive
                        ? 'border-neon-cyan text-night-50'
                        : 'border-transparent text-night-400 hover:border-night-600 hover:text-night-200'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icono size={14} className={isActive ? 'text-neon-cyan' : ''} />
                      {n.label}
                    </>
                  )}
                </NavLink>
              )
            })}
            <span className="mx-2 h-5 w-px bg-night-700" />
            <div className="flex items-center gap-1.5">
              {units.map((u) => (
                <NavLink
                  key={u.id}
                  to={`/unidad/${u.id}`}
                  title={u.titulo}
                  className={({ isActive }) =>
                    `relative flex h-7 w-7 items-center justify-center border font-mono text-[11px] font-bold transition-colors ${
                      isActive
                        ? 'border-neon-cyan/60 bg-neon-cyan/10 text-neon-cyan'
                        : 'border-night-700 text-night-500 hover:border-night-500 hover:text-night-200'
                    }`
                  }
                >
                  {u.numero}
                </NavLink>
              ))}
            </div>
          </nav>

          <button
            onClick={() => setMenuAbierto((v) => !v)}
            className="flex flex-col gap-1.5 rounded-sm border border-night-700 p-2 md:hidden"
            aria-label="Menú"
          >
            <span className="h-0.5 w-5 bg-night-300" />
            <span className="h-0.5 w-5 bg-night-300" />
            <span className="h-0.5 w-5 bg-night-300" />
          </button>
        </div>

        {/* menú móvil */}
        {menuAbierto && (
          <nav className="border-t border-night-700/70 bg-night-950 px-4 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              {NAV.map((n) => {
                const Icono = n.icono
                return (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    end={n.to === '/'}
                    onClick={() => setMenuAbierto(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-sm border-l-2 px-3 py-2 text-sm font-semibold ${
                        isActive ? 'border-neon-cyan bg-night-900 text-neon-cyan' : 'border-transparent text-night-300'
                      }`
                    }
                  >
                    <Icono size={15} />
                    {n.label}
                  </NavLink>
                )
              })}
              <div className="mt-2 flex items-center gap-2 px-3">
                {units.map((u) => (
                  <Link
                    key={u.id}
                    to={`/unidad/${u.id}`}
                    onClick={() => setMenuAbierto(false)}
                    className="flex h-8 w-8 items-center justify-center border border-night-700 font-mono text-xs font-bold text-night-400"
                  >
                    {u.numero}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        )}
      </header>

      <main>
        <RouteTransition ruta={pathname}>{children}</RouteTransition>
      </main>

      <footer className="border-t border-night-700/70">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-10 text-center sm:px-6">
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading text-lg font-bold uppercase tracking-wide text-night-100">
              Algoritmos<span className="text-neon-cyan">UMG</span>
            </span>
            <span className="font-mono text-[10px] font-semibold tracking-widest text-night-500">·LAB</span>
          </div>
          <p className="max-w-md text-xs leading-5 text-night-500">
            Un curso interactivo para aprender algoritmos del curso "Algoritmos" de Ingeniería en
            sistemas de la Universidad Mariano Gálvez con 4 representaciones: lenguaje natural,
            pseudocódigo, diagrama de flujo y C++.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 border-t border-night-700/70 pt-4">
            {CLAVE.map((c) => (
              <span
                key={c.label}
                className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-night-500"
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.fill }} />
                {c.label}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
