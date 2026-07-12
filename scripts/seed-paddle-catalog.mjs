// Run once to create Aegis subscription products in Paddle sandbox.
// Usage: node scripts/seed-paddle-catalog.mjs
//
// Requires: PADDLE_SANDBOX_API_KEY env var
//   export PADDLE_SANDBOX_API_KEY=pdl_sdbx_...

import { Paddle, Environment } from "@paddle/paddle-node-sdk";

if (!process.env.PADDLE_SANDBOX_API_KEY) {
  console.error("Error: PADDLE_SANDBOX_API_KEY is not set.");
  process.exit(1);
}

const paddle = new Paddle(process.env.PADDLE_SANDBOX_API_KEY, {
  environment: Environment.sandbox,
});

async function seed() {
  // ── Protect plan ──────────────────────────────────────────────
  console.log("Creating Protect product...");
  const protect = await paddle.products.create({
    name: "Protect",
    taxCategory: "saas",
    description:
      "Unlimited warranty tracking, AI receipt scanning, and expiry alerts for everything you own.",
  });

  const protectMonthly = await paddle.prices.create({
    productId: protect.id,
    description: "Protect – Monthly",
    unitPrice: { amount: "399", currencyCode: "USD" }, // $3.99
    billingCycle: { interval: "month", frequency: 1 },
    trialPeriod: { interval: "day", frequency: 14 },
  });

  console.log(`  ✓ Protect product:       ${protect.id}`);
  console.log(`  ✓ Protect monthly price: ${protectMonthly.id}`);

  // ── Protect+ plan ─────────────────────────────────────────────
  console.log("Creating Protect+ product...");
  const protectPlus = await paddle.products.create({
    name: "Protect+",
    taxCategory: "saas",
    description:
      "Everything in Protect, plus AI claim assistance, priority support, and family sharing.",
  });

  const protectPlusMonthly = await paddle.prices.create({
    productId: protectPlus.id,
    description: "Protect+ – Monthly",
    unitPrice: { amount: "699", currencyCode: "USD" }, // $6.99
    billingCycle: { interval: "month", frequency: 1 },
    trialPeriod: { interval: "day", frequency: 14 },
  });

  console.log(`  ✓ Protect+ product:       ${protectPlus.id}`);
  console.log(`  ✓ Protect+ monthly price: ${protectPlusMonthly.id}`);

  // ── Summary ───────────────────────────────────────────────────
  console.log("\n=== Paste these into your app config ===");
  console.log(
    JSON.stringify(
      {
        protect: {
          productId: protect.id,
          monthlyPriceId: protectMonthly.id,
        },
        protectPlus: {
          productId: protectPlus.id,
          monthlyPriceId: protectPlusMonthly.id,
        },
      },
      null,
      2
    )
  );
}

seed().catch((e) => {
  console.error(e?.message ?? e);
  process.exit(1);
});
