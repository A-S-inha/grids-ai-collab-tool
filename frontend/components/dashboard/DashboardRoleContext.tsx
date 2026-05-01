"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type DashboardRole = "lead" | "member";

const STORAGE_KEY = "ai-colab-dashboard-role";

type Ctx = {
  role: DashboardRole;
  setRole: (r: DashboardRole) => void;
};

const DashboardRoleContext = createContext<Ctx | null>(null);

export function DashboardRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<DashboardRole>(() => {
    if (typeof window === "undefined") return "lead";
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === "member" || v === "lead") return v;
    } catch {
      /* ignore */
    }
    return "lead";
  });

  const setRole = useCallback((r: DashboardRole) => {
    setRoleState(r);
    try {
      localStorage.setItem(STORAGE_KEY, r);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <DashboardRoleContext.Provider value={{ role, setRole }}>
      {children}
    </DashboardRoleContext.Provider>
  );
}

export function useDashboardRole() {
  const ctx = useContext(DashboardRoleContext);
  if (!ctx) {
    throw new Error("useDashboardRole must be used within DashboardRoleProvider");
  }
  return ctx;
}
