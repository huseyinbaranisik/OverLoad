# Sınav tasarımı · "Benimle uyumlanan vize sorusu"

> Taslak. Kendi cümlelerimle düzenlenecek.

**Fikir:** Ezberi ölçen soru "diferansiyel test nedir?" diye sorar. Benim sorum, öğrenciye **bir karar verdirir ve kararını gerekçelendirtir**; tanımı bilen ama ne zaman kullanacağını bilmeyen öğrenci burada takılır. Primer gibi, soru da öğrenciye uyum sağlar: her bölüm bir öncekinin cevabına göre dallanır.

## Soru (60 dk, kapalı kitap)

Bir hastanenin randevu sistemi, puanı hesaplayan eski bir Python betiğinden yeni bir tarayıcı modülüne (JavaScript) taşınıyor. Eski betiğin belgesi yok; ama 3 yıldır üretimde ve kimse yanlış sonuç verdiğini bildirmedi. Elinizde 300 gerçek, anonim girdi ve eski betiğin bu girdilere verdiği çıktılar var.

**a) (20 p)** Yeni modülün "doğru" çalıştığını nasıl gösterirsiniz? Burada test kahini (oracle) nedir? Neden spesifikasyon değil de eski betik?

**b) (20 p)** 300 girdinin 297'sinde iki sistem birebir aynı sonucu veriyor; 3'ünde fark 0,00003. Yayına alır mısınız? Tolerans değerini nereden ve **ne zaman** belirlemeliydiniz?

**c) (20 p)** Eski betiğin 3 yıldır verdiği bir çıktının aslında yanlış olduğunu fark ettiniz. Yeni modül bu hatayı da kopyalamalı mı? Karakterizasyon testi ile regresyon testi bu noktada nasıl ayrışır?

**d) (20 p)** Doğrulama (*doğru şeyi mi yaptık?* değil, *şeyi doğru mu yaptık?*) ile geçerlemeyi bu senaryodan birer örnekle ayırın. Hangisini 300 girdi kanıtlar, hangisini kanıtlamaz?

**e) (20 p)** Yeni modülü herkese aynı anda açmak yerine nasıl devreye alırsınız? Geri dönüş planınız ne?

## Beklenen temel kavramlar

- Diferansiyel test: iki bağımsız uygulamayı aynı girdilerle karşılaştırmak. Kahin burada eski betik, çünkü elimizdeki tek güvenilir "doğru" o.
- Tolerans **önceden** ve gerekçeyle belirlenir (kayan nokta, float32 ↔ float64); sonuç görüldükten sonra seçilen tolerans, testi anlamsız kılar.
- Karakterizasyon testi mevcut davranışı (hatalarıyla) kayda alır; regresyon testi bilinen doğru davranışın bozulmadığını korur. Hata bulunduğunda bu bir **karardır** ve belgelenmelidir.
- Doğrulama ≠ geçerleme: 300 girdi, yeni modülün eskisiyle aynı olduğunu (doğrulama) gösterir; hastane için doğru puanı hesapladığını (geçerleme) göstermez.
- Gölge → kanarya → aşamalı geçiş; geri alma ölçütü önceden yazılır.

## Çeldiriciler

- "297/300 uyuyor, %99 başarı, yayına alırım." Oran değil, farkın büyüklüğü ve toleransın gerekçesi önemli.
- "Eski betik 3 yıldır çalışıyor, demek ki doğru." Şikâyet gelmemesi doğruluk kanıtı değildir.
- "Spesifikasyon yoksa test yazılamaz." Kahin yalnız spesifikasyon olmak zorunda değil.

## Neden bu soru benimle uyumlanır?

Her bölüm bir öncekinin kararına dayanıyor: (b)'de toleransı "sonradan seçerim" diyen öğrenci, (c)'de aynı hataya karakterizasyon testi üzerinden yeniden düşer. Ezberleyen öğrenci her bölümü ayrı tanım olarak cevaplar; anlayan öğrenci bir zincir kurar. Puan bu zincirin tutarlılığına verilir.
