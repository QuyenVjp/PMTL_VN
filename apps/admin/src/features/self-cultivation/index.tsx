import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowRightIcon, CheckCircle2Icon, FileTextIcon, FlameIcon, LoaderCircleIcon, PlusIcon, RefreshCwIcon, XCircleIcon } from "lucide-react";
import { z } from "zod";
import type { UseFormReturn } from "react-hook-form";
import { useSlugField, type SlugStatus } from "@/lib/hooks/use-slug-field";

function SlugStatusIcon({ status }: { status: SlugStatus }) {
  if (status === "checking") return <LoaderCircleIcon className="size-4 animate-spin text-muted-foreground" />;
  if (status === "available") return <CheckCircle2Icon className="size-4 text-emerald-500" />;
  if (status === "taken") return <XCircleIcon className="size-4 text-destructive" />;
  return null;
}

import {
  AdminDetailField,
  AdminDetailPage,
  AdminDetailSection,
  AdminFormField,
  WorkspaceConfirmDialog,
  WorkspaceDetailSkeleton,
  WorkspaceRouteSkeleton,
} from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { applyApiFieldErrors, useAdminZodForm } from "@/lib/admin-form";
import { cn } from "@/lib/utils";
import { invalidFieldClass } from "@/lib/form-validation";
import { readRouteParam, useNavigateTo } from "@/lib/router-utils";
import { selfCultivationOverviewOptions, type SelfCultivationGuide, type SelfCultivationGuideGroup } from "./queries";
import {
  useCreateSelfCultivationFaq,
  useCreateSelfCultivationGuide,
  usePublishSelfCultivation,
  useUpdateSelfCultivationFaq,
  useUpdateSelfCultivationGuide,
} from "./mutations";
import { TemplatesTab } from "./templates-tab.js";
import { BurnFlowTab } from "./burn-flow-tab.js";

const GROUP_LABELS: Record<SelfCultivationGuideGroup, string> = {
  BAT_DAU: "Tổng quan",
  CACH_DUNG: "Cách dùng",
  BAO_QUAN: "Bảo quản",
  TRUONG_HOP_SU_DUNG: "Trường hợp sử dụng",
  TAI_XUONG: "Tải xuống",
};

const DOMAIN_BOUNDARIES = [
  {
    title: "Kinh văn tự tu",
    description: "Khu nội dung chuẩn cho cách dùng, bảo quản, nguồn tham chiếu và bản in. Không giữ tiến độ cá nhân.",
    owner: "Nội dung / Kinh văn tự tu",
  },
  {
    title: "Ngôi Nhà Nhỏ",
    description: "Kho nội dung riêng cho nghi thức, cách chấm đỏ, quy trình đốt, hủy tờ sai và các biến thể tình huống.",
    owner: "Nội dung / Ngôi Nhà Nhỏ",
    href: "/noi-dung/ngoi-nha-nho",
  },
  {
    title: "Sớ / hồ sơ Ngôi Nhà Nhỏ",
    description: "Hồ sơ vận hành, chấm đỏ, đốt và hàng đợi gian lận. Đây là khu vận hành, không phải nội dung hướng dẫn.",
    owner: "Vận hành / Ngôi Nhà Nhỏ",
    href: "/so/danh-sach",
  },
];

const SELF_CULTIVATION_WORKFLOW = [
  "Giữ cấu trúc nhóm rõ ràng: bắt đầu, cách dùng, bảo quản, trường hợp sử dụng, hỏi đáp, tải xuống.",
  "Những phần gần với Ngôi Nhà Nhỏ chỉ được liên kết chéo bằng ghi chú ranh giới, không sao chép máy móc.",
  "Biểu mẫu và PDF phải đi qua thư viện media hoặc kho tải xuống chính thức để giữ nguồn gốc rõ ràng.",
  "Các lưu ý về đốt và rủi ro chỉ là tham chiếu vận hành; trạng thái thực hành thật thuộc khu nghiệp vụ riêng.",
];

function statusBadgeClass(status: "DRAFT" | "PUBLISHED") {
  return status === "PUBLISHED"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
    : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
}

