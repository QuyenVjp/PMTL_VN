import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  PlusIcon,
  RefreshCwIcon,
  ImageIcon,
} from "lucide-react";

import { WorkspaceRouteSkeleton } from "@/components/workspace";
import { PreviewableImage } from "@/components/media/image-preview-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { resolveMediaSrc } from "@/lib/media-src";
import { useNavigateTo } from "@/lib/router-utils";
import {
  dailyPracticeFaqOptions,
  dailyPracticeGuidesOptions,
  dailyPracticePresetsOptions,
  type DailyPracticeDifficulty,
  type DailyPracticeGuide,
  type DailyPracticeStatus,
} from "./workspace-queries.js";

const difficultyLabels: Record<DailyPracticeDifficulty, string> = {
  BEGINNER: "Bài niệm/chú cốt lõi",
  INTERMEDIATE: "Bài bổ trợ theo tình huống",
  ADVANCED: "Bài kết khóa / cần rà soát",
};

const statusLabels: Record<DailyPracticeStatus, string> = {
  DRAFT: "Nháp",
  PUBLISHED: "Đã xuất bản",
  ARCHIVED: "Đã ẩn",
};

function statusBadgeClass(status: DailyPracticeStatus) {
  return status === "PUBLISHED"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
    : status === "DRAFT"
      ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
      : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400";
}

function EmptyState({ text }: { text: string }) {
  return (
    <Card>
      <CardContent className="pt-6 text-sm text-muted-foreground">{text}</CardContent>
    </Card>
  );
}

