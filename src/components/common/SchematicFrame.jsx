import { ACCENTS } from '../../lib/theme.js'

const cx = (...a) => a.filter(Boolean).join(' ')

// Marco de dibujo técnico: borde de pelo + cruces en las esquinas + etiqueta de
// figura (opcional). Es el contenedor recurrente de todo el sitio.
export default function SchematicFrame({ children, tag, accent = 'cyan', className = '', ...rest }) {
  const acento = ACCENTS[accent] ?? ACCENTS.cyan
  return (
    <div
      className={cx(
        'relative border border-night-700/70 bg-night-900/40',
        className,
      )}
      {...rest}
    >
      <span className="pointer-events-none absolute -left-px -top-px h-2.5 w-2.5 border-l-2 border-t-2 border-night-400" />
      <span className="pointer-events-none absolute -right-px -top-px h-2.5 w-2.5 border-r-2 border-t-2 border-night-400" />
      <span className="pointer-events-none absolute -left-px -bottom-px h-2.5 w-2.5 border-l-2 border-b-2 border-night-400" />
      <span className="pointer-events-none absolute -right-px -bottom-px h-2.5 w-2.5 border-r-2 border-b-2 border-night-400" />
      {tag && (
        <span
          className={cx(
            'absolute -top-[9px] left-3 z-10 inline-flex items-center gap-1.5 bg-night-950 px-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.18em]',
            acento.text,
          )}
        >
          <span className="text-night-500">+</span>
          {tag}
        </span>
      )}
      {children}
    </div>
  )
}

// Etiqueta de especificación: mono, mayúscula, con marca de cruz delante.
// Encode información real (número de sección, código de unidad, nomenclatura).
export function SpecLabel({ children, color = 'night', className = '' }) {
  const acento = ACCENTS[color] ?? null
  return (
    <span
      className={cx(
        'inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em]',
        acento ? acento.text : 'text-night-400',
        className,
      )}
    >
      <span className={cx('text-[11px] leading-none', acento ? acento.text : 'text-night-500')}>+</span>
      {children}
    </span>
  )
}

// Clave de color de las 4 representaciones (punto + etiqueta mono).
export function ColorKey({ items = [], className = '' }) {
  return (
    <div className={cx('flex flex-wrap items-center gap-x-5 gap-y-1.5', className)}>
      {items.map((it) => (
        <span
          key={it.label}
          className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-night-400"
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: it.fill }}
            aria-hidden="true"
          />
          {it.label}
        </span>
      ))}
    </div>
  )
}
