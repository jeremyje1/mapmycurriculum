/// <reference types="cypress" />

/**
 * Core flows: marketing landing, signup checkout stub, enterprise dashboard auth gating.
 * NOTE: Stripe redirect is stubbed; we intercept the POST /api/checkout.
 */

describe('Scenario Engine Core Flows', () => {
  it('Loads marketing home with hero headline', () => {
    cy.visit('/');
    cy.contains('h1', 'Policy‑Aware Curriculum Intelligence').should('be.visible');
    cy.get('a').contains('Get Started').should('have.attr', 'href');
  });

  it('Signup page plan selection & checkout stub', () => {
    cy.visit('/signup');
    cy.contains('h1', 'Get Started');
    // Ensure at least one selectable plan present
    cy.get('button.btn').contains('School Starter').should('exist');
    // Intercept checkout request
    cy.intercept('POST', '/api/checkout', (req) => {
      req.reply({ url: 'https://example.test/stripe-session' });
    }).as('checkout');
    cy.get('input[type=email]').type('tester@example.edu');
    cy.get('input[placeholder="Example Community College"]').type('Example CC');
    cy.get('select').select('Texas');
    cy.get('button[type=submit]').click();
    cy.wait('@checkout').its('response.statusCode').should('eq', 200);
  });

  it('Enterprise dashboard unauthenticated CTA then authenticated view', () => {
    cy.visit('/enterprise/dashboard');
    cy.contains('h1', 'Enterprise Dashboard');
    cy.contains('Authenticate');
    // Set mock auth token (matches page hook expectation) then reload
    cy.window().then(w => {
      w.localStorage.setItem('demo_user', JSON.stringify({ email: 'tester@example.edu', plan: 'district_enterprise' }));
    });
    cy.reload();
    cy.contains('Signed in as tester@example.edu').should('be.visible');
    cy.contains('Compliance & Coverage Snapshot');
  });
});
