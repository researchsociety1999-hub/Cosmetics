export default function AboutLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 lg:px-10">
      <section className="grid items-center gap-10 rounded-[34px] border border-white/[0.06] p-6 md:grid-cols-2 md:p-12">
        <div className="space-y-5">
          <div className="mystic-skeleton h-4 w-20" />
          <div className="mystic-skeleton h-14 w-full max-w-md" />
          <div className="mystic-skeleton h-4 w-full max-w-sm" />
          <div className="mystic-skeleton h-4 w-3/4" />
          <div className="grid gap-4 pt-4 sm:grid-cols-2">
            <div className="mystic-card h-28 animate-pulse" />
            <div className="mystic-card h-28 animate-pulse" />
          </div>
        </div>
        {/* Reserve the exact 4:3 hero box so there is no layout shift on load. */}
        <div className="mx-auto aspect-[4/3] w-full max-w-[560px] animate-pulse rounded-[32px] bg-white/[0.05]" />
      </section>
      <section className="mt-12 grid gap-6 md:grid-cols-3">
        <div className="mystic-card h-48 animate-pulse" />
        <div className="mystic-card h-48 animate-pulse" />
        <div className="mystic-card h-48 animate-pulse" />
      </section>
    </main>
  );
}
