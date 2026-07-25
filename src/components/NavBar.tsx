import { useState } from "react";
import { NavLink } from "react-router-dom";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { useIsAdmin } from "../hooks/useIsAdmin";

const links = [
  { to: "/", label: "Home" },
  { to: "/plans", label: "Plans" },
  { to: "/meal-plans", label: "Meal Plans" },
  { to: "/supplements", label: "Supplements" },
  { to: "/progress", label: "Results" },
  { to: "/contact", label: "Contact" },
];

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAdmin = useIsAdmin();

  return (
    <header className="sticky top-0 z-50 border-b border-steel/20 bg-charcoal/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <NavLink
          to="/"
          className="font-display text-xl tracking-wide text-bone"
          onClick={() => setIsMenuOpen(false)}
        >
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
        <div className="flex items-center gap-3 sm:gap-4">
          <SignedIn>
            {isAdmin && (
              <NavLink
                to="/admin"
                className="hidden font-mono text-xs uppercase tracking-widest text-steel hover:text-bone md:block"
              >
                Dashboard
              </NavLink>
            )}
            <NavLink
              to="/account"
              className="hidden font-mono text-xs uppercase tracking-widest text-steel hover:text-bone md:block"
            >
              My Account
            </NavLink>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <NavLink
              to="/sign-in"
              className="hidden font-mono text-xs uppercase tracking-widest text-steel hover:text-bone md:block"
            >
              Sign in
            </NavLink>
          </SignedOut>
          <NavLink
            to="/contact"
            className="rounded-sm bg-flame px-4 py-2 font-mono text-xs uppercase tracking-widest text-bone transition-opacity hover:opacity-90"
          >
            Book a session
          </NavLink>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center border border-steel/30 text-bone md:hidden"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2} aria-hidden="true">
              {isMenuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div id="mobile-menu" className="border-t border-steel/20 md:hidden">
          <ul className="flex flex-col px-6 py-2">
            {links.slice(1).map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `block py-3 font-mono text-sm uppercase tracking-widest ${
                      isActive ? "text-flame" : "text-steel hover:text-bone"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            <li>
              <SignedIn>
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-3 font-mono text-sm uppercase tracking-widest text-steel hover:text-bone"
                  >
                    Dashboard
                  </NavLink>
                )}
                <NavLink
                  to="/account"
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-3 font-mono text-sm uppercase tracking-widest text-steel hover:text-bone"
                >
                  My Account
                </NavLink>
              </SignedIn>
              <SignedOut>
                <NavLink
                  to="/sign-in"
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-3 font-mono text-sm uppercase tracking-widest text-steel hover:text-bone"
                >
                  Sign in
                </NavLink>
              </SignedOut>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
