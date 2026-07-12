export const PADDLE_ENV = process.env.NEXT_PUBLIC_PADDLE_ENV ?? "sandbox";

export const PLANS = {
  protect: {
    name: "Protect",
    price: "$3.99",
    interval: "month",
    priceId: process.env.NEXT_PUBLIC_PADDLE_PROTECT_PRICE_ID,
    description: "Unlimited warranty tracking, AI receipt scanning, and expiry alerts.",
    features: [
      "Unlimited warranties",
      "AI receipt scanning",
      "Expiry alerts",
    ],
  },
  protectPlus: {
    name: "Protect+",
    price: "$6.99",
    interval: "month",
    priceId: process.env.NEXT_PUBLIC_PADDLE_PROTECT_PLUS_PRICE_ID,
    description: "Everything in Protect, plus claim assistance and family sharing.",
    features: [
      "Everything in Protect",
      "AI claim assistance",
      "Priority support",
      "Family sharing",
    ],
  },
};
