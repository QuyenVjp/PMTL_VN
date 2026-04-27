import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ArrowRightIcon,
  BookOpenIcon,
  ClipboardCheckIcon,
  DownloadIcon,
  FileStackIcon,
  HeartHandshakeIcon,
  ListChecksIcon,
  RefreshCwIcon,
  ShieldAlertIcon,
  WavesIcon,
} from "lucide-react";

import { WorkspaceConfirmDialog, WorkspaceRouteSkeleton } from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { usePublishLifeRelease } from "./mutations.js";
import { lifeReleaseOverviewOptions, type LifeReleaseGuideGroup } from "./queries.js";

const GROUP_LABELS: Record<LifeReleaseGuideGroup, string> = {
  NGHI_THUC: "Nghi thức",
  LUU_Y_CHUAN_BI: "Lưu ý và chuẩn bị",
  HOI_DAP: "Hỏi đáp",
};

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
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Phóng sanh</h1>
          <p className="text-sm text-muted-foreground">
            Khu biên tập chính cho nghi thức, biến thể nghi thức, phần hỏi đáp và tệp tải xuống của Phóng sanh. Không được trộn với nhật ký thành viên hay lịch nhắc việc.
          </p>
        </div>
        <div className="flex items-center gap-2">
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

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Tổng quan khu biên tập</CardTitle>
              <CardDescription>Trang gốc này đang đọc dữ liệu thật của khu Phóng sanh từ API quản trị.</CardDescription>
            </div>
            {overview ? (
              <Badge variant="outline" className={statusBadgeClass(overview.status)}>
                {overview.status === "PUBLISHED" ? "Đã xuất bản" : "Nháp"}
              </Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Khác với nhật ký</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {overview?.boundarySummary.differentFromJournal ?? "—"}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Khác với calendar</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {overview?.boundarySummary.differentFromCalendar ?? "—"}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Thông tin biên tập</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p><span className="font-medium text-foreground">Biên tập:</span> {overview?.updatedByLabel ?? "—"}</p>
              <p><span className="font-medium text-foreground">Cập nhật:</span> {overview ? new Date(overview.updatedAt).toLocaleString("vi-VN") : "—"}</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WavesIcon className="size-5" />
              Cấu trúc nghi thức chuẩn
            </CardTitle>
            <CardDescription>
              Phóng sanh phải giữ nghi thức chuẩn và liên kết rõ với nhật ký của thành viên, không được biến route này thành màn mô tả chung chung.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Object.entries(groupedGuides).map(([key, items]) => (
              <div key={key} className="rounded-lg border bg-muted/20 p-4">
                <p className="font-medium text-foreground">{GROUP_LABELS[key as LifeReleaseGuideGroup]}</p>
                <p className="mt-3 text-sm text-muted-foreground">{items.length} bài hướng dẫn chuẩn</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {items[0]?.summary ?? "Nhóm này đang chờ biên tập bổ sung đúng nguồn tham chiếu."}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldAlertIcon className="size-4 text-muted-foreground" />
                Boundary vận hành
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {(overview?.boundarySummary.nonNegotiables ?? []).map((item) => (
                <div key={item} className="rounded-lg border px-3 py-2">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Lane liên quan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-between">
                <Link to="/phong-sinh/ho-so">
                  Hồ sơ phóng sinh
                  <ArrowRightIcon className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-between">
                <Link to="/ho-tro/phat-nguyen/nhap-ho">
                  Nhập hộ phát nguyện
                  <ArrowRightIcon className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="ritual" className="space-y-4">
        <TabsList className="h-auto flex-wrap gap-1 p-1">
          <TabsTrigger value="ritual">Nghi thức</TabsTrigger>
          <TabsTrigger value="variants">Biến thể nghi thức</TabsTrigger>
          <TabsTrigger value="prep">Lưu ý và chuẩn bị</TabsTrigger>
          <TabsTrigger value="faq">Hỏi đáp</TabsTrigger>
          <TabsTrigger value="downloads">Tải xuống</TabsTrigger>
          <TabsTrigger value="review">Phiên bản và nguồn</TabsTrigger>
        </TabsList>

        <TabsContent value="ritual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpenIcon className="size-4 text-muted-foreground" />
                Nghi thức chuẩn
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {groupedGuides.NGHI_THUC.length ? groupedGuides.NGHI_THUC.map((item) => (
                <div key={item.publicId} className="rounded-lg border bg-muted/20 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.summary}</p>
                    </div>
                    <Badge variant="outline">{item.slug}</Badge>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                    <p><span className="font-medium text-foreground">Nguồn:</span> {item.sourceReference}</p>
                    <p><span className="font-medium text-foreground">Ghi chú biên tập:</span> {item.reviewNote}</p>
                  </div>
                </div>
              )) : <EmptyState text="Chưa có bài hướng dẫn nghi thức chuẩn." />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variants">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <HeartHandshakeIcon className="size-4 text-muted-foreground" />
                Biến thể nghi thức
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {overview?.ritualVariants.length ? overview.ritualVariants.map((item) => (
                <div key={item.publicId} className="rounded-lg border bg-muted/20 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.summary}</p>
                    </div>
                    <Badge variant="outline">{item.routeSlug}</Badge>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                    <p><span className="font-medium text-foreground">Nguồn:</span> {item.sourceReference}</p>
                    <p><span className="font-medium text-foreground">Ghi chú biên tập:</span> {item.reviewNote}</p>
                    {item.warningNotes.map((warning) => (
                      <div key={warning} className="rounded-lg border bg-background px-3 py-2">
                        {warning}
                      </div>
                    ))}
                  </div>
                </div>
              )) : <EmptyState text="Chưa có biến thể nghi thức." />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prep">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardCheckIcon className="size-4 text-muted-foreground" />
                Lưu ý và chuẩn bị
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {groupedGuides.LUU_Y_CHUAN_BI.length ? groupedGuides.LUU_Y_CHUAN_BI.map((item) => (
                <div key={item.publicId} className="rounded-lg border bg-muted/20 p-4">
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{item.summary}</p>
                  <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                    <p><span className="font-medium text-foreground">Nguồn:</span> {item.sourceReference}</p>
                    <p><span className="font-medium text-foreground">Ghi chú biên tập:</span> {item.reviewNote}</p>
                    {item.warningNotes.map((warning) => (
                      <div key={warning} className="rounded-lg border bg-background px-3 py-2">
                        {warning}
                      </div>
                    ))}
                  </div>
                </div>
              )) : <EmptyState text="Chưa có bài hướng dẫn phần chuẩn bị." />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ListChecksIcon className="size-4 text-muted-foreground" />
                Hỏi đáp và liên kết sang nhật ký
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[...groupedGuides.HOI_DAP, ...(overview?.faq ?? [])].length ? (
                <>
                  {groupedGuides.HOI_DAP.map((item) => (
                    <div key={item.publicId} className="rounded-lg border bg-muted/20 p-4">
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{item.summary}</p>
                      <p className="mt-3 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Nguồn:</span> {item.sourceReference}
                      </p>
                    </div>
                  ))}
                  {(overview?.faq ?? []).map((item) => (
                    <div key={item.publicId} className="rounded-lg border bg-muted/20 p-4">
                      <p className="font-medium text-foreground">{item.question}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
                      <p className="mt-3 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Nguồn:</span> {item.sourceReference}
                      </p>
                    </div>
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
                <div key={item.publicId} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/20 p-4">
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.fileName}</p>
                  </div>
                  <Badge variant="outline">{item.assetType}</Badge>
                </div>
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
