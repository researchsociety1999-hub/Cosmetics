/**
 * Signup page — magic link auth via Supabase.
 *
 * IMPORTANT: Only ONE email input must exist in the DOM at any time.
 * The strict-mode Playwright tests use data-testid="signup-email-input".
 * The footer NewsletterForm renders a second email input on every page —
 * using data-testid keeps selectors unambiguous.
 */
'use client';

import { useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import { MagicLinkSubmitButton } from '@/app/components/MagicLinkSubmitButton';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center space-y-4">
          <h1 className="text-2xl font-semibold">Check your email</h1>
          <p className="text-muted-foreground">
            We sent a magic link to <strong>{email}</strong>. Click it to complete sign-up.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm w-full space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Create your Mystique account</h1>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Single, uniquely labelled email input — no duplicates in this form */}
          <div className="space-y-1">
            <label
              htmlFor="signup-email"
              className="block text-sm font-medium"
            >
              Email address
            </label>
            <input
              id="signup-email"
              data-testid="signup-email-input"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-error">
              {error}
            </p>
          )}

          <MagicLinkSubmitButton
            idleLabel="Create account"
            pendingLabel="Creating…"
            ariaLabel="Send magic link to create account"
          />
        </form>

        <p className="text-sm text-muted-foreground text-center">
          Already have an account?{' '}
          <a href="/account/login" className="underline hover:text-foreground">
            Sign in
          </a>
        </p>
      </div>
    </main>
  );
}
