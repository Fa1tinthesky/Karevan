import { createContext, useContext } from "react";
import supabase from "../supabase";
import { Session } from "@supabase/supabase-js";

// ── Types ──────────────────────────────────────────────────────
type DbUser = {
  id: string;
  username: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  wallet: {
    id: string;
    balance: number;
    lockedBalance: number;
    currency: string;
  } | null;
};

type SessionContextType = {
  session: Session | null;
  user: DbUser | null;
  isLoadingUser: boolean;
};

// ── Context ────────────────────────────────────────────────────
export const SessionContext = createContext<SessionContextType>({
  session: null,
  user: null,
  isLoadingUser: false,
});

// ── Query key factory — import this anywhere you need to
//    invalidate or access the user cache ─────────────────────
export const userKeys = {
  me: () => ["user", "me"] as const,
};

// ── The fetch function — reusable outside the provider ────────
export async function fetchCurrentUser(userId: string): Promise<DbUser> {
  const { data, error } = await supabase
    .from("User")
    .select(
      `
      id,
      username,
      email,
      name,
      avatarUrl,
      phone,
      createdAt,
      updatedAt,
      wallet:Wallet (
        id,
        balance,
        lockedBalance,
        currency
      )
    `,
    )
    .eq("id", userId)
    .single();

  if (error) throw error;

  // Supabase returns one-to-one relations as an array — normalize it
  const raw = data as any;
  return {
    ...raw,
    wallet: Array.isArray(raw.wallet) ? (raw.wallet[0] ?? null) : raw.wallet,
  } as DbUser;
}

// ── useSession — drop-in replacement for your existing hook ───
export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};

// ── useCurrentUser — use this everywhere in the app ───────────
// Reads directly from TanStack cache — no extra fetch
export const useCurrentUser = () => {
  const { user, isLoadingUser } = useContext(SessionContext);
  return { user, isLoading: isLoadingUser };
};
