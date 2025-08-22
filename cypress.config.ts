import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_baseUrl || 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,ts,jsx,tsx}',
    supportFile: 'cypress/support/e2e.ts'
  },
  video: false,
  screenshotsFolder: 'cypress/screenshots',
  retries: 1
});
