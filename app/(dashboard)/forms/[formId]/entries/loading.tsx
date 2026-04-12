import { Skeleton } from '@/components/ui/skeleton'

export default function EntriesLoading() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-28 ml-auto" />
      </div>
      <div className="rounded-xl border overflow-hidden">
        <div className="bg-muted/50 border-b px-4 py-3 flex gap-6">
          {[120, 96, 80, 80, 72].map((w, i) => (
            <Skeleton key={i} className="h-3" style={{ width: w }} />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border-b last:border-0 px-4 py-3 flex gap-6 items-center">
            {[140, 100, 80, 80, 72].map((w, j) => (
              <Skeleton key={j} className="h-4" style={{ width: w }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
