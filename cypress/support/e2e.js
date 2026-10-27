// Overload için ortak komutlar. Oyun ?test modunda açılır: zar yok (ihtimal ≥ %50 başarı),
// animasyonlar kısa, Overload artışı ve rastgele olay yok; ana çağrılar art arda gelir.

// Seçimler tarayıcıda hatırlandığı için her test temiz başlar
beforeEach(() => cy.clearLocalStorage());

// Ana menüden ön ayarı seçip vardiyayı başlatır. extra: ?timer=3 gibi ek URL parametreleri
Cypress.Commands.add("startGame", ({ level = "orta", goal = "ayakta", role, extra = "" } = {}) => {
  cy.visit(`index.html?test${extra}`);
  cy.get("[data-cy=pick-preset]").click();
  cy.get(`[data-cy=level-${level}]`).click();
  cy.get(`[data-cy=goal-${goal}]`).click();
  cy.get("[data-cy=sheet-done]").click();
  if (role) {
    cy.get("[data-cy=pick-role]").click();
    cy.get(`[data-cy=role-${role}]`).click();
    cy.get("[data-cy=sheet-done]").click();
  }
  cy.get("[data-cy=play]").click();
  cy.get("#game.active").should("exist");
});

// Telefonu açar (çalıyorsa)
Cypress.Commands.add("acceptCall", () => {
  cy.get("[data-cy=accept-call]").click();
});

// Ajanı hazır olunca seçili kırmızı işarete gönderir ve turuncu işarete dokunup karar penceresini açar
Cypress.Commands.add("dispatchTo", (agent, building) => {
  cy.get(`[data-cy=agent-${agent}].ready`).click();
  cy.get("[data-cy=send]").click();
  cy.get(`[data-cy=marker-${building}].orange`).click({ force: true });
  cy.get("[data-cy=option-A]").should("be.visible");
});

// Seçeneği (içteki kimlikle: A doğru, B kötü, C orta yol, D uzmanlık) seçer ve sonucu kontrol eder
Cypress.Commands.add("decide", (option) => {
  cy.get(`[data-cy=option-${option}]`).click();
  cy.get("[data-cy=what]").should("be.visible");
  cy.get("[data-cy=why]").should("be.visible");
});

Cypress.Commands.add("continue", () => {
  cy.get("[data-cy=result-continue]").click();
});

// Bir ana çağrıyı baştan sona oynar: telefon → ajan → karar → devam
Cypress.Commands.add("playCall", (agent, building, option) => {
  cy.acceptCall();
  cy.dispatchTo(agent, building);
  cy.decide(option);
  cy.continue();
});
