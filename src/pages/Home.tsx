import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import PlanCard from "../components/PlanCard";
import { usePlans } from "../hooks/usePlans";

export default function Home() {
  const { plans, error } = usePlans();

  return (
    <>
      <Hero />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-3xl uppercase text-bone">Featured plans</h2>

        {error && <p className="mt-4 font-body text-steel">Couldn't load plans right now.</p>}

        <div className="mt-8 grid gap-6 md:grid-cols-3">
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

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col items-start gap-6 border border-steel/20 bg-charcoal p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-3xl uppercase text-bone">Real transformations</h2>
            <p className="mt-3 max-w-md font-body text-steel">
              Before-and-after results from real Maxverse clients — in-person and virtual, Nairobi
              and beyond.
            </p>
          </div>
          <Link
            to="/progress"
            className="shrink-0 rounded-sm border border-steel/40 px-6 py-3 font-mono text-sm uppercase tracking-widest text-bone transition-colors hover:border-flame hover:text-flame"
          >
            See Results
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col items-start gap-6 border border-steel/20 bg-charcoal p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-3xl uppercase text-bone">Fuel the work</h2>
            <p className="mt-3 max-w-md font-body text-steel">
              Whey, creatine, pre-workout, and training gear — stocked in Nairobi, paid for with
              M-Pesa.
            </p>
          </div>
          <Link
            to="/supplements"
            className="shrink-0 rounded-sm bg-flame px-6 py-3 font-mono text-sm uppercase tracking-widest text-bone transition-opacity hover:opacity-90"
          >
            Shop Supplements
          </Link>
        </div>
      </section>
    </>
  );
}
