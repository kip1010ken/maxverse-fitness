import { useEffect, useState } from "react";
import { useAuth, UserButton } from "@clerk/clerk-react";

type Profile = {
  id: string;
  phone: string | null;
  full_name: string | null;
  created_at: string;
};

export default function Account() {
  const { getToken } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      const token = await getToken();
      const response = await fetch("/.netlify/functions/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = (await response.json()) as Profile;
      if (!cancelled) {
        setProfile(data);
      }
    }

    loadProfile().catch(() => {
      if (!cancelled) {
        setError(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [getToken]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl uppercase text-bone sm:text-4xl">My Account</h1>
        <UserButton afterSignOutUrl="/" />
      </div>

      {error && <p className="mt-4 font-body text-flame">Could not load your profile.</p>}
      {!error && !profile && (
        <p className="mt-4 font-mono text-xs uppercase tracking-widest text-steel">Loading…</p>
      )}

      {profile && (
        <dl className="mt-8 grid max-w-md gap-4 font-mono text-sm text-bone">
          <div>
            <dt className="text-steel">Client ID</dt>
            <dd>{profile.id}</dd>
          </div>
          <div>
            <dt className="text-steel">Member since</dt>
            <dd>{new Date(profile.created_at).toLocaleDateString()}</dd>
          </div>
        </dl>
      )}
    </section>
  );
}
