import { buildWhatsAppLink } from "../services/whatsapp";

const mealPlans = [
  {
    name: "Lean Cut",
    priceKes: 3500,
    description:
      "Calorie-deficit meal plan built around Nairobi grocery staples, structured for fat loss without muscle loss.",
  },
  {
    name: "Lean Bulk",
    priceKes: 3500,
    description:
      "Surplus meal plan for steady muscle gain, macro-balanced and shopping-list ready.",
  },
  {
    name: "Competition Peak",
    priceKes: 6000,
    description:
      "Precision macro and water-manipulation plan for the final weeks before a show, paired with Competition Prep coaching.",
  },
];

export default function MealPlans() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-4xl uppercase text-bone">Meal Plans</h1>
      <p className="mt-4 max-w-xl font-body text-steel">
        Macro-based meal plans built around food available in Nairobi, delivered as a PDF with a
        shopping list.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {mealPlans.map((plan) => (
          <div key={plan.name} className="flex flex-col gap-4 border border-steel/20 bg-charcoal p-6">
            <h3 className="font-display text-2xl uppercase text-bone">{plan.name}</h3>
            <p className="font-mono text-sm text-steel">KES {plan.priceKes.toLocaleString()}</p>
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
      </div>
    </section>
  );
}
