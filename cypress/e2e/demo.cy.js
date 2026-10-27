// Demo videosu için yaklaşık 60 saniyelik tam bir vardiya: menü, CRT geçişi, telefon, ajan kartı,
// iz bırakan ajan, tutor, ⭐ uzmanlık seçeneği, kritik olayda kablo mini görevi ve iyi son.
// Çalıştır: npm run demo  →  video: cypress/videos/demo.cy.js.mp4

const pause = (ms) => cy.wait(ms, { log: false });

describe("Demo", () => {
  it("bir vardiyayı baştan sona oynar", () => {
    cy.visit("index.html?test");
    pause(2000);
    cy.get("[data-cy=pick-preset]").click();
    pause(1200);
    cy.get("[data-cy=level-yeni]").click();
    pause(600);
    cy.get("[data-cy=sheet-done]").click();
    pause(800);
    cy.get("[data-cy=play]").click();
    pause(1100);

    // 08:30 · Randevu: Gemini'nin kartı, yolculuk, tutor ve uzmanlık seçeneği
    pause(1100);
    cy.acceptCall();
    pause(1100);
    cy.get("[data-cy=agent-gemini]").click();
    pause(2000);
    cy.get("[data-cy=send]").click();
    pause(1100);
    cy.get("[data-cy=marker-randevu].orange").click({ force: true });
    pause(2000);
    cy.get("[data-cy=tutor-toggle]").click();
    cy.get("[data-cy=tutor-input]").type("Geri dönmek güvenli mi?", { delay: 60 });
    cy.get("[data-cy=tutor-send]").click();
    pause(2000);
    cy.get("[data-cy=option-D]").scrollIntoView().click();
    pause(2700);
    cy.continue();
    pause(1100);

    // Kritik bir rastgele olay: ana veritabanı çöktü → kablo mini görevi
    // Oyunun const değişkenleri window özelliği değil; sayfanın kendi bağlamında çalıştır.
    // Test modunda rastgele olay çıkmadığı için demo, kritik bir olayı elle başlatır.
    cy.window().then((w) => w.eval(`
      S.bag = [RANDOM_INCIDENTS.find(t => t.title === 'Ana veritabanı cevap vermiyor')];
      S.sel = spawnRandom().id;
      renderAll();
    `));
    pause(800);
    cy.get("[data-cy=accept-call]").should("exist"); // 11:30 çağrısı da çaldı; önce onu kabul et
    cy.acceptCall();
    pause(800);
    cy.get("[data-cy=marker-veritabani]").click({ force: true });
    pause(1100);
    cy.get("[data-cy=agent-gpt].ready").click();
    pause(1200);
    cy.get("[data-cy=send]").click();
    pause(1200);
    cy.get("[data-cy=marker-veritabani].orange").click({ force: true });
    pause(1100);
    [0, 1, 2, 3].forEach((i) => {
      cy.get(`[data-cy=plug-${i}]`).click();
      pause(300);
      cy.get(`[data-cy=sock-${i}]`).click();
      pause(500);
    });
    cy.get("[data-cy=mg-result]").should("be.visible");
    pause(2000);
    cy.get("[data-cy=option-A]").scrollIntoView().click();
    pause(3000);
    cy.continue();
    pause(1200);

    // 11:30 · Bildirim: Claude
    cy.get("[data-cy=marker-bildirim]").click({ force: true });
    pause(800);
    cy.dispatchTo("claude", "bildirim");
    pause(2000);
    cy.get("[data-cy=option-D]").scrollIntoView().click();
    pause(3000);
    cy.continue();
    pause(1200);

    // 14:30 · Hasta Kayıt: Llama ile KVKK kararı
    cy.acceptCall();
    pause(1100);
    cy.dispatchTo("llama", "kayit");
    pause(2000);
    cy.get("[data-cy=option-A]").scrollIntoView().click();
    pause(2700);
    cy.continue();

    cy.get("[data-cy=end-title]").should("have.attr", "data-end", "good");
    pause(2000);
    cy.get(".log").scrollIntoView({ duration: 2500 });
    pause(2000);
  });
});
