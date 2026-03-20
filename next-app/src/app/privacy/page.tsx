import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";

export default function PrivacyPage() {
  return (
    <StaticInfoPage
      title="Privacy Policy"
      eyebrow="Privacy"
      body="This placeholder page is live so the storefront no longer drops visitors onto a 404. Replace this copy with your final privacy policy whenever you are ready."
    />
  );
}

function StaticInfoPage({
  title,
  eyebrow,
  body,
}: {
  title: string;
  eyebrow: string;
  body: string;
}) {
  return (
    <div className="min-h-screen bg-[#06080c] text-[#f5eee3]">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-14 md:px-6">
        <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
          {eyebrow}
        </p>
        <h1 className="mt-4 font-cormorant text-4xl tracking-[0.12em] text-[#f5eee3] md:text-5xl">
          {title}
        </h1>
        <div className="mystic-card mt-8 p-6 text-sm text-[#b8ab95] md:text-base">
          {body}
        </div>
      </main>
      <Footer />
    </div>
  );
}
