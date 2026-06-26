/**
 * One-time script to create Stripe products and prices for Centinelia.
 * Run with: node scripts/setup-stripe-products.mjs
 */

import Stripe from 'stripe';
import { readFileSync } from 'fs';
import { resolve } from 'path';

try {
  const envContent = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
  for (const line of envContent.split('\n')) {
    const [key, ...rest] = line.split('=');
    if (key && !key.startsWith('#') && rest.length) {
      process.env[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
    }
  }
} catch {}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-05-27.dahlia',
});

const setupPlans = [
  { key: 'STRIPE_SETUP_BASICO',    name: 'Centinelia Instalación Básico',    mxn: 4990 },
  { key: 'STRIPE_SETUP_ESTANDAR',  name: 'Centinelia Instalación Estándar',  mxn: 8990 },
  { key: 'STRIPE_SETUP_PRO',       name: 'Centinelia Instalación Pro',       mxn: 14990 },
];

const minutesPlans = [
  { key: 'STRIPE_MINUTES_STARTER',    name: 'Centinelia Minutos Starter',    mxn: 1990,  minutes: 200 },
  { key: 'STRIPE_MINUTES_GROWTH',     name: 'Centinelia Minutos Growth',     mxn: 3990,  minutes: 500 },
  { key: 'STRIPE_MINUTES_SCALE',      name: 'Centinelia Minutos Scale',      mxn: 7990,  minutes: 1500 },
  { key: 'STRIPE_MINUTES_ENTERPRISE', name: 'Centinelia Minutos Enterprise', mxn: 12990, minutes: 3000 },
];

console.log('Creating Stripe products...\n');
const results = {};

console.log('── Cuotas de instalación (one-time) ──');
for (const plan of setupPlans) {
  const product = await stripe.products.create({
    name: plan.name,
    metadata: { type: 'setup' },
  });
  const price = await stripe.prices.create({
    product:     product.id,
    unit_amount: plan.mxn * 100,
    currency:    'mxn',
  });
  results[plan.key] = price.id;
  console.log(`✓ ${plan.name}: ${price.id}`);
}

console.log('\n── Paquetes de minutos (mensual recurrente) ──');
for (const plan of minutesPlans) {
  const product = await stripe.products.create({
    name:        plan.name,
    description: `${plan.minutes} minutos/mes de agente de voz con IA`,
    metadata:    { type: 'minutes', minutes: String(plan.minutes) },
  });
  const price = await stripe.prices.create({
    product:    product.id,
    unit_amount: plan.mxn * 100,
    currency:   'mxn',
    recurring:  { interval: 'month' },
    metadata:   { minutes: String(plan.minutes) },
  });
  results[plan.key] = price.id;
  console.log(`✓ ${plan.name} (${plan.minutes} min): ${price.id}`);
}

console.log('\n── Agrega esto a Vercel y .env.local ──\n');
for (const [key, value] of Object.entries(results)) {
  console.log(`${key}=${value}`);
}
console.log('\n── Done ──');
