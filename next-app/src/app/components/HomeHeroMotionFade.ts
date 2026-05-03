export function attachHomeHeroScrollFade() {
  const section = document.querySelector<HTMLElement>(
    'section[data-hero-section="home"]',
  );
  const copy = document.querySelector<HTMLElement>('[data-hero-copy="home"]');
  if (!section || !copy) return () => {};

  const copyEl = copy;
  const sectionEl = section;
  const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");

  let raf = 0;
  let listenersAttached = false;

  const update = () => {
    raf = 0;
    const rect = sectionEl.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const raw = 1 - rect.bottom / (rect.height + vh);
    const progress = Math.max(0, Math.min(1, raw));
    copyEl.style.opacity = String(1 - progress * 0.06);
  };

  const schedule = () => {
    if (raf) return;
    raf = window.requestAnimationFrame(update);
  };

  /** Tear down listeners/RAF and clear inline opacity for SPA navigations. */
  function detachScrollFade() {
    if (raf) {
      window.cancelAnimationFrame(raf);
      raf = 0;
    }
    if (listenersAttached) {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      listenersAttached = false;
    }
    copyEl.style.opacity = "";
  }

  function attachScrollFade() {
    if (listenersAttached) return;
    listenersAttached = true;
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
  }

  function onReducedMotionPreferenceChange() {
    if (mq?.matches) {
      detachScrollFade();
    } else {
      attachScrollFade();
    }
  }

  if (!mq?.matches) {
    attachScrollFade();
  }

  mq?.addEventListener("change", onReducedMotionPreferenceChange);

  return () => {
    mq?.removeEventListener("change", onReducedMotionPreferenceChange);
    detachScrollFade();
  };
}
