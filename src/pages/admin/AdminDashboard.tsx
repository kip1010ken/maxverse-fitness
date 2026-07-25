import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "@clerk/clerk-react";

type ContactMessage = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  created_at: string;
};

type ProgressEntry = {
  id: string;
  client_name: string;
  before_image_url: string;
  after_image_url: string;
  summary: string | null;
  is_published: boolean;
  created_at: string;
};

type AdminProduct = {
  id: string;
  category: "supplement" | "gym_wear";
  name: string;
  price_kes: number;
  note: string | null;
  image_url: string | null;
};

type AdminPlan = {
  id: string;
  slug: string;
  name: string;
  price_kes: number;
  cadence: string;
  intensity: number;
  features: string[];
  is_active: boolean;
};

type PlanDraft = {
  name: string;
  priceKes: string;
  cadence: string;
  intensity: string;
  featuresText: string;
  isActive: boolean;
};

const emptyForm = { clientName: "", beforeImageUrl: "", afterImageUrl: "", summary: "" };

export default function AdminDashboard() {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[] | null>(null);
  const [entries, setEntries] = useState<ProgressEntry[] | null>(null);
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [imageDrafts, setImageDrafts] = useState<Record<string, string>>({});
  const [plans, setPlans] = useState<AdminPlan[] | null>(null);
  const [planDrafts, setPlanDrafts] = useState<Record<string, PlanDraft>>({});
  const [planStatus, setPlanStatus] = useState<Record<string, "idle" | "saving" | "error">>({});
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");

  async function authedFetch(path: string, options: RequestInit = {}) {
    const token = await getToken();
    return fetch(path, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}` },
    });
  }

  async function loadMessages() {
    const response = await authedFetch("/.netlify/functions/admin-contact-messages");
    if (response.ok) setMessages(await response.json());
  }

  async function loadEntries() {
    const response = await authedFetch("/.netlify/functions/admin-progress-entries");
    if (response.ok) setEntries(await response.json());
  }

  async function loadProducts() {
    const response = await authedFetch("/.netlify/functions/admin-products");
    if (response.ok) {
      const data: AdminProduct[] = await response.json();
      setProducts(data);
      setImageDrafts(Object.fromEntries(data.map((product) => [product.id, product.image_url ?? ""])));
    }
  }

  async function loadPlans() {
    const response = await authedFetch("/.netlify/functions/admin-plans");
    if (response.ok) {
      const data: AdminPlan[] = await response.json();
      setPlans(data);
      setPlanDrafts(
        Object.fromEntries(
          data.map((plan) => [
            plan.id,
            {
              name: plan.name,
              priceKes: String(plan.price_kes),
              cadence: plan.cadence,
              intensity: String(plan.intensity),
              featuresText: plan.features.join("\n"),
              isActive: plan.is_active,
            },
          ])
        )
      );
    }
  }

  useEffect(() => {
    loadMessages();
    loadEntries();
    loadProducts();
    loadPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveProductImage(id: string) {
    await authedFetch("/.netlify/functions/admin-products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, imageUrl: imageDrafts[id] }),
    });
    loadProducts();
  }

  function updatePlanDraft(id: string, patch: Partial<PlanDraft>) {
    setPlanDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  async function savePlan(id: string) {
    const draft = planDrafts[id];
    if (!draft) return;

    setPlanStatus((prev) => ({ ...prev, [id]: "saving" }));

    try {
      const response = await authedFetch("/.netlify/functions/admin-plans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: draft.name,
          priceKes: Number(draft.priceKes),
          cadence: draft.cadence,
          intensity: Number(draft.intensity),
          features: draft.featuresText
            .split("\n")
            .map((feature) => feature.trim())
            .filter(Boolean),
          isActive: draft.isActive,
        }),
      });

      if (!response.ok) throw new Error("Failed");

      setPlanStatus((prev) => ({ ...prev, [id]: "idle" }));
      loadPlans();
    } catch {
      setPlanStatus((prev) => ({ ...prev, [id]: "error" }));
    }
  }

  async function handleAddEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    try {
      const response = await authedFetch("/.netlify/functions/admin-progress-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Failed");

      setForm(emptyForm);
      setStatus("idle");
      loadEntries();
    } catch {
      setStatus("error");
    }
  }

  async function togglePublish(id: string, isPublished: boolean) {
    await authedFetch("/.netlify/functions/admin-progress-entries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isPublished: !isPublished }),
    });
    loadEntries();
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-4xl uppercase text-bone">Coach Dashboard</h1>

      <div className="mt-12">
        <h2 className="font-display text-2xl uppercase text-bone">Training Plans</h2>
        <p className="mt-2 font-body text-sm text-steel">
          Changes apply immediately on the Home and Plans pages.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {plans?.map((plan) => {
            const draft = planDrafts[plan.id];
            if (!draft) return null;

            return (
              <div key={plan.id} className="flex flex-col gap-3 border border-steel/20 bg-charcoal p-4">
                <label className="flex flex-col gap-1">
                  <span className="font-mono text-xs uppercase tracking-widest text-steel">Name</span>
                  <input
                    value={draft.name}
                    onChange={(event) => updatePlanDraft(plan.id, { name: event.target.value })}
                    className="border border-steel/30 bg-transparent px-3 py-2 font-body text-sm text-bone"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="font-mono text-xs uppercase tracking-widest text-steel">Price (KES)</span>
                    <input
                      type="number"
                      min={0}
                      value={draft.priceKes}
                      onChange={(event) => updatePlanDraft(plan.id, { priceKes: event.target.value })}
                      className="border border-steel/30 bg-transparent px-3 py-2 font-body text-sm text-bone"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="font-mono text-xs uppercase tracking-widest text-steel">Cadence</span>
                    <input
                      value={draft.cadence}
                      onChange={(event) => updatePlanDraft(plan.id, { cadence: event.target.value })}
                      className="border border-steel/30 bg-transparent px-3 py-2 font-body text-sm text-bone"
                    />
                  </label>
                </div>
                <label className="flex flex-col gap-1">
                  <span className="font-mono text-xs uppercase tracking-widest text-steel">Intensity (1-8)</span>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={draft.intensity}
                    onChange={(event) => updatePlanDraft(plan.id, { intensity: event.target.value })}
                    className="border border-steel/30 bg-transparent px-3 py-2 font-body text-sm text-bone"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-mono text-xs uppercase tracking-widest text-steel">
                    Features (one per line)
                  </span>
                  <textarea
                    rows={4}
                    value={draft.featuresText}
                    onChange={(event) => updatePlanDraft(plan.id, { featuresText: event.target.value })}
                    className="border border-steel/30 bg-transparent px-3 py-2 font-body text-sm text-bone"
                  />
                </label>
                <label className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-steel">
                  <input
                    type="checkbox"
                    checked={draft.isActive}
                    onChange={(event) => updatePlanDraft(plan.id, { isActive: event.target.checked })}
                  />
                  Active (visible to clients)
                </label>
                <button
                  onClick={() => savePlan(plan.id)}
                  disabled={planStatus[plan.id] === "saving"}
                  className="rounded-sm bg-flame px-4 py-2 font-mono text-xs uppercase tracking-widest text-bone transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {planStatus[plan.id] === "saving" ? "Saving…" : "Save"}
                </button>
                {planStatus[plan.id] === "error" && (
                  <p className="font-body text-xs text-flame">Could not save.</p>
                )}
              </div>
            );
          })}
          {plans?.length === 0 && <p className="font-body text-steel">No plans yet.</p>}
        </div>
      </div>

      <div className="mt-16">
        <h2 className="font-display text-2xl uppercase text-bone">Product Images</h2>
        <p className="mt-2 font-body text-sm text-steel">
          Paste an image URL for each product — shown on the Supplements & Gym Wear page.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {products?.map((product) => (
            <div key={product.id} className="flex flex-col gap-3 border border-steel/20 bg-charcoal p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-display uppercase text-bone">{product.name}</p>
                  <p className="font-mono text-xs text-steel">
                    {product.category === "supplement" ? "Supplement" : "Gym Wear"} · KES{" "}
                    {product.price_kes.toLocaleString()}
                  </p>
                </div>
                {imageDrafts[product.id] && (
                  <img
                    src={imageDrafts[product.id]}
                    alt=""
                    className="h-12 w-12 shrink-0 border border-steel/20 object-cover"
                  />
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://…"
                  value={imageDrafts[product.id] ?? ""}
                  onChange={(event) =>
                    setImageDrafts((prev) => ({ ...prev, [product.id]: event.target.value }))
                  }
                  className="flex-1 border border-steel/30 bg-transparent px-3 py-2 font-body text-sm text-bone"
                />
                <button
                  onClick={() => saveProductImage(product.id)}
                  className="shrink-0 rounded-sm border border-steel/40 px-3 py-2 font-mono text-xs uppercase tracking-widest text-bone transition-colors hover:border-flame"
                >
                  Save
                </button>
              </div>
            </div>
          ))}
          {products?.length === 0 && <p className="font-body text-steel">No products yet.</p>}
        </div>
      </div>

      <div className="mt-16">
        <h2 className="font-display text-2xl uppercase text-bone">Progress Entries</h2>
        <form
          onSubmit={handleAddEntry}
          className="mt-6 grid gap-4 border border-steel/20 bg-charcoal p-6 md:grid-cols-2"
        >
          <label className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-steel">Client name</span>
            <input
              required
              value={form.clientName}
              onChange={(event) => setForm({ ...form, clientName: event.target.value })}
              className="border border-steel/30 bg-transparent px-4 py-2 font-body text-bone"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-steel">Summary (optional)</span>
            <input
              value={form.summary}
              onChange={(event) => setForm({ ...form, summary: event.target.value })}
              className="border border-steel/30 bg-transparent px-4 py-2 font-body text-bone"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-steel">Before image URL</span>
            <input
              required
              type="url"
              value={form.beforeImageUrl}
              onChange={(event) => setForm({ ...form, beforeImageUrl: event.target.value })}
              className="border border-steel/30 bg-transparent px-4 py-2 font-body text-bone"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-steel">After image URL</span>
            <input
              required
              type="url"
              value={form.afterImageUrl}
              onChange={(event) => setForm({ ...form, afterImageUrl: event.target.value })}
              className="border border-steel/30 bg-transparent px-4 py-2 font-body text-bone"
            />
          </label>
          <button
            type="submit"
            disabled={status === "submitting"}
            className="rounded-sm bg-flame px-6 py-3 font-mono text-xs uppercase tracking-widest text-bone transition-opacity hover:opacity-90 disabled:opacity-50 md:col-span-2"
          >
            {status === "submitting" ? "Adding…" : "Add entry"}
          </button>
          {status === "error" && <p className="font-body text-flame md:col-span-2">Could not add entry.</p>}
        </form>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {entries?.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between gap-4 border border-steel/20 bg-charcoal p-4">
              <div>
                <p className="font-display uppercase text-bone">{entry.client_name}</p>
                <p className="font-mono text-xs text-steel">{entry.is_published ? "Published" : "Draft"}</p>
              </div>
              <button
                onClick={() => togglePublish(entry.id, entry.is_published)}
                className="shrink-0 rounded-sm border border-steel/40 px-3 py-1 font-mono text-xs uppercase tracking-widest text-bone transition-colors hover:border-flame"
              >
                {entry.is_published ? "Unpublish" : "Publish"}
              </button>
            </div>
          ))}
          {entries?.length === 0 && <p className="font-body text-steel">No entries yet.</p>}
        </div>
      </div>

      <div className="mt-16">
        <h2 className="font-display text-2xl uppercase text-bone">Contact Messages</h2>
        <div className="mt-6 flex flex-col gap-4">
          {messages?.map((message) => (
            <div key={message.id} className="border border-steel/20 bg-charcoal p-4">
              <div className="flex flex-wrap justify-between gap-2 font-mono text-xs text-steel">
                <span>
                  {message.name} · {message.phone}
                  {message.email ? ` · ${message.email}` : ""}
                </span>
                <span>{new Date(message.created_at).toLocaleString()}</span>
              </div>
              <p className="mt-2 font-body text-sm text-bone">{message.message}</p>
            </div>
          ))}
          {messages?.length === 0 && <p className="font-body text-steel">No messages yet.</p>}
        </div>
      </div>
    </section>
  );
}
