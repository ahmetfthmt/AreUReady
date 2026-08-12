/* Design note: Sakin Komuta Masası — city cards communicate general preparedness context, never live alerts or predictions. */

export type CityRiskProfile = {
  city: string;
  region: string;
  riskLabel: string;
  summary: string;
  priority: "high" | "medium" | "basic";
  priorityLabel: string;
  action: string;
  tips: string[];
  updatedLabel: string;
  sourceLinks: { label: string; url: string }[];
};

type RegionalProfile = Omit<CityRiskProfile, "city" | "region" | "sourceLinks">;

const SOURCE_LINKS = [
  { label: "AFAD il planları", url: "https://www.afad.gov.tr/il-planlari" },
  { label: "Deprem tehlike haritası", url: "https://www.afad.gov.tr/turkiye-deprem-tehlike-haritasi" },
  { label: "MGM il uyarıları", url: "https://www.mgm.gov.tr/meteouyari/turkiye.aspx" },
];

const REGIONAL_PROFILES: Record<string, RegionalProfile> = {
  Marmara: { riskLabel: "Deprem · sel · ulaşım kesintisi", summary: "Yoğun nüfus ve ulaşım ağları nedeniyle deprem hazırlığına, buluşma planına ve kısa süreli iletişim kesintilerine hazırlıklı ol.", priority: "high", priorityLabel: "Yüksek hazırlık önceliği", action: "Evden çıktıktan sonra buluşacağın açık alanı ve yedek iletişim kişisini netleştir.", tips: ["Bina içindeki güvenli noktayı tüm ev halkıyla konuş.", "Acil çantayı ulaşım koridorunu kapatmayacak yerde tut.", "MGM’nin yağış ve fırtına uyarılarını takip et."], updatedLabel: "Genel bağlam · canlı uyarı değil" },
  Ege: { riskLabel: "Deprem · orman yangını · sıcak hava", summary: "Deprem hazırlığına ek olarak yaz aylarında yangın ve sıcaklık riskine karşı su, gölge ve tahliye planını görünür tut.", priority: "high", priorityLabel: "Yüksek hazırlık önceliği", action: "Evdeki çıkış yollarını ve yangın halinde gideceğin buluşma noktasını bugün kontrol et.", tips: ["Acil çantaya kişi başı su ve güneşten korunma ekipmanı ekle.", "Ormanlık alanlara yakınsan araçta temel su ve ışık bulundur.", "MGM sıcaklık, rüzgâr ve yangın koşullarını takip et."], updatedLabel: "Genel bağlam · canlı uyarı değil" },
  Akdeniz: { riskLabel: "Deprem · sıcak hava · sel", summary: "Deprem ve ani yağışlara karşı planını korurken sıcak havada su, gölge ve ilaç erişimini de aynı hazırlık düzenine ekle.", priority: "high", priorityLabel: "Yüksek hazırlık önceliği", action: "Ev halkının buluşma yerini belirle; yaz günleri için su ve temel ilaçlarını erişilebilir yap.", tips: ["Giriş katı ve bodrumda su baskını riskini kontrol et.", "Sıcak saatlerde yaşlılar ve evcil hayvanlar için serin alan planla.", "MGM’nin yağış ve sıcaklık uyarılarını takip et."], updatedLabel: "Genel bağlam · canlı uyarı değil" },
  Karadeniz: { riskLabel: "Sel · heyelan · fırtına", summary: "Eğimli arazi ve yoğun yağış görülebilen bölgelerde dere yataklarından uzak durma, ulaşım ve iletişim yedeği öne çıkar.", priority: "medium", priorityLabel: "Orta hazırlık önceliği", action: "Şiddetli yağışta kullanmayacağın yolları ve evden güvenli çıkış rotasını önceden işaretle.", tips: ["Dere yatağı ve eğimli yamaç çevresindeki alternatif rotanı bil.", "Telefonun yanı sıra taşınabilir ışık ve powerbank bulundur.", "MGM’nin yağış, rüzgâr ve heyelanla ilişkili uyarılarını takip et."], updatedLabel: "Genel bağlam · canlı uyarı değil" },
  "İç Anadolu": { riskLabel: "Deprem · kış koşulları · ani yağış", summary: "Deprem hazırlığına kışın soğuk, kar ve ulaşım kesintilerini de eklemek; ev, araç ve iş yeri için ayrı küçük plan yapmak faydalıdır.", priority: "medium", priorityLabel: "Orta hazırlık önceliği", action: "Kış koşullarında evden çıkış, ısınma ve iletişim için üç maddelik yedek plan yaz.", tips: ["Araçta battaniye, su, ışık ve basit ilk yardım seti bulundur.", "Isınma ekipmanını ve karbonmonoksit riskini düzenli kontrol et.", "MGM kar, buzlanma ve kuvvetli rüzgâr uyarılarını takip et."], updatedLabel: "Genel bağlam · canlı uyarı değil" },
  "Doğu Anadolu": { riskLabel: "Deprem · yoğun kar · çığ / ulaşım", summary: "Kış koşulları ve uzak ulaşım hatları nedeniyle ısınma, iletişim, ilaç ve temel gıda yedeği planın önemli parçasıdır.", priority: "high", priorityLabel: "Yüksek hazırlık önceliği", action: "Evde en az bir geceyi güvenli ve sıcak geçirecek temel ihtiyaçları tek bir yerde topla.", tips: ["Kışlık giyim ve yedek aydınlatmayı acil çantaya ekle.", "Çığ ve kapalı yol duyurularında resmi kanallardan ayrılma.", "MGM kar, tipi, buzlanma ve çığ uyarılarını takip et."], updatedLabel: "Genel bağlam · canlı uyarı değil" },
  "Güneydoğu Anadolu": { riskLabel: "Deprem · sıcak hava · ani sel", summary: "Yüksek sıcaklık ve ani yağışlar için su, gölge ve güvenli ulaşım planı; deprem hazırlığıyla birlikte düşünülmeli.", priority: "high", priorityLabel: "Yüksek hazırlık önceliği", action: "Su, ilaç ve önemli belgelerini tek erişim noktasında düzenle; aile buluşma yerini belirle.", tips: ["Sıcak saatlerde dışarıda kalmayı gerektirmeyen alternatif plan hazırla.", "Ani yağışta alt geçit ve su biriken yollardan uzak dur.", "MGM sıcaklık, yağış ve toz taşınımı uyarılarını takip et."], updatedLabel: "Genel bağlam · canlı uyarı değil" },
};

