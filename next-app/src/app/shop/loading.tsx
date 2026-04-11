export default function ShopLoading() {
  return (
    <main className="w-full px-4 py-14 md:px-6 lg:px-10 xl:px-14">
      <div className="mystic-skeleton h-6 w-28" />
      <div className="mt-4 mystic-skeleton h-14 w-full max-w-2xl" />
      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5 xl:gap-4">
        <div className="mystic-card h-80 animate-pulse" />
        <div className="mystic-card h-80 animate-pulse" />
        <div className="mystic-card h-80 animate-pulse" />
        <div className="mystic-card h-80 animate-pulse" />
      </div>
    </main>
  );
}
