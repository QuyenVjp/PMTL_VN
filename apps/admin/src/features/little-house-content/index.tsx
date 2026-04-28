import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangleIcon,
  BookOpenIcon,
  DownloadIcon,
  FileStackIcon,
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
import { usePublishLittleHouse } from "./mutations.js";
import { littleHouseOverviewOptions, type LittleHouseGuideGroup } from "./queries.js";

const GROUP_LABELS: Record<LittleHouseGuideGroup, string> = {
  BAT_DAU: "Bắt đầu",
  TRI_TUNG: "Trì tụng",
  DOT_HAU_XU_LY: "Đốt và hậu xử lý",
  TRA_CUU: "Tra cứu",
  THUC_HANH: "Thực hành",
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

export function LittleHouseContentWorkspace() {
  const { data: overview, isLoading, refetch, isRefetching } = useQuery(littleHouseOverviewOptions());
  const publishMutation = usePublishLittleHouse();
  const [confirmStatus, setConfirmStatus] = useState<"DRAFT" | "PUBLISHED" | null>(null);

  const groupedGuides = useMemo(() => {
    const guides = overview?.guides ?? [];
    return {
      BAT_DAU: guides.filter((item) => item.groupKey === "BAT_DAU"),
      TRI_TUNG: guides.filter((item) => item.groupKey === "TRI_TUNG"),
      DOT_HAU_XU_LY: guides.filter((item) => item.groupKey === "DOT_HAU_XU_LY"),
      TRA_CUU: guides.filter((item) => item.groupKey === "TRA_CUU"),
      THUC_HANH: guides.filter((item) => item.groupKey === "THUC_HANH"),
    };
  }, [overview]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ngôi Nhà Nhỏ</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Quản lý nội dung chuẩn, biến thể tình huống, hỏi đáp, file tải xuống, nguồn tham chiếu và trạng thái xuất bản của Ngôi Nhà Nhỏ.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link to="/noi-dung/ngoi-nha-nho/huong-dan/tao-moi">
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
          <TabsTrigger value="guides">Hướng dẫn chính</TabsTrigger>
          <TabsTrigger value="cases">Biến thể tình huống</TabsTrigger>
          <TabsTrigger value="faq">Hỏi đáp</TabsTrigger>
          <TabsTrigger value="downloads">Tải xuống</TabsTrigger>
          <TabsTrigger value="review">Phiên bản và nguồn</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
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
              <p className="font-medium">Nội dung đang quản lý</p>
              <p className="mt-3 text-sm text-muted-foreground">
                {(overview?.guides.length ?? 0)} bài hướng dẫn, {(overview?.caseVariants.length ?? 0)} biến thể, {(overview?.faq.length ?? 0)} mục hỏi đáp.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="font-medium">File tải xuống</p>
              <p className="mt-3 text-sm text-muted-foreground">
                {(overview?.downloads.length ?? 0)} asset đang gắn với workspace nội dung Ngôi Nhà Nhỏ.
              </p>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border bg-card p-4">
              <p className="font-medium">Khác với Kinh văn tự tu</p>
              <p className="mt-3 text-sm text-muted-foreground">{overview?.boundarySummary.differentFromSelfCultivation ?? "—"}</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="font-medium">Khác với Kinh bài tập</p>
              <p className="mt-3 text-sm text-muted-foreground">{overview?.boundarySummary.differentFromDailyPractice ?? "—"}</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="guides" className="space-y-4">
          {Object.entries(groupedGuides).map(([key, items]) => (
            <Card key={key}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BookOpenIcon className="size-4 text-muted-foreground" />
                    {GROUP_LABELS[key as LittleHouseGuideGroup]}
                  </CardTitle>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/noi-dung/ngoi-nha-nho/huong-dan/tao-moi">
                      <PlusIcon className="mr-2 size-4" />
                      Thêm bài
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.length ? items.map((item) => (
                  <div key={item.publicId} className="rounded-lg border bg-muted/20 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <p className="font-medium text-foreground">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.summary}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{item.slug}</Badge>
                        <Button asChild variant="outline" size="sm">
                          <Link to="/noi-dung/ngoi-nha-nho/huong-dan/$guidePublicId" params={{ guidePublicId: item.publicId }}>
                            Sửa và quản lý
                          </Link>
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                      <p><span className="font-medium text-foreground">Nguồn:</span> {item.sourceReference}</p>
                      <p><span className="font-medium text-foreground">Ghi chú phiên bản:</span> {item.versionNote}</p>
                      {item.warningNotes.length ? (
                        <div className="space-y-2">
                          <p className="font-medium text-foreground">Cảnh báo</p>
                          {item.warningNotes.map((warning) => (
                            <div key={warning} className="rounded-lg border bg-background px-3 py-2">
                              {warning}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                )) : <EmptyState text="Nhóm này chưa có bài hướng dẫn chuẩn." />}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="cases">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ListChecksIcon className="size-4 text-muted-foreground" />
                  Biến thể tình huống
                </CardTitle>
                <Button asChild variant="outline" size="sm">
                  <Link to="/noi-dung/ngoi-nha-nho/bien-the/tao-moi">
                    <PlusIcon className="mr-2 size-4" />
                    Thêm biến thể
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {overview?.caseVariants.length ? overview.caseVariants.map((item) => (
                <div key={item.publicId} className="rounded-lg border bg-muted/20 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.summary}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{GROUP_LABELS[item.relatedGroup]}</Badge>
                      <Button asChild variant="outline" size="sm">
                        <Link to="/noi-dung/ngoi-nha-nho/bien-the/$variantPublicId" params={{ variantPublicId: item.publicId }}>
                          Sửa và quản lý
                        </Link>
                      </Button>
                    </div>
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
              )) : <EmptyState text="Chưa có biến thể tình huống." />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangleIcon className="size-4 text-muted-foreground" />
                  Hỏi đáp trọng tâm
                </CardTitle>
                <Button asChild variant="outline" size="sm">
                  <Link to="/noi-dung/ngoi-nha-nho/hoi-dap/tao-moi">
                    <PlusIcon className="mr-2 size-4" />
                    Thêm mục hỏi đáp
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {overview?.faq.length ? overview.faq.map((item) => (
                <div key={item.publicId} className="rounded-lg border bg-muted/20 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="font-medium text-foreground">{item.question}</p>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/noi-dung/ngoi-nha-nho/hoi-dap/$faqPublicId" params={{ faqPublicId: item.publicId }}>
                        Sửa và quản lý
                      </Link>
                    </Button>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Nguồn:</span> {item.sourceReference}
                  </p>
                </div>
              )) : <EmptyState text="Chưa có mục hỏi đáp." />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="downloads">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DownloadIcon className="size-4 text-muted-foreground" />
                Downloads và asset minh họa
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
          title={confirmStatus === "PUBLISHED" ? "Xuất bản Ngôi Nhà Nhỏ" : "Đưa khu biên tập về nháp"}
          description={
            confirmStatus === "PUBLISHED"
              ? "Xác nhận xuất bản nội dung chuẩn của Ngôi Nhà Nhỏ với ghi chú phiên bản mới."
              : "Xác nhận đưa khu biên tập Ngôi Nhà Nhỏ về trạng thái nháp."
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
