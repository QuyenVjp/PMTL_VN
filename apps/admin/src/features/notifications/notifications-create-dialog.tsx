import { z } from "zod";
import { FieldError } from "@/components/ui/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AdminFormField, WorkspaceDetailSheet } from "@/components/workspace";
import { useCreatePushJob } from "./mutations.js";
import { applyApiFieldErrors, useAdminZodForm } from "@/lib/admin-form.js";
import { invalidFieldClass } from "@/lib/form-validation.js";

const audienceOptions = [
  { label: "Tất cả thành viên", value: "all_members" },
  { label: "Chỉ quản trị viên", value: "admin_only" },
  { label: "Điều phối viên và biên tập", value: "operators" },
  { label: "Người đang bật nhắc nhở niệm kinh", value: "chanting_reminder_subscribers" },
];

const createPushJobSchema = z.object({
  title: z.string().trim().min(1, "Tiêu đề không được để trống."),
  body: z.string().trim().min(1, "Nội dung không được để trống."),
  targetAudience: z.string().trim().default("all_members"),
});

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
  const form = useAdminZodForm(createPushJobSchema, {
    defaultValues: {
      title: "",
      body: "",
      targetAudience: "all_members",
    },
  });
  const { errors } = form.formState;
  const values = form.watch();

  const reset = () => {
    form.reset({ title: "", body: "", targetAudience: "all_members" });
  };

  const handleSubmit = form.handleSubmit((formValues) => {
    createPushJob.mutate(
      {
        title: formValues.title,
        body: formValues.body,
        targetAudience: formValues.targetAudience || undefined,
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
        onError: (error) => {
          applyApiFieldErrors(form, error);
        },
      },
    );
  });

  return (
    <WorkspaceDetailSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Tạo đợt gửi thông báo"
      subtitle="Gửi thông báo đẩy đến thiết bị của thành viên theo đúng nhóm nhận."
    >

        <div className="space-y-4">
          <AdminFormField label="Tiêu đề" invalid={Boolean(errors.title)}>
            <Input
              {...form.register("title")}
              placeholder="Thông báo mới từ PMTL..."
              className={invalidFieldClass(Boolean(errors.title))}
            />
            <FieldError message={errors.title?.message} />
          </AdminFormField>
          <AdminFormField label="Nội dung thông báo" invalid={Boolean(errors.body)}>
            <Textarea
              {...form.register("body")}
              placeholder="Soạn nội dung ngắn gọn, rõ ràng và dễ hiểu cho người lớn tuổi..."
              rows={3}
              className={invalidFieldClass(Boolean(errors.body))}
            />
            <FieldError message={errors.body?.message} />
          </AdminFormField>
          <AdminFormField label="Đối tượng (tuỳ chọn)">
            <Select
              value={values.targetAudience}
              onValueChange={(value) => form.setValue("targetAudience", value, { shouldDirty: true })}
            >
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
              Hệ thống sẽ gửi cho nhóm: {audienceLabel(values.targetAudience ?? null)}.
            </span>
          </AdminFormField>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button
            onClick={() => {
              void handleSubmit();
            }}
            disabled={createPushJob.isPending || !values.title.trim() || !values.body.trim()}
          >
            {createPushJob.isPending ? "Đang gửi..." : "Gửi thông báo"}
          </Button>
        </div>
    </WorkspaceDetailSheet>
  );
}
