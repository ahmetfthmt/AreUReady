export type GatheringPoint = {
  id: string;
  city: string;
  name: string;
  note: string;
  createdAt: string;
};

type GatheringPointInput = Pick<GatheringPoint, "city" | "name" | "note">;

export const GATHERING_POINTS_STORAGE_KEY = "hazir-misin-gathering-points";

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `point-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createGatheringPoint(input: GatheringPointInput) {
  const city = input.city.trim();
  const name = input.name.trim();

  if (!city) return { error: "Önce şehrini seçmelisin." } as const;
  if (name.length < 2) return { error: "Alan için en az iki karakterlik bir ad yaz." } as const;

  return {
    point: {
      id: createId(),
      city,
      name,
      note: input.note.trim(),
      createdAt: new Date().toISOString(),
    },
  } as const;
}

export function loadGatheringPoints(storage: Pick<Storage, "getItem"> = localStorage): GatheringPoint[] {
  try {
    const raw = storage.getItem(GATHERING_POINTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((point): point is GatheringPoint => (
      typeof point?.id === "string"
      && typeof point?.city === "string"
      && typeof point?.name === "string"
      && typeof point?.note === "string"
      && typeof point?.createdAt === "string"
    ));
  } catch {
    return [];
  }
}

export function persistGatheringPoints(points: GatheringPoint[], storage: Pick<Storage, "setItem"> = localStorage) {
  storage.setItem(GATHERING_POINTS_STORAGE_KEY, JSON.stringify(points));
}

export function getGatheringPointMapUrl(point: Pick<GatheringPoint, "city" | "name">) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${point.name}, ${point.city}`)}`;
}
