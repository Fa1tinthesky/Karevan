import { SessionContext } from "../context/SessionContext";
import { useState, useEffect } from "react";
import supabase from "../supabase/index";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import LoadingPage from "../pages/LoadingPage";
import type { Session } from "@supabase/supabase-js";
import { fetchCurrentUser } from "../context/SessionContext";
import { userKeys } from "../context/SessionContext";


type Props = { children: React.ReactNode };

export const SessionProvider = ({ children }: Props) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const { data: authStateListener } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        setSession(session);
        setIsAuthLoading(false);

        // Clear user cache on sign out
        if (!session) {
          queryClient.removeQueries({ queryKey: userKeys.me() });
        }
      },
    );

    return () => {
      authStateListener.subscription.unsubscribe();
    };
  }, [queryClient]);

  const { data: user = null, isLoading: isLoadingUser } = useQuery({
    queryKey: userKeys.me(),
    queryFn: () => fetchCurrentUser(session!.user.id),
    enabled: !!session?.user.id, // Only runs when session exists
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1,
  });

  const isLoading = isAuthLoading || (!!session && isLoadingUser);

  return (
    <SessionContext.Provider value={{ session, user, isLoadingUser }}>
      {isLoading ? <LoadingPage /> : children}
    </SessionContext.Provider>
  );
};