const CITY_REGIONS: Record<string, string> = Object.fromEntries([
  ["Adana", "Akdeniz"], ["Adıyaman", "Güneydoğu Anadolu"], ["Afyonkarahisar", "İç Anadolu"], ["Ağrı", "Doğu Anadolu"], ["Aksaray", "İç Anadolu"], ["Amasya", "Karadeniz"], ["Ankara", "İç Anadolu"], ["Antalya", "Akdeniz"], ["Ardahan", "Doğu Anadolu"], ["Artvin", "Karadeniz"], ["Aydın", "Ege"], ["Balıkesir", "Marmara"], ["Bartın", "Karadeniz"], ["Batman", "Güneydoğu Anadolu"], ["Bayburt", "Karadeniz"], ["Bilecik", "Marmara"], ["Bingöl", "Doğu Anadolu"], ["Bitlis", "Doğu Anadolu"], ["Bolu", "Karadeniz"], ["Burdur", "Akdeniz"], ["Bursa", "Marmara"], ["Çanakkale", "Marmara"], ["Çankırı", "İç Anadolu"], ["Çorum", "Karadeniz"], ["Denizli", "Ege"], ["Diyarbakır", "Güneydoğu Anadolu"], ["Düzce", "Marmara"], ["Edirne", "Marmara"], ["Elazığ", "Doğu Anadolu"], ["Erzincan", "Doğu Anadolu"], ["Erzurum", "Doğu Anadolu"], ["Eskişehir", "İç Anadolu"], ["Gaziantep", "Güneydoğu Anadolu"], ["Giresun", "Karadeniz"], ["Gümüşhane", "Karadeniz"], ["Hakkari", "Doğu Anadolu"], ["Hatay", "Akdeniz"], ["Iğdır", "Doğu Anadolu"], ["Isparta", "Akdeniz"], ["İstanbul", "Marmara"], ["İzmir", "Ege"], ["Kahramanmaraş", "Akdeniz"], ["Karabük", "Karadeniz"], ["Karaman", "İç Anadolu"], ["Kars", "Doğu Anadolu"], ["Kastamonu", "Karadeniz"], ["Kayseri", "İç Anadolu"], ["Kilis", "Güneydoğu Anadolu"], ["Kırıkkale", "İç Anadolu"], ["Kırklareli", "Marmara"], ["Kırşehir", "İç Anadolu"], ["Kocaeli", "Marmara"], ["Konya", "İç Anadolu"], ["Kütahya", "Ege"], ["Malatya", "Doğu Anadolu"], ["Manisa", "Ege"], ["Mardin", "Güneydoğu Anadolu"], ["Mersin", "Akdeniz"], ["Muğla", "Ege"], ["Muş", "Doğu Anadolu"], ["Nevşehir", "İç Anadolu"], ["Niğde", "İç Anadolu"], ["Ordu", "Karadeniz"], ["Osmaniye", "Akdeniz"], ["Rize", "Karadeniz"], ["Sakarya", "Marmara"], ["Samsun", "Karadeniz"], ["Siirt", "Güneydoğu Anadolu"], ["Sinop", "Karadeniz"], ["Sivas", "İç Anadolu"], ["Şanlıurfa", "Güneydoğu Anadolu"], ["Şırnak", "Güneydoğu Anadolu"], ["Tekirdağ", "Marmara"], ["Tokat", "Karadeniz"], ["Trabzon", "Karadeniz"], ["Tunceli", "Doğu Anadolu"], ["Uşak", "Ege"], ["Van", "Doğu Anadolu"], ["Yalova", "Marmara"], ["Yozgat", "İç Anadolu"], ["Zonguldak", "Karadeniz"],
]);

