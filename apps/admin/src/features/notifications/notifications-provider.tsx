import React, { createContext, useContext, useState } from "react";
import type { PushJobItem } from "./queries.js";

type NotifDialogType = "create" | "redrive" | "delete" | null;

type NotifContextValue = {
  open: NotifDialogType;
  currentRow: PushJobItem | null;
  setOpen: (value: NotifDialogType) => void;
  setCurrentRow: React.Dispatch<React.SetStateAction<PushJobItem | null>>;
};

const NotifContext = createContext<NotifContextValue | null>(null);

export function NotifProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<NotifDialogType>(null);
  const [currentRow, setCurrentRow] = useState<PushJobItem | null>(null);
  return (
    <NotifContext.Provider value={{ open, currentRow, setOpen, setCurrentRow }}>
      {children}
    </NotifContext.Provider>
  );
}

export function useNotif() {
  const ctx = useContext(NotifContext);
  if (!ctx) throw new Error("useNotif must be used within NotifProvider");
  return ctx;
}
