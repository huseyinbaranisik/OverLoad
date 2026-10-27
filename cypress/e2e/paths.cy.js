// spec.md › 7.1 Test edilen yollar (P1–P6). ?test modunda ihtimal ≥ %50 her zaman başarıdır.
// Ana çağrılar: 1 Randevu (Gemini en uygun) · 2 Bildirim (Claude) · 3 Hasta Kayıt (Llama).

const endIs = (type, title) => {
  cy.get("[data-cy=end-title]").should("have.attr", "data-end", type).and("contain", title);
};

describe("Karar yolları", () => {
  it("P1: A · A · A → İyi nöbet", () => {
    cy.startGame();
    cy.playCall("gemini", "randevu", "A");
    cy.playCall("claude", "bildirim", "A");
    cy.playCall("llama", "kayit", "A");
    endIs("good", "İyi nöbet!");
    cy.get(".log li").should("have.length", 3);
    cy.get(".log li.fail").should("not.exist");
  });

  it("P2: A · A · B → Sistem ayakta ama KVKK ihlali", () => {
    cy.startGame();
    cy.playCall("gemini", "randevu", "A");
    cy.playCall("claude", "bildirim", "A");
    cy.playCall("llama", "kayit", "B");
    endIs("kvkk", "KVKK ihlali");
  });

  it("P3: D · D · D (uzmanlık seçenekleri) → İyi nöbet", () => {
    cy.startGame();
    cy.playCall("gemini", "randevu", "D");
    cy.playCall("claude", "bildirim", "D");
    cy.playCall("llama", "kayit", "D");
    endIs("good", "İyi nöbet!");
  });

  it("P4: C · C · C (orta yol) → İyi nöbet", () => {
    cy.startGame();
    cy.playCall("gemini", "randevu", "C");
    cy.playCall("claude", "bildirim", "C");
    cy.playCall("llama", "kayit", "C");
    endIs("good", "İyi nöbet!");
  });

  it("P5: B başarısız → işaret yeniden kırmızı → A ile toparlanır → İyi nöbet", () => {
    cy.startGame();
    cy.acceptCall();
    cy.dispatchTo("gemini", "randevu");
    cy.decide("B");
    cy.get(".tag.bad").should("contain", "Çözülemedi");
    cy.continue();
    cy.get("[data-cy=marker-randevu].red").should("exist");
    cy.get("[data-cy=heat]").should("contain", "%20");
    cy.dispatchTo("gemini", "randevu");
    cy.decide("A");
    cy.continue();
    cy.playCall("claude", "bildirim", "A");
    cy.playCall("llama", "kayit", "A");
    endIs("good", "İyi nöbet!");
    cy.get(".log li.fail").should("have.length", 1);
  });

  it("P6: beş ajanla üst üste B → Sistem aşırı yüklendi", () => {
    cy.startGame();
    cy.acceptCall();
    ["gemini", "gpt", "claude", "mistral", "llama"].forEach((agent) => {
      cy.dispatchTo(agent, "randevu");
      cy.decide("B");
      cy.continue();
    });
    endIs("overload", "Sistem aşırı yüklendi");
  });
});
