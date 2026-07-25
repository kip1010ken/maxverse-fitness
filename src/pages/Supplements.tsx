import { Link } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";

const categories = [
  { key: "supplement" as const, title: "Supplements" },
  { key: "gym_wear" as const, title: "Gym Wear" },
];

export default function Supplements() {
  const { products, error } = useProducts();

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-4xl uppercase text-bone">Supplements & Gym Wear</h1>
      <p className="mt-4 max-w-xl font-body text-steel">
        Curated stock, available for pickup in Nairobi or delivery. Pay securely with M-Pesa.
      </p>

      {error && (
        <p className="mt-8 font-body text-steel">Couldn't load products right now — check back soon.</p>
      )}
      {!error && products === null && (
        <p className="mt-8 font-mono text-xs uppercase tracking-widest text-steel">Loading…</p>
      )}

      {categories.map((category) => {
        const items = products?.filter((product) => product.category === category.key) ?? [];
        if (products && items.length === 0) return null;

        return (
          <div key={category.key} className="mt-12">
            <h2 className="font-display text-2xl uppercase text-bone">{category.title}</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {items.map((product) => (
                <div key={product.id} className="flex flex-col gap-3 border border-steel/20 bg-charcoal p-6">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="aspect-square w-full border border-steel/20 object-cover"
                    />
                  )}
                  <h3 className="font-display text-lg uppercase text-bone">{product.name}</h3>
                  {product.note && (
                    <p className="font-mono text-xs uppercase tracking-widest text-steel">{product.note}</p>
                  )}
                  <p className="font-mono text-sm text-bone">KES {product.price_kes.toLocaleString()}</p>
                  <Link
                    to={`/checkout?type=product&id=${product.id}&name=${encodeURIComponent(product.name)}&price=${product.price_kes}`}
                    className="mt-auto rounded-sm border border-steel/40 py-2 text-center font-mono text-xs uppercase tracking-widest text-bone transition-colors hover:border-flame hover:text-flame"
                  >
                    Buy with M-Pesa
                  </Link>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
