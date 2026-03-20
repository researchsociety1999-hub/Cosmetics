import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { getPressMentions } from "../lib/queries";

export const dynamic = "force-dynamic";

export default async function PressPage() {
  const pressMentions = await getPressMentions();

  return (
    <div className="min-h-screen bg-[#06080c] text-[#f5eee3]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <header className="mb-10 space-y-4">
          <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
            Press mentions
          </p>
          <h1 className="font-cormorant text-4xl tracking-[0.12em] text-[#f5eee3] md:text-5xl">
            Editorial coverage and brand story placement.
          </h1>
          <p className="max-w-3xl text-sm text-[#b8ab95] md:text-base">
            This page is connected to your `press_mentions` schema and will
            display real coverage once those rows are added.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          {pressMentions.map((mention) => (
            <article key={mention.id} className="mystic-card p-6">
              <p className="text-[0.72rem] uppercase tracking-[0.26em] text-[#d6a85f]">
                {mention.source}
              </p>
              <h2 className="mt-3 font-cormorant text-3xl tracking-[0.08em] text-[#f5eee3]">
                {mention.title}
              </h2>
              {mention.quote && (
                <p className="mt-4 text-sm italic text-[#f5eee3]">
                  "{mention.quote}"
                </p>
              )}
              {mention.published_at && (
                <p className="mt-5 text-xs uppercase tracking-[0.2em] text-[#b8ab95]">
                  {new Date(mention.published_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}
