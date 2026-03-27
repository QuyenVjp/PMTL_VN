import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  BoldIcon,
  Heading2Icon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  PilcrowIcon,
  QuoteIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const editorButtonClass =
  "rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground";

export function RichTextEditor({
  initialContent,
}: {
  initialContent: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Nhập nội dung biên tập...",
      }),
    ],
    content: initialContent,
    immediatelyRender: false,
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="flex flex-wrap gap-2 border-b bg-muted/40 p-3">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(editorButtonClass, editor.isActive("bold") && "bg-accent")}
        >
          <BoldIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(editorButtonClass, editor.isActive("italic") && "bg-accent")}
        >
          <ItalicIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(editorButtonClass, editor.isActive("heading", { level: 2 }) && "bg-accent")}
        >
          <Heading2Icon className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(editorButtonClass, editor.isActive("bulletList") && "bg-accent")}
        >
          <ListIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(editorButtonClass, editor.isActive("orderedList") && "bg-accent")}
        >
          <ListOrderedIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(editorButtonClass, editor.isActive("blockquote") && "bg-accent")}
        >
          <QuoteIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={cn(editorButtonClass, editor.isActive("paragraph") && "bg-accent")}
        >
          <PilcrowIcon className="size-4" />
        </button>

        <div className="ms-auto">
          <Button size="sm">Lưu draft</Button>
        </div>
      </div>

      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none px-4 py-4 dark:prose-invert [&_.ProseMirror]:min-h-[340px] [&_.ProseMirror]:outline-none"
      />
    </div>
  );
}
