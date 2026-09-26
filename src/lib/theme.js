// ============================================================
// theme.js — Paleta de acentos por unidad (clases Tailwind fijas)
// ============================================================

export const ACCENTS = {
  cyan: {
    hex: '#22d3ee',
    text: 'text-neon-cyan',
    bgSoft: 'bg-neon-cyan/10',
    border: 'border-neon-cyan/40',
    hoverBorder: 'hover:border-neon-cyan/70',
    shadow: 'shadow-[0_0_24px_rgba(34,211,238,0.18)]',
    ring: 'ring-neon-cyan',
    gradFrom: 'from-cyan-400',
    fill: '#22d3ee',
  },
  magenta: {
    hex: '#e879f9',
    text: 'text-neon-pink',
    bgSoft: 'bg-neon-pink/10',
    border: 'border-neon-pink/40',
    hoverBorder: 'hover:border-neon-pink/70',
    shadow: 'shadow-[0_0_24px_rgba(232,121,249,0.18)]',
    ring: 'ring-neon-pink',
    gradFrom: 'from-fuchsia-400',
    fill: '#e879f9',
  },
  green: {
    hex: '#4ade80',
    text: 'text-neon-green',
    bgSoft: 'bg-neon-green/10',
    border: 'border-neon-green/40',
    hoverBorder: 'hover:border-neon-green/70',
    shadow: 'shadow-[0_0_24px_rgba(74,222,128,0.18)]',
    ring: 'ring-neon-green',
    gradFrom: 'from-green-400',
    fill: '#4ade80',
  },
  amber: {
    hex: '#fbbf24',
    text: 'text-neon-amber',
    bgSoft: 'bg-neon-amber/10',
    border: 'border-neon-amber/40',
    hoverBorder: 'hover:border-neon-amber/70',
    shadow: 'shadow-[0_0_24px_rgba(251,191,36,0.18)]',
    ring: 'ring-neon-amber',
    gradFrom: 'from-amber-400',
    fill: '#fbbf24',
  },
}

export const NODO_ESTILOS = {
  inicio: { border: 'border-neon-cyan', bg: 'bg-neon-cyan/10', text: 'text-neon-cyan' },
  fin: { border: 'border-neon-red', bg: 'bg-neon-red/10', text: 'text-neon-red' },
  proceso: { border: 'border-neon-green', bg: 'bg-neon-green/10', text: 'text-neon-green' },
  entrada: { border: 'border-neon-pink', bg: 'bg-neon-pink/10', text: 'text-neon-pink' },
  salida: { border: 'border-neon-amber', bg: 'bg-neon-amber/10', text: 'text-neon-amber' },
  decision: { border: 'border-neon-cyan', bg: 'bg-neon-cyan/10', text: 'text-neon-cyan' },
}

// Clave de color de las 4 representaciones. Aparece en tabs, leyendas y footer.
export const MODE_META = {
  natural: { label: 'Algoritmo', corto: 'natural', dot: 'bg-neon-green', text: 'text-neon-green', fill: '#4ade80' },
  pseudo: { label: 'Pseudocódigo', corto: 'pseudo', dot: 'bg-neon-pink', text: 'text-neon-pink', fill: '#e879f9' },
  flujo: { label: 'Diagrama', corto: 'diagrama', dot: 'bg-neon-amber', text: 'text-neon-amber', fill: '#fbbf24' },
  cpp: { label: 'C++', corto: 'c++', dot: 'bg-neon-cyan', text: 'text-neon-cyan', fill: '#22d3ee' },
}
