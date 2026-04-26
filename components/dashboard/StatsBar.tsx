import { Users, CheckCircle2, Clock, Wallet, XCircle, TrendingUp } from 'lucide-react'
import { SesionStats } from '@/lib/types'

interface StatsBarProps {
  sesion: SesionStats
}

/**
 * StatsBar — Server Component.
 * Muestra 4 tarjetas de KPIs + una fila de capacidad con barra de progreso.
 * Recibe los datos ya calculados desde la vista vista_sesion_stats.
 */
export default function StatsBar({ sesion }: StatsBarProps) {
  const {
    totalInscritos,
    totalConfirmados,
    totalPreinscritos,
    totalCancelados,
    totalRecaudado,
    cupoMinimo,
    cupoMaximo,
  } = sesion

  const porcentajeOcupacion = cupoMaximo > 0
    ? Math.min((totalInscritos / cupoMaximo) * 100, 100)
    : 0

  const minimoAlcanzado = totalInscritos >= cupoMinimo

  // Color reactivo de la barra según ocupación
  const colorBarra =
    porcentajeOcupacion >= 90
      ? 'bg-rose-400'
      : porcentajeOcupacion >= 60
      ? 'bg-amber-400'
      : 'bg-emerald-400'

  const kpis = [
    {
      label: 'Total inscritos',
      value: totalInscritos,
      icon: Users,
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      iconBg: 'bg-blue-100',
    },
    {
      label: 'Confirmados',
      value: totalConfirmados,
      icon: CheckCircle2,
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      iconBg: 'bg-emerald-100',
    },
    {
      label: 'Preinscritos',
      value: totalPreinscritos,
      icon: Clock,
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      iconBg: 'bg-amber-100',
    },
    {
      label: 'Cancelados',
      value: totalCancelados,
      icon: XCircle,
      textColor: 'text-rose-500',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100',
      iconBg: 'bg-rose-100',
    },
  ] as const

return (
  <div className="w-full">
    {/* Layout de 6 columnas: 4 KPIs + Recaudado + Cupo */}
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
      
      {/* 4 KPIs Dinámicos */}
      {kpis.map((kpi) => {
        const Icon = kpi.icon
        return (
          <div
            key={kpi.label}
            className={`rounded-lg border ${kpi.borderColor} ${kpi.bgColor} p-2.5 flex items-center gap-2.5`}
          >
            <div className={`rounded-md p-1.5 ${kpi.iconBg} shrink-0`}>
              <Icon className={`h-3.5 w-3.5 ${kpi.textColor}`} />
            </div>
            <div className="min-w-0">
              <div className={`text-lg font-bold leading-none tracking-tight ${kpi.textColor}`}>
                {kpi.value}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 truncate uppercase font-medium">
                {kpi.label}
              </div>
            </div>
          </div>
        )
      })}

      {/* Total recaudado */}
      <div className="rounded-lg border border-slate-200 bg-white p-2.5 flex items-center gap-2.5">
        <div className="rounded-md p-1.5 bg-slate-100 shrink-0">
          <Wallet className="h-3.5 w-3.5 text-slate-600" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] text-slate-400 uppercase font-medium truncate">Recaudado</div>
          <div className="text-lg font-bold text-slate-900 leading-none">
            <span className="text-xs font-normal mr-0.5">Bs</span>
            {Number(totalRecaudado).toLocaleString('es-BO', { minimumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Capacidad / Cupo */}
      <div className="rounded-lg border border-slate-200 bg-white p-2.5 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-slate-400 uppercase font-medium">Cupo</span>
          {minimoAlcanzado ? (
            <span className="text-[9px] font-bold text-emerald-600 uppercase">Listo</span>
          ) : (
            <span className="text-[9px] font-bold text-amber-500 uppercase">-{cupoMinimo - totalInscritos}</span>
          )}
        </div>

        {/* Barra de progreso mini */}
        <div className="relative h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${colorBarra}`}
            style={{ width: `${porcentajeOcupacion}%` }}
          />
          {cupoMinimo > 0 && (
            <div
              className="absolute top-0 bottom-0 w-px bg-slate-300"
              style={{ left: `${(cupoMinimo / cupoMaximo) * 100}%` }}
            />
          )}
        </div>

        <div className="flex justify-between mt-1 text-[9px] font-medium text-slate-500">
          <span>{totalInscritos}</span>
          <span>{cupoMaximo} máx</span>
        </div>
      </div>

    </div>
  </div>
)
}
