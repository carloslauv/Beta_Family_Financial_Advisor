// In-memory store for shared panoramas
// In production, this would be a database
const sharedPanoramas = new Map<string, { panorama: unknown; expiresAt: Date }>();

export function storePanorama(token: string, panorama: unknown): void {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
  sharedPanoramas.set(token, { panorama, expiresAt });
}

export function getSharedPanorama(token: string): unknown | null {
  const entry = sharedPanoramas.get(token);
  if (!entry) return null;
  if (entry.expiresAt < new Date()) {
    sharedPanoramas.delete(token);
    return null;
  }
  return entry.panorama;
}

export function cleanupExpired(): void {
  const now = new Date();
  Array.from(sharedPanoramas.entries()).forEach(([token, entry]) => {
    if (entry.expiresAt < now) {
      sharedPanoramas.delete(token);
    }
  });
}
