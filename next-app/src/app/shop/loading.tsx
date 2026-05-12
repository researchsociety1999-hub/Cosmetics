export default function ShopLoading() {
  return (
    <main className="w-full px-4 py-14 md:px-6 lg:px-10 xl:px-14">
      <div className="mb-8 flex flex-wrap gap-3">
        <div className="h-9 w-16 animate-pulse rounded-full bg-white/[0.06]" />
        <div className="h-9 w-24 animate-pulse rounded-full bg-white/[0.06]" />
        <div className="h-9 w-20 animate-pulse rounded-full bg-white/[0.06]" />
        <div className="h-9 w-28 animate-pulse rounded-full bg-white/[0.06]" />
      </div>
      <div className="mb-8 mystic-card flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:gap-4 md:p-5">
        <div className="h-11 w-full max-w-md animate-pulse rounded-lg bg-white/[0.06] sm:flex-1" />
        <div className="h-10 w-24 shrink-0 animate-pulse rounded-full bg-white/[0.06]" />
      </div>
      <div className="mb-8 space-y-2">
        <div className="h-3 w-40 animate-pulse rounded bg-white/[0.06]" />
        <div className="h-4 w-64 max-w-full animate-pulse rounded bg-white/[0.05]" />
      </div>
      <div className="space-y-16 md:space-y-20">
        <section className="space-y-6 border-t border-white/[0.04] pt-12 md:space-y-7 md:pt-14">
          <div className="space-y-2">
            <div className="h-3 w-24 animate-pulse rounded bg-white/[0.06]" />
            <div className="h-9 w-48 max-w-full animate-pulse rounded bg-white/[0.08]" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 md:gap-6 lg:grid-cols-3 lg:gap-7 xl:grid-cols-4 xl:gap-8 2xl:gap-9">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="mystic-card h-80 animate-pulse border border-white/[0.04]"
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
