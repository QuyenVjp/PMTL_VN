import * as React from "react";
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
import { cn } from "@/lib/utils";

const editorButtonClass =
  "inline-flex size-9 items-center justify-center rounded-md border border-input bg-background text-sm transition-colors hover:bg-accent hover:text-accent-foreground";

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Nhập nội dung biên tập...",
  minHeight = 180,
}: {
  value: string;
  onChange?: (nextValue: string) => void;
  placeholder?: string;
  minHeight?: number;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value || "<p></p>",
    immediatelyRender: false,
    onUpdate: ({ editor: nextEditor }) => {
      onChange?.(nextEditor.getHTML());
    },
  });

  React.useEffect(() => {
    if (!editor) {
      return;
    }

    const currentValue = editor.getHTML();
    const normalizedIncoming = value || "<p></p>";

    if (currentValue !== normalizedIncoming) {
      editor.commands.setContent(normalizedIncoming, { emitUpdate: false });
    }
  }, [editor, value]);

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
          aria-label="In đậm"
        >
          <BoldIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(editorButtonClass, editor.isActive("italic") && "bg-accent")}
          aria-label="In nghiêng"
        >
          <ItalicIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(editorButtonClass, editor.isActive("heading", { level: 2 }) && "bg-accent")}
          aria-label="Tiêu đề cấp 2"
        >
          <Heading2Icon className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(editorButtonClass, editor.isActive("bulletList") && "bg-accent")}
          aria-label="Danh sách chấm"
        >
          <ListIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(editorButtonClass, editor.isActive("orderedList") && "bg-accent")}
          aria-label="Danh sách số"
        >
          <ListOrderedIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(editorButtonClass, editor.isActive("blockquote") && "bg-accent")}
          aria-label="Trích dẫn"
        >
          <QuoteIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={cn(editorButtonClass, editor.isActive("paragraph") && "bg-accent")}
          aria-label="Đoạn văn"
        >
          <PilcrowIcon className="size-4" />
        </button>
      </div>

      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none px-4 py-4 dark:prose-invert [&_.ProseMirror]:min-h-[var(--editor-min-height)] [&_.ProseMirror]:outline-none"
        style={{ ["--editor-min-height" as string]: `${minHeight}px` }}
      />
    </div>
  );
}
