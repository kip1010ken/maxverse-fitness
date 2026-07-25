const categories = [
  {
    title: "Supplements",
    products: [
      { name: "Whey Isolate", priceKes: 5500, note: "900g · Vanilla / Chocolate" },
      { name: "Creatine Monohydrate", priceKes: 2200, note: "300g" },
      { name: "Pre-Workout", priceKes: 3800, note: "30 servings" },
    ],
  },
  {
    title: "Gym Wear",
    products: [
      { name: "Maxverse Training Tee", priceKes: 1800, note: "S–XXL" },
      { name: "Compression Shorts", priceKes: 2400, note: "S–XXL" },
      { name: "Lifting Belt", priceKes: 4200, note: "One size, adjustable" },
    ],
  },
];

export default function Supplements() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-4xl uppercase text-bone">Supplements & Gym Wear</h1>
      <p className="mt-4 max-w-xl font-body text-steel">
        Curated stock, available for pickup in Nairobi or delivery. Message on WhatsApp to
        order — online checkout is coming soon.
      </p>

      {categories.map((category) => (
        <div key={category.title} className="mt-12">
          <h2 className="font-display text-2xl uppercase text-bone">{category.title}</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {category.products.map((product) => (
              <div key={product.name} className="flex flex-col gap-3 border border-steel/20 bg-charcoal p-6">
                <h3 className="font-display text-lg uppercase text-bone">{product.name}</h3>
                <p className="font-mono text-xs uppercase tracking-widest text-steel">{product.note}</p>
                <p className="font-mono text-sm text-bone">KES {product.priceKes.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
