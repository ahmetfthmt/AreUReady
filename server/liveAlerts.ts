export type AlertSeverity = "normal" | "notice" | "warning" | "danger" | "unavailable";

export type AlertKind = "earthquake" | "flood" | "storm" | "meteorological" | "unknown";

export type LiveAlert = {
  source: "AFAD" | "MGM";
  severity: AlertSeverity;
  kind: AlertKind;
  kindLabel: string;
  quickActions: string[];
  title: string;
  detail: string;
  observedAt?: string;
  sourceUrl: string;
};

export type CityLiveAlertsPayload = {
  city: string;
  checkedAt: Date;
  alerts: [LiveAlert, LiveAlert];
};

type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

type AfadEvent = {
  eventDate?: string;
  eventType?: string;
  magnitude?: number;
  magnitudeType?: string;
  location?: string;
  depth?: number;
};

type AfadResponse = {
  eventList?: AfadEvent[] | null;
};

type LiveAlertDependencies = {
  fetcher?: Fetcher;
  now?: () => Date;
  useCache?: boolean;
};

const AFAD_EVENTS_URL = "https://deprem.afad.gov.tr/EventData/GetEventsByFilter";
const AFAD_SOURCE_URL = "https://deprem.afad.gov.tr/event-catalog";
const MGM_WARNINGS_URL = "https://www.mgm.gov.tr/meteouyari/turkiye.aspx?Gun=1";
const CACHE_WINDOW_MS = 5 * 60 * 1000;

const cache = new Map<string, { savedAt: number; value: CityLiveAlertsPayload }>();

const ALERT_KIND_LABELS: Record<AlertKind, string> = {
  earthquake: "Deprem",
  flood: "Sel",
  storm: "Fırtına",
  meteorological: "Meteorolojik uyarı",
  unknown: "Resmi uyarı",
};

const QUICK_ACTIONS: Record<AlertKind, string[]> = {
  earthquake: [
    "Sarsıntıyı hissediyorsan çök–kapan–tutun; cam ve devrilebilecek eşyalardan uzaklaş.",
    "Sarsıntı bittiyse hasarlı binaya girme; gaz kokusu veya hasar varsa 112’yi ara.",
  ],
  flood: [
    "Su basmış yol, alt geçit ve dere yatağına girme; araçla suyu geçmeye çalışma.",
    "Elektrik hatlarından uzaklaş ve mümkünse daha yüksek, güvenli bir noktaya geç.",
  ],
  storm: [
    "Ağaç, direk, tabela ve inşaat alanlarından uzaklaş; açık alanda bekleme.",
    "Dışarıdaki gevşek eşyaları sabitle; deniz ve kara yolculuğu için resmi duyuruyu takip et.",
  ],
  meteorological: [
    "Dışarı çıkman gerekmiyorsa güvenli bir kapalı alanda kal; yolculuk planını yeniden değerlendir.",
    "Yerel resmi uyarı ayrıntısını aç ve riskli açık alanlardan uzak dur.",
  ],
  unknown: [
    "Uyarı türü netleşene kadar resmi açıklamayı doğrula ve riskli alandan uzak dur.",
    "Gerekirse 112’yi ara; söylenti yerine yalnızca resmi duyuruyu paylaş.",
  ],
};

function normalize(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("ş", "s")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c");
}

function getEarthquakeSeverity(magnitude: number): AlertSeverity {
  if (magnitude >= 5) return "danger";
  if (magnitude >= 4) return "warning";
  return "notice";
}

function getAlertKind(eventType?: string): AlertKind {
  const type = normalize(eventType ?? "");
  if (type.includes("deprem") || type.includes("earthquake")) return "earthquake";
  if (type.includes("sel") || type.includes("flood")) return "flood";
  if (type.includes("firtina") || type.includes("storm") || type.includes("wind")) return "storm";
  return "unknown";
}

function getQuickActions(kind: AlertKind, severity: AlertSeverity) {
  return severity === "normal" || severity === "unavailable" ? [] : QUICK_ACTIONS[kind];
}

function getMgmAlertFromColor(color: string): Pick<LiveAlert, "severity" | "title"> | null {
  const normalizedColor = color.toLowerCase();
  if (normalizedColor === "#1dce7d") return { severity: "normal", title: "Yeşil · Tehlike yok" };
  if (normalizedColor === "#fff431") return { severity: "notice", title: "Sarı · Az tehlikeli" };
  if (normalizedColor === "#ffc757") return { severity: "warning", title: "Turuncu · Tehlikeli" };
  if (normalizedColor === "#f94b65") return { severity: "danger", title: "Kırmızı · Çok tehlikeli" };
  return null;
}

