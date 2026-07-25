import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-xl px-6 py-16 text-center">
      <h1 className="font-display text-3xl uppercase text-bone">Page not found</h1>
      <p className="mt-4 font-body text-steel">The page you're looking for doesn't exist.</p>
      <Link
        to="/"
        className="mt-8 inline-block rounded-sm bg-flame px-6 py-3 font-mono text-sm uppercase tracking-widest text-bone transition-opacity hover:opacity-90"
      >
        Back to home
      </Link>
    </section>
  );
}
