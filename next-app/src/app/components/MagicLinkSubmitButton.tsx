"use client";

import { useFormStatus } from "react-dom";

type MagicLinkSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
  className?: string;
};

/**
 * Submit control for server actions — must be rendered inside the same `<form>`.
 */
export function MagicLinkSubmitButton({
  idleLabel,
  pendingLabel,
  className,
}: MagicLinkSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={
        className ??
        "mystic-button-primary inline-flex min-h-[48px] items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em] disabled:cursor-wait disabled:opacity-70"
      }
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
