import { useEffect, useState } from "react";

type ProgressEntry = {
  id: string;
  client_name: string;
  before_image_url: string;
  after_image_url: string;
  summary: string | null;
};

export default function Progress() {
  const [entries, setEntries] = useState<ProgressEntry[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/.netlify/functions/progress")
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then(setEntries)
      .catch(() => setError(true));
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-4xl uppercase text-bone">Client Results</h1>
      <p className="mt-4 max-w-xl font-body text-steel">
        Real transformations from Maxverse clients — in-person and virtual.
      </p>

      {error && (
        <p className="mt-8 font-body text-steel">Couldn't load results right now — check back soon.</p>
      )}

      {!error && entries === null && (
        <p className="mt-8 font-mono text-xs uppercase tracking-widest text-steel">Loading…</p>
      )}

      {entries?.length === 0 && (
        <p className="mt-8 font-body text-steel">New results coming soon.</p>
      )}

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        {entries?.map((entry) => (
          <article key={entry.id} className="border border-steel/20 bg-charcoal p-6">
            <div className="grid grid-cols-2 gap-2">
              <figure>
                <img
                  src={entry.before_image_url}
                  alt={`${entry.client_name} before`}
                  className="aspect-square w-full object-cover"
                />
                <figcaption className="mt-2 font-mono text-xs uppercase tracking-widest text-steel">
                  Before
                </figcaption>
              </figure>
              <figure>
                <img
                  src={entry.after_image_url}
                  alt={`${entry.client_name} after`}
                  className="aspect-square w-full object-cover"
                />
                <figcaption className="mt-2 font-mono text-xs uppercase tracking-widest text-steel">
                  After
                </figcaption>
              </figure>
            </div>
            <h3 className="mt-4 font-display text-xl uppercase text-bone">{entry.client_name}</h3>
            {entry.summary && <p className="mt-2 font-body text-sm text-steel">{entry.summary}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}
