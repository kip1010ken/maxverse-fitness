import { useState } from "react";
import type { FormEvent } from "react";
import { buildWhatsAppLink } from "../services/whatsapp";

type Status = "idle" | "submitting" | "success" | "error";

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: data.get("name"),
      phone: data.get("phone"),
      email: data.get("email"),
      message: data.get("message"),
    };

    try {
      const response = await fetch("/.netlify/functions/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Request failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-4xl uppercase text-bone">Contact</h1>
      <p className="mt-4 font-body text-steel">
        Send a message and we'll get back to you, or{" "}
        <a
          href={buildWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="text-flame"
        >
          message us directly on WhatsApp
        </a>
        .
      </p>

      <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-widest text-steel">Name</span>
          <input
            name="name"
            required
            maxLength={100}
            className="border border-steel/30 bg-transparent px-4 py-3 font-body text-bone"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-widest text-steel">Phone</span>
          <input
            name="phone"
            required
            placeholder="254712345678"
            pattern="^\+?\d{9,15}$"
            className="border border-steel/30 bg-transparent px-4 py-3 font-body text-bone"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-widest text-steel">
            Email (optional)
          </span>
          <input
            name="email"
            type="email"
            maxLength={200}
            className="border border-steel/30 bg-transparent px-4 py-3 font-body text-bone"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-widest text-steel">Message</span>
          <textarea
            name="message"
            required
            maxLength={2000}
            rows={5}
            className="border border-steel/30 bg-transparent px-4 py-3 font-body text-bone"
          />
        </label>

        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded-sm bg-flame px-6 py-3 font-mono text-sm uppercase tracking-widest text-bone transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {status === "submitting" ? "Sending…" : "Send message"}
        </button>

        {status === "success" && (
          <p className="font-body text-moss">Message sent — we'll be in touch.</p>
        )}
        {status === "error" && (
          <p className="font-body text-flame">Something went wrong, please try again or use WhatsApp.</p>
        )}
      </form>
    </section>
  );
}
