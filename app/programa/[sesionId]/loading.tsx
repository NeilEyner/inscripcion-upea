import { Skeleton } from '@/components/ui/skeleton'

/**
 * loading.tsx — Suspense boundary de Next.js para toda la ruta /programa/[sesionId]
 * Se muestra durante la transición de navegación, antes de que el Server Component
 * resuelva las queries. El diseño replica la estructura real para evitar layout shifts.
 */
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header skeleton */}
      <div className="bg-white border-b border-slate-200 h-14">
        <div className="max-w-screen-2xl mx-auto px-6 h-full flex items-center gap-4">
          <Skeleton className="h-4 w-20" />
          <div className="w-px h-5 bg-slate-200" />
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-5 w-5 rounded" />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-48" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-14" />
              </div>
            </div>
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 py-6 space-y-5">
        {/* StatsBar skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white px-5 py-4 flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-7 w-12" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>

        {/* Barra de capacidad skeleton */}
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 flex items-center gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-2.5 flex-1 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Controles skeleton */}
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-9 w-72" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>

        {/* Tabla skeleton */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-100 px-4 py-3 flex gap-4">
            {[120, 180, 100, 100, 80, 80].map((w, i) => (
              <Skeleton key={i} className="h-4" style={{ width: w }} />
            ))}
          </div>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="border-b border-slate-50 px-4 py-3.5 flex gap-4 items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