const createGuideSchema = z.object({
  title: z.string().trim().min(1, "Tiêu đề không được để trống."),
  slug: z.string().trim().optional(),
  summary: z.string().trim().min(1, "Tóm tắt không được để trống."),
  groupKey: z.enum(["BAT_DAU", "CACH_DUNG", "BAO_QUAN", "TRUONG_HOP_SU_DUNG", "TAI_XUONG"]),
  sourceReference: z.string().trim().min(1, "Phải có sourceReference."),
  boundaryNote: z.string().trim().optional(),
  warningText: z.string().trim().optional(),
});

const createFaqSchema = z.object({
  question: z.string().trim().min(1, "Câu hỏi không được để trống."),
  answer: z.string().trim().min(1, "Câu trả lời không được để trống."),
  sourceReference: z.string().trim().min(1, "Phải có sourceReference."),
});

function GuideList({ items }: { items: SelfCultivationGuide[] }) {
  if (!items.length) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Chưa có nội dung.
        </CardContent>
      </Card>
    );
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
              <div className="flex items-center gap-2">
                <Badge variant="outline">{GROUP_LABELS[item.groupKey]}</Badge>
                <Button asChild variant="outline" size="sm">
                  <Link to="/noi-dung/kinh-van-tu-tu/huong-dan/$guidePublicId" params={{ guidePublicId: item.publicId }}>
                    Sửa
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Slug:</span> {item.slug}
            </p>
            <p>
              <span className="font-medium text-foreground">Nguồn:</span> {item.sourceReference}
            </p>
            {item.boundaryNote ? <p><span className="font-medium text-foreground">Ghi chú ranh giới:</span> {item.boundaryNote}</p> : null}
            {item.warningNotes.length ? (
              <div className="space-y-1">
                <p className="font-medium text-foreground">Lưu ý quan trọng</p>
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

type GuideFormValues = z.infer<typeof createGuideSchema>;
type FaqFormValues = z.infer<typeof createFaqSchema>;

function buildGuideDefaults(guide?: SelfCultivationGuide): GuideFormValues {
  return {
    title: guide?.title ?? "",
    slug: guide?.slug ?? "",
    summary: guide?.summary ?? "",
    groupKey: guide?.groupKey ?? "CACH_DUNG",
    sourceReference: guide?.sourceReference ?? "",
    boundaryNote: guide?.boundaryNote ?? "",
    warningText: guide?.warningNotes.join("\n") ?? "",
  };
}

function buildFaqDefaults(faq?: { question: string; answer: string; sourceReference: string }): FaqFormValues {
  return {
    question: faq?.question ?? "",
    answer: faq?.answer ?? "",
    sourceReference: faq?.sourceReference ?? "",
  };
}

function GuideForm({
  form,
  slug,
  setSlug,
  slugStatus,
}: {
  form: UseFormReturn<GuideFormValues>;
  slug: string;
  setSlug: (value: string) => void;
  slugStatus: SlugStatus;
}) {
  const { errors } = form.formState;
  const values = form.watch();

  return (
    <AdminDetailSection title="Bài hướng dẫn">
      <div className="space-y-4">
        <FieldError message={errors.root?.server?.message} />
        <AdminFormField label="Tiêu đề *">
          <Input {...form.register("title")} className={invalidFieldClass(Boolean(errors.title))} />
          <FieldError message={errors.title?.message} />
        </AdminFormField>
        <div className="grid gap-4 md:grid-cols-2">
          <AdminFormField label="Slug">
              <div className="relative">
                <Input
                  name="slug"
                  value={slug}
                  onChange={(event) => {
                    form.clearErrors("slug");
                    form.setValue("slug", event.target.value, { shouldDirty: true });
                    setSlug(event.target.value);
                  }}
                  placeholder="tu-dong-tao-neu-de-trong"
                  className={invalidFieldClass(slugStatus === "taken" || Boolean(errors.slug))}
                  aria-invalid={slugStatus === "taken" || Boolean(errors.slug)}
                  style={{ paddingRight: slugStatus !== "idle" ? "2.25rem" : undefined }}
                />
                {(slugStatus !== "idle" || errors.slug) && (
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <SlugStatusIcon status={errors.slug ? "taken" : slugStatus} />
                  </span>
                )}
              </div>
              <FieldError message={errors.slug?.message ?? (slugStatus === "taken" ? "Slug này đã được dùng, hãy chỉnh lại." : undefined)} />
          </AdminFormField>
          <AdminFormField label="Nhóm">
              <Select value={values.groupKey} onValueChange={(value) => form.setValue("groupKey", value as SelfCultivationGuideGroup, { shouldDirty: true, shouldValidate: true })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(GROUP_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                </SelectContent>
              </Select>
          </AdminFormField>
        </div>
        <AdminFormField label="Tóm tắt *">
          <Textarea {...form.register("summary")} rows={3} className={invalidFieldClass(Boolean(errors.summary))} />
          <FieldError message={errors.summary?.message} />
        </AdminFormField>
        <AdminFormField label="Nguồn tham chiếu *">
          <Input {...form.register("sourceReference")} className={invalidFieldClass(Boolean(errors.sourceReference))} placeholder="VD: KINH-VAN-TU-TU-CONTENT-INVENTORY §2.2" />
          <FieldError message={errors.sourceReference?.message} />
        </AdminFormField>
        <AdminFormField label="Ghi chú ranh giới">
          <Textarea {...form.register("boundaryNote")} rows={2} placeholder="Nêu rõ ranh giới nếu nội dung gần với khu khác" />
        </AdminFormField>
        <AdminFormField label="Lưu ý quan trọng">
          <Textarea {...form.register("warningText")} rows={4} placeholder="Mỗi dòng một lưu ý" />
        </AdminFormField>
      </div>
    </AdminDetailSection>
  );
}

function GuideSidebar({ guide, values }: { guide?: SelfCultivationGuide; values: GuideFormValues }) {
  return (
    <>
      <AdminDetailSection title="Thông tin">
        <AdminDetailField label="Nhóm" value={GROUP_LABELS[values.groupKey]} />
        <AdminDetailField label="Slug" value={values.slug || "Tự tạo khi lưu"} />
        <AdminDetailField label="Số lưu ý" value={String((values.warningText ?? "").split("\n").filter((item) => item.trim()).length)} />
      </AdminDetailSection>
      {guide ? (
        <AdminDetailSection title="Lịch sử">
          <AdminDetailField label="Cập nhật" value={new Date(guide.updatedAt).toLocaleString("vi-VN")} />
        </AdminDetailSection>
      ) : null}
    </>
  );
}

function FaqForm({ form }: { form: UseFormReturn<FaqFormValues> }) {
  const { errors } = form.formState;
  return (
    <AdminDetailSection title="Hỏi đáp Kinh văn tự tu">
      <div className="space-y-4">
        <FieldError message={errors.root?.server?.message} />
        <AdminFormField label="Câu hỏi *">
          <Input {...form.register("question")} className={invalidFieldClass(Boolean(errors.question))} />
          <FieldError message={errors.question?.message} />
        </AdminFormField>
        <AdminFormField label="Câu trả lời *">
          <Textarea {...form.register("answer")} rows={10} className={invalidFieldClass(Boolean(errors.answer))} />
          <FieldError message={errors.answer?.message} />
        </AdminFormField>
        <AdminFormField label="Nguồn tham chiếu *">
          <Input {...form.register("sourceReference")} className={invalidFieldClass(Boolean(errors.sourceReference))} />
          <FieldError message={errors.sourceReference?.message} />
        </AdminFormField>
      </div>
    </AdminDetailSection>
  );
}

export function SelfCultivationGuideCreatePage() {
  const navigateTo = useNavigateTo();
  const createGuide = useCreateSelfCultivationGuide();
  const form = useAdminZodForm(createGuideSchema, { defaultValues: buildGuideDefaults() });
  const values = form.watch();
  const { slug, setSlug, resetSlug, slugStatus } = useSlugField({ title: values.title, entityType: "SELF_CULTIVATION_GUIDE" });
  const lastSlugRef = useRef(slug);

  useEffect(() => {
    if (lastSlugRef.current !== slug) {
      lastSlugRef.current = slug;
      form.setValue("slug", slug, { shouldValidate: false });
      form.clearErrors("slug");
    }
  }, [form, slug]);

  const handleSave = form.handleSubmit((formValues) => {
    if (slugStatus === "taken") {
      form.setError("slug", { type: "server", message: "Slug này đã được dùng, hãy chỉnh lại." }, { shouldFocus: true });
      return;
    }
    createGuide.mutate(
      {
        title: formValues.title,
        slug: slug.trim() || undefined,
        summary: formValues.summary,
        groupKey: formValues.groupKey,
        sourceReference: formValues.sourceReference,
        boundaryNote: formValues.boundaryNote || undefined,
        warningNotes: (formValues.warningText ?? "").split("\n").map((item) => item.trim()).filter(Boolean),
      },
      {
        onSuccess: () => {
          resetSlug();
          navigateTo("/noi-dung/kinh-van-tu-tu");
        },
        onError: (error) => applyApiFieldErrors(form, error),
      },
    );
  });

  return (
    <AdminDetailPage
      backHref="/noi-dung/kinh-van-tu-tu"
      backLabel="Kinh văn tự tu"
      title="Thêm bài hướng dẫn"
      onSave={() => void handleSave()}
      isSaving={createGuide.isPending}
      saveLabel="Tạo mới"
      saveDisabled={!values.title.trim() || !values.summary.trim() || !values.sourceReference.trim() || slugStatus === "taken"}
      sidebar={<GuideSidebar values={values} />}
    >
      <GuideForm form={form} slug={slug} setSlug={setSlug} slugStatus={slugStatus} />
    </AdminDetailPage>
  );
}

export function SelfCultivationGuideDetailPage() {
  const params = useParams({ strict: false });
  const publicId = readRouteParam(params, "guidePublicId") ?? "";
  const navigateTo = useNavigateTo();
  const { data: overview, isLoading } = useQuery(selfCultivationOverviewOptions());
  const guide = overview?.guides.find((item) => item.publicId === publicId);
  const updateGuide = useUpdateSelfCultivationGuide();
  const form = useAdminZodForm(createGuideSchema, { defaultValues: buildGuideDefaults(guide) });
  const values = form.watch();
  const { slug, setSlug, setSlugFromServer, slugStatus } = useSlugField({
    title: values.title,
    entityType: "SELF_CULTIVATION_GUIDE",
    excludePublicId: guide?.slug,
    initialSlug: guide?.slug,
  });
  const lastSlugRef = useRef(slug);

  useEffect(() => {
    if (!guide) return;
    form.reset(buildGuideDefaults(guide));
    setSlugFromServer(guide.slug, guide.title);
  }, [form, guide, setSlugFromServer]);

  useEffect(() => {
    if (lastSlugRef.current !== slug) {
      lastSlugRef.current = slug;
      form.setValue("slug", slug, { shouldValidate: false });
      form.clearErrors("slug");
    }
  }, [form, slug]);

  const handleSave = form.handleSubmit((formValues) => {
    if (slugStatus === "taken") {
      form.setError("slug", { type: "server", message: "Slug này đã được dùng, hãy chỉnh lại." }, { shouldFocus: true });
      return;
    }
    updateGuide.mutate(
      {
        publicId,
        title: formValues.title,
        slug: slug.trim() || undefined,
        summary: formValues.summary,
        groupKey: formValues.groupKey,
        sourceReference: formValues.sourceReference,
        boundaryNote: formValues.boundaryNote || undefined,
        warningNotes: (formValues.warningText ?? "").split("\n").map((item) => item.trim()).filter(Boolean),
      },
      { onError: (error) => applyApiFieldErrors(form, error) },
    );
  });

  if (isLoading) return <WorkspaceDetailSkeleton />;

  if (!guide) {
    return (
      <AdminDetailPage
        backHref="/noi-dung/kinh-van-tu-tu"
        backLabel="Kinh văn tự tu"
        title="Không tìm thấy bài hướng dẫn"
        onSave={() => navigateTo("/noi-dung/kinh-van-tu-tu")}
        saveLabel="Quay lại"
      >
        <AdminDetailSection title="Không có dữ liệu">
          <p className="text-sm text-muted-foreground">Bài hướng dẫn này không tồn tại hoặc đã bị xoá.</p>
        </AdminDetailSection>
      </AdminDetailPage>
    );
  }

  return (
    <AdminDetailPage
      backHref="/noi-dung/kinh-van-tu-tu"
      backLabel="Kinh văn tự tu"
      title={guide.title}
      onSave={() => void handleSave()}
      isSaving={updateGuide.isPending}
      saveDisabled={!values.title.trim() || !values.summary.trim() || !values.sourceReference.trim() || slugStatus === "taken"}
      sidebar={<GuideSidebar guide={guide} values={values} />}
    >
      <GuideForm form={form} slug={slug} setSlug={setSlug} slugStatus={slugStatus} />
    </AdminDetailPage>
  );
}

export function SelfCultivationFaqCreatePage() {
  const navigateTo = useNavigateTo();
  const createFaq = useCreateSelfCultivationFaq();
  const form = useAdminZodForm(createFaqSchema, { defaultValues: buildFaqDefaults() });
  const values = form.watch();

  const handleSave = form.handleSubmit((formValues) => {
    createFaq.mutate(formValues, {
      onSuccess: () => navigateTo("/noi-dung/kinh-van-tu-tu"),
      onError: (error) => applyApiFieldErrors(form, error),
    });
  });

  return (
    <AdminDetailPage
      backHref="/noi-dung/kinh-van-tu-tu"
      backLabel="Kinh văn tự tu"
      title="Thêm mục hỏi đáp"
      onSave={() => void handleSave()}
      isSaving={createFaq.isPending}
      saveLabel="Tạo mới"
      saveDisabled={!values.question.trim() || !values.answer.trim() || !values.sourceReference.trim()}
      sidebar={
        <AdminDetailSection title="Thông tin">
          <AdminDetailField label="Nguồn" value={values.sourceReference || "Chưa nhập"} />
        </AdminDetailSection>
      }
    >
      <FaqForm form={form} />
    </AdminDetailPage>
  );
}

export function SelfCultivationFaqDetailPage() {
  const params = useParams({ strict: false });
  const publicId = readRouteParam(params, "faqPublicId") ?? "";
  const { data: overview, isLoading } = useQuery(selfCultivationOverviewOptions());
  const faq = overview?.faq.find((item) => item.publicId === publicId);
  const updateFaq = useUpdateSelfCultivationFaq();
  const form = useAdminZodForm(createFaqSchema, { defaultValues: buildFaqDefaults(faq) });
  const values = form.watch();

  useEffect(() => {
    if (faq) form.reset(buildFaqDefaults(faq));
  }, [faq, form]);

  const handleSave = form.handleSubmit((formValues) => {
    updateFaq.mutate({ publicId, ...formValues }, { onError: (error) => applyApiFieldErrors(form, error) });
  });

  if (isLoading) return <WorkspaceDetailSkeleton />;

  return (
    <AdminDetailPage
      backHref="/noi-dung/kinh-van-tu-tu"
      backLabel="Kinh văn tự tu"
      title={faq?.question ?? "Không tìm thấy mục hỏi đáp"}
      onSave={() => void handleSave()}
      isSaving={updateFaq.isPending}
      saveDisabled={!faq || !values.question.trim() || !values.answer.trim() || !values.sourceReference.trim()}
      sidebar={
        <AdminDetailSection title="Thông tin">
          <AdminDetailField label="Nguồn" value={values.sourceReference || "Chưa nhập"} />
          {faq ? <AdminDetailField label="Cập nhật" value={new Date(faq.updatedAt).toLocaleString("vi-VN")} /> : null}
        </AdminDetailSection>
      }
    >
      {faq ? (
        <FaqForm form={form} />
      ) : (
        <AdminDetailSection title="Không có dữ liệu">
          <p className="text-sm text-muted-foreground">Mục hỏi đáp này không tồn tại hoặc đã bị xoá.</p>
        </AdminDetailSection>
      )}
    </AdminDetailPage>
  );
}

export function SelfCultivationWorkspacePage() {
  const { data: overview, isLoading, refetch, isRefetching } = useQuery(selfCultivationOverviewOptions());
  const publishMutation = usePublishSelfCultivation();
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
            Khu quản lý chính cho `/kinh-van-tu-tu`. Không được gắn nhầm sang nội dung hỗ trợ thực hành tại nhà.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => void refetch()} disabled={isRefetching}>
            <RefreshCwIcon className={cn("mr-2 size-4", isRefetching && "animate-spin")} />
            Làm mới
          </Button>
          {overview ? (
            <Button onClick={() => setConfirmStatus(overview.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED") }>
              {overview.status === "PUBLISHED" ? "Đưa về nháp" : "Xuất bản"}
            </Button>
          ) : null}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Tổng quan khu biên tập</CardTitle>
              <CardDescription>Khu này bám đúng cấu trúc tab của đặc tả quản trị Kinh văn tự tu.</CardDescription>
            </div>
            {overview ? <Badge variant="outline" className={statusBadgeClass(overview.status)}>{overview.status === "PUBLISHED" ? "Đã xuất bản" : "Nháp"}</Badge> : null}
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Khác với Kinh Bài Tập</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">{overview?.boundarySummary.differentFromDailyPractice ?? <Skeleton className="h-4 w-full" />}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Khác với Ngôi Nhà Nhỏ</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">{overview?.boundarySummary.differentFromLittleHouse ?? <Skeleton className="h-4 w-full" />}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Thông tin biên tập</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p><span className="font-medium text-foreground">Biên tập:</span> {overview?.updatedByLabel ?? "—"}</p>
              <p><span className="font-medium text-foreground">Cập nhật:</span> {overview ? new Date(overview.updatedAt).toLocaleString("vi-VN") : "—"}</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Ranh giới quản trị</CardTitle>
            <CardDescription>
              Kinh văn tự tu có liên hệ với Ngôi Nhà Nhỏ, nhưng không cùng khu phụ trách. Admin chỉ liên kết chéo và giữ nguồn tham chiếu rõ ràng.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {DOMAIN_BOUNDARIES.map((item) => (
              <div key={item.title} className="flex min-h-36 flex-col justify-between rounded-lg border bg-muted/20 p-4">
                <div className="space-y-2">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm leading-5 text-muted-foreground">{item.description}</p>
                  <Badge variant="outline">{item.owner}</Badge>
                </div>
                {item.href ? (
                  <Button asChild variant="outline" size="sm" className="mt-4 justify-between">
                    <Link to={item.href}>
                      Mở khu này
                      <ArrowRightIcon className="size-4" />
                    </Link>
                  </Button>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Checklist đúng design</CardTitle>
            <CardDescription>Operator nhìn vào đây để biết màn này được phép quản lý gì.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {SELF_CULTIVATION_WORKFLOW.map((item) => (
              <div key={item} className="flex gap-2 text-sm leading-5">
                <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                <span>{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tong-quan" className="space-y-4">
        <TabsList className="h-auto flex-wrap gap-1 p-1">
          <TabsTrigger value="tong-quan">Tổng quan</TabsTrigger>
          <TabsTrigger value="cach-dung">Cách dùng</TabsTrigger>
          <TabsTrigger value="bao-quan">Bảo quản</TabsTrigger>
          <TabsTrigger value="truong-hop">Trường hợp sử dụng</TabsTrigger>
          <TabsTrigger value="faq">Hỏi đáp</TabsTrigger>
          <TabsTrigger value="tai-xuong">Tải xuống</TabsTrigger>
          <TabsTrigger value="bieu-mau">
            <FileTextIcon className="mr-1.5 size-3.5" />
            Biểu mẫu
          </TabsTrigger>
          <TabsTrigger value="luong-dot">
            <FlameIcon className="mr-1.5 size-3.5" />
            Rủi ro
          </TabsTrigger>
          <TabsTrigger value="version">Phiên bản và nguồn</TabsTrigger>
        </TabsList>

        <TabsContent value="tong-quan" className="space-y-4">
          <div className="flex justify-end">
            <Button asChild variant="outline">
              <Link to="/noi-dung/kinh-van-tu-tu/huong-dan/tao-moi">
                <PlusIcon className="mr-2 size-4" />
                Thêm bài hướng dẫn
              </Link>
            </Button>
          </div>
          <GuideList items={groupedGuides.BAT_DAU} />
          <Card>
            <CardHeader><CardTitle className="text-base">Điểm không được làm sai</CardTitle></CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground">
              {(overview?.boundarySummary.nonNegotiables ?? []).map((item) => <div key={item} className="rounded-lg border px-3 py-2">{item}</div>)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cach-dung"><div className="flex justify-end pb-4"><Button asChild variant="outline"><Link to="/noi-dung/kinh-van-tu-tu/huong-dan/tao-moi"><PlusIcon className="mr-2 size-4" />Thêm bài hướng dẫn</Link></Button></div><GuideList items={groupedGuides.CACH_DUNG} /></TabsContent>
        <TabsContent value="bao-quan"><div className="flex justify-end pb-4"><Button asChild variant="outline"><Link to="/noi-dung/kinh-van-tu-tu/huong-dan/tao-moi"><PlusIcon className="mr-2 size-4" />Thêm bài hướng dẫn</Link></Button></div><GuideList items={groupedGuides.BAO_QUAN} /></TabsContent>
        <TabsContent value="truong-hop"><div className="flex justify-end pb-4"><Button asChild variant="outline"><Link to="/noi-dung/kinh-van-tu-tu/huong-dan/tao-moi"><PlusIcon className="mr-2 size-4" />Thêm bài hướng dẫn</Link></Button></div><GuideList items={groupedGuides.TRUONG_HOP_SU_DUNG} /></TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <div className="flex justify-end">
            <Button asChild variant="outline">
              <Link to="/noi-dung/kinh-van-tu-tu/hoi-dap/tao-moi">
                <PlusIcon className="mr-2 size-4" />
                Thêm mục hỏi đáp
              </Link>
            </Button>
          </div>
          {(overview?.faq?.length ?? 0) ? (
            <div className="grid gap-3">
              {overview?.faq.map((item) => (
                <Card key={item.publicId}>
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <CardTitle className="text-base">{item.question}</CardTitle>
                      <Button asChild variant="outline" size="sm">
                        <Link to="/noi-dung/kinh-van-tu-tu/hoi-dap/$faqPublicId" params={{ faqPublicId: item.publicId }}>
                          Sửa
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>{item.answer}</p>
                    <p><span className="font-medium text-foreground">Nguồn:</span> {item.sourceReference}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">Chưa có nội dung.</CardContent>
            </Card>
          )}
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
          )) : (
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">Chưa có nội dung.</CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="bieu-mau"><TemplatesTab /></TabsContent>
        <TabsContent value="luong-dot"><BurnFlowTab /></TabsContent>

        <TabsContent value="version" className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Nguồn tham chiếu</CardTitle></CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground">
              {(overview?.sourceReferences ?? []).map((item) => <div key={item} className="rounded-lg border px-3 py-2">{item}</div>)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Ghi chú phiên bản</CardTitle></CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground">
              {(overview?.versionNotes ?? []).map((item) => <div key={item} className="rounded-lg border px-3 py-2">{item}</div>)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {confirmStatus ? (
        <WorkspaceConfirmDialog
          open
          onOpenChange={(open) => { if (!open) setConfirmStatus(null); }}
          title={confirmStatus === "PUBLISHED" ? "Xuất bản Kinh văn tự tu" : "Đưa khu biên tập về nháp"}
          description={confirmStatus === "PUBLISHED" ? "Xác nhận xuất bản Kinh văn tự tu với ghi chú phiên bản mới." : "Xác nhận đưa Kinh văn tự tu về trạng thái nháp."}
          confirmLabel={confirmStatus === "PUBLISHED" ? "Xuất bản" : "Đưa về nháp"}
          isPending={publishMutation.isPending}
          onConfirm={() => publishMutation.mutate({ status: confirmStatus, changeSummary: confirmStatus === "PUBLISHED" ? "Xuất bản từ khu biên tập quản trị." : "Đưa về nháp từ khu biên tập quản trị." }, { onSuccess: () => setConfirmStatus(null) })}
        />
      ) : null}

      {isLoading ? <WorkspaceRouteSkeleton /> : null}
    </div>
  );
}
