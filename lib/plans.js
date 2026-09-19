// Single source of truth for plan limits and pricing copy.
//
// The API routes enforce these numbers, and the landing page, pricing page, and
// dashboard usage meters all render them, so a limit can only be changed here.
//
// `period` is how usage is counted:
//   'lifetime'  a one-time allowance that never resets (the free trial)
//   'month'     resets on the 1st of each month
//
// Assure+ limits are sized against model cost. At the AI Gateway rates for the
// configured model ($1.50 per million input tokens, $7.50 per million output),
// a receipt scan costs roughly a cent. A claim conversation is capped at
// `claimMessages` messages, which bounds it to roughly ten cents even if every
// reply runs long. 50 scans and 25 conversations a month therefore stays well
// inside the $5 price after payment fees even at full use.
export const PLANS = {
  free: {
    key: 'free',
    name: 'Free trial',
    price: '$0',
    interval: null,
    period: 'lifetime',
    limits: { warranties: 5, scans: 1, claims: 1, claimMessages: 10 },
    features: [
      'Track up to 5 warranties',
      '1 AI receipt scan',
      '1 AI claim session (up to 10 messages)',
      'Expiry countdown',
    ],
  },
  plus: {
    key: 'plus',
    name: 'Assure+',
    price: '$5',
    interval: 'month',
    period: 'month',
    limits: { warranties: 100, scans: 50, claims: 25, claimMessages: 10 },
    features: [
      'Track up to 100 warranties',
      '50 AI receipt scans per month',
      '25 AI claim sessions per month (up to 10 messages each)',
      'Expiry countdown',
    ],
  },
};

// There is no billing yet, so nobody can be on Assure+ and every account is
// held to the free trial. When billing lands this becomes a per-user lookup.
export const ENFORCED_PLAN = PLANS.free;
