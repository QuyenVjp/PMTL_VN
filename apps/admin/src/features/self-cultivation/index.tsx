import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon, RefreshCwIcon } from "lucide-react";

import { WorkspaceConfirmDialog } from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { extractValidationFieldErrors, hasFieldErrors, invalidFieldClass, type FieldErrors } from "@/lib/form-validation";
import { selfCultivationOverviewOptions, type SelfCultivationGuide, type SelfCultivationGuideGroup } from "./queries";
import { useCreateSelfCultivationFaq, useCreateSelfCultivationGuide, usePublishSelfCultivation } from "./mutations";
import { TemplatesTab } from "./templates-tab.js";
import { BurnFlowTab } from "./burn-flow-tab.js";

const GROUP_LABELS: Record<SelfCultivationGuideGroup, string> = {
  BAT_DAU: "Tổng quan",
  CACH_DUNG: "Cách dùng",
  BAO_QUAN: "Bảo quản",
  TRUONG_HOP_SU_DUNG: "Trường hợp sử dụng",
  TAI_XUONG: "Tải xuống",
};

function statusBadgeClass(status: "DRAFT" | "PUBLISHED") {
  return status === "PUBLISHED"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
    : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
}

function GuideList({ items }: { items: SelfCultivationGuide[] }) {
  if (!items.length) {
    return <div className="rounded-xl border border-dashed px-4 py-8 text-sm text-muted-foreground">Chưa có nội dung. [Thêm mới]</div>;
  }

  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <Card key={item.publicId}>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-base">{item.title}</CardTitle>
                <CardDescription>{item.summary}</CardDescription>
              </div>
              <Badge variant="outline">{GROUP_LABELS[item.groupKey]}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Slug:</span> {item.slug}
            </p>
            <p>
              <span className="font-medium text-foreground">Nguồn:</span> {item.sourceReference}
            </p>
            {item.boundaryNote ? <p><span className="font-medium text-foreground">Boundary:</span> {item.boundaryNote}</p> : null}
            {item.warningNotes.length ? (
              <div className="space-y-1">
                <p className="font-medium text-foreground">Warning notes</p>
                {item.warningNotes.map((note) => (
                  <div key={note} className="rounded-lg border px-3 py-2">{note}</div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CreateGuideDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const createGuide = useCreateSelfCultivationGuide();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [groupKey, setGroupKey] = useState<SelfCultivationGuideGroup>("CACH_DUNG");
  const [sourceReference, setSourceReference] = useState("");
  const [boundaryNote, setBoundaryNote] = useState("");
  const [warningText, setWarningText] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const reset = () => {
    setTitle("");
    setSlug("");
    setSummary("");
    setGroupKey("CACH_DUNG");
    setSourceReference("");
    setBoundaryNote("");
    setWarningText("");
    setFieldErrors({});
  };

  const handleSave = () => {
    const nextErrors: FieldErrors = {};
    if (!title.trim()) nextErrors.title = "Tiêu đề không được để trống.";
    if (!summary.trim()) nextErrors.summary = "Tóm tắt không được để trống.";
    if (!sourceReference.trim()) nextErrors.sourceReference = "Phải có sourceReference.";
    if (hasFieldErrors(nextErrors)) {
      setFieldErrors(nextErrors);
      return;
    }

    createGuide.mutate(
      {
        title: title.trim(),
        slug: slug.trim() || undefined,
        summary: summary.trim(),
        groupKey,
        sourceReference: sourceReference.trim(),
        boundaryNote: boundaryNote.trim() || undefined,
        warningNotes: warningText.split("\n").map((item) => item.trim()).filter(Boolean),
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
        onError: (error) => setFieldErrors(extractValidationFieldErrors(error)),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="text-start">
          <DialogTitle>Thêm guide Kinh văn tự tu</DialogTitle>
          <DialogDescription>Guide mới phải có sourceReference và boundary note nếu wording đụng lane khác.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <label className="grid gap-1.5">
            <span className="text-sm font-medium">Tiêu đề</span>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} className={invalidFieldClass(Boolean(fieldErrors.title))} />
            <FieldError message={fieldErrors.title} />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-sm font-medium">Slug</span>
              <Input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="tu-dong-tao-neu-de-trong" />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-medium">Nhóm</span>
              <Select value={groupKey} onValueChange={(value) => setGroupKey(value as SelfCultivationGuideGroup)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(GROUP_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                </SelectContent>
              </Select>
            </label>
          </div>
          <label className="grid gap-1.5">
            <span className="text-sm font-medium">Tóm tắt</span>
            <Textarea value={summary} onChange={(event) => setSummary(event.target.value)} rows={3} className={invalidFieldClass(Boolean(fieldErrors.summary))} />
            <FieldError message={fieldErrors.summary} />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-medium">Source reference</span>
            <Input value={sourceReference} onChange={(event) => setSourceReference(event.target.value)} className={invalidFieldClass(Boolean(fieldErrors.sourceReference))} placeholder="VD: KINH-VAN-TU-TU-CONTENT-INVENTORY §2.2" />
            <FieldError message={fieldErrors.sourceReference} />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-medium">Boundary note</span>
            <Textarea value={boundaryNote} onChange={(event) => setBoundaryNote(event.target.value)} rows={2} placeholder="Nêu rõ boundary nếu wording gần lane khác" />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-medium">Warning notes</span>
            <Textarea value={warningText} onChange={(event) => setWarningText(event.target.value)} rows={3} placeholder="Mỗi dòng một warning" />
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSave} disabled={createGuide.isPending}>{createGuide.isPending ? "Đang tạo..." : "Thêm guide"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateFaqDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const createFaq = useCreateSelfCultivationFaq();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sourceReference, setSourceReference] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleSave = () => {
    const nextErrors: FieldErrors = {};
    if (!question.trim()) nextErrors.question = "Câu hỏi không được để trống.";
    if (!answer.trim()) nextErrors.answer = "Câu trả lời không được để trống.";
    if (!sourceReference.trim()) nextErrors.sourceReference = "Phải có sourceReference.";
    if (hasFieldErrors(nextErrors)) {
      setFieldErrors(nextErrors);
      return;
    }

    createFaq.mutate(
      { question: question.trim(), answer: answer.trim(), sourceReference: sourceReference.trim() },
      {
        onSuccess: () => {
          setQuestion("");
          setAnswer("");
          setSourceReference("");
          setFieldErrors({});
          onOpenChange(false);
        },
        onError: (error) => setFieldErrors(extractValidationFieldErrors(error)),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader className="text-start">
          <DialogTitle>Thêm FAQ Kinh văn tự tu</DialogTitle>
          <DialogDescription>FAQ phải giữ wording retrieval-friendly, không biến thành prose dài.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <label className="grid gap-1.5">
            <span className="text-sm font-medium">Câu hỏi</span>
            <Input value={question} onChange={(event) => setQuestion(event.target.value)} className={invalidFieldClass(Boolean(fieldErrors.question))} />
            <FieldError message={fieldErrors.question} />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-medium">Câu trả lời</span>
            <Textarea value={answer} onChange={(event) => setAnswer(event.target.value)} rows={4} className={invalidFieldClass(Boolean(fieldErrors.answer))} />
            <FieldError message={fieldErrors.answer} />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-medium">Source reference</span>
            <Input value={sourceReference} onChange={(event) => setSourceReference(event.target.value)} className={invalidFieldClass(Boolean(fieldErrors.sourceReference))} />
            <FieldError message={fieldErrors.sourceReference} />
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSave} disabled={createFaq.isPending}>{createFaq.isPending ? "Đang tạo..." : "Thêm FAQ"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SelfCultivationWorkspacePage() {
  const { data: overview, isLoading, refetch, isRefetching } = useQuery(selfCultivationOverviewOptions());
  const publishMutation = usePublishSelfCultivation();
  const [guideDialogOpen, setGuideDialogOpen] = useState(false);
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState<"DRAFT" | "PUBLISHED" | null>(null);

  const groupedGuides = useMemo(() => {
    const guides = overview?.guides ?? [];
    return {
      BAT_DAU: guides.filter((item) => item.groupKey === "BAT_DAU"),
      CACH_DUNG: guides.filter((item) => item.groupKey === "CACH_DUNG"),
      BAO_QUAN: guides.filter((item) => item.groupKey === "BAO_QUAN"),
      TRUONG_HOP_SU_DUNG: guides.filter((item) => item.groupKey === "TRUONG_HOP_SU_DUNG"),
      TAI_XUONG: guides.filter((item) => item.groupKey === "TAI_XUONG"),
    };
  }, [overview]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Kinh văn tự tu</h1>
          <p className="text-sm text-muted-foreground">
            Workspace owner cho `/kinh-van-tu-tu`. Không được bind nhầm sang `practice-support/vietnam-home-practice-guide`.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => void refetch()} disabled={isRefetching}>
            <RefreshCwIcon className={cn("mr-2 size-4", isRefetching && "animate-spin")} />
            Làm mới
          </Button>
          {overview ? (
            <Button onClick={() => setConfirmStatus(overview.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED") }>
              {overview.status === "PUBLISHED" ? "Đưa về nháp" : "Publish"}
            </Button>
          ) : null}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Tổng quan workspace</CardTitle>
              <CardDescription>Tab-based workspace theo đúng `ADMIN_MODULE_SPECS §4a`.</CardDescription>
            </div>
            {overview ? <Badge variant="outline" className={statusBadgeClass(overview.status)}>{overview.status === "PUBLISHED" ? "Đã xuất bản" : "Nháp"}</Badge> : null}
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Khác với Kinh Bài Tập</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">{overview?.boundarySummary.differentFromDailyPractice ?? "Đang tải..."}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Khác với Ngôi Nhà Nhỏ</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">{overview?.boundarySummary.differentFromLittleHouse ?? "Đang tải..."}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Review metadata</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p><span className="font-medium text-foreground">Biên tập:</span> {overview?.updatedByLabel ?? "—"}</p>
              <p><span className="font-medium text-foreground">Cập nhật:</span> {overview ? new Date(overview.updatedAt).toLocaleString("vi-VN") : "—"}</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Tabs defaultValue="tong-quan" className="space-y-4">
        <TabsList className="h-auto flex-wrap gap-1 p-1">
          <TabsTrigger value="tong-quan">Tổng quan</TabsTrigger>
          <TabsTrigger value="cach-dung">Cách dùng</TabsTrigger>
          <TabsTrigger value="bao-quan">Bảo quản</TabsTrigger>
          <TabsTrigger value="truong-hop">Trường hợp sử dụng</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="tai-xuong">Tải xuống</TabsTrigger>
          <TabsTrigger value="bieu-mau">Biểu mẫu tự tu</TabsTrigger>
          <TabsTrigger value="luong-dot">Luồng đốt & rủi ro</TabsTrigger>
          <TabsTrigger value="version">Version / nguồn</TabsTrigger>
        </TabsList>

        <TabsContent value="tong-quan" className="space-y-4">
          <div className="flex justify-end"><Button variant="outline" onClick={() => setGuideDialogOpen(true)}><PlusIcon className="mr-2 size-4" />Thêm guide</Button></div>
          <GuideList items={groupedGuides.BAT_DAU} />
          <Card>
            <CardHeader><CardTitle className="text-base">Non-negotiables</CardTitle></CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground">
              {(overview?.boundarySummary.nonNegotiables ?? []).map((item) => <div key={item} className="rounded-lg border px-3 py-2">{item}</div>)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cach-dung"><div className="flex justify-end pb-4"><Button variant="outline" onClick={() => setGuideDialogOpen(true)}><PlusIcon className="mr-2 size-4" />Thêm guide</Button></div><GuideList items={groupedGuides.CACH_DUNG} /></TabsContent>
        <TabsContent value="bao-quan"><div className="flex justify-end pb-4"><Button variant="outline" onClick={() => setGuideDialogOpen(true)}><PlusIcon className="mr-2 size-4" />Thêm guide</Button></div><GuideList items={groupedGuides.BAO_QUAN} /></TabsContent>
        <TabsContent value="truong-hop"><div className="flex justify-end pb-4"><Button variant="outline" onClick={() => setGuideDialogOpen(true)}><PlusIcon className="mr-2 size-4" />Thêm guide</Button></div><GuideList items={groupedGuides.TRUONG_HOP_SU_DUNG} /></TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <div className="flex justify-end"><Button variant="outline" onClick={() => setFaqDialogOpen(true)}><PlusIcon className="mr-2 size-4" />Thêm FAQ</Button></div>
          {(overview?.faq?.length ?? 0) ? (
            <div className="grid gap-3">
              {overview?.faq.map((item) => (
                <Card key={item.publicId}>
                  <CardHeader className="pb-3"><CardTitle className="text-base">{item.question}</CardTitle></CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>{item.answer}</p>
                    <p><span className="font-medium text-foreground">Nguồn:</span> {item.sourceReference}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : <div className="rounded-xl border border-dashed px-4 py-8 text-sm text-muted-foreground">Chưa có nội dung. [Thêm mới]</div>}
        </TabsContent>

        <TabsContent value="tai-xuong" className="space-y-3">
          {(overview?.downloads?.length ?? 0) ? overview?.downloads.map((item) => (
            <Card key={item.publicId}>
              <CardContent className="flex items-center justify-between gap-3 pt-6">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.fileName}</p>
                </div>
                <Badge variant="outline">{item.assetType}</Badge>
              </CardContent>
            </Card>
          )) : <div className="rounded-xl border border-dashed px-4 py-8 text-sm text-muted-foreground">Chưa có nội dung. [Thêm mới]</div>}
        </TabsContent>

        <TabsContent value="bieu-mau"><TemplatesTab /></TabsContent>
        <TabsContent value="luong-dot"><BurnFlowTab /></TabsContent>

        <TabsContent value="version" className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Source references</CardTitle></CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground">
              {(overview?.sourceReferences ?? []).map((item) => <div key={item} className="rounded-lg border px-3 py-2">{item}</div>)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Version notes</CardTitle></CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground">
              {(overview?.versionNotes ?? []).map((item) => <div key={item} className="rounded-lg border px-3 py-2">{item}</div>)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateGuideDialog open={guideDialogOpen} onOpenChange={setGuideDialogOpen} />
      <CreateFaqDialog open={faqDialogOpen} onOpenChange={setFaqDialogOpen} />

      {confirmStatus ? (
        <WorkspaceConfirmDialog
          open
          onOpenChange={(open) => { if (!open) setConfirmStatus(null); }}
          title={confirmStatus === "PUBLISHED" ? "Publish Kinh văn tự tu" : "Đưa workspace về nháp"}
          description={confirmStatus === "PUBLISHED" ? "Xác nhận publish workspace Kinh văn tự tu với version note mới." : "Xác nhận đưa workspace Kinh văn tự tu về trạng thái nháp."}
          confirmLabel={confirmStatus === "PUBLISHED" ? "Publish" : "Đưa về nháp"}
          isPending={publishMutation.isPending}
          onConfirm={() => publishMutation.mutate({ status: confirmStatus, changeSummary: confirmStatus === "PUBLISHED" ? "Publish từ workspace admin." : "Đưa về nháp từ workspace admin." }, { onSuccess: () => setConfirmStatus(null) })}
        />
      ) : null}

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center gap-2 pt-6 text-sm text-muted-foreground">
            <RefreshCwIcon className="size-4 animate-spin" />
            Đang tải workspace Kinh văn tự tu...
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
