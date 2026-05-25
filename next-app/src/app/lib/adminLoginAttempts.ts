type AttemptRecord = {
  count: number;
  resetAt: number;
};

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;

const failuresByIp = new Map<string, AttemptRecord>();

function getRecord(ip: string): AttemptRecord | null {
  const record = failuresByIp.get(ip);
  if (!record) {
    return null;
  }

  if (Date.now() > record.resetAt) {
    failuresByIp.delete(ip);
    return null;
  }

  return record;
}

export function isAdminLoginLockedOut(ip: string): boolean {
  const record = getRecord(ip);
  return (record?.count ?? 0) >= MAX_FAILURES;
}

export function recordAdminLoginFailure(ip: string): void {
  const now = Date.now();
  const record = getRecord(ip);

  if (!record) {
    failuresByIp.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }

  record.count += 1;
}
