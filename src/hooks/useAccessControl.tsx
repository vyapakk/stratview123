import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface AccessGrant {
  dashboard_id: string;
  valid_from: string;
  valid_to: string | null;
}

export const useAccessControl = () => {
  const { user, isAdmin } = useAuth();
  const [grants, setGrants] = useState<AccessGrant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGrants = useCallback(async () => {
    if (!user) {
      setGrants([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("dashboard_access")
        .select("dashboard_id, valid_from, valid_to")
        .eq("user_id", user.id);

      if (error) throw error;
      setGrants(data || []);
    } catch (err) {
      console.error("Failed to fetch access grants:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGrants();
  }, [fetchGrants]);

  const accessSet = useMemo(() => {
    const now = new Date().toISOString();
    const set = new Set<string>();
    for (const g of grants) {
      const isActive = g.valid_from <= now && (!g.valid_to || g.valid_to > now);
      if (isActive) set.add(g.dashboard_id);
    }
    return set;
  }, [grants]);

  const hasAccess = useCallback(
    (dashboardId: string) => {
      if (isAdmin) return true;
      return accessSet.has(dashboardId);
    },
    [isAdmin, accessSet]
  );

  /** Active grants with validity dates (for MyAccount subscriptions) */
  const activeGrants = useMemo(() => {
    const now = new Date().toISOString();
    return grants.filter(
      (g) => g.valid_from <= now && (!g.valid_to || g.valid_to > now)
    );
  }, [grants]);

  return { hasAccess, activeGrants, isLoading, refetch: fetchGrants };
};
