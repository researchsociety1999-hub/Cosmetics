export default function JournalLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 lg:px-10">
      <div className="space-y-5">
        <div className="mystic-skeleton h-4 w-24" />
        <div className="mystic-skeleton h-12 w-full max-w-md" />
        <div className="mystic-skeleton h-4 w-full max-w-lg" />
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="mystic-card h-72 animate-pulse" />
        ))}
      </div>
    </main>
  );
}
