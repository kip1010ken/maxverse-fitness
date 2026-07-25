import PlanCard from "../components/PlanCard";
import { usePlans } from "../hooks/usePlans";

export default function Plans() {
  const { plans, error } = usePlans();

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-4xl uppercase text-bone">Plans</h1>
      <p className="mt-4 max-w-xl font-body text-steel">
        Three tiers of coaching, from foundational training to full competition prep. Every plan
        is available in-person in Nairobi or fully virtual.
      </p>

      {error && (
        <p className="mt-8 font-body text-steel">Couldn't load plans right now — check back soon.</p>
      )}
      {!error && plans === null && (
        <p className="mt-8 font-mono text-xs uppercase tracking-widest text-steel">Loading…</p>
      )}

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {plans?.map((plan) => (
          <PlanCard
            key={plan.id}
            id={plan.id}
            name={plan.name}
            priceKes={plan.price_kes}
            cadence={plan.cadence}
            intensity={plan.intensity}
            features={plan.features}
          />
        ))}
      </div>
    </section>
  );
}
