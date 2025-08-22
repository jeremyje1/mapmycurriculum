#!/usr/bin/env node
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from the root .env file
dotenv.config({ path: resolve(__dirname, '..', '.env') });

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

async function createProducts() {
  try {
    console.log('🚀 Creating Stripe products with new pricing structure...\n');

    // 1. Starter Plan - $2,495/year
    console.log('Creating Starter Plan...');
    const starterProduct = await stripe.products.create({
      name: 'Starter Plan',
      description: 'For small schools, departments, or pilot projects. Up to 500 students / 50 faculty.',
      metadata: {
        plan_type: 'starter',
        max_students: '500',
        max_faculty: '50',
        features: JSON.stringify([
          'Upload curriculum maps (CSV, Excel, PDF)',
          'Auto-alignment with national/state standards',
          'AI-generated gap analysis report (10 pages)',
          'Exportable curriculum maps (CSV/Word/PDF)',
          'Email support only'
        ])
      }
    });

    const starterPrice = await stripe.prices.create({
      product: starterProduct.id,
      unit_amount: 249500, // $2,495.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'year'
      },
      nickname: 'Starter Annual',
      metadata: {
        plan_type: 'starter'
      }
    });

    console.log(`✅ Starter Plan created: ${starterProduct.id}`);
    console.log(`   Price ID: ${starterPrice.id}\n`);

    // 2. Professional Plan - $5,995/year
    console.log('Creating Professional Plan...');
    const professionalProduct = await stripe.products.create({
      name: 'Professional Plan',
      description: 'For mid-sized schools, districts, or multi-program colleges. Up to 2,500 students / 200 faculty.',
      metadata: {
        plan_type: 'professional',
        max_students: '2500',
        max_faculty: '200',
        max_programs: '5',
        features: JSON.stringify([
          'Everything in Starter',
          'AI narrative report (20-25 pages)',
          'Multi-program support (5 programs/departments)',
          'Faculty collaboration portal',
          'Scenario modeling (curriculum redesign options)',
          'Standards crosswalks (state → accreditation body)',
          'Monthly office hours session with consultant'
        ])
      }
    });

    const professionalPrice = await stripe.prices.create({
      product: professionalProduct.id,
      unit_amount: 599500, // $5,995.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'year'
      },
      nickname: 'Professional Annual',
      metadata: {
        plan_type: 'professional'
      }
    });

    console.log(`✅ Professional Plan created: ${professionalProduct.id}`);
    console.log(`   Price ID: ${professionalPrice.id}\n`);

    // 3. Comprehensive Plan - $12,500/year
    console.log('Creating Comprehensive Plan...');
    const comprehensiveProduct = await stripe.products.create({
      name: 'Comprehensive Plan',
      description: 'For larger institutions needing board-level or accreditation-ready deliverables. Up to 10,000 students / 1,000 faculty.',
      metadata: {
        plan_type: 'comprehensive',
        max_students: '10000',
        max_faculty: '1000',
        features: JSON.stringify([
          'Everything in Professional',
          'Custom accreditation alignment (regional + professional bodies)',
          'AI-powered curriculum visualization dashboards',
          'Unlimited program uploads',
          'Real-time gap closure tracking',
          'Annual curriculum strategy workshop (virtual)',
          '40-50 page AI narrative & accreditation-ready package'
        ])
      }
    });

    const comprehensivePrice = await stripe.prices.create({
      product: comprehensiveProduct.id,
      unit_amount: 1250000, // $12,500.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'year'
      },
      nickname: 'Comprehensive Annual',
      metadata: {
        plan_type: 'comprehensive'
      }
    });

    console.log(`✅ Comprehensive Plan created: ${comprehensiveProduct.id}`);
    console.log(`   Price ID: ${comprehensivePrice.id}\n`);

    // 4. Enterprise Transformation - Custom pricing (create product only, no price)
    console.log('Creating Enterprise Transformation product...');
    const enterpriseProduct = await stripe.products.create({
      name: 'Enterprise Transformation',
      description: 'For multi-campus districts, universities, or systems. Custom pricing starting at $25,000+.',
      metadata: {
        plan_type: 'enterprise',
        pricing: 'custom',
        starting_price: '25000',
        features: JSON.stringify([
          'Everything in Comprehensive',
          'Unlimited users and programs',
          'Dedicated customer success manager',
          'API integrations with LMS/SIS (Canvas, Banner, Workday, etc.)',
          'Power BI / Tableau dashboard embed',
          'Quarterly progress audits',
          'On-site or hybrid accreditation support',
          'Full white-glove implementation'
        ])
      }
    });

    console.log(`✅ Enterprise Transformation product created: ${enterpriseProduct.id}`);
    console.log(`   (No price created - custom pricing)\n`);

    // Summary
    console.log('📋 Summary of created products:\n');
    console.log('Starter Plan:');
    console.log(`  Product ID: ${starterProduct.id}`);
    console.log(`  Price ID: ${starterPrice.id}`);
    console.log(`  Amount: $2,495/year\n`);

    console.log('Professional Plan:');
    console.log(`  Product ID: ${professionalProduct.id}`);
    console.log(`  Price ID: ${professionalPrice.id}`);
    console.log(`  Amount: $5,995/year\n`);

    console.log('Comprehensive Plan:');
    console.log(`  Product ID: ${comprehensiveProduct.id}`);
    console.log(`  Price ID: ${comprehensivePrice.id}`);
    console.log(`  Amount: $12,500/year\n`);

    console.log('Enterprise Transformation:');
    console.log(`  Product ID: ${enterpriseProduct.id}`);
    console.log(`  Price ID: Custom pricing (contact sales)\n`);

    // Update environment variables
    console.log('💡 Add these to your .env file:');
    console.log(`NEXT_PUBLIC_PRICE_STARTER="${starterPrice.id}"`);
    console.log(`NEXT_PUBLIC_PRICE_PROFESSIONAL="${professionalPrice.id}"`);
    console.log(`NEXT_PUBLIC_PRICE_COMPREHENSIVE="${comprehensivePrice.id}"`);
    console.log(`NEXT_PUBLIC_PRICE_ENTERPRISE="custom"`);

  } catch (error) {
    console.error('❌ Error creating products:', error);
    process.exit(1);
  }
}

// Run the script
createProducts();