function GuideCard({ guide }: { guide: DailyPracticeGuide }) {
  const imageUrl = guide.scriptureImageUrl ? resolveMediaSrc(guide.scriptureImageUrl) : null;
  const showImage = Boolean(imageUrl);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <CardTitle className="text-base">{guide.title}</CardTitle>
            <CardDescription>{difficultyLabels[guide.difficulty]}</CardDescription>
          </div>
          <Badge variant="outline" className={statusBadgeClass(guide.status)}>{statusLabels[guide.status]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p className="line-clamp-4 whitespace-pre-wrap">{guide.body}</p>
        <div className="grid gap-2 md:grid-cols-3">
          <div className="rounded-lg border px-3 py-2"><span className="font-medium text-foreground">Slug:</span> {guide.slug}</div>
          <div className="rounded-lg border px-3 py-2"><span className="font-medium text-foreground">Phút:</span> {guide.duration}</div>
          <div className="rounded-lg border px-3 py-2"><span className="font-medium text-foreground">Thứ tự:</span> {guide.sortOrder}</div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border px-3 py-2">
          {showImage ? (
            <PreviewableImage
              src={imageUrl}
              alt={`Ảnh/bản kinh ${guide.title}`}
              title={`Ảnh/bản kinh ${guide.title}`}
              className="size-16 shrink-0"
            />
          ) : (
            <div className="flex size-16 shrink-0 items-center justify-center rounded-md border border-dashed bg-muted">
              <ImageIcon className="size-6 text-muted-foreground/50" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium text-foreground">Ảnh/bản kinh</p>
            <p className="truncate text-xs text-muted-foreground">
              {guide.scriptureImageMediaPublicId
                ? showImage
                  ? "Đã chọn từ thư viện media"
                  : "Đã chọn media nhưng chưa có preview"
                : "Chưa chọn ảnh/bản kinh"}
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button asChild variant="outline">
            <Link to="/noi-dung/kinh-bai-tap/$publicId" params={{ publicId: guide.publicId }}>
              Sửa và quản lý
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function DailyRecitationWorkspace() {
  const navigateTo = useNavigateTo();
  const {
    data: guidesEnvelope,
    isLoading: guidesLoading,
    refetch: refetchGuides,
    isRefetching: guidesRefetching,
  } = useQuery(dailyPracticeGuidesOptions());
  const {
    data: presetsEnvelope,
    isLoading: presetsLoading,
    refetch: refetchPresets,
    isRefetching: presetsRefetching,
  } = useQuery(dailyPracticePresetsOptions());
  const {
    data: faqEnvelope,
    isLoading: faqLoading,
    refetch: refetchFaq,
    isRefetching: faqRefetching,
  } = useQuery(dailyPracticeFaqOptions());

  const guides = guidesEnvelope?.data ?? [];
  const presets = presetsEnvelope?.data ?? [];
  const faqs = faqEnvelope?.data ?? [];

  const groupedGuides = useMemo(
    () => ({
      BEGINNER: guides.filter((guide) => guide.difficulty === "BEGINNER"),
      INTERMEDIATE: guides.filter((guide) => guide.difficulty === "INTERMEDIATE"),
      ADVANCED: guides.filter((guide) => guide.difficulty === "ADVANCED"),
    }),
    [guides],
  );
  const isRefetching = guidesRefetching || presetsRefetching || faqRefetching;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kinh bài tập</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Quản lý bộ bài niệm/chú, số biến gợi ý, lời khấn, ảnh/bản kinh để niệm, scenario presets và nguồn trích xuất.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              navigateTo("/noi-dung/kinh-bai-tap/tao-moi");
            }}
          >
            <PlusIcon className="size-4" />
            Thêm bài niệm / bài chú
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              void Promise.all([refetchGuides(), refetchPresets(), refetchFaq()]);
            }}
            disabled={isRefetching}
          >
            <RefreshCwIcon className={cn("mr-2 size-4", isRefetching && "animate-spin")} />
            Làm mới
          </Button>
        </div>
      </div>

      <Tabs defaultValue="guides" className="space-y-4">
        <TabsList className="h-auto flex-wrap gap-1 p-1">
          <TabsTrigger value="guides">Bài niệm và bước</TabsTrigger>
          <TabsTrigger value="presets">Scenario presets</TabsTrigger>
          <TabsTrigger value="faq">Hỏi đáp</TabsTrigger>
        </TabsList>

        <TabsContent value="guides" className="space-y-4">
          {guidesLoading ? <WorkspaceRouteSkeleton /> : guides.length ? (
            <div className="space-y-6">
              {Object.entries(groupedGuides).map(([difficulty, items]) => (
                <div key={difficulty} className="space-y-3">
                  <div>
                    <h2 className="text-lg font-semibold">{difficultyLabels[difficulty as DailyPracticeDifficulty]}</h2>
                    <p className="text-sm text-muted-foreground">{items.length} mục</p>
                  </div>
                  {items.length ? (
                    <div className="grid gap-4">
                      {items.map((guide) => (
                        <GuideCard
                          key={guide.publicId}
                          guide={guide}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState text="Chưa có bài nào cho nhóm này." />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="Chưa có bài niệm/bài chú nào." />
          )}
        </TabsContent>

        <TabsContent value="presets" className="space-y-4">
          <div className="flex justify-end">
            <Button asChild>
              <Link to="/noi-dung/kinh-bai-tap/kich-ban/tao-moi">
                Thêm scenario preset
              </Link>
            </Button>
          </div>
          {presetsLoading ? <WorkspaceRouteSkeleton /> : presets.length ? (
            <div className="grid gap-4">
              {presets.map((preset) => (
                <Card key={preset.publicId}>
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-base">{preset.name}</CardTitle>
                        <CardDescription>{preset.scenarioType}</CardDescription>
                      </div>
                        <Badge variant="outline">{preset.practiceCount} bài niệm/chú</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <div className="rounded-lg border px-3 py-2">Số bài liên kết: {preset.guideIds.length}</div>
                    <div className="rounded-lg border px-3 py-2">Cập nhật: {new Date(preset.updatedAt).toLocaleString("vi-VN")}</div>
                    <div className="flex justify-end">
                      <Button asChild variant="outline">
                        <Link to="/noi-dung/kinh-bai-tap/kich-ban/$publicId" params={{ publicId: preset.publicId }}>
                          Sửa và quản lý
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState text="Chưa có scenario preset nào." />
          )}
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <div className="flex justify-end">
            <Button asChild>
              <Link to="/noi-dung/kinh-bai-tap/hoi-dap/tao-moi">
                Thêm mục hỏi đáp
              </Link>
            </Button>
          </div>
          {faqLoading ? <WorkspaceRouteSkeleton /> : faqs.length ? (
            <div className="grid gap-4">
              {faqs.map((faq) => (
                <Card key={faq.publicId}>
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-base">{faq.question}</CardTitle>
                        <CardDescription>{faq.category}</CardDescription>
                      </div>
                      {faq.featured ? <Badge variant="outline">Nổi bật</Badge> : null}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p className="whitespace-pre-wrap">{faq.answer}</p>
                    <div className="rounded-lg border px-3 py-2">Thứ tự: {faq.sortOrder}</div>
                    <div className="flex justify-end">
                      <Button asChild variant="outline">
                        <Link to="/noi-dung/kinh-bai-tap/hoi-dap/$publicId" params={{ publicId: faq.publicId }}>
                          Sửa và quản lý
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState text="Chưa có mục hỏi đáp nào." />
          )}
        </TabsContent>

      </Tabs>

      {guidesLoading && presetsLoading && faqLoading ? <WorkspaceRouteSkeleton /> : null}
    </div>
  );
}
