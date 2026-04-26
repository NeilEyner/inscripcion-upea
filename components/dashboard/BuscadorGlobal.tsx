'use client'

import { useState, useTransition, useRef, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface BuscadorGlobalProps {
  busquedaInicial?: string
}

/**
 * BuscadorGlobal — Client Component.
 *
 * Estrategia de búsqueda:
 * - El valor del input es estado local para respuesta inmediata.
 * - Los cambios se reflejan en los URL params (?q=...) con debounce de 300ms.
 * - El Server Component padre lee el param 'q' y lo pasa a la query de Postgres.
 * - useTransition marca la transición de navegación sin bloquear el input.
 *
 * No usa useSearchParams() para evitar la necesidad de Suspense explícito en el padre.
 */
export default function BuscadorGlobal({ busquedaInicial = '' }: BuscadorGlobalProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [valor, setValor] = useState(busquedaInicial)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const actualizarUrl = useCallback(
    (termino: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        startTransition(() => {
          if (termino.trim()) {
            router.replace(`${pathname}?q=${encodeURIComponent(termino.trim())}`)
          } else {
            router.replace(pathname)
          }
        })
      }, 300)
    },
    [pathname, router]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setValor(val)
    actualizarUrl(val)
  }

  const limpiar = () => {
    setValor('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    startTransition(() => {
      router.replace(pathname)
    })
  }

  return (
    <div className="relative w-full max-w-sm">
      {/* Ícono izquierdo: loader durante transición, lupa en reposo */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        {isPending ? (
          <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
        ) : (
          <Search className="h-4 w-4 text-slate-400" />
        )}
      </div>

      <Input
        value={valor}
        onChange={handleChange}
        placeholder="Buscar por CI o nombre..."
        className={cn(
          'pl-9 pr-9 h-9 bg-white border-slate-200 text-sm placeholder:text-slate-400',
          'focus-visible:ring-1 focus-visible:ring-blue-400 focus-visible:border-blue-400',
          'transition-colors'
        )}
        autoComplete="off"
        spellCheck={false}
      />

      {/* Botón limpiar */}
      {valor && (
        <button
          onClick={limpiar}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Limpiar búsqueda"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