function extractMgmColor(html: string, city: string) {
  const provinceTags = html.match(/<(?:path|g)\b[^>]*data-iladi=(?:"[^"]*"|'[^']*')[^>]*>/gi) ?? [];
  const tag = provinceTags.find((candidate) => {
    const cityMatch = candidate.match(/data-iladi=(?:"([^"]*)"|'([^']*)')/i);
    const candidateCity = cityMatch?.[1] ?? cityMatch?.[2] ?? "";
    return normalize(candidateCity) === normalize(city);
  });

  const colorMatch = tag?.match(/fill\s*:\s*(#[a-f0-9]{6})/i);
  return colorMatch?.[1] ?? null;
}

async function getAfadAlert(city: string, now: Date, fetcher: Fetcher): Promise<LiveAlert> {
  try {
    const start = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const response = await fetcher(AFAD_EVENTS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        EventSearchFilterList: [
          { FilterType: 9, Value: now.toISOString() },
          { FilterType: 8, Value: start },
        ],
        Skip: 0,
        Take: 200,
      }),
    });

    if (!response.ok) throw new Error(`AFAD HTTP ${response.status}`);

    const data = (await response.json()) as AfadResponse;
    const matchingEvent = (data.eventList ?? [])
      .filter((event) => normalize(event.location ?? "").includes(normalize(city)))
      .sort((left, right) => {
        const magnitudeDifference = (right.magnitude ?? 0) - (left.magnitude ?? 0);
        if (magnitudeDifference !== 0) return magnitudeDifference;
        return String(right.eventDate ?? "").localeCompare(String(left.eventDate ?? ""));
      })[0];

    if (!matchingEvent) {
      return {
        source: "AFAD",
        severity: "normal",
        kind: "unknown",
        kindLabel: ALERT_KIND_LABELS.unknown,
        quickActions: [],
        title: "Şehir adıyla eşleşen yeni kayıt yok",
        detail: `AFAD son 24 saatte ${city} adıyla eşleşen bir olay kaydı döndürmedi. Bu, çevrede hiç hareket olmadığı anlamına gelmez; ayrıntı için resmi kataloğu aç.`,
        sourceUrl: AFAD_SOURCE_URL,
      };
    }

    const magnitude = matchingEvent.magnitude ?? 0;
    const magnitudeType = matchingEvent.magnitudeType ?? "M";
    const severity = getEarthquakeSeverity(magnitude);
    const kind = getAlertKind(matchingEvent.eventType ?? "Earthquake");
    const depthDetail = typeof matchingEvent.depth === "number" ? ` · ${matchingEvent.depth.toFixed(1)} km derinlik` : "";
    return {
      source: "AFAD",
      severity,
      kind,
      kindLabel: ALERT_KIND_LABELS[kind],
      quickActions: getQuickActions(kind, severity),
      title: `${magnitudeType} ${magnitude.toFixed(1)} deprem kaydı`,
      detail: `${matchingEvent.location ?? city}${depthDetail}`,
      observedAt: matchingEvent.eventDate,
      sourceUrl: AFAD_SOURCE_URL,
    };
  } catch {
    return {
      source: "AFAD",
      severity: "unavailable",
      kind: "unknown",
      kindLabel: ALERT_KIND_LABELS.unknown,
      quickActions: [],
      title: "AFAD canlı sorgusu şu an alınamadı",
      detail: "Bağlantı veya resmi veri akışı yanıt vermedi. Bu durum, uyarı olmadığı anlamına gelmez; resmi kataloğu doğrudan kontrol et.",
      sourceUrl: AFAD_SOURCE_URL,
    };
  }
}

async function getMgmAlert(city: string, fetcher: Fetcher): Promise<LiveAlert> {
  try {
    const response = await fetcher(MGM_WARNINGS_URL, { headers: { Accept: "text/html" } });
    if (!response.ok) throw new Error(`MGM HTTP ${response.status}`);

    const html = await response.text();
    const color = extractMgmColor(html, city);
    const parsedAlert = color ? getMgmAlertFromColor(color) : null;
    if (!parsedAlert) {
      return {
        source: "MGM",
        severity: "unavailable",
        kind: "meteorological",
        kindLabel: ALERT_KIND_LABELS.meteorological,
        quickActions: [],
        title: "MGM harita seviyesi çözümlenemedi",
        detail: "Resmi MeteoUyarı haritasındaki şehir verisi şu an okunamadı. Güncel seviyeyi resmi haritadan kontrol et.",
        sourceUrl: MGM_WARNINGS_URL,
      };
    }

    return {
      source: "MGM",
      ...parsedAlert,
      kind: "meteorological",
      kindLabel: ALERT_KIND_LABELS.meteorological,
      quickActions: getQuickActions("meteorological", parsedAlert.severity),
      detail: `MGM MeteoUyarı haritasında ${city} için resmi seviye: ${parsedAlert.title}.`,
      sourceUrl: MGM_WARNINGS_URL,
    };
  } catch {
    return {
      source: "MGM",
      severity: "unavailable",
      kind: "meteorological",
      kindLabel: ALERT_KIND_LABELS.meteorological,
      quickActions: [],
      title: "MGM canlı sorgusu şu an alınamadı",
      detail: "Bağlantı veya resmi harita yanıt vermedi. Bu durum, meteorolojik uyarı olmadığı anlamına gelmez; resmi haritayı doğrudan kontrol et.",
      sourceUrl: MGM_WARNINGS_URL,
    };
  }
}

export async function getCityLiveAlerts(
  city: string,
  { fetcher = fetch, now = () => new Date(), useCache = true }: LiveAlertDependencies = {},
): Promise<CityLiveAlertsPayload> {
  const cacheKey = normalize(city);
  const cached = cache.get(cacheKey);
  const currentTime = now();
  if (useCache && cached && currentTime.getTime() - cached.savedAt < CACHE_WINDOW_MS) return cached.value;

  const [afad, mgm] = await Promise.all([getAfadAlert(city, currentTime, fetcher), getMgmAlert(city, fetcher)]);
  const value: CityLiveAlertsPayload = { city, checkedAt: currentTime, alerts: [afad, mgm] };
  if (useCache) cache.set(cacheKey, { savedAt: currentTime.getTime(), value });
  return value;
}

export function clearLiveAlertsCache() {
  cache.clear();
}
