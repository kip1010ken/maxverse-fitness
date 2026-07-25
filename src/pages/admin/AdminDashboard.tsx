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

type AdminMealPlan = {
  id: string;
  name: string;
  price_kes: number;
  description: string;
  is_active: boolean;
};

type MealPlanDraft = {
  name: string;
  priceKes: string;
  description: string;
  isActive: boolean;
};

type AdminOrder = {
  id: string;
  item_type: "plan" | "product";
  item_name: string;
  amount_kes: number;
  phone: string;
  recipient_name: string | null;
  delivery_address: string | null;
  delivery_notes: string | null;
  status: "pending" | "paid" | "failed" | "cancelled";
  mpesa_receipt_number: string | null;
  created_at: string;
};

const emptyForm = { clientName: "", beforeImageUrl: "", afterImageUrl: "", summary: "" };

const emptyProductForm = {
  category: "supplement" as "supplement" | "gym_wear",
  name: "",
  priceKes: "",
  note: "",
  imageUrl: "",
};

const emptyMealPlanForm = { name: "", priceKes: "", description: "" };

const ORDER_STATUS_COLOR: Record<AdminOrder["status"], string> = {
  paid: "text-moss",
  failed: "text-flame",
  cancelled: "text-flame",
  pending: "text-steel",
};

