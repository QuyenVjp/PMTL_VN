import { useState } from "react";
import { toast } from "sonner";
import { FieldError } from "@/components/ui/field-error";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePushJob } from "./mutations.js";
import { extractValidationFieldErrors, hasFieldErrors, invalidFieldClass, type FieldErrors } from "@/lib/form-validation.js";

const audienceOptions = [
  { label: "Tất cả thành viên", value: "all_members" },
  { label: "Chỉ quản trị viên", value: "admin_only" },
  { label: "Điều phối viên và biên tập", value: "operators" },
  { label: "Người đang bật nhắc nhở niệm kinh", value: "chanting_reminder_subscribers" },
];

function audienceLabel(value: string | null): string {
  return audienceOptions.find((option) => option.value === value)?.label ?? "Tất cả thành viên";
}

export function CreatePushJobDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const createPushJob = useCreatePushJob();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetAudience, setTargetAudience] = useState("all_members");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const reset = () => { setTitle(""); setBody(""); setTargetAudience("all_members"); setFieldErrors({}); };

  const handleSubmit = () => {
    const nextErrors: FieldErrors = {};
    if (!title.trim()) nextErrors.title = "Tiêu đề không được để trống.";
    if (!body.trim()) nextErrors.body = "Nội dung không được để trống.";
    if (hasFieldErrors(nextErrors)) { setFieldErrors(nextErrors); toast.error(Object.values(nextErrors)[0]); return; }
    setFieldErrors({});
    createPushJob.mutate(
      { title: title.trim(), body: body.trim(), targetAudience: targetAudience.trim() || undefined },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
        onError: (error) => {
          setFieldErrors(extractValidationFieldErrors(error));
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>Tạo đợt gửi thông báo</DialogTitle>
          <DialogDescription>Gửi thông báo đẩy đến thiết bị của thành viên theo đúng nhóm nhận.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium">Tiêu đề</span>
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: "" }));
              }}
              placeholder="Thông báo mới từ PMTL..."
              className={invalidFieldClass(Boolean(fieldErrors.title))}
            />
            <FieldError message={fieldErrors.title} />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium">Nội dung thông báo</span>
            <Textarea
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                if (fieldErrors.body) setFieldErrors((prev) => ({ ...prev, body: "" }));
              }}
              placeholder="Soạn nội dung ngắn gọn, rõ ràng và dễ hiểu cho người lớn tuổi..."
              rows={3}
              className={invalidFieldClass(Boolean(fieldErrors.body))}
            />
            <FieldError message={fieldErrors.body} />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium">Đối tượng (tuỳ chọn)</span>
            <Select value={targetAudience} onValueChange={setTargetAudience}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn nhóm nhận thông báo" />
              </SelectTrigger>
              <SelectContent>
                {audienceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">
              Hệ thống sẽ gửi cho nhóm: {audienceLabel(targetAudience)}.
            </span>
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={createPushJob.isPending || !title.trim() || !body.trim()}>
            {createPushJob.isPending ? "Đang gửi..." : "Gửi thông báo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
