import { describe, expect, it } from "vitest";
import {
  GATHERING_POINTS_STORAGE_KEY,
  createGatheringPoint,
  getGatheringPointMapUrl,
  loadGatheringPoints,
  persistGatheringPoints,
} from "../client/src/lib/gatheringPoints";

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

describe("gathering points", () => {
  it("validates the city and area name before creating a device record", () => {
    expect(createGatheringPoint({ city: "", name: "Park", note: "" })).toMatchObject({ error: "Önce şehrini seçmelisin." });
    expect(createGatheringPoint({ city: "İzmir", name: "A", note: "" })).toMatchObject({ error: "Alan için en az iki karakterlik bir ad yaz." });
  });

  it("persists a valid gathering point and restores it for offline use", () => {
    const storage = createStorage();
    const result = createGatheringPoint({ city: "İzmir", name: "Kültürpark", note: "Ana kapı" });
    if ("error" in result) throw new Error("Expected a valid gathering point");

    persistGatheringPoints([result.point], storage);

    expect(loadGatheringPoints(storage)).toEqual([result.point]);
    expect(storage.getItem(GATHERING_POINTS_STORAGE_KEY)).toContain("Kültürpark");
  });

  it("persists an empty list after a saved point is removed", () => {
    const storage = createStorage();
    const result = createGatheringPoint({ city: "İzmir", name: "Kültürpark", note: "Ana kapı" });
    if ("error" in result) throw new Error("Expected a valid gathering point");

    persistGatheringPoints([result.point], storage);
    persistGatheringPoints([], storage);

    expect(loadGatheringPoints(storage)).toEqual([]);
  });

  it("ignores malformed local data and produces a usable map search link", () => {
    const storage = createStorage();
    storage.setItem(GATHERING_POINTS_STORAGE_KEY, "not-json");

    expect(loadGatheringPoints(storage)).toEqual([]);
    expect(getGatheringPointMapUrl({ city: "Ankara", name: "Kızılay Meydanı" })).toContain("google.com/maps/search");
  });
});
