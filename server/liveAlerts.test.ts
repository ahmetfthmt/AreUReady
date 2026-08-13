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
              { eventDate: "2026-08-13T07:12:00", magnitude: 4.2, magnitudeType: "ML", location: "Seferihisar (İzmir)", depth: 8.2 },
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
      observedAt: "2026-08-13T07:12:00",
    });
    expect(result.alerts[1]).toMatchObject({
      source: "MGM",
      severity: "warning",
      title: "Turuncu · Tehlikeli",
    });
  });

  it("makes an unavailable source explicit instead of treating it as no alert", async () => {
    const failingFetcher = async () => new Response("", { status: 503 });
    const result = await getCityLiveAlerts("Ankara", { fetcher: failingFetcher, now: () => fixedNow, useCache: false });

    expect(result.alerts).toHaveLength(2);
    expect(result.alerts.every((alert) => alert.severity === "unavailable")).toBe(true);
    expect(result.alerts[0].detail).toContain("uyarı olmadığı anlamına gelmez");
  });
});
