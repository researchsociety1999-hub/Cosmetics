import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "mystique_admin";

/** Signed session cookie for `/admin/*` (password gate). */
export function getAdminCookieName(): string {
  return COOKIE_NAME;
}

function getSigningSecret(): string | null {
  return process.env.MYSTIQUE_ADMIN_SECRET?.trim() ?? null;
}

/**
 * Create a signed token: `exp.unixSeconds.nonce.signatureHex`
 * Verified with MYSTIQUE_ADMIN_SECRET (min ~32 random chars recommended).
 */
export function signAdminSession(validForSeconds: number): string | null {
  const secret = getSigningSecret();
  if (!secret) {
    return null;
  }
  const exp = Math.floor(Date.now() / 1000) + validForSeconds;
  const nonce = randomBytes(12).toString("hex");
  const payload = `${exp}.${nonce}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  if (!token?.trim()) {
    return false;
  }
  const secret = getSigningSecret();
  if (!secret) {
    return false;
  }
  const parts = token.split(".");
  if (parts.length !== 3) {
    return false;
  }
  const [expStr, nonce, sig] = parts;
  if (!expStr || !nonce || !sig) {
    return false;
  }
  const payload = `${expStr}.${nonce}`;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  try {
    const a = Buffer.from(sig, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return false;
    }
  } catch {
    return false;
  }
  const exp = Number.parseInt(expStr, 10);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) {
    return false;
  }
  return true;
}

export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.MYSTIQUE_ADMIN_PASSWORD?.trim() && getSigningSecret(),
  );
}
