export default function FormsLoading() {
  return (
    <div className="flex flex-col gap-8 p-6 md:p-10 max-w-3xl mx-auto w-full animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-7 w-20 bg-muted rounded-lg" />
          <div className="h-3.5 w-24 bg-muted rounded" />
        </div>
        <div className="h-9 w-28 bg-muted rounded-lg" />
      </div>
      <div className="border rounded-xl overflow-hidden divide-y">
        {[0,1,2,3,4].map(i => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5">
            <div className="size-2 rounded-full bg-muted shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="h-3.5 w-40 bg-muted rounded" />
                <div className="h-4 w-14 bg-muted rounded-full" />
              </div>
              <div className="h-2.5 w-52 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
