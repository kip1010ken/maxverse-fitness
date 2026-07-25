import { buildWhatsAppLink } from "../services/whatsapp";
import { useMealPlans } from "../hooks/useMealPlans";

export default function MealPlans() {
  const { mealPlans, error } = useMealPlans();

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-4xl uppercase text-bone">Meal Plans</h1>
      <p className="mt-4 max-w-xl font-body text-steel">
        Macro-based meal plans built around food available in Nairobi, delivered as a PDF with a
        shopping list.
      </p>

      {error && (
        <p className="mt-8 font-body text-steel">Couldn't load meal plans right now — check back soon.</p>
      )}
      {!error && mealPlans === null && (
        <p className="mt-8 font-mono text-xs uppercase tracking-widest text-steel">Loading…</p>
      )}

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {mealPlans?.map((plan) => (
          <div key={plan.id} className="flex flex-col gap-4 border border-steel/20 bg-charcoal p-6">
            <h3 className="font-display text-2xl uppercase text-bone">{plan.name}</h3>
            <p className="font-mono text-sm text-steel">KES {plan.price_kes.toLocaleString()}</p>
            <p className="flex-1 font-body text-sm text-bone/90">{plan.description}</p>
            <a
              href={buildWhatsAppLink(`Hi Maxverse Fitness, I'd like to get the ${plan.name} meal plan.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm border border-steel/40 py-2 text-center font-mono text-xs uppercase tracking-widest text-bone transition-colors hover:border-flame hover:text-flame"
            >
              Get {plan.name}
            </a>
          </div>
        ))}
        {mealPlans?.length === 0 && <p className="font-body text-steel">New meal plans coming soon.</p>}
      </div>
    </section>
  );
}
