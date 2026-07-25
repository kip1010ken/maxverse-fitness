import { useEffect, useState } from "react";

export type Plan = {
  id: string;
  slug: string;
  name: string;
  price_kes: number;
  cadence: string;
  intensity: number;
  features: string[];
};

export function usePlans() {
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/.netlify/functions/plans")
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then(setPlans)
      .catch(() => setError(true));
  }, []);

  return { plans, error };
}
