import { useMemo, useState } from "react";
import { type ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import { WorkspaceDataTable, WorkspaceRowActions } from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { fraudAlertListOptions, vowListOptions, charityListOptions, guidanceQueueOptions } from "./queries.js";
import {
  useCreateCharity,
  useUpdateCharityStatus,
  useResolveFraudAlert,
  useRespondGuidance,
} from "./mutations.js";
import {
  CHARITY_STATUS_LABELS,
  FRAUD_SEVERITY_LABELS,
  FRAUD_SEVERITY_VARIANT,
  VOW_STATUS_LABELS,
  GUIDANCE_URGENCY_VARIANT,
  type CharityListItem,
  type FraudAlertItem,
  type VowListItem,
  type GuidanceQueueItem,
  type CharityStatus,
} from "./types.js";

// ─── Charities ────────────────────────────────────────────────────────────────

type StatusDialogState = {
  item: CharityListItem;
  targetStatus: CharityStatus;
  reason: string;
} | null;

function CharityRowActions({ item, onStatusAction }: { item: CharityListItem; onStatusAction: (item: CharityListItem, targetStatus: CharityStatus) => void }) {
  const actions = [];

  if (item.status === "PENDING_REVIEW") {
    actions.push({
      label: "Xác minh",
      onClick: () => onStatusAction(item, "ACTIVE"),
    });
  } else if (item.status === "ACTIVE") {
    actions.push({
      label: "Tạm dừng",
      onClick: () => onStatusAction(item, "SUSPENDED"),
    });
  } else if (item.status === "SUSPENDED") {
    actions.push({
      label: "Kích hoạt lại",
      onClick: () => onStatusAction(item, "ACTIVE"),
    });
  }

  if (item.status !== "FLAGGED") {
    actions.push({
      label: "Thu hồi",
      onClick: () => onStatusAction(item, "FLAGGED"),
      variant: "destructive" as const,
    });
  }

  if (actions.length === 0) return null;
  return <WorkspaceRowActions actions={actions} />;
}

export function CharitiesPage() {
  const { data: envelope, isLoading } = useQuery(charityListOptions());
  const items = useMemo(() => envelope?.data ?? [], [envelope]);

  const createCharity = useCreateCharity();
  const updateStatus = useUpdateCharityStatus();

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    charityType: "",
    registrationNumber: "",
    contactEmail: "",
    websiteUrl: "",
  });

  const [statusDialog, setStatusDialog] = useState<StatusDialogState>(null);

  function handleOpenStatusDialog(item: CharityListItem, targetStatus: CharityStatus) {
    setStatusDialog({ item, targetStatus, reason: "" });
  }

  function handleConfirmStatus() {
    if (!statusDialog) return;
    updateStatus.mutate(
      { publicId: statusDialog.item.id, status: statusDialog.targetStatus, reason: statusDialog.reason },
      { onSuccess: () => setStatusDialog(null) },
    );
  }

  function handleCreate() {
    createCharity.mutate(
      {
        name: createForm.name,
        charityType: createForm.charityType,
        registrationNumber: createForm.registrationNumber || undefined,
        contactEmail: createForm.contactEmail || undefined,
        websiteUrl: createForm.websiteUrl || undefined,
      },
      {
        onSuccess: () => {
          setShowCreate(false);
          setCreateForm({ name: "", charityType: "", registrationNumber: "", contactEmail: "", websiteUrl: "" });
        },
      },
    );
  }

  const charityColumns: ColumnDef<CharityListItem>[] = useMemo(
    () => [
      { accessorKey: "name", header: "Tên tổ chức" },
      { accessorKey: "charityType", header: "Loại" },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <Badge variant="outline">{CHARITY_STATUS_LABELS[row.original.status]}</Badge>
        ),
      },
      {
        accessorKey: "registrationNumber",
        header: "Mã đăng ký",
        cell: ({ row }) => row.original.registrationNumber ?? "—",
      },
      {
        accessorKey: "contactEmail",
        header: "Email",
        cell: ({ row }) => row.original.contactEmail ?? "—",
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <CharityRowActions item={row.original} onStatusAction={handleOpenStatusDialog} />
        ),
      },
    ],
    [],
  );

  const table = useSafeReactTable({ data: items, columns: charityColumns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tổ chức từ thiện</h1>
          <p className="mt-2 text-sm text-muted-foreground">Danh sách và quản lý các tổ chức từ thiện đã đăng ký</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <PlusIcon className="size-4" />
          Thêm tổ chức
        </Button>
      </div>

      <WorkspaceDataTable table={table} columns={charityColumns} isLoading={isLoading} emptyMessage="Chưa có tổ chức nào." />

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Thêm tổ chức từ thiện</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="charity-name">Tên tổ chức <span className="text-destructive">*</span></Label>
              <Input
                id="charity-name"
                value={createForm.name}
                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nhập tên tổ chức"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="charity-type">Loại <span className="text-destructive">*</span></Label>
              <Select
                value={createForm.charityType}
                onValueChange={(v) => setCreateForm((f) => ({ ...f, charityType: v }))}
              >
                <SelectTrigger id="charity-type">
                  <SelectValue placeholder="Chọn loại tổ chức" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FOOD_BANK">Ngân hàng thực phẩm</SelectItem>
                  <SelectItem value="MEDICAL">Y tế</SelectItem>
                  <SelectItem value="EDUCATION">Giáo dục</SelectItem>
                  <SelectItem value="DISASTER_RELIEF">Cứu trợ thảm họa</SelectItem>
                  <SelectItem value="ANIMAL_WELFARE">Phúc lợi động vật</SelectItem>
                  <SelectItem value="OTHER">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="charity-reg">Mã đăng ký</Label>
              <Input
                id="charity-reg"
                value={createForm.registrationNumber}
                onChange={(e) => setCreateForm((f) => ({ ...f, registrationNumber: e.target.value }))}
                placeholder="Mã đăng ký (tuỳ chọn)"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="charity-email">Email liên hệ</Label>
              <Input
                id="charity-email"
                type="email"
                value={createForm.contactEmail}
                onChange={(e) => setCreateForm((f) => ({ ...f, contactEmail: e.target.value }))}
                placeholder="email@toà-chức.vn"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="charity-web">Website</Label>
              <Input
                id="charity-web"
                value={createForm.websiteUrl}
                onChange={(e) => setCreateForm((f) => ({ ...f, websiteUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Huỷ</Button>
            <Button
              onClick={handleCreate}
              disabled={!createForm.name || !createForm.charityType || createCharity.isPending}
            >
              {createCharity.isPending ? "Đang lưu..." : "Thêm tổ chức"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status change confirm dialog */}
      {statusDialog && (
        <Dialog open onOpenChange={() => setStatusDialog(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {statusDialog.targetStatus === "ACTIVE" && "Xác minh / kích hoạt tổ chức"}
                {statusDialog.targetStatus === "SUSPENDED" && "Tạm dừng tổ chức"}
                {statusDialog.targetStatus === "FLAGGED" && "Thu hồi tổ chức"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Tổ chức: <span className="font-semibold text-foreground">{statusDialog.item.name}</span>
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="status-reason">Lý do</Label>
                <Textarea
                  id="status-reason"
                  value={statusDialog.reason}
                  onChange={(e) => setStatusDialog((d) => d ? { ...d, reason: e.target.value } : d)}
                  placeholder="Ghi chú lý do thay đổi trạng thái..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStatusDialog(null)}>Huỷ</Button>
              <Button
                variant={statusDialog.targetStatus === "FLAGGED" ? "destructive" : "default"}
                onClick={handleConfirmStatus}
                disabled={updateStatus.isPending}
              >
                {updateStatus.isPending ? "Đang lưu..." : "Xác nhận"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─── Fraud Alerts ─────────────────────────────────────────────────────────────

type ResolveDialogState = {
  item: FraudAlertItem;
  resolution: string;
} | null;

export function FraudAlertsPage() {
  const { data: envelope, isLoading } = useQuery(fraudAlertListOptions());
  const items = useMemo(() => envelope?.data ?? [], [envelope]);

  const resolveAlert = useResolveFraudAlert();
  const [resolveDialog, setResolveDialog] = useState<ResolveDialogState>(null);

  function handleConfirmResolve() {
    if (!resolveDialog) return;
    resolveAlert.mutate(
      { publicId: resolveDialog.item.id, resolution: resolveDialog.resolution },
      { onSuccess: () => setResolveDialog(null) },
    );
  }

  const fraudColumns: ColumnDef<FraudAlertItem>[] = useMemo(
    () => [
      {
        accessorKey: "charity",
        header: "Tổ chức liên quan",
        cell: ({ row }) => row.original.charity?.name ?? "—",
      },
      { accessorKey: "alertType", header: "Loại cảnh báo" },
      {
        accessorKey: "severity",
        header: "Mức độ",
        cell: ({ row }) => (
          <Badge variant={FRAUD_SEVERITY_VARIANT[row.original.severity]}>
            {FRAUD_SEVERITY_LABELS[row.original.severity]}
          </Badge>
        ),
      },
      {
        accessorKey: "description",
        header: "Trích đoạn nội dung",
        cell: ({ row }) => (
          <span className="line-clamp-2 max-w-xs text-sm">{row.original.description}</span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Ngày phát hiện",
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("vi-VN"),
      },
      {
        accessorKey: "resolved",
        header: "Đã xử lý",
        cell: ({ row }) => (
          <Badge variant={row.original.resolved ? "secondary" : "destructive"}>
            {row.original.resolved ? "Đã xử lý" : "Chưa xử lý"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          if (row.original.resolved) return null;
          return (
            <WorkspaceRowActions
              actions={[
                {
                  label: "Giải quyết",
                  onClick: () => setResolveDialog({ item: row.original, resolution: "" }),
                },
              ]}
            />
          );
        },
      },
    ],
    [],
  );

  const table = useSafeReactTable({ data: items, columns: fraudColumns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cảnh báo gian lận</h1>
        <p className="mt-2 text-sm text-muted-foreground">Hàng đợi cảnh báo gian lận cần xem xét và xử lý</p>
      </div>

      <WorkspaceDataTable table={table} columns={fraudColumns} isLoading={isLoading} emptyMessage="Không có cảnh báo nào." />

      {resolveDialog && (
        <Dialog open onOpenChange={() => setResolveDialog(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Giải quyết cảnh báo gian lận</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant={FRAUD_SEVERITY_VARIANT[resolveDialog.item.severity]}>
                  {FRAUD_SEVERITY_LABELS[resolveDialog.item.severity]}
                </Badge>
                <span className="text-sm font-medium">{resolveDialog.item.alertType}</span>
              </div>
              <p className="text-sm text-muted-foreground">{resolveDialog.item.description}</p>
              <div className="space-y-1.5">
                <Label htmlFor="resolve-notes">Ghi chú xử lý</Label>
                <Textarea
                  id="resolve-notes"
                  value={resolveDialog.resolution}
                  onChange={(e) => setResolveDialog((d) => d ? { ...d, resolution: e.target.value } : d)}
                  placeholder="Mô tả cách giải quyết cảnh báo này..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResolveDialog(null)}>Huỷ</Button>
              <Button
                onClick={handleConfirmResolve}
                disabled={resolveAlert.isPending}
              >
                {resolveAlert.isPending ? "Đang lưu..." : "Xác nhận giải quyết"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─── Purity Vows ──────────────────────────────────────────────────────────────

const vowColumns: ColumnDef<VowListItem>[] = [
  {
    accessorKey: "practitioner",
    header: "Người nguyện",
    cell: ({ row }) => row.original.practitioner?.name ?? "—",
  },
  { accessorKey: "purityLevel", header: "Mức độ" },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => (
      <Badge variant="outline">
        {VOW_STATUS_LABELS[row.original.status] ?? row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "vowDate",
    header: "Ngày nguyện",
    cell: ({ row }) => new Date(row.original.vowDate).toLocaleDateString("vi-VN"),
  },
  {
    accessorKey: "sleepArrangement",
    header: "Quy tắc ngủ",
    cell: ({ row }) => row.original.sleepArrangement ?? "—",
  },
];

export function PurityVowsPage() {
  const { data: envelope, isLoading } = useQuery(vowListOptions());
  const items = useMemo(() => envelope?.data ?? [], [envelope]);

  const table = useSafeReactTable({ data: items, columns: vowColumns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lời nguyện thanh tu</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Chỉ xem — lời nguyện do đồng tu tự đăng ký
        </p>
      </div>
      <WorkspaceDataTable table={table} columns={vowColumns} isLoading={isLoading} emptyMessage="Chưa có lời nguyện nào." />
    </div>
  );
}

// ─── Guidance Queue ───────────────────────────────────────────────────────────

type RespondDialogState = {
  item: GuidanceQueueItem;
  response: string;
} | null;

export function GuidanceQueuePage() {
  const { data: envelope, isLoading } = useQuery(guidanceQueueOptions());
  const items = useMemo(() => envelope?.data ?? [], [envelope]);

  const respondGuidance = useRespondGuidance();
  const [respondDialog, setRespondDialog] = useState<RespondDialogState>(null);

  function handleConfirmRespond() {
    if (!respondDialog) return;
    respondGuidance.mutate(
      { id: respondDialog.item.id, response: respondDialog.response },
      { onSuccess: () => setRespondDialog(null) },
    );
  }

  const guidanceColumns: ColumnDef<GuidanceQueueItem>[] = useMemo(
    () => [
      {
        accessorKey: "practitioner",
        header: "Đồng tu",
        cell: ({ row }) => row.original.practitioner ?? "—",
      },
      { accessorKey: "category", header: "Danh mục" },
      {
        accessorKey: "question",
        header: "Câu hỏi",
        cell: ({ row }) => <span className="line-clamp-2">{row.original.question}</span>,
      },
      {
        accessorKey: "urgency",
        header: "Mức độ khẩn",
        cell: ({ row }) => (
          <Badge variant={GUIDANCE_URGENCY_VARIANT[row.original.urgency]}>
            {row.original.urgency}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <Badge variant={row.original.status === "ANSWERED" ? "secondary" : "outline"}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Ngày gửi",
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("vi-VN"),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          if (row.original.status !== "PENDING") return null;
          return (
            <WorkspaceRowActions
              actions={[
                {
                  label: "Phản hồi",
                  onClick: () => setRespondDialog({ item: row.original, response: "" }),
                },
              ]}
            />
          );
        },
      },
    ],
    [],
  );

  const table = useSafeReactTable({ data: items, columns: guidanceColumns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hàng đợi hướng dẫn</h1>
        <p className="mt-2 text-sm text-muted-foreground">Hàng đợi câu hỏi cần phản hồi</p>
      </div>

      <WorkspaceDataTable table={table} columns={guidanceColumns} isLoading={isLoading} emptyMessage="Không có yêu cầu nào." />

      {respondDialog && (
        <Dialog open onOpenChange={() => setRespondDialog(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Phản hồi yêu cầu hướng dẫn</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant={GUIDANCE_URGENCY_VARIANT[respondDialog.item.urgency]}>
                  {respondDialog.item.urgency}
                </Badge>
                <span className="text-sm text-muted-foreground">{respondDialog.item.category}</span>
                {respondDialog.item.practitioner && (
                  <span className="text-sm font-medium">{respondDialog.item.practitioner}</span>
                )}
              </div>
              <div className="rounded-md border bg-muted/40 p-3">
                <p className="text-sm">{respondDialog.item.question}</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="guidance-response">Phản hồi hướng dẫn Pháp</Label>
                <Textarea
                  id="guidance-response"
                  value={respondDialog.response}
                  onChange={(e) => setRespondDialog((d) => d ? { ...d, response: e.target.value } : d)}
                  placeholder="Nhập nội dung phản hồi hướng dẫn..."
                  rows={5}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRespondDialog(null)}>Huỷ</Button>
              <Button
                onClick={handleConfirmRespond}
                disabled={!respondDialog.response.trim() || respondGuidance.isPending}
              >
                {respondGuidance.isPending ? "Đang gửi..." : "Gửi phản hồi"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
