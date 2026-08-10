import CodeMirror from '@uiw/react-codemirror'
import { cpp } from '@codemirror/lang-cpp'
import { oneDark } from '@codemirror/theme-one-dark'

const EXTENSIONS = {
  cpp: () => [cpp()],
  pseudo: () => [],
  natural: () => [],
}

// Editor de código compartido (CodeMirror con tema oscuro)
export default function CmEditor({
  value,
  onChange,
  lenguaje = 'natural',
  minHeight = 180,
  readOnly = false,
  placeholder = '',
}) {
  return (
    <div
      className="overflow-hidden rounded-xl border border-night-700 bg-night-900/80 focus-within:border-neon-cyan/50 transition-colors"
      style={{ minHeight }}
    >
      <CodeMirror
        value={value}
        height="100%"
        minHeight={`${minHeight}px`}
        onChange={onChange}
        theme={oneDark}
        extensions={EXTENSIONS[lenguaje] ? EXTENSIONS[lenguaje]() : []}
        editable={!readOnly}
        readOnly={readOnly}
        placeholder={placeholder}
        basicSetup={{ foldGutter: false, autocompletion: false }}
      />
    </div>
  )
}

// Editor de lenguaje natural: textarea simple con estilo
export function NaturalEditor({
  value,
  onChange,
  minRows = 6,
  readOnly = false,
  placeholder = 'Escribe tu algoritmo paso a paso, en frases…',
}) {
  return (
    <textarea
      value={value}
      readOnly={readOnly}
      onChange={(e) => onChange?.(e.target.value)}
      rows={minRows}
      placeholder={placeholder}
      className="w-full rounded-xl border border-night-700 bg-night-900/80 px-4 py-3 font-mono text-[13.5px] leading-7 text-night-200 placeholder:text-night-500 outline-none transition-colors focus:border-neon-cyan/50 resize-y"
    />
  )
}