const CITY_OVERRIDES: Record<string, Partial<RegionalProfile>> = {
  İstanbul: { riskLabel: "Deprem · kıyı · ulaşım kesintisi", priority: "high", priorityLabel: "Yüksek hazırlık önceliği", action: "Aile buluşma noktanı, alternatif ulaşım rotanı ve bina içindeki güvenli alanı bugün netleştir." },
  Ankara: { riskLabel: "Deprem · kış koşulları · sel", priority: "medium", priorityLabel: "Orta hazırlık önceliği", action: "Kış ve ani yağış senaryosu için ev, iş ve araç planındaki üç kritik malzemeyi tamamla." },
  İzmir: { riskLabel: "Deprem · yangın · sıcak hava", priority: "high", priorityLabel: "Yüksek hazırlık önceliği", action: "Bina çıkışını, açık buluşma alanını ve sıcak/yangın günleri için su planını birlikte kontrol et." },
  Bursa: { riskLabel: "Deprem · heyelan · sel", priority: "high", priorityLabel: "Yüksek hazırlık önceliği", action: "Ev halkıyla buluşma yerini konuş; eğimli ve su biriken güzergâhlara alternatif belirle." },
  Antalya: { riskLabel: "Deprem · sıcak hava · orman yangını", priority: "high", priorityLabel: "Yüksek hazırlık önceliği", action: "Sıcak ve yangın günlerinde çıkış rotanı, su stoğunu ve evcil hayvan planını gözden geçir." },
  Trabzon: { riskLabel: "Sel · heyelan · fırtına", priority: "medium", priorityLabel: "Orta hazırlık önceliği", action: "Yoğun yağışta kullanmayacağın yolları ve yamaç/dere çevresinden uzak güvenli rotanı yaz." },
  Erzurum: { riskLabel: "Yoğun kar · tipi · deprem", priority: "high", priorityLabel: "Yüksek hazırlık önceliği", action: "En az bir geceyi sıcak ve iletişimde kalarak geçirecek kışlık ihtiyaçları tek çantada hazırla." },
  Diyarbakır: { riskLabel: "Deprem · sıcak hava · ani sel", priority: "high", priorityLabel: "Yüksek hazırlık önceliği", action: "Su, ilaç ve belgelerini tek erişim noktasında düzenle; aile buluşma yerini belirle." },
  Van: { riskLabel: "Deprem · kış koşulları · ulaşım", priority: "high", priorityLabel: "Yüksek hazırlık önceliği", action: "Soğuk hava ve ulaşım kesintisinde evde kalmayı sağlayacak temel ihtiyaçları kontrol et." },
  Muğla: { riskLabel: "Deprem · orman yangını · sıcak hava", priority: "high", priorityLabel: "Yüksek hazırlık önceliği", action: "Yangın halinde kullanacağın iki çıkış rotasını ve su/evcil hayvan planını görünür yap." },
  Samsun: { riskLabel: "Sel · fırtına · deprem", priority: "medium", priorityLabel: "Orta hazırlık önceliği", action: "Yağışlı havalarda alt geçit ve su biriken yollar için güvenli alternatif rotanı belirle." },
};

