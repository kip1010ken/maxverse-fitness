import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/plans", label: "Plans" },
  { to: "/meal-plans", label: "Meal Plans" },
  { to: "/supplements", label: "Supplements" },
  { to: "/contact", label: "Contact" },
];

export default function NavBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-steel/20 bg-charcoal/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <NavLink to="/" className="font-display text-xl tracking-wide text-bone">
          MAXVERSE
        </NavLink>
        <ul className="hidden gap-8 md:flex">
          {links.slice(1).map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `font-mono text-xs uppercase tracking-widest transition-colors ${
                    isActive ? "text-flame" : "text-steel hover:text-bone"
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <NavLink
          to="/contact"
          className="rounded-sm bg-flame px-4 py-2 font-mono text-xs uppercase tracking-widest text-bone transition-opacity hover:opacity-90"
        >
          Book a session
        </NavLink>
      </nav>
    </header>
  );
}
