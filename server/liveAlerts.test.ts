import { describe, expect, it } from "vitest";
import { getCityLiveAlerts } from "./liveAlerts";

const fixedNow = new Date("2026-08-13T08:00:00.000Z");

describe("getCityLiveAlerts", () => {
  it("normalizes AFAD and MGM official responses into a city-specific live alert payload", async () => {
    const fetcher = async (url: string) => {
      if (url.includes("deprem.afad.gov.tr")) {
        return new Response(
          JSON.stringify({
            eventList: [
              { eventDate: "2026-08-13T07:12:00", eventType: "Earthquake", magnitude: 4.2, magnitudeType: "ML", location: "Seferihisar (İzmir)", depth: 8.2 },
              { eventDate: "2026-08-13T07:40:00", magnitude: 2.8, magnitudeType: "ML", location: "Bornova (İzmir)", depth: 5.4 },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      return new Response(
        '<svg><path id="93501" data-iladi="İzmir" style="fill: #FFC757; cursor: pointer;" /></svg>',
        { status: 200, headers: { "Content-Type": "text/html" } },
      );
    };

    const result = await getCityLiveAlerts("İzmir", { fetcher, now: () => fixedNow, useCache: false });

    expect(result.city).toBe("İzmir");
    expect(result.checkedAt).toEqual(fixedNow);
    expect(result.alerts[0]).toMatchObject({
      source: "AFAD",
      severity: "warning",
      title: "ML 4.2 deprem kaydı",
      kind: "earthquake",
      kindLabel: "Deprem",
      observedAt: "2026-08-13T07:12:00",
    });
    expect(result.alerts[0].quickActions).toHaveLength(2);
    expect(result.alerts[1]).toMatchObject({
      source: "MGM",
      severity: "warning",
      kind: "meteorological",
      title: "Turuncu · Tehlikeli",
    });
    expect(result.alerts[1].quickActions).toHaveLength(2);
  });

  it("uses the official event type to provide flood-specific quick actions", async () => {
    const fetcher = async (url: string) => {
      if (url.includes("deprem.afad.gov.tr")) {
        return new Response(
          JSON.stringify({ eventList: [{ eventDate: "2026-08-13T07:50:00", eventType: "Flood", magnitude: 4.0, location: "Merkez (Antalya)" }] }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      return new Response('<svg><path data-iladi="Antalya" style="fill: #1DCE7D;" /></svg>', { status: 200 });
    };

    const result = await getCityLiveAlerts("Antalya", { fetcher, now: () => fixedNow, useCache: false });

    expect(result.alerts[0]).toMatchObject({ kind: "flood", kindLabel: "Sel" });
    expect(result.alerts[0].quickActions[0]).toContain("alt geçit");
    expect(result.alerts[1].quickActions).toEqual([]);
  });

  it("uses a conservative fallback when an official event type is unknown", async () => {
    const fetcher = async (url: string) => {
      if (url.includes("deprem.afad.gov.tr")) {
        return new Response(
          JSON.stringify({ eventList: [{ eventDate: "2026-08-13T07:55:00", eventType: "Unclassified", magnitude: 4.1, location: "Merkez (Bursa)" }] }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      return new Response('<svg><path data-iladi="Bursa" style="fill: #1DCE7D;" /></svg>', { status: 200 });
    };

    const result = await getCityLiveAlerts("Bursa", { fetcher, now: () => fixedNow, useCache: false });

    expect(result.alerts[0]).toMatchObject({ kind: "unknown", kindLabel: "Resmi uyarı" });
    expect(result.alerts[0].quickActions[0]).toContain("türü netleşene kadar");
  });

  it("does not suggest quick actions when no city-matched event or weather warning is returned", async () => {
    const fetcher = async (url: string) => {
      if (url.includes("deprem.afad.gov.tr")) {
        return new Response(JSON.stringify({ eventList: [] }), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      return new Response('<svg><path data-iladi="Sivas" style="fill: #1DCE7D;" /></svg>', { status: 200 });
    };

    const result = await getCityLiveAlerts("Sivas", { fetcher, now: () => fixedNow, useCache: false });

    expect(result.alerts.map((alert) => alert.quickActions)).toEqual([[], []]);
    expect(result.alerts[0].title).toBe("Şehir adıyla eşleşen yeni kayıt yok");
    expect(result.alerts[1].title).toBe("Yeşil · Tehlike yok");
  });

  it("makes an unavailable source explicit instead of treating it as no alert", async () => {
    const failingFetcher = async () => new Response("", { status: 503 });
    const result = await getCityLiveAlerts("Ankara", { fetcher: failingFetcher, now: () => fixedNow, useCache: false });

    expect(result.alerts).toHaveLength(2);
    expect(result.alerts.every((alert) => alert.severity === "unavailable")).toBe(true);
    expect(result.alerts[0].detail).toContain("uyarı olmadığı anlamına gelmez");
  });
});
