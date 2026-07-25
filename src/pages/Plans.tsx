import PlanCard from "../components/PlanCard";

const plans = [
  {
    name: "Foundation",
    priceKes: 4500,
    cadence: "month",
    intensity: 3,
    features: [
      "3x weekly virtual check-ins",
      "Custom training split",
      "Form review via video",
      "WhatsApp support",
    ],
  },
  {
    name: "Momentum",
    priceKes: 8500,
    cadence: "month",
    intensity: 5,
    features: [
      "Daily coaching access",
      "Progressive training program",
      "Base meal plan included",
      "Monthly progress review",
    ],
  },
  {
    name: "Competition Prep",
    priceKes: 12000,
    cadence: "month",
    intensity: 7,
    features: [
      "Daily coaching access",
      "Full meal plan + macros",
      "Supplement protocol",
      "Peak-week guidance",
    ],
  },
];

export default function Plans() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-4xl uppercase text-bone">Plans</h1>
      <p className="mt-4 max-w-xl font-body text-steel">
        Three tiers of coaching, from foundational training to full competition prep. Every plan
        is available in-person in Nairobi or fully virtual.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard key={plan.name} {...plan} />
        ))}
      </div>
    </section>
  );
}
