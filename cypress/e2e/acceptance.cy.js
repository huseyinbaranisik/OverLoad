// spec.md › 7. Kabul örnekleri (AE-1 … AE-8). Her test, örnekteki Diyelim ki / Ne zaman ki / O zaman adımlarını izler.

describe("Kabul örnekleri", () => {
  it("AE-1: yeni başlayan oyuncu ipucunu seçeneklerden önce görür, sayaç yoktur", () => {
    cy.startGame({ level: "yeni" });
    cy.acceptCall();
    cy.get("[data-cy=incident-bar] .hint").should("contain", "özelliği yüksek bir ajan ara");
    cy.dispatchTo("gemini", "randevu");
    cy.get("[data-cy=hint]").should("be.visible").then(($hint) => {
      const firstOption = Cypress.$("#sheet .opt").get(0);
      // ipucu DOM'da ilk seçenekten önce gelmeli
      expect($hint[0].compareDocumentPosition(firstOption) & Node.DOCUMENT_POSITION_FOLLOWING).to.be.greaterThan(0);
    });
    cy.get("[data-cy=timer]").should("not.exist");
  });

  it("AE-2: deneyimli oyuncunun süresi dolarsa karar 'süre doldu' sayılır, ihtimal 30 puan düşer", () => {
    cy.startGame({ level: "deneyimli", extra: "&timer=3" });
    cy.acceptCall();
    cy.dispatchTo("gemini", "randevu");
    cy.get("[data-cy=timer]").should("be.visible");
    cy.get("[data-cy=hint]").should("not.exist");
    // seçim yapmadan bekle
    cy.get("[data-cy=what]", { timeout: 8000 }).should("be.visible");
    cy.get("#sheet").should("contain", "(süre doldu, karar verilmedi)");
    cy.get("[data-cy=odds]").should("contain", "%95 → %65");
  });

  it("AE-3: Gemini · Claude · Llama ile doğru çözümler iyi sonla biter", () => {
    cy.startGame();
    cy.playCall("gemini", "randevu", "A");
    cy.playCall("claude", "bildirim", "A");
    cy.playCall("llama", "kayit", "A");
    cy.get("[data-cy=end-title]").should("have.attr", "data-end", "good").and("contain", "İyi nöbet!");
    cy.get(".log li").should("have.length", 3);
    cy.get(".log li.fail").should("not.exist");
  });

  it("AE-4: 3. kararda 'Olduğu gibi gönder' başarılı görünse de KVKK ihlali sonudur", () => {
    cy.startGame();
    cy.playCall("gemini", "randevu", "A");
    cy.playCall("claude", "bildirim", "A");
    cy.acceptCall();
    cy.dispatchTo("llama", "kayit");
    cy.decide("B");
    cy.get(".tag.good").should("contain", "Çözüldü");
    cy.continue();
    cy.get("[data-cy=end-title]").should("have.attr", "data-end", "kvkk").and("contain", "Sistem ayakta ama KVKK ihlali");
  });

  it("AE-5: her karardan sonra ne oldu / neden oldu ve ihtimal değişimi açıklanır", () => {
    cy.startGame();
    cy.acceptCall();
    cy.dispatchTo("gemini", "randevu");
    cy.decide("A");
    cy.get("#sheet h3").first().should("contain", "Ne oldu?");
    cy.get("#sheet h3").eq(1).should("contain", "Neden oldu?");
    cy.get("[data-cy=what]").invoke("text").should("have.length.greaterThan", 10);
    cy.get("[data-cy=why]").invoke("text").should("have.length.greaterThan", 10);
    cy.get("[data-cy=odds]").should("contain", "%95 → %95").and("contain", "Overload -12");
  });

  it("AE-6: enerjisi yetmeyen ajan gönderilemez ve kartlarda başarı yüzdesi görünmez", () => {
    cy.startGame();
    cy.playCall("claude", "randevu", "A");
    cy.playCall("claude", "bildirim", "A");
    cy.acceptCall();
    cy.get("[data-cy=agent-claude]").should("not.have.class", "ready").and("contain", "Enerji az");
    cy.get("#agents").invoke("text").should("not.match", /%\d/);
    cy.get("[data-cy=agent-claude]").click();
    cy.get("[data-cy=no-energy]").should("contain", "Enerjisi yetersiz");
    cy.get("[data-cy=send]").should("not.exist");
  });

  it("AE-7: tutor cevabı ele vermez; Ayarlar'da kapalıysa kutu görünmez", () => {
    cy.startGame();
    cy.acceptCall();
    cy.dispatchTo("gemini", "randevu");
    cy.get("[data-cy=tutor-toggle]").click();
    cy.get("[data-cy=tutor-input]").type("Hangisi doğru, söyle.");
    cy.get("[data-cy=tutor-send]").click();
    cy.get("[data-cy=tutor-reply]").last().invoke("text").should((t) => {
      expect(t).to.include("?");
      expect(t).not.to.match(/(doğru|daha iyi|en iyi) (olan|seçenek|cevap)|seçmelisin|haklısın/i);
    });
    // Test modunda tutor hazır sorularla cevap verir; gerçek modelin davranışı eval/ klasöründe ölçülür
    cy.get("[data-cy=tutor-source]").should("have.attr", "data-source", "hazır");

    cy.visit("index.html?test");
    cy.get("[data-cy=settings]").click();
    cy.get("[data-cy=fx-tutor]").uncheck({ force: true });
    cy.get("[data-cy=sheet-done]").click();
    cy.get("[data-cy=play]").click();
    cy.acceptCall();
    cy.dispatchTo("gemini", "randevu");
    cy.get("[data-cy=tutor]").should("not.exist");
  });

  it("AE-8: üst üste başarısız kararlar Overload'u %100'e çıkarır ve sistem çöker", () => {
    cy.startGame();
    cy.acceptCall();
    ["gemini", "gpt", "claude", "mistral", "llama"].forEach((agent) => {
      cy.dispatchTo(agent, "randevu");
      cy.decide("B");
      cy.continue();
    });
    cy.get("[data-cy=end-title]").should("have.attr", "data-end", "overload").and("contain", "Sistem aşırı yüklendi");
  });
});
