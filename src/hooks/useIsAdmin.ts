import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";

export function useIsAdmin(): boolean | null {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      setIsAdmin(false);
      return;
    }

    let cancelled = false;

    getToken()
      .then((token) => fetch("/.netlify/functions/whoami", { headers: { Authorization: `Bearer ${token}` } }))
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setIsAdmin(Boolean(data.isAdmin));
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, getToken]);

  return isAdmin;
}
