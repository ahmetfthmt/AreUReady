# Hazır mısın? — Tasarım Beyin Fırtınası

## İlk üç yaklaşım

### Theme Name: Sakin Komuta Masası
Very Brief Intro: Afet ve günlük belirsizlik anlarında güven veren, açık zeminli ve editoryal bir kişisel kontrol masası. Veri yoğunluğunu sakin renkler ve net eylem sırasıyla yumuşatır.
Probability: 0.07

### Theme Name: Cepte Kıvılcım
Very Brief Intro: Hızlı paylaşımı ve küçük kazanımları öne çıkaran, sıcak renkli ve enerjik bir mobil hazırlık kartı. Sosyal etkileşim ile pratik faydayı aynı döngüde buluşturur.
Probability: 0.03

### Theme Name: Gece Nöbeti
Very Brief Intro: Koyu zemin, fosforlu vurgu ve istasyon hissiyle acil durumlarda yüksek görünürlük sağlayan bir araç arayüzü. Yalnızca kriz anı değil, gece kullanımı için de güçlüdür.
Probability: 0.09

## Seçilen yaklaşım: Sakin Komuta Masası

### Design Movement
Contemporary editorial utility ve Swiss International Typographic Style'ın, yerel saha defteri dokusuyla birleşimi. Arayüz, haber portalı gibi bağırmak yerine bir editörün masasında doğru bilgiyi doğru sıraya koyar.

### Core Principles
1. **Önce yön:** Her ekran, kullanıcıyı tek bir sonraki eyleme taşır.
2. **Sakin kontrast:** Koyu mürekkep, kırık beyaz ve tek sıcak vurgu rengi belirsizliği azaltır.
3. **Kanıtlanabilirlik:** Resmi kaynak, zaman damgası ve yerel veri ayrımı görünürdür.
4. **Paylaşılabilir fayda:** Viral döngü, korku değil kişisel hazırlık skorunun paylaşılmasıyla kurulur.

### Color Philosophy
Kırık beyaz zemin (`#F4F0E8`) kâğıt ve sakinlik hissi verir; mürekkep lacivert (`#152A35`) uzun okumada güven ve ciddiyet taşır. Sahiplenilebilir imza rengi **nar çiçeği (`#F25D3D`)**, acil olmayı alarmcılığa çevirmeden eylemi işaret eder. Soluk adaçayı (`#DCE5D6`) tamamlanmışlık ve nefes alanı için kullanılır; sarı yalnızca “yaklaşan” durumlarda küçük bir sinyal olarak görünür.

### Layout Paradigm
Mobilde alt sekme gezinmesi; masaüstünde solda dar bir “durum rayı”, sağda geniş fakat asimetrik çalışma alanı. İlk ekranın sol üstü kimlik ve güncel bağlam, orta bölüm hazırlık skoru, alt bölüm eylem listesi olur. Kartlar aynı ölçüde tekrarlanmaz: bir ana skor plakası, ona eklemlenen kısa kanıt kartları ve yatay kaydırılabilir “bugünün odağı” şeridi.

### Signature Elements
* **Hazırlık halkası:** SVG ile çizilen, skoru gösteren ve tamamlandıkça nar çiçeği çizgisiyle dolan dairesel işaret.
* **Saha fişi:** Her bilgi kartının altında kaynak, saat ve “bunu neden görüyorum?” mikro metni.
* **Dikey koordinat çizgisi:** Başlıkların yanında ince ölçüm çizgileri ve bölüm numaraları; arayüze editoryal disiplin verir.

### Interaction Philosophy
Kullanıcıyı form doldurmaya zorlamadan “hızlı işaretle, sonra tamamla” davranışı. Her kontrol anında sonuç verir; tamamlanan maddeler silinmez, üstü çizilmiş bir kanıt gibi kalır. Paylaşım, uygulamayı terk ettirmeyen sistem paylaşımı varsa onu kullanır; yoksa güvenli kopyalama ile çalışır.

### Animation
İlk açılışta başlık, skor ve eylem listesi 50 ms aralıklarla yukarı doğru 8 px hareket ederek görünür. Kartlar 180 ms `cubic-bezier(0.23, 1, 0.32, 1)` ile açılır. Butonlar basılıyken yüzde 97 ölçeğe iner. Skor halkası yalnızca ilk hesaplamada 500 ms çizgi animasyonu yapar; veri değişiminde animasyon tekrarlanmaz. `prefers-reduced-motion` açıkken tüm girişler anında görünür.

### Typography System
Başlıklarda **Barlow Condensed** 700/800: sıkıştırılmış, eyleme dönük ve afiş karakterli. Gövde metninde **Manrope** 400/500/700: Türkçe okunaklı, modern ve kompakt. H1 56/0.94 masaüstü, 42/0.98 mobil; bölüm başlığı 25/1.0; gövde 15/1.55; etiketler 11 px, 0.16em harf aralığı ve büyük harf.

### Brand Essence
Bir kriz uygulaması değil; Türkiye'de günlük belirsizlikte ne yapacağını netleştiren, herkes için 60 saniyelik kişisel hazırlık masası. **Sakin, kanıtlı, harekete geçirici.**

### Brand Voice
Başlıklar kısa ve fiille başlar. CTA'ler komut verir ama panik yaratmaz; mikro metinler kaynak ve sınırı açıklar.

Örnekler: **“Önce kendini netleştir.”** / **“60 saniyede bugün için bir plan çıkar.”**

### Wordmark & Logo
Wordmark, “Hazır”ın yatay çizgisini bir kontrol işaretine dönüştüren özel bir çizgi karakterle yazılır; “mısın?” daha küçük ve alt hizalıdır. İkon, üç kısa saha çizgisinin bir nar çekirdeği formunda birleştiği, metinsiz ve tek renkli bir semboldür.

### Signature Brand Color
**Nar Çiçeği — `#F25D3D`**. Bu renk yalnızca markaya ait eylem sinyallerinde, paylaşım kartında ve hazırlık halkasında kullanılır; genel dekorasyona yayılmaz.

## Uygulama kararları

* İlk sürüm tamamen cihaz üzerinde çalışacak; planlar `localStorage` içinde saklanacak ve ağ kesilince temel akış bozulmayacak.
* “Bugünün odağı” kartları 12 Ağustos 2026 araştırma notlarından ilham alan statik, kaynak bağlantılı içeriklerdir; canlı veri gibi sunulmayacaktır.
* Kullanıcı; konum, acil kişi, buluşma noktası, çanta, belge ve evcil hayvan gibi gerçek hayat maddelerini işaretler.
* Paylaşılabilir çıktı; kişisel adres veya telefon gibi hassas verileri dışarı aktarmadan yalnızca skor ve genel tamamlanma bilgisini kullanır.
