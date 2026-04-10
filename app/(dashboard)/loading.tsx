export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8 p-6 md:p-10 max-w-2xl mx-auto w-full animate-pulse">
      <div className="h-7 w-40 bg-muted rounded-lg" />
      <div className="grid grid-cols-3 gap-3">
        {[0,1,2].map(i => (
          <div key={i} className="border rounded-xl p-4 space-y-3">
            <div className="h-3 w-16 bg-muted rounded" />
            <div className="h-7 w-12 bg-muted rounded" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <div className="h-4 w-28 bg-muted rounded" />
        <div className="border rounded-xl overflow-hidden divide-y">
          {[0,1,2].map(i => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5">
              <div className="size-2 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-48 bg-muted rounded" />
                <div className="h-2.5 w-32 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
