import Link from 'next/link'
import {
  ArrowLeft,
  GraduationCap,
  MapPin,
  Monitor,
  Calendar,
  Tag,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SesionStats, COLOR_CATEGORIA } from '@/lib/types'
import LogoutButton from './LogoutButton'

interface DashboardHeaderProps {
  sesion: SesionStats
  sesionId: string
}

/**
 * Header sticky del dashboard de un programa.
 * Server Component: no necesita estado propio.
 * LogoutButton es un Client Component separado por necesitar useTransition.
 */
export default function DashboardHeader({ sesion, sesionId }: DashboardHeaderProps) {
  const colorClase = COLOR_CATEGORIA[sesion.categoria]

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm shadow-slate-100">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
        {/* Volver al grid de programas */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors shrink-0 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span className="hidden sm:inline">Programas</span>
        </Link>

        <Separator orientation="vertical" className="h-5 bg-slate-200" />

        {/* Identidad del programa */}
        <div className="flex-1 min-w-0 flex items-center gap-2.5">
          <GraduationCap className="h-5 w-5 text-slate-400 shrink-0" />

          <div className="min-w-0">
            {/* Línea 1: categoría + nombre */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={`text-[10px] font-semibold tracking-wide shrink-0 px-2 py-0.5 ${colorClase}`}
              >
                {sesion.categoria}
              </Badge>
              <h1 className="text-sm font-semibold text-slate-900 truncate leading-tight">
                {sesion.nombre}
              </h1>
              {!sesion.activo && (
                <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-200 shrink-0">
                  Inactivo
                </Badge>
              )}
            </div>

            {/* Línea 2: metadata chips */}
            <div className="hidden sm:flex items-center gap-3 mt-0.5 text-[11px] text-slate-400 flex-wrap">
              <span className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {sesion.version}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {sesion.gestion}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {sesion.sede}
              </span>
              <span className="flex items-center gap-1">
                <Monitor className="h-3 w-3" />
                {sesion.modalidad}
              </span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <LogoutButton sesionId={sesionId} />
      </div>
    </header>
  )
}
