'use client'

import { useTransition } from 'react'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logoutSesion } from '@/lib/actions/sesiones.actions'

interface LogoutButtonProps {
  sesionId: string
}

/**
 * Client Component aislado para no convertir DashboardHeader en cliente.
 * Usa useTransition para mostrar estado de carga sin bloquear la UI.
 */
export default function LogoutButton({ sesionId }: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      await logoutSesion(sesionId)
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={isPending}
      className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 shrink-0 h-8 px-2.5 gap-1.5"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline text-xs">Salir</span>
    </Button>
  )
}