const CITY_COORDINATES: Record<string, [number, number]> = {
  İstanbul: [41.0082, 28.9784], Ankara: [39.9334, 32.8597], İzmir: [38.4237, 27.1428], Bursa: [40.195, 29.06], Antalya: [36.8969, 30.7133], Adana: [37, 35.3213], Mersin: [36.8121, 34.6415], Muğla: [37.2153, 28.3636], Aydın: [37.856, 27.8416], Denizli: [37.7765, 29.0864], Samsun: [41.2867, 36.33], Trabzon: [41.0015, 39.7178], Erzurum: [39.9043, 41.2679], Van: [38.5012, 43.373], Diyarbakır: [37.9144, 40.2306], Gaziantep: [37.0662, 37.3833], Şanlıurfa: [37.1674, 38.7955], Konya: [37.8746, 32.4932], Kayseri: [38.7225, 35.4875], Eskişehir: [39.7667, 30.5256], Sivas: [39.75, 37.0167], Malatya: [38.3552, 38.3095], Rize: [41.0201, 40.5234], Zonguldak: [41.4564, 31.7987], Isparta: [37.7648, 30.5566], Kahramanmaraş: [37.5753, 36.9228], Mardin: [37.3212, 40.7245], Çanakkale: [40.1553, 26.4142], Edirne: [41.6771, 26.5557], Kars: [40.6013, 43.0975],
};

export const CITY_PROFILES: Record<string, CityRiskProfile> = Object.fromEntries(
  Object.entries(CITY_REGIONS).map(([city, region]) => {
    const base = REGIONAL_PROFILES[region];
    return [city, { city, region, ...base, ...CITY_OVERRIDES[city], sourceLinks: SOURCE_LINKS }];
  }),
) as Record<string, CityRiskProfile>;

export const CITY_NAMES = Object.keys(CITY_PROFILES).sort((a, b) => a.localeCompare(b, "tr"));

export function findNearestCity(latitude: number, longitude: number): CityRiskProfile | null {
  const candidates = Object.entries(CITY_COORDINATES).filter(([city]) => CITY_PROFILES[city]);
  if (!candidates.length) return null;
  let nearestCity = candidates[0][0];
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (const [city, [cityLatitude, cityLongitude]] of candidates) {
    const distance = Math.pow(latitude - cityLatitude, 2) + Math.pow(longitude - cityLongitude, 2);
    if (distance < nearestDistance) {
      nearestCity = city;
      nearestDistance = distance;
    }
  }
  return CITY_PROFILES[nearestCity] ?? null;
}
