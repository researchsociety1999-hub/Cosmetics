export function attachHomeHeroScrollFade() {
  const section = document.querySelector<HTMLElement>(
    'section[data-hero-section="home"]',
  );
  const copy = document.querySelector<HTMLElement>('[data-hero-copy="home"]');
  if (!section || !copy) return () => {};

  const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  if (mq?.matches) return () => {};

  let raf = 0;
  const update = () => {
    raf = 0;
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const raw = 1 - rect.bottom / (rect.height + vh);
    const progress = Math.max(0, Math.min(1, raw));
    copy.style.opacity = String(1 - progress * 0.06);
  };

  const schedule = () => {
    if (raf) return;
    raf = window.requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });

  return () => {
    if (raf) window.cancelAnimationFrame(raf);
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
  };
}

