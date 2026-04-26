import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { applyApiFieldErrors, useAdminZodForm } from "@/lib/admin-form";
import { invalidFieldClass } from "@/lib/form-validation";

import { useCheckIn } from "./mutations.js";

const checkInSchema = z.object({
  memberId: z.string().trim().min(1, "Vui lòng nhập mã thành viên."),
});

interface EventsCheckInDialogProps {
  eventPublicId: string;
  eventTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventsCheckInDialog({
  eventPublicId,
  eventTitle,
  open,
  onOpenChange,
}: EventsCheckInDialogProps) {
  const checkIn = useCheckIn();
  const form = useAdminZodForm(checkInSchema, {
    defaultValues: {
      memberId: "",
    },
  });
  const { errors } = form.formState;

  function handleClose() {
    form.reset({ memberId: "" });
    onOpenChange(false);
  }

  const handleSubmit = form.handleSubmit((values) => {
    checkIn.mutate(
      { eventPublicId, userId: values.memberId },
      {
        onSuccess: () => handleClose(),
        onError: (error) => {
          applyApiFieldErrors(form, error);
        },
      },
    );
  });

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : handleClose())}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Điểm danh thành viên</DialogTitle>
        </DialogHeader>
        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Sự kiện: <span className="font-medium text-foreground">{eventTitle}</span>
          </p>
          <div className="space-y-2">
            <Label htmlFor="memberId">
              Mã thành viên <span className="text-destructive">*</span>
            </Label>
            <Input
              id="memberId"
              {...form.register("memberId")}
              aria-invalid={Boolean(errors.memberId)}
              className={invalidFieldClass(Boolean(errors.memberId))}
              placeholder="Nhập mã thành viên cần điểm danh"
              autoFocus
            />
            <FieldError message={errors.memberId?.message ?? errors.root?.server?.message} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={checkIn.isPending}>
              {checkIn.isPending ? "Đang điểm danh..." : "Điểm danh"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
