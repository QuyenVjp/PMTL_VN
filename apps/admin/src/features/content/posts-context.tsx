import React, { createContext, useContext, useState } from "react";
import type { PostListItem } from "@/features/content/queries";

export type PostDialogType = "create" | "edit" | "publish" | "delete" | null;

type PostsContextValue = {
  open: PostDialogType;
  currentRow: PostListItem | null;
  setOpen: (value: PostDialogType) => void;
  setCurrentRow: React.Dispatch<React.SetStateAction<PostListItem | null>>;
};

const PostsContext = createContext<PostsContextValue | null>(null);

export function PostsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<PostDialogType>(null);
  const [currentRow, setCurrentRow] = useState<PostListItem | null>(null);

  return (
    <PostsContext.Provider value={{ open, currentRow, setOpen, setCurrentRow }}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostsContext);
  if (!context) throw new Error("usePosts must be used within PostsProvider");
  return context;
}
