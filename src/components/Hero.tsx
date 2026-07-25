import LoadBar from "./LoadBar";

export default function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:py-32">
      <LoadBar filled={3} total={8} label="Nairobi · In-person & virtual" />
      <h1 className="mt-8 font-display text-5xl uppercase leading-[0.95] text-bone md:text-7xl">
        Training built
        <br />
        <span className="text-flame">plate by plate.</span>
      </h1>
      <p className="mt-6 max-w-xl font-body text-lg text-steel">
        Coaching, meal plans, and supplement guidance from a competing
        bodybuilder — delivered in person in Nairobi or virtually,
        wherever you train.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <a
          href="/plans"
          className="rounded-sm bg-flame px-6 py-3 font-mono text-sm uppercase tracking-widest text-bone transition-opacity hover:opacity-90"
        >
          See plans
        </a>
        <a
          href="/contact"
          className="rounded-sm border border-steel/40 px-6 py-3 font-mono text-sm uppercase tracking-widest text-bone transition-colors hover:border-bone"
        >
          Message on WhatsApp
        </a>
      </div>
    </section>
  );
}
