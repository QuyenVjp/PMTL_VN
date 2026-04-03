import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { SparklesIcon } from "lucide-react";

import { AdminDetailPage, AdminDetailSection, AdminFormField } from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/features/content/rich-text-editor";
import { cn } from "@/lib/utils";
import { extractValidationFieldErrors, hasFieldErrors, invalidFieldClass, type FieldErrors } from "@/lib/form-validation";
import { useCreateWisdomEntry, useCreateWisdomTranslationDraft, useSuggestWisdomSlug } from "./mutations";

const ENTRY_TYPE_OPTIONS = [
  { label: "Bạch thoại Phật pháp", value: "BACH_THOAI" },
  { label: "Khai thị", value: "KHAI_THI" },
  { label: "Phật ngôn Phật ngữ", value: "PHAT_NGON" },
  { label: "Bài pháp hội", value: "PHAP_HOI" },
];

const EXCERPT_MAX_LENGTH = 4000;

function excerptTextLength(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim().length;
}

function getYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

export function WisdomCreatePage() {
  const navigate = useNavigate();
  const createEntry = useCreateWisdomEntry();
  const suggestSlug = useSuggestWisdomSlug();
  const createDraft = useCreateWisdomTranslationDraft();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [entryType, setEntryType] = useState<"BACH_THOAI" | "KHAI_THI" | "PHAT_NGON" | "PHAP_HOI">("BACH_THOAI");
  const [sourceCode, setSourceCode] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [originalText, setOriginalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const youtubeId = getYouTubeId(sourceUrl.trim());

  const handleSave = () => {
    const nextErrors: FieldErrors = {};
    if (!title.trim()) nextErrors.title = "Tiêu đề không được để trống.";
    if (excerptTextLength(excerpt) > EXCERPT_MAX_LENGTH) nextErrors.excerpt = "Tóm tắt tối đa 4.000 ký tự hiển thị.";
    if (hasFieldErrors(nextErrors)) {
      setFieldErrors(nextErrors);
      toast.error(Object.values(nextErrors)[0]);
      return;
    }

    createEntry.mutate(
      {
        title: title.trim(),
        slug: slug.trim() || undefined,
        entryType,
        sourceCode: sourceCode.trim() || undefined,
        sourceUrl: sourceUrl.trim() || undefined,
        excerpt: excerpt.trim() || undefined,
        originalText: originalText.trim() || undefined,
        translatedText: translatedText.trim() || undefined,
      },
      {
        onSuccess: () => {
          void navigate({ to: "/noi-dung/bach-thoai" });
        },
        onError: (error) => setFieldErrors(extractValidationFieldErrors(error)),
      },
    );
  };

  const sidebar = (
    <AdminDetailSection title="Ghi chú workspace">
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="rounded-lg border px-3 py-2">`Bạch thoại Phật pháp` đi theo lane video / nguồn phát. Nếu có YouTube, ưu tiên điền `URL nguồn` để admin và web đều dựng đúng iframe.</div>
          <div className="rounded-lg border px-3 py-2">Hỏi đáp là nhóm nội dung riêng, không được tạo từ form này.</div>
          <div className="rounded-lg border px-3 py-2">Nếu wording nhạy cảm, phải giữ `sourceCode` hoặc `sourceUrl` để reviewer lần lại nguồn chính xác.</div>
        </div>
      </AdminDetailSection>
  );

  return (
    <AdminDetailPage
      backHref="/noi-dung/bach-thoai"
      backLabel="Bạch thoại Phật pháp"
      title="Tạo bài Bạch thoại"
      status={<Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">Nháp</Badge>}
      onSave={handleSave}
      isSaving={createEntry.isPending}
      saveLabel="Tạo"
      saveDisabled={!title.trim()}
      sidebar={sidebar}
    >
      <AdminDetailSection title="Thông tin cơ bản">
        <div className="space-y-4">
          <AdminFormField label="Tiêu đề">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Nhập tiêu đề..." className={invalidFieldClass(Boolean(fieldErrors.title))} />
            <FieldError message={fieldErrors.title} />
          </AdminFormField>
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <AdminFormField label="Slug">
              <Input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="tu-dong-tao-neu-de-trong" />
            </AdminFormField>
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                disabled={suggestSlug.isPending || !title.trim()}
                onClick={() => suggestSlug.mutate({ title: title.trim(), sourceCode: sourceCode.trim() || undefined }, { onSuccess: (result) => setSlug(result.slug) })}
              >
                <SparklesIcon className="mr-2 size-4" />
                {suggestSlug.isPending ? "Đang gợi ý..." : "Gợi ý slug"}
              </Button>
            </div>
          </div>
          <AdminFormField label="Loại bài">
            <Select value={entryType} onValueChange={(value) => setEntryType(value as typeof entryType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ENTRY_TYPE_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </AdminFormField>
          <AdminFormField label="Mã nguồn">
            <Input value={sourceCode} onChange={(event) => setSourceCode(event.target.value)} placeholder="VD: shuohua20140808" />
          </AdminFormField>
          <AdminFormField label="Tóm tắt">
            <RichTextEditor
              value={excerpt}
              onChange={(nextValue) => {
                setExcerpt(nextValue);
                if (fieldErrors.excerpt) setFieldErrors((prev) => ({ ...prev, excerpt: "" }));
              }}
              placeholder="Tóm tắt ngắn, dễ đọc trên mobile và đủ rõ để người duyệt nắm nội dung..."
              minHeight={160}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <FieldError message={fieldErrors.excerpt} />
              <span className={cn(Boolean(fieldErrors.excerpt) && "text-destructive")}>{excerptTextLength(excerpt)}/{EXCERPT_MAX_LENGTH}</span>
            </div>
          </AdminFormField>
        </div>
      </AdminDetailSection>

      <AdminDetailSection title="Nguồn phát">
        <div className="space-y-4">
          <AdminFormField label="URL nguồn video" hint="Dán link YouTube hoặc link nguồn chính thức. Nếu là YouTube, hệ thống sẽ dựng preview iframe.">
            <Input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
          </AdminFormField>

          {youtubeId ? (
            <div className="overflow-hidden rounded-xl border">
              <div className="aspect-video bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
                  title="Preview video Bạch thoại"
                  className="size-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="border-t px-4 py-3 text-xs text-muted-foreground">
                Preview video đã nhận diện từ URL nguồn. Web public có thể dựng player trực tiếp từ nguồn này.
              </div>
            </div>
          ) : sourceUrl.trim() ? (
            <div className="rounded-lg border border-dashed px-3 py-3 text-xs text-muted-foreground">
              URL nguồn đã có nhưng chưa nhận diện được YouTube embed. Hệ thống sẽ giữ link nguồn để reviewer kiểm tra thủ công.
            </div>
          ) : null}
        </div>
      </AdminDetailSection>

      <AdminDetailSection title="Nguyên văn và bản dịch">
        <div className="space-y-4">
          <AdminFormField label="Nguyên văn gốc">
            <Textarea value={originalText} onChange={(event) => setOriginalText(event.target.value)} rows={8} placeholder="Văn bản gốc..." />
          </AdminFormField>
          <AdminFormField label="Bản dịch tiếng Việt">
            <Textarea value={translatedText} onChange={(event) => setTranslatedText(event.target.value)} rows={8} placeholder="Bản dịch nháp..." />
          </AdminFormField>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={createDraft.isPending || !originalText.trim()}
              onClick={() => createDraft.mutate({ originalText: originalText.trim(), title: title.trim() || undefined, sourceCode: sourceCode.trim() || undefined }, { onSuccess: (result) => setTranslatedText(result.translatedText) })}
            >
              <SparklesIcon className="mr-2 size-4" />
              {createDraft.isPending ? "Đang dịch..." : "Tạo bản dịch nháp"}
            </Button>
          </div>
        </div>
      </AdminDetailSection>
    </AdminDetailPage>
  );
}
