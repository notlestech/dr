import { Skeleton } from '@/components/ui/skeleton'

export default function DrawsLoading() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Skeleton className="h-4 w-24" />
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="size-7 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="pl-9 space-y-2">
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
      ))}
    </div>
  )
}
