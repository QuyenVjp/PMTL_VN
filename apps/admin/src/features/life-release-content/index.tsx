import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  BookOpenIcon,
  ClipboardCheckIcon,
  DownloadIcon,
  FileStackIcon,
  HeartHandshakeIcon,
  ListChecksIcon,
  PlusIcon,
  RefreshCwIcon,
} from "lucide-react";

import { WorkspaceConfirmDialog, WorkspaceRouteSkeleton } from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { usePublishLifeRelease } from "./mutations.js";
import {
  lifeReleaseOverviewOptions,
  type LifeReleaseDownload,
  type LifeReleaseFaq,
  type LifeReleaseGuide,
  type LifeReleaseVariant,
} from "./queries.js";

function statusBadgeClass(status: "DRAFT" | "PUBLISHED") {
  return status === "PUBLISHED"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
    : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
}

function EmptyState({ text }: { text: string }) {
  return (
    <Card>
      <CardContent className="pt-6 text-sm text-muted-foreground">{text}</CardContent>
    </Card>
  );
}

function GuideManagementItem({ item }: { item: LifeReleaseGuide }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <p className="font-medium text-foreground">{item.title}</p>
          <p className="text-sm text-muted-foreground">{item.summary}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{item.slug}</Badge>
          <Button asChild variant="outline" size="sm">
            <Link to="/noi-dung/phong-sanh/huong-dan/$guidePublicId" params={{ guidePublicId: item.publicId }}>
              Sửa và quản lý
            </Link>
          </Button>
        </div>
      </div>
      <div className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
        <p><span className="font-medium text-foreground">Thứ tự:</span> {item.displayOrder}</p>
        <p><span className="font-medium text-foreground">Cập nhật:</span> {new Date(item.updatedAt).toLocaleString("vi-VN")}</p>
        <p className="md:col-span-2"><span className="font-medium text-foreground">Nguồn:</span> {item.sourceReference}</p>
        <p className="md:col-span-2"><span className="font-medium text-foreground">Ghi chú biên tập:</span> {item.reviewNote}</p>
      </div>
      {item.warningNotes.length ? (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-foreground">Cảnh báo</p>
          {item.warningNotes.map((warning) => (
            <div key={warning} className="rounded-lg border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
              {warning}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function VariantManagementItem({ item }: { item: LifeReleaseVariant }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <p className="font-medium text-foreground">{item.name}</p>
          <p className="text-sm text-muted-foreground">{item.summary}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{item.routeSlug}</Badge>
          <Button asChild variant="outline" size="sm">
            <Link to="/noi-dung/phong-sanh/bien-the/$variantPublicId" params={{ variantPublicId: item.publicId }}>
              Sửa và quản lý
            </Link>
          </Button>
        </div>
      </div>
      <div className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
        <p><span className="font-medium text-foreground">Thứ tự:</span> {item.displayOrder}</p>
        <p><span className="font-medium text-foreground">Cập nhật:</span> {new Date(item.updatedAt).toLocaleString("vi-VN")}</p>
        <p className="md:col-span-2"><span className="font-medium text-foreground">Nguồn:</span> {item.sourceReference}</p>
        <p className="md:col-span-2"><span className="font-medium text-foreground">Ghi chú biên tập:</span> {item.reviewNote}</p>
      </div>
      {item.warningNotes.length ? (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-foreground">Cảnh báo</p>
          {item.warningNotes.map((warning) => (
            <div key={warning} className="rounded-lg border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
              {warning}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FaqManagementItem({ item }: { item: LifeReleaseFaq }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <p className="font-medium text-foreground">{item.question}</p>
          <p className="text-sm text-muted-foreground">{item.answer}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">#{item.displayOrder}</Badge>
          <Button asChild variant="outline" size="sm">
            <Link to="/noi-dung/phong-sanh/hoi-dap/$faqPublicId" params={{ faqPublicId: item.publicId }}>
              Sửa và quản lý
            </Link>
          </Button>
        </div>
      </div>
      <div className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
        <p><span className="font-medium text-foreground">Cập nhật:</span> {new Date(item.updatedAt).toLocaleString("vi-VN")}</p>
        <p className="md:col-span-2"><span className="font-medium text-foreground">Nguồn:</span> {item.sourceReference}</p>
      </div>
    </div>
  );
}

function DownloadManagementItem({ item }: { item: LifeReleaseDownload }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-4">
      <div className="min-w-0">
        <p className="font-medium text-foreground">{item.title}</p>
        <p className="text-sm text-muted-foreground">{item.fileName}</p>
        <p className="mt-1 text-xs text-muted-foreground">Thứ tự: {item.displayOrder}</p>
      </div>
      <Badge variant="outline">{item.assetType}</Badge>
    </div>
  );
}

export function LifeReleaseContentWorkspace() {
  const { data: overview, isLoading, refetch, isRefetching } = useQuery(lifeReleaseOverviewOptions());
  const publishMutation = usePublishLifeRelease();
  const [confirmStatus, setConfirmStatus] = useState<"DRAFT" | "PUBLISHED" | null>(null);

  const groupedGuides = useMemo(() => {
    const guides = overview?.guides ?? [];
    return {
      NGHI_THUC: guides.filter((item) => item.groupKey === "NGHI_THUC"),
      LUU_Y_CHUAN_BI: guides.filter((item) => item.groupKey === "LUU_Y_CHUAN_BI"),
      HOI_DAP: guides.filter((item) => item.groupKey === "HOI_DAP"),
    };
  }, [overview]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Phóng sanh</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Quản lý nội dung nghi thức, biến thể, checklist chuẩn bị, hỏi đáp, file tải xuống, nguồn tham chiếu và trạng thái xuất bản của Phóng sanh.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link to="/noi-dung/phong-sanh/huong-dan/tao-moi">
              <PlusIcon className="size-4" />
              Thêm bài hướng dẫn
            </Link>
          </Button>
          <Button variant="outline" onClick={() => void refetch()} disabled={isRefetching}>
            <RefreshCwIcon className={cn("mr-2 size-4", isRefetching && "animate-spin")} />
            Làm mới
          </Button>
          {overview ? (
            <Button onClick={() => setConfirmStatus(overview.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED")}>
              {overview.status === "PUBLISHED" ? "Đưa về nháp" : "Xuất bản"}
            </Button>
          ) : null}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="h-auto flex-wrap gap-1 p-1">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="ritual">Nghi thức</TabsTrigger>
          <TabsTrigger value="variants">Biến thể nghi thức</TabsTrigger>
          <TabsTrigger value="prep">Lưu ý và chuẩn bị</TabsTrigger>
          <TabsTrigger value="faq">Hỏi đáp</TabsTrigger>
          <TabsTrigger value="downloads">Tải xuống</TabsTrigger>
          <TabsTrigger value="review">Phiên bản và nguồn</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-4">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">Trạng thái</p>
                {overview ? (
                  <Badge variant="outline" className={statusBadgeClass(overview.status)}>
                    {overview.status === "PUBLISHED" ? "Đã xuất bản" : "Nháp"}
                  </Badge>
                ) : null}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {overview ? `Cập nhật: ${new Date(overview.updatedAt).toLocaleString("vi-VN")}` : "Đang tải trạng thái xuất bản."}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="font-medium">Nội dung hướng dẫn</p>
              <p className="mt-3 text-sm text-muted-foreground">{overview?.guides.length ?? 0} bài theo nhóm nghi thức, chuẩn bị và hỏi đáp.</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="font-medium">Biến thể nghi thức</p>
              <p className="mt-3 text-sm text-muted-foreground">{overview?.ritualVariants.length ?? 0} variant first-class, không chôn trong một bài dài.</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="font-medium">Tài nguyên</p>
              <p className="mt-3 text-sm text-muted-foreground">{overview?.downloads.length ?? 0} file tải xuống, {overview?.sourceReferences.length ?? 0} nguồn tham chiếu.</p>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border bg-card p-4">
              <p className="font-medium">Tách khỏi nhật ký thành viên</p>
              <p className="mt-3 text-sm text-muted-foreground">{overview?.boundarySummary.differentFromJournal ?? "—"}</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="font-medium">Tách khỏi lịch nhắc việc</p>
              <p className="mt-3 text-sm text-muted-foreground">{overview?.boundarySummary.differentFromCalendar ?? "—"}</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ritual" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpenIcon className="size-4 text-muted-foreground" />
                  Nghi thức chuẩn
                </CardTitle>
                <Button asChild variant="outline" size="sm">
                  <Link to="/noi-dung/phong-sanh/huong-dan/tao-moi">
                    <PlusIcon className="mr-2 size-4" />
                    Thêm bài nghi thức
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {groupedGuides.NGHI_THUC.length ? groupedGuides.NGHI_THUC.map((item) => (
                <GuideManagementItem key={item.publicId} item={item} />
              )) : <EmptyState text="Chưa có bài hướng dẫn nghi thức chuẩn." />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variants">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <HeartHandshakeIcon className="size-4 text-muted-foreground" />
                  Biến thể nghi thức
                </CardTitle>
                <Button asChild variant="outline" size="sm">
                  <Link to="/noi-dung/phong-sanh/bien-the/tao-moi">
                    <PlusIcon className="mr-2 size-4" />
                    Thêm biến thể
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {overview?.ritualVariants.length ? overview.ritualVariants.map((item) => (
                <VariantManagementItem key={item.publicId} item={item} />
              )) : <EmptyState text="Chưa có biến thể nghi thức." />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prep">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ClipboardCheckIcon className="size-4 text-muted-foreground" />
                  Lưu ý và chuẩn bị
                </CardTitle>
                <Button asChild variant="outline" size="sm">
                  <Link to="/noi-dung/phong-sanh/huong-dan/tao-moi">
                    <PlusIcon className="mr-2 size-4" />
                    Thêm checklist
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {groupedGuides.LUU_Y_CHUAN_BI.length ? groupedGuides.LUU_Y_CHUAN_BI.map((item) => (
                <GuideManagementItem key={item.publicId} item={item} />
              )) : <EmptyState text="Chưa có bài hướng dẫn phần chuẩn bị." />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ListChecksIcon className="size-4 text-muted-foreground" />
                  Hỏi đáp và liên kết sang nhật ký
                </CardTitle>
                <Button asChild variant="outline" size="sm">
                  <Link to="/noi-dung/phong-sanh/hoi-dap/tao-moi">
                    <PlusIcon className="mr-2 size-4" />
                    Thêm mục hỏi đáp
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[...groupedGuides.HOI_DAP, ...(overview?.faq ?? [])].length ? (
                <>
                  {groupedGuides.HOI_DAP.map((item) => (
                    <GuideManagementItem key={item.publicId} item={item} />
                  ))}
                  {(overview?.faq ?? []).map((item) => (
                    <FaqManagementItem key={item.publicId} item={item} />
                  ))}
                </>
              ) : <EmptyState text="Chưa có mục hỏi đáp hay bài giải thích ngắn." />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="downloads">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DownloadIcon className="size-4 text-muted-foreground" />
                Downloads và checklist hiện trường
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {overview?.downloads.length ? overview.downloads.map((item) => (
                <DownloadManagementItem key={item.publicId} item={item} />
              )) : <EmptyState text="Chưa có file tải xuống." />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileStackIcon className="size-4 text-muted-foreground" />
                Nguồn tham chiếu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {(overview?.sourceReferences ?? []).map((item) => (
                <div key={item} className="rounded-lg border px-3 py-2">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ghi chú phiên bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {(overview?.versionNotes ?? []).map((item) => (
                <div key={item} className="rounded-lg border px-3 py-2">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {confirmStatus ? (
        <WorkspaceConfirmDialog
          open
          onOpenChange={(open) => {
            if (!open) setConfirmStatus(null);
          }}
          title={confirmStatus === "PUBLISHED" ? "Xuất bản Phóng sanh" : "Đưa khu biên tập về nháp"}
          description={
            confirmStatus === "PUBLISHED"
              ? "Xác nhận xuất bản nội dung chuẩn của Phóng sanh với ghi chú phiên bản mới."
              : "Xác nhận đưa khu biên tập Phóng sanh về trạng thái nháp."
          }
          confirmLabel={confirmStatus === "PUBLISHED" ? "Xuất bản" : "Đưa về nháp"}
          isPending={publishMutation.isPending}
          onConfirm={() =>
            publishMutation.mutate(
              {
                status: confirmStatus,
                changeSummary: confirmStatus === "PUBLISHED" ? "Xuất bản từ khu quản trị." : "Đưa về nháp từ khu quản trị.",
              },
              { onSuccess: () => setConfirmStatus(null) },
            )
          }
        />
      ) : null}

      {isLoading ? <WorkspaceRouteSkeleton /> : null}
    </div>
  );
}
