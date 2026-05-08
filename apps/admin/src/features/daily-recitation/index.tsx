import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { type ColumnDef } from "@tanstack/react-table";
import {
  PlusIcon,
  RefreshCwIcon,
  ImageIcon,
} from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table";
import { WorkspaceManagementTable, WorkspaceRouteSkeleton } from "@/components/workspace";
import { PreviewableImage } from "@/components/media/image-preview-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { resolveMediaSrc } from "@/lib/media-src";
import { useNavigateTo } from "@/lib/router-utils";
import {
  dailyPracticeFaqOptions,
  dailyPracticeGuidesOptions,
  dailyPracticePresetsOptions,
  type DailyPracticeFaq,
  type DailyPracticeDifficulty,
  type DailyPracticeGuide,
  type DailyPracticePreset,
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

function GuideManagementTable({ guides, isLoading }: { guides: DailyPracticeGuide[]; isLoading?: boolean }) {
  const columns = useMemo<ColumnDef<DailyPracticeGuide>[]>(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Bài niệm / bài chú" />,
        cell: ({ row }) => (
          <div className="flex max-w-[460px] items-center gap-3">
            {row.original.scriptureImageUrl ? (
              <PreviewableImage
                src={resolveMediaSrc(row.original.scriptureImageUrl)}
                alt={`Ảnh/bản kinh ${row.original.title}`}
                title={`Ảnh/bản kinh ${row.original.title}`}
                className="size-12 shrink-0"
              />
            ) : (
              <div className="flex size-12 shrink-0 items-center justify-center rounded-md border border-dashed bg-muted">
                <ImageIcon className="size-5 text-muted-foreground/50" />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-medium">{row.original.title}</p>
              <p className="line-clamp-2 text-xs text-muted-foreground">{row.original.body}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "difficulty",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nhóm" />,
        cell: ({ row }) => <Badge variant="outline">{difficultyLabels[row.original.difficulty]}</Badge>,
      },
      {
        accessorKey: "duration",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Phút" />,
      },
      {
        accessorKey: "sortOrder",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Thứ tự" />,
      },
      {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
        cell: ({ row }) => (
          <Badge variant="outline" className={statusBadgeClass(row.original.status)}>
            {statusLabels[row.original.status]}
          </Badge>
        ),
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
            <Link to="/noi-dung/kinh-bai-tap/$publicId" params={{ publicId: row.original.publicId }}>
              Sửa và quản lý
            </Link>
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <WorkspaceManagementTable
      rows={guides}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="Chưa có bài niệm/bài chú nào."
    />
  );
}

function PresetManagementTable({ presets, isLoading }: { presets: DailyPracticePreset[]; isLoading?: boolean }) {
  const columns = useMemo<ColumnDef<DailyPracticePreset>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Scenario preset" />,
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.scenarioType}</p>
          </div>
        ),
      },
      {
        accessorKey: "practiceCount",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Số bài" />,
      },
      {
        accessorKey: "guideIds",
        header: "Liên kết",
        cell: ({ row }) => row.original.guideIds.length,
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
            <Link to="/noi-dung/kinh-bai-tap/kich-ban/$publicId" params={{ publicId: row.original.publicId }}>
              Sửa và quản lý
            </Link>
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <WorkspaceManagementTable
      rows={presets}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="Chưa có scenario preset nào."
    />
  );
}

function FaqManagementTable({ faqs, isLoading }: { faqs: DailyPracticeFaq[]; isLoading?: boolean }) {
  const columns = useMemo<ColumnDef<DailyPracticeFaq>[]>(
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
        accessorKey: "category",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Danh mục" />,
      },
      {
        accessorKey: "sortOrder",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Thứ tự" />,
      },
      {
        accessorKey: "featured",
        header: "Nổi bật",
        cell: ({ row }) => row.original.featured ? <Badge variant="outline">Nổi bật</Badge> : "—",
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
            <Link to="/noi-dung/kinh-bai-tap/hoi-dap/$publicId" params={{ publicId: row.original.publicId }}>
              Sửa và quản lý
            </Link>
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <WorkspaceManagementTable
      rows={faqs}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="Chưa có mục hỏi đáp nào."
    />
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
          <div className="space-y-6">
            {Object.entries(groupedGuides).map(([difficulty, items]) => (
              <div key={difficulty} className="space-y-3">
                <div>
                  <h2 className="text-lg font-semibold">{difficultyLabels[difficulty as DailyPracticeDifficulty]}</h2>
                  <p className="text-sm text-muted-foreground">{items.length} mục</p>
                </div>
                <GuideManagementTable guides={items} isLoading={guidesLoading} />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="presets" className="space-y-4">
          <div className="flex justify-end">
            <Button asChild>
              <Link to="/noi-dung/kinh-bai-tap/kich-ban/tao-moi">
                Thêm scenario preset
              </Link>
            </Button>
          </div>
          <PresetManagementTable presets={presets} isLoading={presetsLoading} />
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <div className="flex justify-end">
            <Button asChild>
              <Link to="/noi-dung/kinh-bai-tap/hoi-dap/tao-moi">
                Thêm mục hỏi đáp
              </Link>
            </Button>
          </div>
          <FaqManagementTable faqs={faqs} isLoading={faqLoading} />
        </TabsContent>

      </Tabs>

      {guidesLoading && presetsLoading && faqLoading ? <WorkspaceRouteSkeleton /> : null}
    </div>
  );
}
