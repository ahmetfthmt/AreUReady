/* Design note: Sakin Komuta Masası — asymmetrical field-desk dashboard, Barlow Condensed + Manrope, restrained motion. */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  CloudOff,
  Copy,
  ExternalLink,
  FileCheck2,
  Info,
  LoaderCircle,
  LocateFixed,
  MapPin,
  Menu,
  PawPrint,
  Phone,
  Plus,
  Radio,
  RefreshCw,
  RotateCcw,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { CITY_NAMES, CITY_PROFILES, findNearestCity } from "@/lib/cityProfiles";
import { trpc } from "@/lib/trpc";

type NavKey = "overview" | "plan" | "focus" | "share";

type Plan = {
  city: string;
  location: string;
  contactName: string;
  contactPhone: string;
  meetingPoint: string;
  pet: boolean;
  tasks: Record<string, boolean>;
  note: string;
};

const TASKS = [
  {
    id: "contact",
    category: "İletişim",
    label: "Acil kişini kaydet",
    detail: "Telefonu ezberde değil, planın içinde tut.",
    icon: Phone,
  },
  {
    id: "meeting",
    category: "Buluşma",
    label: "Buluşma noktanı belirle",
    detail: "Evden ayrılınca ilk nerede buluşacaksınız?",
    icon: MapPin,
  },
  {
    id: "bag",
    category: "Çanta",
    label: "Temel çantayı kontrol et",
    detail: "Su, ışık, ilk yardım ve şarj; önce bunlar.",
    icon: ShieldCheck,
  },
  {
    id: "documents",
    category: "Belgeler",
    label: "Önemli belgeleri erişilebilir yap",
    detail: "Kimlik ve kritik evrakların yerini biliyor musun?",
    icon: FileCheck2,
  },
  {
    id: "pet",
    category: "Evcil hayvan",
    label: "Evcil hayvan planını ekle",
    detail: "Mama, taşıma çantası ve güvenli kişi notu.",
    icon: PawPrint,
  },
];

const FOCUS_CARDS = [
  {
    eyebrow: "BUGÜNÜN ODAĞI · GÖKYÜZÜ",
    title: "Güneş tutulması: saati değil, hazırlığı kaçırma.",
    body: "12 Ağustos 2026 için maksimum evre 20.47 olarak paylaşılıyor. Türkiye'den görünürlük konuma göre değişebilir; güvenli gözlem filtresi kullan.",
    source: "Güneydoğu Ekspres",
    href: "https://www.guneydoguekspres.com/12-agustos-2026-gunes-tutulmasi-saat-kacta-tam-gunes-tutulmasi-turkiyeden-gorulecek-mi",
    icon: Sun,
    tone: "orange",
  },
  {
    eyebrow: "BUGÜNÜN ODAĞI · RESMİ KAYNAK",
    title: "Deprem oldu mu? Önce kaynağı kontrol et.",
    body: "AFAD ve Kandilli listeleri anlık hareketleri takip etmek için başvurulacak resmi kanallardır. Tahmin değil, teyit arıyoruz.",
    source: "NTV / AFAD / Kandilli",
    href: "https://www.ntv.com.tr/turkiye/son-dakika-deprem-mi-oldu-az-once-deprem-nerede-oldu-istanbul-ankara-izmir-ve-il-il-afad-son-depremler-12-agustos-2026-1736940",
    icon: Bell,
    tone: "sage",
  },
];

const DEFAULT_TASKS = Object.fromEntries(TASKS.map((task) => [task.id, false]));
const DEFAULT_PLAN: Plan = {
  city: "",
  location: "",
  contactName: "",
  contactPhone: "",
  meetingPoint: "",
  pet: false,
  tasks: DEFAULT_TASKS,
  note: "",
};

function loadPlan(): Plan {
  try {
    const raw = localStorage.getItem("hazir-misin-plan");
    if (!raw) return DEFAULT_PLAN;
    const parsed = JSON.parse(raw) as Partial<Plan>;
    return {
      ...DEFAULT_PLAN,
      ...parsed,
      tasks: { ...DEFAULT_TASKS, ...(parsed.tasks ?? {}) },
    };
  } catch {
    return DEFAULT_PLAN;
  }
}

