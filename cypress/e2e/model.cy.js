// spec.md › 12. Uyum modeli (AE-9 … AE-11). Model tarayıcıda onnxruntime-web ile çalışır.

describe("Uyum modeli", () => {
  it("AE-11: tarayıcıdaki ONNX çıkarımı Python kahiniyle (tests/parite.json) 1e-4 içinde aynı", () => {
    cy.readFile("tests/parite.json").then((ref) => {
      cy.visit("index.html?test");
      cy.window().then(async (w) => {
        for (const c of ref.cases) {
          const p = await w.eval("uyumTahmin")(c.x);
          expect(p, c.name).to.be.a("number");
          expect(Math.abs(p - c.p), `${c.name}: tarayıcı ${p} · Python ${c.p}`).to.be.lessThan(ref.tolerance);
        }
      });
    });
  });

  it("AE-10: deneyimli oyuncu vardiya başında akış modunda: tutor kapalı, sayaç var", () => {
    cy.startGame({ level: "deneyimli", extra: "&timer=30" });
    cy.acceptCall();
    cy.dispatchTo("gemini", "randevu");
    cy.get("[data-cy=uyum]").should("have.attr", "data-mod", "akis");
    cy.get("[data-cy=p]").invoke("text").then(parseFloat).should("be.lessThan", 0.5);
    cy.get("[data-cy=tutor]").should("not.have.attr", "open");
    cy.get("[data-cy=timer]").should("be.visible");
  });

  it("AE-9: iki kötü seçim ve uyumsuz ajandan sonra destek modu: tutor açık ve soru sormuş, sayaç yok", () => {
    cy.startGame({ level: "yeni" });
    cy.acceptCall();
    ["llama", "mistral"].forEach((agent) => { // ikisi de randevu işine uygun değil (ihtimal < %75)
      cy.dispatchTo(agent, "randevu");
      cy.get("[data-cy=uyum]").should("have.attr", "data-mod", "akis");
      cy.decide("B");
      cy.continue();
    });
    cy.dispatchTo("claude", "randevu");
    cy.get("[data-cy=uyum]").should("have.attr", "data-mod", "destek");
    cy.get("[data-cy=p]").invoke("text").then(parseFloat).should("be.at.least", 0.5);
    cy.get("[data-cy=tutor]").should("have.attr", "open");
    cy.get("[data-cy=tutor-reply]").should("have.length", 1);
    cy.get("[data-cy=timer]").should("not.exist");
  });
});
