export default function ShopLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-14 md:px-6">
      <div className="mystic-skeleton h-6 w-28" />
      <div className="mt-4 mystic-skeleton h-14 w-full max-w-2xl" />
      <div className="mt-8 grid gap-6 md:grid-cols-3 xl:grid-cols-4">
        <div className="mystic-card h-80 animate-pulse" />
        <div className="mystic-card h-80 animate-pulse" />
        <div className="mystic-card h-80 animate-pulse" />
        <div className="mystic-card h-80 animate-pulse" />
      </div>
    </main>
  );
}
