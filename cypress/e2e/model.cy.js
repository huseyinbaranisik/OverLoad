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

  it("Veri toplama modu (?veri): gölgede model oyunu değiştirmez, her karar data/oturumlar.csv biçiminde iner", () => {
    cy.startGame({ level: "yeni", extra: "&veri" });
    cy.acceptCall();
    ["llama", "mistral"].forEach((agent) => { // AE-9'daki gibi: normalde destek moduna geçirirdi
      cy.dispatchTo(agent, "randevu");
      cy.decide("B");
      cy.continue();
    });
    cy.dispatchTo("claude", "randevu");
    cy.get("[data-cy=uyum]").should("have.attr", "data-mod", "golge");
    cy.get("[data-cy=tutor]").should("not.have.attr", "open");
    cy.decide("A");
    cy.continue();
    cy.playCall("claude", "bildirim", "A");
    cy.playCall("llama", "kayit", "A");
    cy.get("[data-cy=veri-indir]").should("contain", "5 karar").click();
    cy.window().then((w) => {
      cy.readFile(`cypress/downloads/oturum-${w.eval("OTURUM_ID")}.csv`).then((csv) => {
        const [baslik, ...satir] = csv.trim().split("\n").map((s) => s.split(","));
        cy.readFile("data/oturumlar.csv").then((ref) => expect(baslik).to.deep.equal(ref.split("\n")[0].trim().split(",")));
        expect(satir).to.have.length(5);
        expect(satir.map((r) => r[1])).to.deep.equal(Array(5).fill("gercek"));
        expect(satir.map((r) => r.at(-1))).to.deep.equal(["1", "1", "0", "0", "0"]); // kotu_secim
        expect(satir.map((r) => r[5])).to.deep.equal(["0", "1", "2", "2", "2"]); // onceki_kotu
      });
    });
  });
});
