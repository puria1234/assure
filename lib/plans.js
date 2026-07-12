export const PLANS = {
  free: {
    name: 'Free',
    price: '$0',
    interval: null,
    limits: {
      warranties: 5,
      scans: 3,       // AI receipt scans per month
      claims: 1,      // claim sessions per month
    },
    features: [
      'Up to 5 warranties',
      '3 AI receipt scans / month',
      '1 claim session / month',
      'Expiry countdown & alerts',
    ],
  },
  protect: {
    name: 'Protect',
    price: '$3.99',
    interval: 'month',
    limits: {
      warranties: 30,
      scans: 20,
      claims: 10,
    },
    features: [
      'Up to 30 warranties',
      '20 AI receipt scans / month',
      '10 claim sessions / month',
      'Expiry alerts (30-day)',
      'Coverage progress tracking',
    ],
  },
  protectPlus: {
    name: 'Protect+',
    price: '$6.99',
    interval: 'month',
    limits: {
      warranties: Infinity,
      scans: Infinity,
      claims: Infinity,
    },
    features: [
      'Unlimited warranties',
      'Unlimited AI receipt scans',
      'Unlimited claim sessions',
      'Priority support',
      'Family sharing (up to 5)',
    ],
  },
};
