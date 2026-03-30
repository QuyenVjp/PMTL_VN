import React, { createContext, useContext, useState } from "react";
import type { DownloadItem } from "@/features/downloads/queries";

export type DownloadDialogType = "create" | "edit" | "detail" | "publish" | "delete" | null;

type DownloadsContextValue = {
  open: DownloadDialogType;
  currentRow: DownloadItem | null;
  setOpen: (value: DownloadDialogType) => void;
  setCurrentRow: React.Dispatch<React.SetStateAction<DownloadItem | null>>;
};

const DownloadsContext = createContext<DownloadsContextValue | null>(null);

export function DownloadsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<DownloadDialogType>(null);
  const [currentRow, setCurrentRow] = useState<DownloadItem | null>(null);

  return (
    <DownloadsContext.Provider value={{ open, currentRow, setOpen, setCurrentRow }}>
      {children}
    </DownloadsContext.Provider>
  );
}

export function useDownloads() {
  const context = useContext(DownloadsContext);
  if (!context) throw new Error("useDownloads must be used within DownloadsProvider");
  return context;
}
