import { NavLink, Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Code2, Cpu, Home, ArrowRightLeft, PenTool, Terminal } from 'lucide-react'
import { units } from '../data/units.js'

const NAV = [
  { to: '/', label: 'Inicio', icono: Home },
  { to: '/convertidor', label: 'Convertidor', icono: ArrowRightLeft },
  { to: '/practica', label: 'Práctica', icono: PenTool },
  { to: '/laboratorio', label: 'Laboratorio', icono: Terminal },
]

export default function Layout({ children }) {
  const { pathname } = useLocation()
  const [menuAbierto, setMenuAbierto] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-screen bg-night-950 text-night-100">
      {/* barra superior */}
      <header className="sticky top-0 z-40 border-b border-night-800 bg-night-950/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-b from-neon-cyan to-fuchsia-500">
              <Cpu size={17} className="text-night-950" />
            </span>
            <span className="text-sm font-black tracking-tight text-night-50">
              AlgoritmosUMG<span className="text-neon-cyan">·</span>Lab
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
                    `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-neon-cyan/10 text-neon-cyan'
                        : 'text-night-400 hover:bg-night-800 hover:text-night-200'
                    }`
                  }
                >
                  <Icono size={15} />
                  {n.label}
                </NavLink>
              )
            })}
            <span className="mx-2 h-5 w-px bg-night-700" />
            <div className="flex items-center gap-1">
              {units.map((u) => (
                <NavLink
                  key={u.id}
                  to={`/unidad/${u.id}`}
                  title={u.titulo}
                  className={({ isActive }) =>
                    `flex h-7 w-7 items-center justify-center rounded-md border text-[11px] font-bold transition-colors ${
                      isActive
                        ? 'border-neon-cyan/60 bg-neon-cyan/15 text-neon-cyan'
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
            className="flex flex-col gap-1.5 rounded-md p-2 md:hidden"
            aria-label="Menú"
          >
            <span className="h-0.5 w-5 bg-night-300" />
            <span className="h-0.5 w-5 bg-night-300" />
            <span className="h-0.5 w-5 bg-night-300" />
          </button>
        </div>

        {/* menú móvil */}
        {menuAbierto && (
          <nav className="border-t border-night-800 bg-night-950 px-4 py-3 md:hidden">
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
                      `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                        isActive ? 'bg-neon-cyan/10 text-neon-cyan' : 'text-night-300'
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
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-night-700 text-xs font-bold text-night-400"
                  >
                    {u.numero}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        )}
      </header>

      <main>{children}</main>

      <footer className="border-t border-night-800">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-10 text-center sm:px-6">
          <div className="flex items-center gap-2">
            <Code2 size={16} className="text-neon-cyan" />
            <span className="text-sm font-bold text-night-200">AlgoritmosUMG·Lab</span>
          </div>
          <p className="max-w-md text-xs leading-5 text-night-500">
            Un curso interactivo para aprender algoritmos del curso "Algoritmos" de Ingenieria en sistemas de la Universidad Mariano Galvez con 4 representaciones: lenguaje natural,
            pseudocódigo, diagrama de flujo y C++.
          </p>
        </div>
      </footer>
    </div>
  )
}
