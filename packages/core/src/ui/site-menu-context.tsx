import React, { createContext, useContext } from "react";
import type { SiteMenuConfigItem } from "../types";

interface SiteMenuContextType {
  menuItems: SiteMenuConfigItem[];
}

const SiteMenuContext = createContext<SiteMenuContextType | undefined>(undefined);

export function SiteMenuProvider({
  menuItems,
  children,
}: {
  menuItems: SiteMenuConfigItem[];
  children: React.ReactNode;
}) {
  return (
    <SiteMenuContext.Provider value={{ menuItems }}>
      {children}
    </SiteMenuContext.Provider>
  );
}

export function useSiteMenu() {
  const context = useContext(SiteMenuContext);
  if (context === undefined) {
    throw new Error("useSiteMenu must be used within a SiteMenuProvider");
  }
  return context;
}
