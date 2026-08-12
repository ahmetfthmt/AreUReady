# Şehir Bazlı Odak Kartları Araştırma Notu

## Kaynak gözlemi

AFAD’ın **İl Afet Risk Azaltma Planları (İRAP)** sayfası, il düzeyinde afet risklerini azaltma amacıyla hazırlanan resmi planları referanslıyor. Bu nedenle uygulamadaki şehir kartları “bugün şu olacak” türünde tahminler vermeyecek; il bazındaki genel risk bağlamını ve hazırlık önceliklerini gösterecek.

AFAD’ın Türkiye Deprem Tehlike Haritası şehir profillerinde resmi deprem tehlikesi bağlamı için kaynak bağlantısı olarak kullanılacak. Uygulama, harita bilgisini kişiye özel bina güvenliği değerlendirmesi veya deprem tahmini gibi göstermeyecek.

MGM’nin MeteoUyarı sayfası meteorolojik uyarıları Yeşil, Sarı, Turuncu ve Kırmızı seviyelerinde sunuyor; ayrıca yağış, rüzgâr, sıcak/soğuk, kar, çığ ve benzeri olay ikonlarını kullanıyor. Uygulamadaki şehir kartı, canlı MGM uyarısını taklit etmeyecek; kullanıcıyı MGM’nin resmi il uyarılarına yönlendirecek.

## Ürün kararı

Şehir profili veri modeli; `city`, `region`, `riskLevel`, `riskLabel`, `summary`, `priority`, `tips`, `sourceLinks` ve `updatedLabel` alanlarından oluşacak. Risk seviyesi, gerçek zamanlı tehlike anlamına gelmeyen **genel bağlam** etiketi olarak sunulacak. Konum izni verilmezse kullanıcı şehir seçiciden devam edecek; son seçim cihazda saklanacak.

Kart akışı iki katmanlı olacak: önce “Şehrinde neye hazırlıklı ol?” özeti, ardından bugün uygulanabilecek tek tavsiye ve resmi kaynak bağlantıları. Bu sayede kullanıcı korkutulmadan eyleme yönlenecek.

## Referanslar

1. [AFAD — İl Afet Risk Azaltma Planları (İRAP)](https://www.afad.gov.tr/il-afet-risk-azaltma-pl)
2. [AFAD — İl Planları](https://www.afad.gov.tr/il-planlari)
3. [AFAD — Türkiye Deprem Tehlike Haritası](https://www.afad.gov.tr/turkiye-deprem-tehlike-haritasi)
4. [MGM — MeteoUyarı Türkiye](https://www.mgm.gov.tr/meteouyari/turkiye.aspx)
