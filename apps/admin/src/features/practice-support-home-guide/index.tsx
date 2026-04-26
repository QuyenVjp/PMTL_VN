/**
 * Practice Support Home Guide Editor — admin structured editor.
 * Edit vegetarianDisciplineRules[], officeNutritionNotes[], supplementalDietNotes[].
 * Owner: content/practice-support
 * No business authority here — all writes stay at apps/api.
 */
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { BookOpenCheckIcon, GripVerticalIcon, PlusIcon, RouteIcon, SaveIcon, ShieldCheckIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkspaceScopeCards } from "@/components/workspace";

import { practiceHomeGuideDetailOptions, type RuleItem, type VietnamHomePracticeGuide } from "./queries";
import { useUpdatePracticeHomeGuide, type UpdatePracticeHomeGuideInput } from "./mutations";

// ── Helpers ───────────────────────────────────────────────────────────

const SEVERITY_OPTIONS: { value: RuleItem["severity"]; label: string; color: string }[] = [
  { value: "info", label: "Thông tin", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  { value: "warning", label: "Cảnh báo", color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300" },
  { value: "critical", label: "Quan trọng", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

// ── Rule Item Editor ──────────────────────────────────────────────────

interface RuleItemEditorProps {
  item: RuleItem;
  onChange: (item: RuleItem) => void;
  onRemove: () => void;
}

function RuleItemEditor({ item, onChange, onRemove }: RuleItemEditorProps) {
  return (
    <div className="relative flex gap-3 rounded-lg border bg-card p-4">
      <div className="flex items-center text-muted-foreground">
        <GripVerticalIcon className="size-5" />
      </div>
      <div className="flex-1 grid gap-3 sm:grid-cols-2">
        <Field label="Mã quy tắc">
          <Input
            value={item.ruleCode}
            onChange={(e) => onChange({ ...item, ruleCode: e.target.value })}
            placeholder="vd: no-killing-rule"
          />
        </Field>
        <Field label="Mức độ">
          <Select
            value={item.severity}
            onValueChange={(v) => onChange({ ...item, severity: v as RuleItem["severity"] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEVERITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Nhãn">
          <Input
            value={item.label}
            onChange={(e) => onChange({ ...item, label: e.target.value })}
            placeholder="Tên hiển thị ngắn gọn..."
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Mô tả chi tiết">
            <Textarea
              value={item.description}
              onChange={(e) => onChange({ ...item, description: e.target.value })}
              placeholder="Nội dung hướng dẫn chi tiết..."
              rows={2}
            />
          </Field>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
      >
        <Trash2Icon className="size-4" />
      </Button>
    </div>
  );
}

// ── String Array Editor ───────────────────────────────────────────────

interface StringArrayEditorProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}

function StringArrayEditor({ items, onChange, placeholder }: StringArrayEditorProps) {
  const handleChange = (index: number, value: string) => {
    const updated = [...items];
    updated[index] = value;
    onChange(updated);
  };

  const handleAdd = () => {
    onChange([...items, ""]);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-2">
          <div className="mt-2 text-muted-foreground">
            <GripVerticalIcon className="size-5" />
          </div>
          <Textarea
            value={item}
            onChange={(e) => handleChange(index, e.target.value)}
            placeholder={placeholder}
            rows={2}
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mt-1 text-muted-foreground hover:text-destructive"
            onClick={() => handleRemove(index)}
          >
            <Trash2Icon className="size-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
        <PlusIcon className="mr-1 size-4" />
        Thêm mục
      </Button>
    </div>
  );
}

// ── Rule Array Editor ─────────────────────────────────────────────────

interface RuleArrayEditorProps {
  items: RuleItem[];
  onChange: (items: RuleItem[]) => void;
}

function RuleArrayEditor({ items, onChange }: RuleArrayEditorProps) {
  const handleChange = (index: number, item: RuleItem) => {
    const updated = [...items];
    updated[index] = item;
    onChange(updated);
  };

  const handleAdd = () => {
    onChange([
      ...items,
      { ruleCode: "", label: "", description: "", severity: "info" as const },
    ]);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <RuleItemEditor
          key={index}
          item={item}
          onChange={(updated) => handleChange(index, updated)}
          onRemove={() => handleRemove(index)}
        />
      ))}
      <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
        <PlusIcon className="mr-1 size-4" />
        Thêm quy tắc
      </Button>
    </div>
  );
}

// ── Main Editor ───────────────────────────────────────────────────────

function PracticeHomeGuideEditor({ data }: { data: VietnamHomePracticeGuide }) {
  const updateMutation = useUpdatePracticeHomeGuide();

  // Local state for editable fields
  const [vegetarianRules, setVegetarianRules] = useState<RuleItem[]>(data.vegetarianDisciplineRules);
  const [officeNotes, setOfficeNotes] = useState<string[]>(data.officeNutritionNotes);
  const [supplementalNotes, setSupplementalNotes] = useState<string[]>(data.supplementalDietNotes);

  // Reset local state when data changes
  useEffect(() => {
    setVegetarianRules(data.vegetarianDisciplineRules);
    setOfficeNotes(data.officeNutritionNotes);
    setSupplementalNotes(data.supplementalDietNotes);
  }, [data]);

  const hasChanges = () => {
    return (
      JSON.stringify(vegetarianRules) !== JSON.stringify(data.vegetarianDisciplineRules) ||
      JSON.stringify(officeNotes) !== JSON.stringify(data.officeNutritionNotes) ||
      JSON.stringify(supplementalNotes) !== JSON.stringify(data.supplementalDietNotes)
    );
  };

  const handleSave = () => {
    // Validate
    const invalidRules = vegetarianRules.filter(
      (r) => !r.ruleCode.trim() || !r.label.trim() || !r.description.trim()
    );
    if (invalidRules.length > 0) {
      toast.error("Một số quy tắc chưa điền đầy đủ thông tin.");
      return;
    }
    const emptyOfficeNotes = officeNotes.filter((n) => !n.trim());
    if (emptyOfficeNotes.length > 0) {
      toast.error("Ghi chú dinh dưỡng văn phòng không được để trống.");
      return;
    }
    const emptySupplementalNotes = supplementalNotes.filter((n) => !n.trim());
    if (emptySupplementalNotes.length > 0) {
      toast.error("Ghi chú bổ sung không được để trống.");
      return;
    }

    const input: UpdatePracticeHomeGuideInput = {
      vegetarianDisciplineRules: vegetarianRules,
      officeNutritionNotes: officeNotes,
      supplementalDietNotes: supplementalNotes,
    };

    updateMutation.mutate(input);
  };

  return (
    <div className="space-y-6">
      {/* Header info */}
      <Card>
        <CardHeader>
          <CardTitle>{data.title}</CardTitle>
          <CardDescription>{data.overview}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div>
              <span className="font-medium">Slug:</span> {data.slug}
            </div>
            <div>
              <span className="font-medium">Public ID:</span> {data.publicId}
            </div>
            <div>
              <span className="font-medium">Cập nhật lần cuối:</span>{" "}
              {new Date(data.updatedAt).toLocaleString("vi-VN")}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editable sections */}
      <Tabs defaultValue="vegetarian" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vegetarian">Kỷ luật ăn chay</TabsTrigger>
          <TabsTrigger value="office">Dinh dưỡng văn phòng</TabsTrigger>
          <TabsTrigger value="supplemental">Ghi chú bổ sung</TabsTrigger>
        </TabsList>

        <TabsContent value="vegetarian">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quy tắc kỷ luật ăn chay</CardTitle>
              <CardDescription>
                Các quy tắc về ăn chay cho người tu tập tại gia. Mỗi quy tắc gồm mã, nhãn, mô tả và mức độ quan trọng.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RuleArrayEditor items={vegetarianRules} onChange={setVegetarianRules} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="office">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ghi chú dinh dưỡng văn phòng</CardTitle>
              <CardDescription>
                Hướng dẫn dinh dưỡng cho người làm việc văn phòng. Đây là các gợi ý, không phải quy tắc bắt buộc.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StringArrayEditor
                items={officeNotes}
                onChange={setOfficeNotes}
                placeholder="Nhập ghi chú hướng dẫn dinh dưỡng..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="supplemental">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ghi chú bổ sung</CardTitle>
              <CardDescription>
                Thông tin bổ sung ngoài nguồn canon chính thức. Đây là tham khảo, không phải quy tắc cứng.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StringArrayEditor
                items={supplementalNotes}
                onChange={setSupplementalNotes}
                placeholder="Nhập ghi chú bổ sung..."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save button */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          disabled={!hasChanges() || updateMutation.isPending}
          onClick={() => {
            setVegetarianRules(data.vegetarianDisciplineRules);
            setOfficeNotes(data.officeNutritionNotes);
            setSupplementalNotes(data.supplementalDietNotes);
          }}
        >
          Huỷ thay đổi
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasChanges() || updateMutation.isPending}
        >
          <SaveIcon className="mr-2 size-4" />
          {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────

export function PracticeHomePracticeGuidePage() {
  const { data: envelope, isLoading, isError } = useQuery(practiceHomeGuideDetailOptions());

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tự tu tại gia Việt Nam</h1>
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <div className="grid gap-4">
          {[0, 1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !envelope?.data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tự tu tại gia Việt Nam</h1>
          <p className="mt-2 text-sm text-destructive">
            Không thể tải dữ liệu. Vui lòng thử lại sau.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tự tu tại gia Việt Nam</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Đây là lane practice-support riêng cho bối cảnh tu học tại gia ở Việt Nam; không còn bind nhầm vào route Kinh văn tự tu.
        </p>
      </div>

      <WorkspaceScopeCards
        items={[
          {
            title: "Practice-support owner",
            description: "Surface này quản lý quy tắc ăn chay và ghi chú tu học tại gia, không phải kho Kinh văn tự tu.",
            badge: "Practice support",
            icon: ShieldCheckIcon,
          },
          {
            title: "Route tách biệt",
            description: "Không bind lại `/noi-dung/kinh-van-tu-tu`; Kinh văn tự tu có owner `self-cultivation` riêng.",
            badge: "Không trộn route",
            icon: RouteIcon,
          },
          {
            title: "Structured editor",
            description: "Mỗi rule cần mã, nhãn, mô tả và mức độ để API validate trước khi public surface dùng.",
            badge: "Structured content",
            icon: BookOpenCheckIcon,
          },
        ]}
      />

      <PracticeHomeGuideEditor data={envelope.data} />
    </div>
  );
}
