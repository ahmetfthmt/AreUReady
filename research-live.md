# AFAD / MGM Dinamik Uyarı Araştırması

## İlk resmi kaynak bulgusu

AFAD’ın `https://deprem.afad.gov.tr/event-service` sayfası resmi olay servisi olarak bulundu; arama sonucu XML, CSV, KML, GeoJSON ve JSON formatlarının desteklendiğini gösteriyor. Tarayıcı sayfası dinamik yükleme ekranında kaldığı için gerçek uç nokta ve parametreler HTML/servis yanıtından ayrıca doğrulanmalıdır.

MGM’nin resmi `MeteoUyarı Türkiye` sayfası, uyarıları yeşil, sarı, turuncu ve kırmızı seviyelerle sınıflandırıyor. Şehir kartı bu seviyeleri canlı veri doğrulanmadan kendi başına üretmemeli; yalnızca resmi servisten gelen kayıtları göstermeli ve veri alınamadığında bunu açıkça belirtmelidir.

## Uygulama kararı

Kısa vadede doğrudan üçüncü taraf tarayıcı istekleri CORS ve veri formatı değişikliği riski taşır. En güvenli üretim yolu, kullanıcı tarafından çalıştırılacak Render uyumlu bir backend proxy veya doğrulanmış bir sunucu tarafı veri katmanı eklemek; frontend’in yalnızca normalize edilmiş, kaynak ve zaman damgası taşıyan uyarı kayıtlarını tüketmesidir. Backend eklenmeden frontend, canlı veri yoksa yanlış biçimde “uyarı yok” dememelidir.

## Doğrulanan resmi uç noktalar

| Kaynak | Doğrulanan erişim | Uygulama kullanım sınırı |
| --- | --- | --- |
| AFAD | `POST https://deprem.afad.gov.tr/EventData/GetEventsByFilter` | Son 24 saat için `EventSearchFilterList` içinde `MinDate = 8` ve `MaxDate = 9` filtreleri, `Skip` ve `Take` alanları ile JSON olay listesi döndürüyor. Her olayda zaman, koordinat, büyüklük, derinlik ve konum metni bulunuyor. |
| MGM | `GET https://www.mgm.gov.tr/meteouyari/turkiye.aspx?Gun=1` | Türkiye SVG haritası her ili `data-iladi` ve `data-plakakodu` öznitelikleriyle veriyor; satır içi `fill` rengi resmi seviye rengini taşıyor. Yeşil için `#1DCE7D` gözlemlendi. |

AFAD uç noktası 13 Ağustos 2026 tarihinde resmi alan adından JSON yanıt verdi. Örnek olaylar içinde `eventDate`, `longitude`, `latitude`, `magnitude`, `magnitudeType`, `location`, `depth` ve `eventType` alanları yer aldı. MGM sayfasında seviye açıklamaları: yeşil “Tehlike Yok”, sarı “Az Tehlikeli”, turuncu “Tehlikeli”, kırmızı “Çok Tehlikeli”.

## Entegrasyon yaklaşımı

Sunucu tarafında AFAD JSON verisi ve MGM HTML/SVG haritası kısa süreli bellek önbelleğiyle normalize edilecek. Her şehir için AFAD olayları şehir koordinatına belirli yarıçapta filtrelenecek; yalnızca son 24 saatteki en yüksek büyüklüklü ve yakın olay gösterilecek. MGM için yalnızca resmi haritadan ayrıştırılan mevcut il seviyesi gösterilecek. “Veri yok” ile “sorgu başarısız” ayrımı korunacak, zaman damgası ve resmi kaynak bağlantısı her kartta yer alacak.
