import { useEffect, useState } from "react";

export type MealPlan = {
  id: string;
  name: string;
  price_kes: number;
  description: string;
};

export function useMealPlans() {
  const [mealPlans, setMealPlans] = useState<MealPlan[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/.netlify/functions/meal-plans")
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then(setMealPlans)
      .catch(() => setError(true));
  }, []);

  return { mealPlans, error };
}
