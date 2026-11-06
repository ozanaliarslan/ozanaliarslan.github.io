# Sınıf Çarkıfeleği

Ozan Ali Arslan tarafından sınıfta kullanılmak üzere hazırlanan 9. sınıf düzeyinde dersler arası kelime oyunu.

- 15 ders alanından 205 kelimeye ek olarak 81 il adı; toplam 286 kelime.
- Çark, Türkçe harf panosu, 2–6 takım, otomatik puan, tahmin, pas ve geri alma.
- Öğretmenin kendi sorularını eklemesi ve oyun verilerini JSON olarak taşıması.
- Hesap, API anahtarı veya sunucu gerektirmez. İlerleme kullanılan tarayıcıda saklanır.

## Açılış

GitHub Pages üzerinde `carkifelek/` klasörü yayımlanır. Çevrimdışı kullanım için bu klasörün tüm dosyalarını indirin ve `index.html` dosyasını bir tarayıcıda açın.

## İçerik

Sorular 9. sınıf düzeyindeki temel kavram ve ön öğrenmeler için hazırlanmıştır. Ders filtresiyle işlenmiş konuları seçin. Kelimeyi bulan takımdan bir açıklama veya örnek isteyin. Almanca ikinci yabancı dil, bilişim seçmeli alan olarak eklenmiştir.

MEB öğretim programları: https://tymm.meb.gov.tr/ogretim-programlari

## Kontrol

Bu klasörde `node tests/game.test.cjs` çalıştırılır. Denetimler 286 sorunun biçimini, aynı derste benzersiz cevapları, Türkçe/İngilizce harf dönüşümünü, puanı, sıra geçişini, iflası, tahmini ve her sorunun harflerle tamamlanmasını kapsar.

## Kategori ipuçları

Tanım yerine yalnızca “Bir müzik terimi”, “Bir matematik kavramı”, “Bir ilimiz” gibi genel ifadeler gösterilir. Alt konu bilgisi gösterilmez. Daha önce kaydedilen oyundaki hazır sorular da açılışta güncel kategori ipuçlarına geçirilir.
