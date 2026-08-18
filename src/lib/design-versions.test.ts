import { describe, expect, it } from "vitest";
import {
  MAX_VERSIONS,
  getVersions,
  pushVersion,
  restoreVersion,
  stripVersions,
  type VersionedDesign,
} from "./design-versions";

const v1 = { bg: "#111", layers: [{ kind: "text", text: "one" }] };
const v2 = { bg: "#222", layers: [{ kind: "text", text: "two" }] };
const v3 = { bg: "#333", layers: [{ kind: "text", text: "three" }] };

describe("saving revisions", () => {
  it("keeps the first save free of history", () => {
    const saved = pushVersion(null, v1, { price: 100 });
    expect(stripVersions(saved)).toEqual(v1);
    expect(getVersions(saved)).toHaveLength(0);
  });

  it("archives the previous state on each subsequent save", () => {
    const first = pushVersion(null, v1, { price: 100 });
    const second = pushVersion(first, v2, { price: 120 });
    const third = pushVersion(second, v3, { price: 130 });

    expect(stripVersions(third)).toEqual(v3);
    const history = getVersions(third);
    expect(history).toHaveLength(2);
    // newest first
    expect(history[0]!.state).toEqual(v2);
    expect(history[1]!.state).toEqual(v1);
  });

  it("never nests history inside a snapshot and caps the stack", () => {
    let design: VersionedDesign = pushVersion(null, v1, { price: 1 });
    for (let i = 0; i < MAX_VERSIONS + 5; i++) {
      design = pushVersion(design, { bg: `#${i}` }, { price: i });
    }
    const history = getVersions(design);
    expect(history).toHaveLength(MAX_VERSIONS);
    expect(history.every((h) => !("__versions" in h.state))).toBe(true);
  });
});

describe("listing revisions in the Garage", () => {
  it("reads history off a persisted row payload and sorts newest first", () => {
    const row = { design: pushVersion(pushVersion(null, v1, { price: 100 }), v2, { price: 120 }) };
    const versions = getVersions(row.design as VersionedDesign);
    expect(versions).toHaveLength(1);
    expect(versions[0]!.state).toEqual(v1);
    expect(typeof versions[0]!.label).toBe("string");
    // the card renders state without the history blob
    expect(stripVersions(row.design as VersionedDesign)).toEqual(v2);
  });

  it("returns an empty list for designs saved before versioning existed", () => {
    expect(getVersions({ bg: "#000" })).toEqual([]);
    expect(getVersions(null)).toEqual([]);
  });
});

describe("restoring a previous revision", () => {
  it("makes the chosen revision current and archives what was current", () => {
    const first = pushVersion(null, v1, { price: 100 });
    const second = pushVersion(first, v2, { price: 120 });
    const target = getVersions(second)[0]!;

    const restored = restoreVersion(second, target.id, 120)!;
    expect(restored).not.toBeNull();
    expect(stripVersions(restored)).toEqual(v1);

    const history = getVersions(restored);
    expect(history.some((h) => h.id === target.id)).toBe(false);
    expect(history[0]!.state).toEqual(v2);
  });

  it("returns null for an unknown revision id", () => {
    const design = pushVersion(pushVersion(null, v1, { price: 1 }), v2, { price: 2 });
    expect(restoreVersion(design, "nope", 0)).toBeNull();
  });

  it("supports restoring twice in a row", () => {
    const a = pushVersion(null, v1, { price: 1 });
    const b = pushVersion(a, v2, { price: 2 });
    const c = pushVersion(b, v3, { price: 3 });

    const toV1 = getVersions(c).find((h) => h.state.bg === "#111")!;
    const back = restoreVersion(c, toV1.id, 3)!;
    expect(stripVersions(back)).toEqual(v1);

    const toV3 = getVersions(back).find((h) => h.state.bg === "#333")!;
    const forward = restoreVersion(back, toV3.id, 1)!;
    expect(stripVersions(forward)).toEqual(v3);
  });
});
