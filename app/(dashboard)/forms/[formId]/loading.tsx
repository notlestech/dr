export default function FormDetailLoading() {
  return (
    <div className="flex flex-col gap-8 p-6 md:p-10 max-w-3xl mx-auto w-full animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-3 w-20 bg-muted rounded" />
          <div className="h-7 w-48 bg-muted rounded-lg" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-muted rounded-lg" />
          <div className="h-8 w-20 bg-muted rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[0,1,2,3].map(i => (
          <div key={i} className="border rounded-xl p-4 space-y-2">
            <div className="h-3 w-16 bg-muted rounded" />
            <div className="h-6 w-10 bg-muted rounded" />
          </div>
        ))}
      </div>
      <div className="border rounded-xl divide-y">
        {[0,1,2,3,4].map(i => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <div className="h-3.5 w-full max-w-xs bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
