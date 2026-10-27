const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    // baseUrl yok: Cypress index.html'i proje kökünden kendisi sunar
    specPattern: "cypress/e2e/**/*.cy.js",
    supportFile: "cypress/support/e2e.js",
    viewportWidth: 390,
    viewportHeight: 844,
    defaultCommandTimeout: 10000,
    video: true,
    videoCompression: 28,
    screenshotOnRunFailure: true,
  },
});
