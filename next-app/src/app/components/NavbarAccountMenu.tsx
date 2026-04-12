"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { signOutAction } from "../actions/auth";

function profileIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="text-[#e8dcc4]"
    >
      <circle
        cx="12"
        cy="9"
        r="3.25"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeOpacity="0.9"
      />
      <path
        d="M6.5 19.25c0-3.1 2.35-5 5.5-5s5.5 1.9 5.5 5"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeOpacity="0.9"
      />
    </svg>
  );
}

export function NavbarAccountMenu({
  isSignedIn,
  email,
  className = "",
}: {
  isSignedIn: boolean;
  email: string | null;
  className?: string;
}) {
  const pathname = usePathname() || "/";
  const nextQuery = `?next=${encodeURIComponent(pathname)}`;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function onDocMouseDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) close();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const shortEmail =
    email && email.length > 28 ? `${email.slice(0, 26)}…` : email;

  const itemClass =
    "block w-full px-4 py-2.5 text-left text-[0.62rem] uppercase tracking-[0.2em] text-[#d4c4a8] transition hover:bg-[rgba(214,168,95,0.06)] hover:text-[#f5ebd4] focus-visible:bg-[rgba(214,168,95,0.08)] focus-visible:outline-none";

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(214,168,95,0.22)] bg-[rgba(2,3,6,0.45)] text-[#e8dcc4] shadow-[0_4px_20px_rgba(0,0,0,0.35)] backdrop-blur-sm transition hover:border-[rgba(214,168,95,0.38)] hover:bg-[rgba(8,9,14,0.55)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(212,175,55,0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="sr-only">Account menu</span>
        {profileIcon()}
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-[60] min-w-[13.5rem] rounded-xl border border-[rgba(214,168,95,0.14)] bg-[rgba(6,7,10,0.94)] py-2 shadow-[0_16px_48px_rgba(0,0,0,0.55)] backdrop-blur-md"
        >
          {isSignedIn ? (
            <>
              {shortEmail ? (
                <p
                  className="border-b border-[rgba(214,168,95,0.1)] px-4 py-3 text-[0.7rem] leading-snug tracking-wide text-[#b8ab95]"
                  role="presentation"
                >
                  {shortEmail}
                </p>
              ) : null}
              <Link
                href="/account"
                role="menuitem"
                className={itemClass}
                onClick={close}
              >
                My account
              </Link>
              <Link
                href="/account#order-history"
                role="menuitem"
                className={itemClass}
                onClick={close}
              >
                Order history
              </Link>
              <Link href="/cart" role="menuitem" className={itemClass} onClick={close}>
                Bag
              </Link>
              <form action={signOutAction} className="border-t border-[rgba(214,168,95,0.08)] pt-1">
                <button type="submit" role="menuitem" className={itemClass}>
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href={`/account/login${nextQuery}`}
                role="menuitem"
                className={itemClass}
                onClick={close}
              >
                Sign in
              </Link>
              <Link
                href={`/account/signup${nextQuery}`}
                role="menuitem"
                className={itemClass}
                onClick={close}
              >
                Create account
              </Link>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
