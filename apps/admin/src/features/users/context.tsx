import React, { createContext, useContext, useState } from "react";

import type { AdminUserListItem } from "@/features/users/types";

export type DialogType = "edit" | "block" | "unblock" | "role" | null;

type UsersContextValue = {
  open: DialogType;
  currentRow: AdminUserListItem | null;
  setOpen: (value: DialogType) => void;
  setCurrentRow: React.Dispatch<React.SetStateAction<AdminUserListItem | null>>;
};

const UsersContext = createContext<UsersContextValue | null>(null);

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<DialogType>(null);
  const [currentRow, setCurrentRow] = useState<AdminUserListItem | null>(null);

  return (
    <UsersContext.Provider value={{ open, currentRow, setOpen, setCurrentRow }}>
      {children}
    </UsersContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error("useUsers must be used within UsersProvider");
  }
  return context;
}
