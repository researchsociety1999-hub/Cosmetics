export default function ProductLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-14 md:px-6">
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="mystic-card h-[520px] animate-pulse" />
        <div className="space-y-5">
          <div className="mystic-skeleton h-6 w-40" />
          <div className="mystic-skeleton h-14 w-full" />
          <div className="mystic-card h-28 animate-pulse" />
          <div className="mystic-card h-44 animate-pulse" />
        </div>
      </div>
    </main>
  );
}
