import { useEffect, useState } from "react";

export type Product = {
  id: string;
  category: "supplement" | "gym_wear";
  name: string;
  price_kes: number;
  note: string | null;
  image_url: string | null;
};

export function useProducts() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/.netlify/functions/products")
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then(setProducts)
      .catch(() => setError(true));
  }, []);

  return { products, error };
}
