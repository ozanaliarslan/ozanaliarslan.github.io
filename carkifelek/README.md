# Sınıf Çarkıfeleği

Ozan Ali Arslan tarafından sınıfta kullanılmak üzere hazırlanan ilkokuldan liseye dersler arası kelime oyunu.

- 40 ders alanında 649 kelimeye ek olarak 81 il adı ve 56 tarihî kişi. Toplam 786 kelime.
- Çark, Türkçe harf panosu, 2–6 takım, otomatik puan, 30 saniyelik harf süresi, pas ve geri alma.
- Öğretmenin kendi sorularını eklemesi ve oyun verilerini JSON olarak taşıması.
- Hesap, API anahtarı veya sunucu gerektirmez. İlerleme kullanılan tarayıcıda saklanır.

## Açılış

GitHub Pages üzerinde `carkifelek/` klasörü yayımlanır. Çevrimdışı kullanım için bu klasörün tüm dosyalarını indirin ve `index.html` dosyasını bir tarayıcıda açın.

## İçerik

Sorular ilkokul, ortaokul ve lise düzeylerinden kavramlar içerir. Menüde sınıf düzeyi yerine ders adı kullanılır. Ders filtresiyle işlenmiş konuları seçin. Kelimeyi bulan takımdan bir açıklama veya örnek isteyin. Almanca ikinci yabancı dil, bilişim seçmeli alan olarak eklenmiştir.

MEB öğretim programları: https://tymm.meb.gov.tr/ogretim-programlari

## Kontrol

Bu klasörde `node tests/game.test.cjs` çalıştırılır. Denetimler 786 sorunun biçimini, aynı derste benzersiz cevapları, Türkçe/İngilizce harf dönüşümünü, puanı, sesli harf ücretini, özel çark dilimlerini, süre sonunu, sıra geçişini ve her sorunun harflerle tamamlanmasını kapsar.

## Kategori ipuçları

Tanım yerine yalnızca “Bir müzik terimi”, “Bir matematik kavramı”, “Bir ilimiz” gibi genel ifadeler gösterilir. Alt konu bilgisi gösterilmez. Daha önce kaydedilen oyundaki hazır sorular da açılışta güncel kategori ipuçlarına geçirilir.

Çark durduğunda 30 saniye içinde bir harf seçilir. SESLİ ve JOKER dilimleri ücretsiz sesli harf hakkı verir. Normal puan dilimlerinde kapalı sessiz harf varken sesli harf 100 puandır. Oyunu sıfırlama düğmesi takım puanlarını ve tur geçmişini temizler.

Cevap açıldıktan sonra tahtanın altında kısa bir bilgi notu görünür. Özel sorulara isteğe bağlı açıklama eklenebilir.
