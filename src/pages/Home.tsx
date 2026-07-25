import Hero from "../components/Hero";
import PlanCard from "../components/PlanCard";

const featuredPlans = [
  {
    name: "Foundation",
    priceKes: 4500,
    cadence: "month",
    intensity: 3,
    features: ["3x weekly virtual check-ins", "Custom training split", "Form review via video"],
  },
  {
    name: "Competition Prep",
    priceKes: 12000,
    cadence: "month",
    intensity: 7,
    features: ["Daily coaching access", "Full meal plan + macros", "Supplement protocol", "Peak-week guidance"],
  },
];

export default function Home() {
  return (
    <>
      <Hero />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-3xl uppercase text-bone">Featured plans</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {featuredPlans.map((plan) => (
            <PlanCard key={plan.name} {...plan} />
          ))}
        </div>
      </section>
    </>
  );
}
