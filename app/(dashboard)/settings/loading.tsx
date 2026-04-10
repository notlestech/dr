export default function SettingsLoading() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl animate-pulse">
      <div className="space-y-1">
        <div className="h-7 w-24 bg-muted rounded-lg" />
        <div className="h-3.5 w-48 bg-muted rounded" />
      </div>
      {[0, 1, 2].map(i => (
        <div key={i} className="border rounded-xl p-5 space-y-4">
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="h-px bg-border" />
          <div className="space-y-2">
            <div className="h-9 w-full max-w-sm bg-muted rounded-lg" />
            <div className="h-9 w-full max-w-sm bg-muted rounded-lg" />
          </div>
          <div className="h-9 w-28 bg-muted rounded-lg" />
        </div>
      ))}
    </div>
  )
}
