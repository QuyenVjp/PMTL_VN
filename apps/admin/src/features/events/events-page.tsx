import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateEvent, type CreateEventInput } from "./mutations.js";
import type { EventType, DeliveryMode } from "./types.js";
import { EventsTable } from "./events-table";

interface CreateEventForm {
  titleVi: string;
  eventType: EventType | "";
  deliveryMode: DeliveryMode | "";
  startAt: string;
  locationName: string;
  description: string;
}

const EMPTY_FORM: CreateEventForm = {
  titleVi: "",
  eventType: "",
  deliveryMode: "",
  startAt: "",
  locationName: "",
  description: "",
};

export function EventsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<CreateEventForm>(EMPTY_FORM);
  const createEvent = useCreateEvent();

  function handleChange(field: keyof CreateEventForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titleVi || !form.eventType || !form.deliveryMode || !form.startAt) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }
    const payload: CreateEventInput = {
      titleVi: form.titleVi,
      eventType: form.eventType,
      deliveryMode: form.deliveryMode,
      startAt: new Date(form.startAt).toISOString(),
    };
    if (form.locationName) payload.locationName = form.locationName;
    if (form.description) payload.description = form.description;

    createEvent.mutate(payload, {
      onSuccess: () => {
        setForm(EMPTY_FORM);
        setCreateOpen(false);
      },
    });
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setForm(EMPTY_FORM);
      setCreateOpen(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sự kiện Phật pháp</h1>
          <p className="mt-2 text-sm text-muted-foreground">Quản lý các sự kiện tu học và cộng đồng</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Tạo sự kiện
        </Button>
      </div>

      <EventsTable />

      <Dialog open={createOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tạo sự kiện mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titleVi">
                Tên sự kiện <span className="text-destructive">*</span>
              </Label>
              <Input
                id="titleVi"
                value={form.titleVi}
                onChange={(e) => handleChange("titleVi", e.target.value)}
                placeholder="Nhập tên sự kiện"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventType">
                Loại sự kiện <span className="text-destructive">*</span>
              </Label>
              <Select value={form.eventType} onValueChange={(v) => handleChange("eventType", v)}>
                <SelectTrigger id="eventType">
                  <SelectValue placeholder="Chọn loại sự kiện" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DHARMA_TALK">Pháp thoại</SelectItem>
                  <SelectItem value="RECITATION_SESSION">Thời khóa tụng kinh</SelectItem>
                  <SelectItem value="LIFE_LIBERATION">Phóng sinh</SelectItem>
                  <SelectItem value="MEDITATION_RETREAT">Khóa tu thiền</SelectItem>
                  <SelectItem value="COMMUNITY_SERVICE">Phụng sự cộng đồng</SelectItem>
                  <SelectItem value="SUTRA_STUDY">Học kinh</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryMode">
                Hình thức <span className="text-destructive">*</span>
              </Label>
              <Select value={form.deliveryMode} onValueChange={(v) => handleChange("deliveryMode", v)}>
                <SelectTrigger id="deliveryMode">
                  <SelectValue placeholder="Chọn hình thức" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ONLINE">Trực tuyến</SelectItem>
                  <SelectItem value="OFFLINE">Trực tiếp</SelectItem>
                  <SelectItem value="HYBRID">Kết hợp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startAt">
                Ngày bắt đầu <span className="text-destructive">*</span>
              </Label>
              <Input
                id="startAt"
                type="datetime-local"
                value={form.startAt}
                onChange={(e) => handleChange("startAt", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="locationName">Địa điểm</Label>
              <Input
                id="locationName"
                value={form.locationName}
                onChange={(e) => handleChange("locationName", e.target.value)}
                placeholder="Nhập địa điểm (tùy chọn)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả ngắn</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Mô tả ngắn về sự kiện (tùy chọn)"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={createEvent.isPending}>
                {createEvent.isPending ? "Đang tạo..." : "Tạo sự kiện"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
