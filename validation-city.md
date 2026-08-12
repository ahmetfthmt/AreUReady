# Şehir Bazlı Odak Kartı Doğrulama Notu

## Tarayıcı testi

Canlı preview üzerinde şehir seçicinin **81 il seçeneğiyle** yüklendiği doğrulandı. İstanbul seçildiğinde uygulama “İstanbul için odak kartın güncellendi.” bildirimini gösterdi; kartta “Deprem · kıyı · ulaşım kesintisi”, “Yüksek hazırlık önceliği”, şehir özeti, bugün yapılacak ilk adım, üç hazırlık tavsiyesi ve Marmara bölgesi bilgisi göründü.

Kartın altındaki AFAD il planları, AFAD Türkiye Deprem Tehlike Haritası ve MGM il uyarıları bağlantıları DOM’da görünür ve dış kaynağa açılacak şekilde oluşturuldu. İlk açılışta şehir seçilmeden boş durum metni, manuel seçim ve konum butonu görünür.

Programatik doğrulamada `hasCityPanel: true`, `optionCount: 81`, `selectedCity: İstanbul`, `storedCity: İstanbul` ve `sourceLinkCount: 3` sonuçları alındı. Sayfa yenilendikten sonra İstanbul kartının yeniden açılması, şehir seçiminin `localStorage` içinde kalıcı olduğunu doğruladı.

## Güvenlik ve kapsam sınırı

Uygulama canlı risk tahmini veya acil durum bildirimi yapmıyor. Şehir profilleri genel hazırlık bağlamı olarak etiketleniyor; gerçek zamanlı meteorolojik durum ve resmi afet bilgisi için kullanıcı resmi kaynaklara yönlendiriliyor. Konum izni reddedildiğinde manuel seçim akışı çalışmaya devam ediyor.
