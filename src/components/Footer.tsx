export default function Footer() {
  return (
    <footer className="border-t border-steel/20 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <p className="font-display text-lg uppercase text-bone">Maxverse Fitness</p>
        <p className="font-mono text-xs uppercase tracking-widest text-steel">
          Nairobi, Kenya · © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
