import React, { createContext, useContext, useState } from "react";
import type { GuideItem } from "@/features/guides/queries";

export type GuideDialogType = "create" | "edit" | "publish" | null;

type GuidesContextValue = {
  open: GuideDialogType;
  currentRow: GuideItem | null;
  setOpen: (value: GuideDialogType) => void;
  setCurrentRow: React.Dispatch<React.SetStateAction<GuideItem | null>>;
};

const GuidesContext = createContext<GuidesContextValue | null>(null);

export function GuidesProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<GuideDialogType>(null);
  const [currentRow, setCurrentRow] = useState<GuideItem | null>(null);

  return (
    <GuidesContext.Provider value={{ open, currentRow, setOpen, setCurrentRow }}>
      {children}
    </GuidesContext.Provider>
  );
}

export function useGuides() {
  const context = useContext(GuidesContext);
  if (!context) throw new Error("useGuides must be used within GuidesProvider");
  return context;
}