export default function AdminDashboard() {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[] | null>(null);
  const [entries, setEntries] = useState<ProgressEntry[] | null>(null);
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [imageDrafts, setImageDrafts] = useState<Record<string, string>>({});
  const [plans, setPlans] = useState<AdminPlan[] | null>(null);
  const [planDrafts, setPlanDrafts] = useState<Record<string, PlanDraft>>({});
  const [planStatus, setPlanStatus] = useState<Record<string, "idle" | "saving" | "error">>({});
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [productFormStatus, setProductFormStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [mealPlans, setMealPlans] = useState<AdminMealPlan[] | null>(null);
  const [mealPlanDrafts, setMealPlanDrafts] = useState<Record<string, MealPlanDraft>>({});
  const [mealPlanStatus, setMealPlanStatus] = useState<Record<string, "idle" | "saving" | "error">>({});
  const [mealPlanForm, setMealPlanForm] = useState(emptyMealPlanForm);
  const [mealPlanFormStatus, setMealPlanFormStatus] = useState<"idle" | "submitting" | "error">("idle");

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

  async function loadOrders() {
    const response = await authedFetch("/.netlify/functions/admin-orders");
    if (response.ok) setOrders(await response.json());
  }

  async function loadMealPlans() {
    const response = await authedFetch("/.netlify/functions/admin-meal-plans");
    if (response.ok) {
      const data: AdminMealPlan[] = await response.json();
      setMealPlans(data);
      setMealPlanDrafts(
        Object.fromEntries(
          data.map((plan) => [
            plan.id,
            {
              name: plan.name,
              priceKes: String(plan.price_kes),
              description: plan.description,
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
    loadOrders();
    loadMealPlans();
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

  async function handleAddProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProductFormStatus("submitting");

    try {
      const response = await authedFetch("/.netlify/functions/admin-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: productForm.category,
          name: productForm.name,
          priceKes: Number(productForm.priceKes),
          note: productForm.note,
          imageUrl: productForm.imageUrl,
        }),
      });

      if (!response.ok) throw new Error("Failed");

      setProductForm(emptyProductForm);
      setProductFormStatus("idle");
      loadProducts();
    } catch {
      setProductFormStatus("error");
    }
  }

  async function deleteProduct(id: string, name: string) {
    if (!window.confirm(`Remove "${name}"? This can't be undone.`)) {
      return;
    }

    await authedFetch(`/.netlify/functions/admin-products?id=${id}`, { method: "DELETE" });
    loadProducts();
  }

  function updateMealPlanDraft(id: string, patch: Partial<MealPlanDraft>) {
    setMealPlanDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  async function saveMealPlan(id: string) {
    const draft = mealPlanDrafts[id];
    if (!draft) return;

    setMealPlanStatus((prev) => ({ ...prev, [id]: "saving" }));

    try {
      const response = await authedFetch("/.netlify/functions/admin-meal-plans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: draft.name,
          priceKes: Number(draft.priceKes),
          description: draft.description,
          isActive: draft.isActive,
        }),
      });

      if (!response.ok) throw new Error("Failed");

      setMealPlanStatus((prev) => ({ ...prev, [id]: "idle" }));
      loadMealPlans();
    } catch {
      setMealPlanStatus((prev) => ({ ...prev, [id]: "error" }));
    }
  }

  async function handleAddMealPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMealPlanFormStatus("submitting");

    try {
      const response = await authedFetch("/.netlify/functions/admin-meal-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: mealPlanForm.name,
          priceKes: Number(mealPlanForm.priceKes),
          description: mealPlanForm.description,
        }),
      });

      if (!response.ok) throw new Error("Failed");

      setMealPlanForm(emptyMealPlanForm);
      setMealPlanFormStatus("idle");
      loadMealPlans();
    } catch {
      setMealPlanFormStatus("error");
    }
  }

  async function deleteMealPlan(id: string, name: string) {
    if (!window.confirm(`Remove "${name}"? This can't be undone.`)) {
      return;
    }

    await authedFetch(`/.netlify/functions/admin-meal-plans?id=${id}`, { method: "DELETE" });
    loadMealPlans();
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
        <h2 className="font-display text-2xl uppercase text-bone">Meal Plans</h2>
        <p className="mt-2 font-body text-sm text-steel">
          Changes apply immediately on the Meal Plans page.
        </p>

        <form
          onSubmit={handleAddMealPlan}
          className="mt-6 grid gap-4 border border-steel/20 bg-charcoal p-6 md:grid-cols-2"
        >
          <label className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-steel">Name</span>
            <input
              required
              value={mealPlanForm.name}
              onChange={(event) => setMealPlanForm({ ...mealPlanForm, name: event.target.value })}
              className="border border-steel/30 bg-transparent px-4 py-2 font-body text-bone"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-steel">Price (KES)</span>
            <input
              required
              type="number"
              min={1}
              value={mealPlanForm.priceKes}
              onChange={(event) => setMealPlanForm({ ...mealPlanForm, priceKes: event.target.value })}
              className="border border-steel/30 bg-transparent px-4 py-2 font-body text-bone"
            />
          </label>
          <label className="flex flex-col gap-2 md:col-span-2">
            <span className="font-mono text-xs uppercase tracking-widest text-steel">Description</span>
            <textarea
              required
              rows={3}
              value={mealPlanForm.description}
              onChange={(event) => setMealPlanForm({ ...mealPlanForm, description: event.target.value })}
              className="border border-steel/30 bg-transparent px-4 py-2 font-body text-bone"
            />
          </label>
          <button
            type="submit"
            disabled={mealPlanFormStatus === "submitting"}
            className="rounded-sm bg-flame px-6 py-3 font-mono text-xs uppercase tracking-widest text-bone transition-opacity hover:opacity-90 disabled:opacity-50 md:col-span-2"
          >
            {mealPlanFormStatus === "submitting" ? "Adding…" : "Add meal plan"}
          </button>
          {mealPlanFormStatus === "error" && (
            <p className="font-body text-flame md:col-span-2">
              Could not add meal plan — check the name isn't already used.
            </p>
          )}
        </form>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {mealPlans?.map((plan) => {
            const draft = mealPlanDrafts[plan.id];
            if (!draft) return null;

            return (
              <div key={plan.id} className="flex flex-col gap-3 border border-steel/20 bg-charcoal p-4">
                <label className="flex flex-col gap-1">
                  <span className="font-mono text-xs uppercase tracking-widest text-steel">Name</span>
                  <input
                    value={draft.name}
                    onChange={(event) => updateMealPlanDraft(plan.id, { name: event.target.value })}
                    className="border border-steel/30 bg-transparent px-3 py-2 font-body text-sm text-bone"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-mono text-xs uppercase tracking-widest text-steel">Price (KES)</span>
                  <input
                    type="number"
                    min={1}
                    value={draft.priceKes}
                    onChange={(event) => updateMealPlanDraft(plan.id, { priceKes: event.target.value })}
                    className="border border-steel/30 bg-transparent px-3 py-2 font-body text-sm text-bone"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-mono text-xs uppercase tracking-widest text-steel">Description</span>
                  <textarea
                    rows={3}
                    value={draft.description}
                    onChange={(event) => updateMealPlanDraft(plan.id, { description: event.target.value })}
                    className="border border-steel/30 bg-transparent px-3 py-2 font-body text-sm text-bone"
                  />
                </label>
                <label className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-steel">
                  <input
                    type="checkbox"
                    checked={draft.isActive}
                    onChange={(event) => updateMealPlanDraft(plan.id, { isActive: event.target.checked })}
                  />
                  Active (visible to clients)
                </label>
                <button
                  onClick={() => saveMealPlan(plan.id)}
                  disabled={mealPlanStatus[plan.id] === "saving"}
                  className="rounded-sm bg-flame px-4 py-2 font-mono text-xs uppercase tracking-widest text-bone transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {mealPlanStatus[plan.id] === "saving" ? "Saving…" : "Save"}
                </button>
                {mealPlanStatus[plan.id] === "error" && (
                  <p className="font-body text-xs text-flame">Could not save.</p>
                )}
                <button
                  onClick={() => deleteMealPlan(plan.id, plan.name)}
                  className="self-start font-mono text-xs uppercase tracking-widest text-flame hover:underline"
                >
                  Remove
                </button>
              </div>
            );
          })}
          {mealPlans?.length === 0 && <p className="font-body text-steel">No meal plans yet.</p>}
        </div>
      </div>

      <div className="mt-16">
        <h2 className="font-display text-2xl uppercase text-bone">Products</h2>
        <p className="mt-2 font-body text-sm text-steel">
          Add, edit images for, or remove supplements and gym wear — changes apply immediately on
          the Supplements & Gym Wear page.
        </p>

        <form
          onSubmit={handleAddProduct}
          className="mt-6 grid gap-4 border border-steel/20 bg-charcoal p-6 md:grid-cols-2"
        >
          <label className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-steel">Category</span>
            <select
              value={productForm.category}
              onChange={(event) =>
                setProductForm({ ...productForm, category: event.target.value as "supplement" | "gym_wear" })
              }
              className="border border-steel/30 bg-charcoal px-4 py-2 font-body text-bone"
            >
              <option value="supplement">Supplement</option>
              <option value="gym_wear">Gym Wear</option>
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-steel">Name</span>
            <input
              required
              value={productForm.name}
              onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
              className="border border-steel/30 bg-transparent px-4 py-2 font-body text-bone"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-steel">Price (KES)</span>
            <input
              required
              type="number"
              min={1}
              value={productForm.priceKes}
              onChange={(event) => setProductForm({ ...productForm, priceKes: event.target.value })}
              className="border border-steel/30 bg-transparent px-4 py-2 font-body text-bone"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-steel">Note (optional)</span>
            <input
              placeholder="e.g. 900g · Vanilla / Chocolate"
              value={productForm.note}
              onChange={(event) => setProductForm({ ...productForm, note: event.target.value })}
              className="border border-steel/30 bg-transparent px-4 py-2 font-body text-bone"
            />
          </label>
          <label className="flex flex-col gap-2 md:col-span-2">
            <span className="font-mono text-xs uppercase tracking-widest text-steel">Image URL (optional)</span>
            <input
              type="url"
              placeholder="https://…"
              value={productForm.imageUrl}
              onChange={(event) => setProductForm({ ...productForm, imageUrl: event.target.value })}
              className="border border-steel/30 bg-transparent px-4 py-2 font-body text-bone"
            />
          </label>
          <button
            type="submit"
            disabled={productFormStatus === "submitting"}
            className="rounded-sm bg-flame px-6 py-3 font-mono text-xs uppercase tracking-widest text-bone transition-opacity hover:opacity-90 disabled:opacity-50 md:col-span-2"
          >
            {productFormStatus === "submitting" ? "Adding…" : "Add product"}
          </button>
          {productFormStatus === "error" && (
            <p className="font-body text-flame md:col-span-2">
              Could not add product — check the name isn't already used in that category.
            </p>
          )}
        </form>

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
              <button
                onClick={() => deleteProduct(product.id, product.name)}
                className="self-start font-mono text-xs uppercase tracking-widest text-flame hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
          {products?.length === 0 && <p className="font-body text-steel">No products yet.</p>}
        </div>
      </div>

      <div className="mt-16">
        <h2 className="font-display text-2xl uppercase text-bone">Orders</h2>
        <p className="mt-2 font-body text-sm text-steel">
          Product orders include a delivery address — plans have nothing to ship.
        </p>
        <div className="mt-6 flex flex-col gap-4">
          {orders?.map((order) => (
            <div key={order.id} className="border border-steel/20 bg-charcoal p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-steel">
                <span>
                  {order.item_name} · KES {order.amount_kes.toLocaleString()} · {order.phone}
                </span>
                <span className={ORDER_STATUS_COLOR[order.status]}>{order.status.toUpperCase()}</span>
              </div>
              {order.item_type === "product" &&
                (order.recipient_name || order.delivery_address || order.delivery_notes) && (
                  <div className="mt-2 font-body text-sm text-bone">
                    {order.recipient_name && <p>Recipient: {order.recipient_name}</p>}
                    {order.delivery_address && <p>Address: {order.delivery_address}</p>}
                    {order.delivery_notes && <p>Notes: {order.delivery_notes}</p>}
                  </div>
                )}
              <p className="mt-2 font-mono text-xs text-steel">
                {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
          ))}
          {orders?.length === 0 && <p className="font-body text-steel">No orders yet.</p>}
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
