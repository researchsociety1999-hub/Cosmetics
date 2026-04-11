export default function GlobalLoading() {
  return (
    <main className="min-h-screen bg-[#06080c] px-4 py-16 text-[#f5eee3] md:px-6 lg:px-10 xl:px-14">
      <div className="w-full space-y-6">
        <div className="mystic-skeleton h-6 w-40" />
        <div className="mystic-skeleton h-16 w-full max-w-3xl" />
        <div className="mystic-skeleton h-6 w-full max-w-2xl" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="mystic-card h-72 animate-pulse" />
          <div className="mystic-card h-72 animate-pulse" />
          <div className="mystic-card h-72 animate-pulse" />
        </div>
      </div>
    </main>
  );
}