function usePersistedPlan() {
  const [plan, setPlan] = useState<Plan>(() => loadPlan());

  useEffect(() => {
    localStorage.setItem("hazir-misin-plan", JSON.stringify(plan));
  }, [plan]);

  return [plan, setPlan] as const;
}

function getTodayLabel() {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function formatLiveTimestamp(value?: string | Date) {
  if (!value) return "Zaman damgası bekleniyor";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Zaman damgası okunamadı";
  return new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" }).format(parsed);
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const [plan, setPlan] = usePersistedPlan();
  const [selectedCity, setSelectedCity] = useState(() => {
    const storedCity = localStorage.getItem("hazir-misin-city");
    if (storedCity && CITY_PROFILES[storedCity]) return storedCity;
    const storedPlan = loadPlan();
    return storedPlan.city && CITY_PROFILES[storedPlan.city] ? storedPlan.city : "";
  });
  const [activeNav, setActiveNav] = useState<NavKey>("overview");
  const [online, setOnline] = useState(() => navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isShareBusy, setIsShareBusy] = useState(false);
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "success" | "denied">("idle");
  const planRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, []);

  const completedCount = useMemo(
    () => Object.values(plan.tasks).filter(Boolean).length,
    [plan.tasks],
  );
  const score = Math.round((completedCount / TASKS.length) * 100);
  const nextTask = TASKS.find((task) => !plan.tasks[task.id]);
  const cityProfile = selectedCity ? CITY_PROFILES[selectedCity] : null;
  const todayLabel = getTodayLabel();
  const liveAlertsQuery = trpc.alerts.city.useQuery(
    { city: selectedCity || "İstanbul" },
    {
      enabled: Boolean(selectedCity) && online,
      refetchInterval: online ? 300_000 : false,
      staleTime: 240_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  );
  const displayedLiveAlerts = liveAlertsQuery.data;

  const updatePlan = (patch: Partial<Plan>) => setPlan((current) => ({ ...current, ...patch }));

  const toggleTask = (id: string) => {
    setPlan((current) => ({
      ...current,
      tasks: { ...current.tasks, [id]: !current.tasks[id] },
    }));
  };

  const selectCity = (city: string) => {
    setSelectedCity(city);
    updatePlan({ city });
    if (city) {
      localStorage.setItem("hazir-misin-city", city);
      setLocationStatus("success");
      toast.success(`${city} için odak kartın güncellendi.`);
    }
  };

  const detectCity = () => {
    if (!navigator.geolocation) {
      toast.info("Bu tarayıcı konum algılamayı desteklemiyor; şehir seçiciyi kullanabilirsin.");
      return;
    }
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const nearestCity = findNearestCity(coords.latitude, coords.longitude);
        if (!nearestCity) {
          setLocationStatus("denied");
          toast.info("Yakındaki şehir eşleştirilemedi; şehir seçiciden devam edebilirsin.");
          return;
        }
        selectCity(nearestCity.city);
        toast.success(`Yaklaşık konumuna göre ${nearestCity.city} seçildi.`);
      },
      () => {
        setLocationStatus("denied");
        toast.info("Konum izni kullanılmadı; şehrini listeden seçebilirsin.");
      },
      { enableHighAccuracy: false, maximumAge: 86_400_000, timeout: 8_000 },
    );
  };

  const navigate = (key: NavKey) => {
    setActiveNav(key);
    setMenuOpen(false);
    if (key === "overview") scrollToId("overview");
    if (key === "plan") scrollToId("plan");
    if (key === "focus") scrollToId("focus");
    if (key === "share") scrollToId("share");
  };

  const shareText = `${selectedCity ? `${selectedCity} için ` : ""}Hazır mısın? Hazırlık skorum %${score}. ${completedCount}/${TASKS.length} adımı tamamladım. Ben planımı çıkardım; sıra sende.`;

  const sharePlan = async () => {
    setIsShareBusy(true);
    try {
      if (navigator.share) {
        await navigator.share({ title: "Hazır mısın?", text: shareText });
        toast.success("Hazırlık kartın paylaşıldı.");
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        toast.success("Paylaşım metni panoya kopyalandı.");
      } else {
        toast.info(shareText);
      }
    } catch {
      toast.info("Paylaşım iptal edildi; planın cihazında kayıtlı.");
    } finally {
      setIsShareBusy(false);
    }
  };

  const copyPlan = async () => {
    if (!navigator.clipboard) {
      toast.info(shareText);
      return;
    }
    await navigator.clipboard.writeText(shareText);
    toast.success("Kısa paylaşım metni kopyalandı.");
  };

  const resetPlan = () => {
    setPlan(DEFAULT_PLAN);
    toast.success("Planın temizlendi. Baştan başlayabilirsin.");
  };

  const installApp = async () => {
    if (!installPrompt) {
      toast.info("Tarayıcı menüsünden 'Ana ekrana ekle' seçeneğini kullanabilirsin.");
      return;
    }
    await installPrompt.prompt();
    setInstallPrompt(null);
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "is-open" : ""}`} aria-label="Uygulama navigasyonu">
        <div className="brand-lockup">
          <img src="/manus-storage/hazir-misin-mark_67e5ac2c.png" alt="" className="brand-mark" />
          <div>
            <div className="brand-wordmark">Hazır<span>mısın?</span></div>
            <div className="brand-subtitle">kişisel hazırlık masası</div>
          </div>
          <button className="icon-button sidebar-close" onClick={() => setMenuOpen(false)} aria-label="Menüyü kapat">
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-date">
          <span className="section-kicker">DOSYA 01 / BUGÜN</span>
          <strong>{todayLabel}</strong>
          <span className="sync-status">
            <span className={`status-dot ${online ? "is-online" : "is-offline"}`} />
            {online ? "Cihazında kayıtlı" : "Çevrimdışı mod"}
          </span>
        </div>

        <nav className="side-nav">
          <button className={activeNav === "overview" ? "active" : ""} onClick={() => navigate("overview")}>
            <span className="nav-index">01</span><span>Genel görünüm</span><ChevronRight size={15} />
          </button>
          <button className={activeNav === "plan" ? "active" : ""} onClick={() => navigate("plan")}>
            <span className="nav-index">02</span><span>Planını çıkar</span><ChevronRight size={15} />
          </button>
          <button className={activeNav === "focus" ? "active" : ""} onClick={() => navigate("focus")}>
            <span className="nav-index">03</span><span>Bugünün odağı</span><ChevronRight size={15} />
          </button>
          <button className={activeNav === "share" ? "active" : ""} onClick={() => navigate("share")}>
            <span className="nav-index">04</span><span>Skorunu paylaş</span><ChevronRight size={15} />
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-note"><Info size={15} /><span>Bu uygulama tahmin yapmaz. Resmi kaynak, kişisel plan ve sakin karar için tasarlandı.</span></div>
          <button className="install-link" onClick={installApp}><Plus size={16} /> Ana ekrana ekle</button>
        </div>
      </aside>

      <main className="main-column">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Menüyü aç"><Menu size={21} /></button>
          <div className="topbar-context"><span className="live-line" /> <span>{online ? "Sistem hazır" : "Çevrimdışı çalışma"}</span></div>
          <div className="topbar-actions">
            <button className="text-button" onClick={resetPlan}><RotateCcw size={14} /> Sıfırla</button>
            <button className="button button-primary button-small" onClick={sharePlan} disabled={isShareBusy}><Share2 size={15} /> {isShareBusy ? "Hazırlanıyor" : "Paylaş"}</button>
          </div>
        </header>

        <section className="hero-section" id="overview">
          <div className="hero-copy">
            <div className="section-kicker">KİŞİSEL HAZIRLIK · 60 SANİYE</div>
            <h1>Önce kendini<br /><em>netleştir.</em></h1>
            <p className="hero-lede">Gündem değişir. Planın cebinde kalır. Bugün seni etkileyebilecek şeyleri sakin bir sıraya koy, sonra tek bir kartla paylaş.</p>
            <div className="hero-actions">
              <button className="button button-primary" onClick={() => navigate("plan")}>Planımı çıkar <ArrowUpRight size={17} /></button>
              <button className="text-button text-button-large" onClick={() => navigate("focus")}>Bugünün odağı <ChevronRight size={16} /></button>
            </div>
            <div className="source-stamp"><span>ARAŞTIRMA NOTU</span> 12 AĞUSTOS 2026 · GÜNCEL SORGU KÜMELERİ</div>
          </div>
          <div className="hero-art" role="img" aria-label="Hazırlık defteri ve el feneri bulunan sakin masa fotoğrafı">
            <div className="hero-art-overlay" />
            <div className="hero-sticker"><Sparkles size={15} /><span>panik değil,<br /><strong>hazırlık</strong></span></div>
            <div className="hero-caption">SAHA NOTU / 001</div>
          </div>
        </section>

        <section className="score-grid" aria-label="Hazırlık özeti">
          <div className="score-card">
            <div className="score-card-header"><span className="section-kicker">HAZIRLIK SKORU</span><span className="score-meta">{completedCount} / {TASKS.length} ADIM</span></div>
            <div className="score-card-body">
              <div className="score-ring" style={{ "--score": `${score * 3.6}deg` } as React.CSSProperties}>
                <div className="score-ring-inner"><strong>{score}</strong><span>puan</span></div>
              </div>
              <div className="score-message"><span className="score-status">{score === 0 ? "İlk çizgi" : score === 100 ? "Tamamlandı" : "İyi gidiyor"}</span><h2>{nextTask ? "Bir sonraki küçük adımın hazır." : "Planın tamam; şimdi paylaş."}</h2><p>{nextTask ? nextTask.detail : "Hazırlık kartını çevrendekilere göndererek bir kişiyi daha harekete geçir."}</p><button className="inline-action" onClick={() => navigate("plan")}>{nextTask ? nextTask.label : "Planı gözden geçir"} <ArrowUpRight size={14} /></button></div>
            </div>
          </div>
          <div className="quick-card">
            <div className="quick-card-top"><span className="section-kicker">HIZLI BAĞLAM</span><span className="mini-number">01</span></div>
            <div className="quick-icon"><CloudOff size={19} /></div>
            <h3>Çevrimdışı da yanında.</h3>
            <p>Planın cihazında saklanır. İnternet gittiğinde de kontrol listene ulaşabilirsin.</p>
            <div className="quick-foot"><span className={`status-dot ${online ? "is-online" : "is-offline"}`} /> <span>{online ? "Son değişiklikler kaydediliyor" : "Bağlantı yok · yerel kayıt aktif"}</span></div>
          </div>
        </section>

        <section className="section-block plan-block" id="plan" ref={planRef}>
          <div className="section-heading"><div><span className="section-kicker">02 / PLANINI ÇIKAR</span><h2>Kontrol sende olanları<br /><em>işaretle.</em></h2></div><div className="section-heading-copy"><p>İlk beş madde, belirsiz bir anda en çok zaman kazandıran temel düzeni kurar. Hepsini şimdi bitirmek zorunda değilsin.</p><span className="field-rule" /></div></div>
          <div className="plan-layout">
            <div className="plan-form-panel">
              <div className="form-row"><label htmlFor="location">Neredesin?</label><div className="input-with-icon"><MapPin size={17} /><input id="location" value={plan.location} onChange={(event) => updatePlan({ location: event.target.value })} placeholder="İl / ilçe yaz" /></div></div>
              <div className="form-row"><label htmlFor="contactName">Acil durumda arayacağın kişi</label><div className="input-with-icon"><Users size={17} /><input id="contactName" value={plan.contactName} onChange={(event) => updatePlan({ contactName: event.target.value })} placeholder="Ad soyad" /></div></div>
              <div className="form-row"><label htmlFor="contactPhone">Telefon numarası <span>opsiyonel</span></label><div className="input-with-icon"><Phone size={17} /><input id="contactPhone" inputMode="tel" value={plan.contactPhone} onChange={(event) => updatePlan({ contactPhone: event.target.value })} placeholder="05xx xxx xx xx" /></div></div>
              <div className="form-row"><label htmlFor="meetingPoint">Buluşma noktası <span>opsiyonel</span></label><div className="input-with-icon"><MapPin size={17} /><input id="meetingPoint" value={plan.meetingPoint} onChange={(event) => updatePlan({ meetingPoint: event.target.value })} placeholder="Park, okul, meydan…" /></div></div>
              <label className="toggle-row"><input type="checkbox" checked={plan.pet} onChange={(event) => updatePlan({ pet: event.target.checked })} /><span className="toggle-ui" /><span>Evcil hayvanım var; planıma dahil et</span><PawPrint size={16} /></label>
              <div className="note-row"><label htmlFor="note">Kendine not <span>yerel saklanır</span></label><textarea id="note" rows={2} value={plan.note} onChange={(event) => updatePlan({ note: event.target.value })} placeholder="Örn. Anahtar komşuda…" /></div>
            </div>
            <div className="task-list" aria-label="Hazırlık görevleri">
              <div className="task-list-header"><span className="section-kicker">TEMEL ADIMLAR</span><span>{completedCount} tamamlandı</span></div>
              {TASKS.map((task) => {
                const Icon = task.icon;
                const checked = Boolean(plan.tasks[task.id]);
                return <button className={`task-item ${checked ? "is-checked" : ""}`} key={task.id} onClick={() => toggleTask(task.id)} aria-pressed={checked}>
                  <span className="task-icon"><Icon size={18} /></span><span className="task-copy"><small>{task.category}</small><strong>{task.label}</strong><span>{task.detail}</span></span><span className="task-check">{checked ? <CheckCircle2 size={21} /> : <Circle size={21} />}</span>
                </button>;
              })}
            </div>
          </div>
        </section>

        <section className="section-block focus-block" id="focus">
          <div className="section-heading compact"><div><span className="section-kicker">03 / BUGÜNÜN ODAĞI</span><h2>Arama merakını<br /><em>eyleme çevir.</em></h2></div><p className="section-heading-copy">Son iki gündeki güncel sorgu kümelerinden seçildi. Buradaki kartlar canlı uyarı değil; güvenilir kaynağa giden, kısa bağlam notlarıdır.</p></div>
          <div className="city-focus-panel">
            <div className="city-focus-head">
              <div>
                <span className="section-kicker">ŞEHİR BAZLI ODAK</span>
                <h3>{cityProfile ? `${cityProfile.city} için bugün` : "Şehrine göre başla"}</h3>
                <p>{cityProfile ? "Genel risk bağlamını ve bugün atabileceğin ilk küçük adımı gör." : "Şehrini seç veya yaklaşık konumunu kullan. Seçimin cihazında saklanır."}</p>
              </div>
              <div className="city-focus-controls">
                <label htmlFor="city-select">Şehrin</label>
                <select id="city-select" value={selectedCity} onChange={(event) => selectCity(event.target.value)}>
                  <option value="">Şehir seç…</option>
                  {CITY_NAMES.map((city) => <option value={city} key={city}>{city}</option>)}
                </select>
                <button className="city-locate-button" onClick={detectCity} disabled={locationStatus === "loading"}>
                  <LocateFixed size={15} /> {locationStatus === "loading" ? "Bulunuyor…" : "Konumumu kullan"}
                </button>
              </div>
            </div>
            {cityProfile ? (
              <div className="city-focus-body">
                <div className={`city-risk-signal ${cityProfile.priority}`}>
                  <ShieldAlert size={20} />
                  <small>GENEL RİSK BAĞLAMI</small>
                  <strong>{cityProfile.riskLabel}</strong>
                  <span>{cityProfile.priorityLabel}</span>
                  <p>{cityProfile.summary}</p>
                </div>
                <div className="city-action-card">
                  <span className="city-action-kicker">BUGÜNÜN İLK ADIMI</span>
                  <strong>{cityProfile.action}</strong>
                  <ul>{cityProfile.tips.map((tip) => <li key={tip}><Check size={14} />{tip}</li>)}</ul>
                  <div className="city-card-foot"><span>{cityProfile.updatedLabel}</span><span>{cityProfile.region}</span></div>
                </div>
              </div>
            ) : (
              <div className="city-empty-state"><LocateFixed size={20} /><div><strong>Şehrini seçtiğinde kartın burada görünecek.</strong><span>Konum izni verilmezse hiçbir veri gönderilmez; manuel seçim yeterlidir.</span></div></div>
            )}
            {cityProfile && <section className="city-live-alerts" aria-label={`${cityProfile.city} için canlı resmi uyarılar`} aria-live="polite">
              <div className="city-live-heading">
                <div><span className="section-kicker">CANLI RESMİ DURUM</span><strong><Radio size={15} /> AFAD + MGM</strong></div>
                <button className="live-refresh-button" onClick={() => liveAlertsQuery.refetch()} disabled={!online || liveAlertsQuery.isFetching}>
                  <RefreshCw size={14} className={liveAlertsQuery.isFetching ? "is-spinning" : ""} /> {liveAlertsQuery.isFetching ? "Güncelleniyor" : "Yenile"}
                </button>
              </div>
              {!online ? <div className="live-alert-empty"><Info size={17} /><span>Çevrimdışısın. Canlı uyarılar bağlantı geri geldiğinde yenilenir; genel hazırlık kartın cihazında kalır.</span></div> : null}
              {online && liveAlertsQuery.isLoading ? <div className="live-alert-empty"><LoaderCircle size={18} className="is-spinning" /><span>AFAD ve MGM resmi kaynakları sorgulanıyor…</span></div> : null}
              {online && liveAlertsQuery.isError ? <div className="live-alert-empty is-error"><ShieldAlert size={17} /><span>Canlı durum şu an alınamadı. Bu, uyarı olmadığı anlamına gelmez; resmi kaynak bağlantılarını kullan.</span></div> : null}
              {online && displayedLiveAlerts ? <div className="live-alert-list">
                {displayedLiveAlerts.alerts.map((alert) => <article className={`live-alert ${alert.severity}`} key={alert.source}>
                  <div className="live-alert-top"><span>{alert.source}</span><small>{alert.observedAt ? formatLiveTimestamp(alert.observedAt) : `Kontrol ${formatLiveTimestamp(displayedLiveAlerts.checkedAt)}`}</small></div>
                  <strong>{alert.title}</strong>
                  <p>{alert.detail}</p>
                  {alert.quickActions.length > 0 ? <div className="live-quick-actions">
                    <span><ShieldAlert size={13} /> HIZLI AKSİYON · {alert.kindLabel}</span>
                    <ul>{alert.quickActions.map((action) => <li key={action}><Check size={13} />{action}</li>)}</ul>
                  </div> : null}
                  <a href={alert.sourceUrl} target="_blank" rel="noreferrer">Resmi kaynağı aç <ExternalLink size={12} /></a>
                </article>)}
              </div> : null}
            </section>}
            {cityProfile && <div className="city-source-row"><span><Info size={14} /> Kaynaklar canlı uyarı yerine resmi doğrulama için eklenmiştir.</span>{cityProfile.sourceLinks.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>{source.label}<ExternalLink size={12} /></a>)}</div>}
          </div>
          <div className="focus-grid">{FOCUS_CARDS.map((card) => { const Icon = card.icon; return <article className={`focus-card ${card.tone}`} key={card.title}><div className="focus-card-top"><span className="section-kicker">{card.eyebrow}</span><Icon size={19} /></div><h3>{card.title}</h3><p>{card.body}</p><a href={card.href} target="_blank" rel="noreferrer">Kaynağı aç <ExternalLink size={14} /></a><div className="source-line"><span>{card.source}</span><span>12.08.26</span></div></article>; })}</div>
        </section>

        <section className="section-block share-block" id="share">
          <div className="share-copy"><span className="section-kicker">04 / SKORUNU PAYLAŞ</span><h2>Bir kişiyi daha<br /><em>harekete geçir.</em></h2><p>Paylaşım kartın; adını, telefonunu, konumunu ve özel notunu içermez. Yalnızca kendi hazırlık skorunu gösterir.</p><div className="share-actions"><button className="button button-primary" onClick={sharePlan} disabled={isShareBusy}><Share2 size={17} /> {isShareBusy ? "Kart hazırlanıyor" : "Kartımı paylaş"}</button><button className="button button-secondary" onClick={copyPlan}><Copy size={16} /> Metni kopyala</button></div></div>
          <div className="share-card" aria-label={`Hazırlık skoru ${score}`}><div className="share-card-texture" /><div className="share-card-head"><img src="/manus-storage/hazir-misin-mark_67e5ac2c.png" alt="" /><span>HAZIR MISIN? / 2026</span></div><div className="share-score"><span>BENİM HAZIRLIK SKORUM</span><strong>%{score}</strong><small>{completedCount} / {TASKS.length} adım tamam</small></div><div className="share-card-foot"><span>Ben planımı çıkardım.</span><span>Seninki hazır mı?</span></div></div>
        </section>

        <footer className="app-footer"><div><img src="/manus-storage/hazir-misin-mark_67e5ac2c.png" alt="" /> <strong>Hazır mısın?</strong></div><span>Bir kriz uygulaması değil. Her gün için sakin bir başlangıç.</span><a href="https://www.afad.gov.tr/" target="_blank" rel="noreferrer">Resmi kaynaklar <ExternalLink size={13} /></a></footer>
      </main>
    </div>
  );
}

declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  }
}
