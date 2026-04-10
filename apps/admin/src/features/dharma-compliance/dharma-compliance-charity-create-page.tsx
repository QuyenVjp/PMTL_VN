import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateCharity } from "@/features/dharma-compliance/mutations";

const CHARITY_TYPE_OPTIONS = [
  { label: "Ngân hàng thực phẩm", value: "FOOD_BANK" },
  { label: "Y tế", value: "MEDICAL" },
  { label: "Giáo dục", value: "EDUCATION" },
  { label: "Cứu trợ thảm họa", value: "DISASTER_RELIEF" },
  { label: "Phúc lợi động vật", value: "ANIMAL_WELFARE" },
  { label: "Khác", value: "OTHER" },
];

export function DharmaComplianceCharityCreatePage() {
  const navigate = useNavigate();
  const createCharity = useCreateCharity();

  const [form, setForm] = useState({
    name: "",
    charityType: "",
    registrationNumber: "",
    contactEmail: "",
    websiteUrl: "",
  });

  function handleCreate() {
    if (!form.name || !form.charityType) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    createCharity.mutate(
      {
        name: form.name,
        charityType: form.charityType,
        registrationNumber: form.registrationNumber || undefined,
        contactEmail: form.contactEmail || undefined,
        websiteUrl: form.websiteUrl || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Đã thêm tổ chức từ thiện.");
          void navigate({ to: "/phap-luat/to-chuc-tu-thien" });
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thêm tổ chức từ thiện</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Đăng ký một tổ chức từ thiện mới vào hệ thống.
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Thông tin tổ chức</CardTitle>
          <CardDescription>
            Điền đầy đủ thông tin cơ bản của tổ chức từ thiện.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tên tổ chức */}
          <div className="space-y-2">
            <Label htmlFor="charity-name">
              Tên tổ chức <span className="text-destructive">*</span>
            </Label>
            <Input
              id="charity-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Nhập tên tổ chức"
            />
          </div>

          {/* Loại tổ chức */}
          <div className="space-y-2">
            <Label htmlFor="charity-type">
              Loại <span className="text-destructive">*</span>
            </Label>
            <Select value={form.charityType} onValueChange={(v) => setForm((f) => ({ ...f, charityType: v }))}>
              <SelectTrigger id="charity-type">
                <SelectValue placeholder="Chọn loại tổ chức" />
              </SelectTrigger>
              <SelectContent>
                {CHARITY_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mã đăng ký */}
          <div className="space-y-2">
            <Label htmlFor="charity-reg">Mã đăng ký</Label>
            <Input
              id="charity-reg"
              value={form.registrationNumber}
              onChange={(e) => setForm((f) => ({ ...f, registrationNumber: e.target.value }))}
              placeholder="Mã đăng ký (tuỳ chọn)"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="charity-email">Email liên hệ</Label>
            <Input
              id="charity-email"
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
              placeholder="email@tổ-chức.vn"
            />
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="charity-web">Website</Label>
            <Input
              id="charity-web"
              value={form.websiteUrl}
              onChange={(e) => setForm((f) => ({ ...f, websiteUrl: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => { void navigate({ to: "/phap-luat/to-chuc-tu-thien" }); }}
              disabled={createCharity.isPending}
            >
              Huỷ
            </Button>
            <Button onClick={handleCreate} disabled={!form.name || !form.charityType || createCharity.isPending}>
              {createCharity.isPending ? "Đang lưu..." : "Thêm tổ chức"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
