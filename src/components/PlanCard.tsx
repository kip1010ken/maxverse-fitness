import { Link } from "react-router-dom";
import LoadBar from "./LoadBar";

type PlanCardProps = {
  id: string;
  name: string;
  priceKes: number;
  cadence: string;
  intensity: number; // 1-8, feeds the LoadBar
  features: string[];
};

export default function PlanCard({ id, name, priceKes, cadence, intensity, features }: PlanCardProps) {
  return (
    <div className="flex flex-col gap-5 border border-steel/20 bg-charcoal p-6 transition-colors hover:border-flame/60">
      <div>
        <h3 className="font-display text-2xl uppercase text-bone">{name}</h3>
        <p className="mt-1 font-mono text-sm text-steel">
          KES {priceKes.toLocaleString()} / {cadence}
        </p>
      </div>
      <LoadBar filled={intensity} label="Intensity" />
      <ul className="flex flex-1 flex-col gap-2 font-body text-sm text-bone/90">
        {features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <span className="text-flame">—</span>
            {feature}
          </li>
        ))}
      </ul>
      <Link
        to={`/checkout?type=plan&id=${id}&name=${encodeURIComponent(name)}&price=${priceKes}`}
        className="rounded-sm border border-steel/40 py-2 text-center font-mono text-xs uppercase tracking-widest text-bone transition-colors hover:border-flame hover:text-flame"
      >
        Choose {name}
      </Link>
    </div>
  );
}
