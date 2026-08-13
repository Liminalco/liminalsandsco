/**
 * Version history for saved canvas designs.
 *
 * Revisions live inside the saved design's JSON payload under `__versions`, so
 * no extra table is needed and local-only (offline) designs version the same way.
 */

export const MAX_VERSIONS = 20;
export const VERSIONS_KEY = "__versions" as const;

export type DesignVersion = {
  id: string;
  at: number;
  label: string;
  price: number;
  state: Record<string, unknown>;
};

export type VersionedDesign = Record<string, unknown> & {
  __versions?: DesignVersion[];
};

function versionId(): string {
  return `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

/** Strips revision metadata so a stored snapshot never nests its own history. */
export function stripVersions(design: VersionedDesign | null | undefined): Record<string, unknown> {
  if (!design) return {};
  const { __versions: _drop, ...rest } = design;
  return rest;
}

export function getVersions(design: VersionedDesign | null | undefined): DesignVersion[] {
  const list = design?.[VERSIONS_KEY];
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => b.at - a.at);
}

/**
 * Returns the next payload to persist: `nextState` becomes current, and the
 * previous state is pushed onto the revision stack (newest first, capped).
 */
export function pushVersion(
  previous: VersionedDesign | null | undefined,
  nextState: Record<string, unknown>,
  meta: { price: number; label?: string },
): VersionedDesign {
  const history = getVersions(previous);
  const prevState = stripVersions(previous);
  const hasPrevious = Object.keys(prevState).length > 0;

  const nextHistory = hasPrevious
    ? [
        {
          id: versionId(),
          at: Date.now(),
          label: meta.label ?? `Revision ${history.length + 1}`,
          price: Number((previous as { price?: number })?.price ?? meta.price ?? 0),
          state: prevState,
        },
        ...history,
      ].slice(0, MAX_VERSIONS)
    : history;

  return { ...stripVersions(nextState as VersionedDesign), [VERSIONS_KEY]: nextHistory };
}

/** Restores `versionId` as the current state, archiving whatever was current. */
export function restoreVersion(
  design: VersionedDesign | null | undefined,
  id: string,
  price = 0,
): VersionedDesign | null {
  const history = getVersions(design);
  const target = history.find((v) => v.id === id);
  if (!target) return null;
  const restored = pushVersion(design, target.state, { price, label: "Before restore" });
  return {
    ...restored,
    [VERSIONS_KEY]: getVersions(restored).filter((v) => v.id !== target.id).slice(0, MAX_VERSIONS),
  };
}

export function formatVersionDate(at: number): string {
  try {
    return new Date(at).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return new Date(at).toISOString();
  }
}
