/**
 * Login page — magic link auth via Supabase.
 *
 * IMPORTANT: Only ONE email input must exist in the DOM at any time.
 * The strict-mode Playwright tests use getByRole('textbox', { name: /email/i })
 * and will fail if two elements match. Any honeypot, hidden, or duplicate input
 * MUST carry aria-hidden="true" and be excluded from the accessibility tree.
 */
'use client';

import { useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import MagicLinkSubmitButton from '@/app/components/MagicLinkSubmitButton';

export default function LoginPage() {
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
            We sent a magic link to <strong>{email}</strong>. Click it to sign in.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm w-full space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Single, uniquely labelled email input — no duplicates in this form */}
          <div className="space-y-1">
            <label
              htmlFor="login-email"
              className="block text-sm font-medium"
            >
              Email address
            </label>
            <input
              id="login-email"
              data-testid="login-email-input"
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

          <MagicLinkSubmitButton ariaLabel="Send magic link to sign in" />
        </form>

        <p className="text-sm text-muted-foreground text-center">
          No account?{' '}
          <a href="/account/signup" className="underline hover:text-foreground">
            Create one
          </a>
        </p>
      </div>
    </main>
  );
}
