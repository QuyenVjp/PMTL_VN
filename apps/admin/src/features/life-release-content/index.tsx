import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
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

import { DataTableColumnHeader } from "@/components/data-table";
import { WorkspaceConfirmDialog, WorkspaceManagementTable, WorkspaceRouteSkeleton } from "@/components/workspace";
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

function GuideManagementTable({ items }: { items: LifeReleaseGuide[] }) {
  const columns = useMemo<ColumnDef<LifeReleaseGuide>[]>(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Bài hướng dẫn" />,
        cell: ({ row }) => (
          <div className="max-w-[420px]">
            <p className="truncate font-medium">{row.original.title}</p>
            <p className="line-clamp-2 text-xs text-muted-foreground">{row.original.summary}</p>
          </div>
        ),
      },
      {
        accessorKey: "slug",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Slug" />,
        cell: ({ row }) => <Badge variant="outline">{row.original.slug}</Badge>,
      },
      {
        accessorKey: "displayOrder",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Thứ tự" />,
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Cập nhật" />,
        cell: ({ row }) => new Date(row.original.updatedAt).toLocaleString("vi-VN"),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button asChild variant="outline" size="sm">
            <Link to="/noi-dung/phong-sanh/huong-dan/$guidePublicId" params={{ guidePublicId: row.original.publicId }}>
              Sửa và quản lý
            </Link>
          </Button>
        ),
      },
    ],
    [],
  );

  return <WorkspaceManagementTable rows={items} columns={columns} emptyMessage="Chưa có bài hướng dẫn." />;
}

function VariantManagementTable({ items }: { items: LifeReleaseVariant[] }) {
  const columns = useMemo<ColumnDef<LifeReleaseVariant>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Biến thể" />,
        cell: ({ row }) => (
          <div className="max-w-[420px]">
            <p className="truncate font-medium">{row.original.name}</p>
            <p className="line-clamp-2 text-xs text-muted-foreground">{row.original.summary}</p>
          </div>
        ),
      },
      {
        accessorKey: "routeSlug",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Slug" />,
        cell: ({ row }) => <Badge variant="outline">{row.original.routeSlug}</Badge>,
      },
      {
        accessorKey: "displayOrder",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Thứ tự" />,
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Cập nhật" />,
        cell: ({ row }) => new Date(row.original.updatedAt).toLocaleString("vi-VN"),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button asChild variant="outline" size="sm">
            <Link to="/noi-dung/phong-sanh/bien-the/$variantPublicId" params={{ variantPublicId: row.original.publicId }}>
              Sửa và quản lý
            </Link>
          </Button>
        ),
      },
    ],
    [],
  );

  return <WorkspaceManagementTable rows={items} columns={columns} emptyMessage="Chưa có biến thể nghi thức." />;
}

function FaqManagementTable({ items }: { items: LifeReleaseFaq[] }) {
  const columns = useMemo<ColumnDef<LifeReleaseFaq>[]>(
    () => [
      {
        accessorKey: "question",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Câu hỏi" />,
        cell: ({ row }) => (
          <div className="max-w-[520px]">
            <p className="truncate font-medium">{row.original.question}</p>
            <p className="line-clamp-2 text-xs text-muted-foreground">{row.original.answer}</p>
          </div>
        ),
      },
      {
        accessorKey: "displayOrder",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Thứ tự" />,
      },
      {
        accessorKey: "sourceReference",
        header: "Nguồn",
        cell: ({ row }) => <span className="line-clamp-2 text-muted-foreground">{row.original.sourceReference}</span>,
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Cập nhật" />,
        cell: ({ row }) => new Date(row.original.updatedAt).toLocaleString("vi-VN"),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button asChild variant="outline" size="sm">
            <Link to="/noi-dung/phong-sanh/hoi-dap/$faqPublicId" params={{ faqPublicId: row.original.publicId }}>
              Sửa và quản lý
            </Link>
          </Button>
        ),
      },
    ],
    [],
  );

  return <WorkspaceManagementTable rows={items} columns={columns} emptyMessage="Chưa có mục hỏi đáp." />;
}

function DownloadManagementTable({ items }: { items: LifeReleaseDownload[] }) {
  const columns = useMemo<ColumnDef<LifeReleaseDownload>[]>(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tài nguyên" />,
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.title}</p>
            <p className="text-xs text-muted-foreground">{row.original.fileName}</p>
          </div>
        ),
      },
      {
        accessorKey: "assetType",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Loại" />,
        cell: ({ row }) => <Badge variant="outline">{row.original.assetType}</Badge>,
      },
      {
        accessorKey: "displayOrder",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Thứ tự" />,
      },
    ],
    [],
  );

  return <WorkspaceManagementTable rows={items} columns={columns} emptyMessage="Chưa có file tải xuống." />;
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
              <GuideManagementTable items={groupedGuides.NGHI_THUC} />
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
              <VariantManagementTable items={overview?.ritualVariants ?? []} />
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
              <GuideManagementTable items={groupedGuides.LUU_Y_CHUAN_BI} />
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
              <GuideManagementTable items={groupedGuides.HOI_DAP} />
              <FaqManagementTable items={overview?.faq ?? []} />
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
              <DownloadManagementTable items={overview?.downloads ?? []} />
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
