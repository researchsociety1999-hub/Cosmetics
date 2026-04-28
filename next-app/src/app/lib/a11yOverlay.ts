type Inertable = HTMLElement & { inert?: boolean };

export function setElementInert(el: HTMLElement | null, inert: boolean) {
  if (!el) return;
  const node = el as Inertable;
  try {
    if ("inert" in node) {
      node.inert = inert;
    }
  } catch {
    // ignore
  }

  // Screen reader fallback: hide the subtree while overlay is open.
  // (Not a full inert polyfill, but prevents landmark/heading navigation behind dialogs.)
  if (inert) {
    el.setAttribute("aria-hidden", "true");
  } else {
    el.removeAttribute("aria-hidden");
  }
}

type OverlayHandle = { release: () => void };

let overlayCount = 0;
let prevBodyOverflow: string | null = null;
const inertRefCounts = new Map<HTMLElement, number>();

function lockBodyScroll() {
  if (typeof document === "undefined") return;
  if (overlayCount === 0) {
    prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  overlayCount += 1;
}

function unlockBodyScroll() {
  if (typeof document === "undefined") return;
  overlayCount = Math.max(0, overlayCount - 1);
  if (overlayCount === 0) {
    document.body.style.overflow = prevBodyOverflow ?? "";
    prevBodyOverflow = null;
  }
}

function retainInert(el: HTMLElement) {
  const next = (inertRefCounts.get(el) ?? 0) + 1;
  inertRefCounts.set(el, next);
  if (next === 1) {
    setElementInert(el, true);
  }
}

function releaseInert(el: HTMLElement) {
  const current = inertRefCounts.get(el) ?? 0;
  const next = Math.max(0, current - 1);
  if (next === 0) {
    inertRefCounts.delete(el);
    setElementInert(el, false);
    return;
  }
  inertRefCounts.set(el, next);
}

export function acquireOverlayLock({
  inertTargets,
}: {
  inertTargets: Array<HTMLElement | null | undefined>;
}): OverlayHandle {
  lockBodyScroll();
  const targets = inertTargets.filter((t): t is HTMLElement => t instanceof HTMLElement);
  for (const t of targets) {
    retainInert(t);
  }

  let released = false;
  return {
    release: () => {
      if (released) return;
      released = true;
      for (const t of targets) {
        releaseInert(t);
      }
      unlockBodyScroll();
    },
  };
}

export function collectFocusable(container: HTMLElement): HTMLElement[] {
  const selector =
    'a[href], button:not([disabled]), textarea, input:not([type="hidden"]):not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return [...container.querySelectorAll(selector)].filter(
    (n): n is HTMLElement =>
      n instanceof HTMLElement &&
      !n.hasAttribute("disabled") &&
      n.tabIndex !== -1 &&
      !n.getAttribute("aria-hidden"),
  );
}

export function trapTabKey(
  e: KeyboardEvent,
  container: HTMLElement,
  opts?: { initialFocus?: HTMLElement | null },
) {
  if (e.key !== "Tab") return;

  const focusables = collectFocusable(container);
  const target = document.activeElement;

  if (focusables.length === 0) {
    // Keep focus on container itself if nothing else exists.
    e.preventDefault();
    container.focus();
    return;
  }

  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  const activeIsInside = target instanceof Node && container.contains(target);
  if (!activeIsInside) {
    e.preventDefault();
    (opts?.initialFocus ?? first).focus();
    return;
  }

  if (e.shiftKey) {
    if (target === first) {
      e.preventDefault();
      last.focus();
    }
    return;
  }

  if (target === last) {
    e.preventDefault();
    first.focus();
  }
}

