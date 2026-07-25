import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

type Status = "idle" | "submitting" | "polling" | "paid" | "failed";

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const { getToken, isSignedIn, isLoaded } = useAuth();

  const itemType = searchParams.get("type");
  const itemId = searchParams.get("id");
  const itemName = searchParams.get("name") ?? "";
  const itemPrice = searchParams.get("price") ?? "";

  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError("");

    try {
      const token = await getToken();
      const response = await fetch("/.netlify/functions/orders-initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ itemType, itemId, phone }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not start payment");

      setOrderId(data.orderId);
      setStatus("polling");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("failed");
    }
  }

  useEffect(() => {
    if (status !== "polling" || !orderId) return;

    let cancelled = false;

    const interval = setInterval(async () => {
      const token = await getToken();
      const response = await fetch(`/.netlify/functions/orders-status?orderId=${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (cancelled) return;

      if (data.status === "paid") {
        setStatus("paid");
      } else if (data.status === "failed") {
        setStatus("failed");
        setError("Payment was not completed.");
      }
    }, 3000);

    const timeout = setTimeout(() => {
      if (!cancelled) {
        setStatus("failed");
        setError("Payment timed out — check your phone or try again.");
      }
    }, 90000);

    return () => {
      cancelled = true;
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [status, orderId, getToken]);

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return (
      <section className="mx-auto max-w-xl px-6 py-16">
        <h1 className="font-display text-4xl uppercase text-bone">Checkout</h1>
        <p className="mt-4 font-body text-steel">
          Please{" "}
          <Link to="/sign-in" className="text-flame">
            sign in
          </Link>{" "}
          to complete your purchase.
        </p>
      </section>
    );
  }

  if (!itemType || !itemId) {
    return (
      <section className="mx-auto max-w-xl px-6 py-16">
        <h1 className="font-display text-4xl uppercase text-bone">Checkout</h1>
        <p className="mt-4 font-body text-steel">No item selected.</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-xl px-6 py-16">
      <h1 className="font-display text-4xl uppercase text-bone">Checkout</h1>
      <p className="mt-4 font-body text-steel">
        {itemName} — KES {Number(itemPrice).toLocaleString()}
      </p>

      {status !== "paid" && status !== "polling" && (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-steel">M-Pesa phone number</span>
            <input
              required
              placeholder="254712345678"
              pattern="^2547\d{8}$"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="border border-steel/30 bg-transparent px-4 py-3 font-body text-bone"
            />
          </label>
          <button
            type="submit"
            disabled={status === "submitting"}
            className="rounded-sm bg-flame px-6 py-3 font-mono text-sm uppercase tracking-widest text-bone transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {status === "submitting" ? "Sending prompt…" : "Pay with M-Pesa"}
          </button>
          {error && <p className="font-body text-flame">{error}</p>}
        </form>
      )}

      {status === "polling" && (
        <p className="mt-8 font-mono text-xs uppercase tracking-widest text-steel">
          Check your phone and enter your M-Pesa PIN to complete payment…
        </p>
      )}

      {status === "paid" && (
        <p className="mt-8 font-body text-moss">Payment received — thank you! We'll be in touch on WhatsApp.</p>
      )}
    </section>
  );
}
