/**
 * Design System Showcase — live component reference for PMTL admin.
 *
 * Ported from Shadboard's component showcase pattern, adapted for PMTL:
 * - Vietnamese labels and realistic example content
 * - OKLCH theme-aware previews
 * - Grouped by category with interactive examples
 */
import { useState } from "react";
import {
  AlertCircleIcon,
  HomeIcon,
  InfoIcon,
  PlusIcon,
  SettingsIcon,
  TrashIcon,
  UserIcon,
} from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { InputSpin } from "@/components/ui/input-spin";
import { InputTags } from "@/components/ui/input-tags";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ShowMoreText } from "@/components/ui/show-more-text";
import { Slider } from "@/components/ui/slider";
import {
  Timeline,
  TimelineContent,
  TimelineHeading,
  TimelineItem,
  TimelineLine,
} from "@/components/ui/timeline";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { SparklineAreaChart } from "@/components/dashboard/sparkline-area-chart";
import { SparklineBarChart } from "@/components/dashboard/sparkline-bar-chart";
import { SparklineLineChart } from "@/components/dashboard/sparkline-line-chart";

// ── Section wrapper ────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

function DemoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

// ── Sparkline sample data ──────────────────────────────────────────

const sparkData = [
  { v: 12 }, { v: 18 }, { v: 15 }, { v: 25 }, { v: 22 },
  { v: 30 }, { v: 28 }, { v: 35 }, { v: 32 }, { v: 40 },
];

// ── Main Page ──────────────────────────────────────────────────────

export function DesignSystemPage() {
  const [tags, setTags] = useState<string[]>(["Phật pháp", "Thiền"]);
  const [spinValue, setSpinValue] = useState(5);
  const [sliderValue, setSliderValue] = useState([33]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hệ thống thiết kế</h1>
        <p className="text-muted-foreground">
          Tham khảo tất cả component được tích hợp trong trang quản trị PMTL.
        </p>
      </div>

      {/* ── Buttons & Actions ─────────────────────────────────── */}
      <Section title="Nút bấm & Hành động">
        <DemoCard title="Button variants">
          <div className="flex flex-wrap gap-2">
            <Button>Mặc định</Button>
            <Button variant="secondary">Phụ</Button>
            <Button variant="destructive">Xoá</Button>
            <Button variant="outline">Viền</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Liên kết</Button>
          </div>
        </DemoCard>

        <DemoCard title="Button sizes">
          <div className="flex flex-wrap items-center gap-2">
            <Button size="default">Vừa</Button>
            <Button size="sm">Nhỏ</Button>
            <Button size="icon"><PlusIcon className="size-4" /></Button>
          </div>
        </DemoCard>

        <DemoCard title="Toggle & ToggleGroup">
          <div className="space-y-3">
            <Toggle aria-label="Toggle bold">
              <b>B</b>
            </Toggle>
            <ToggleGroup type="multiple" className="justify-start">
              <ToggleGroupItem value="bold" aria-label="Bold"><b>B</b></ToggleGroupItem>
              <ToggleGroupItem value="italic" aria-label="Italic"><i>I</i></ToggleGroupItem>
              <ToggleGroupItem value="underline" aria-label="Underline"><u>U</u></ToggleGroupItem>
            </ToggleGroup>
          </div>
        </DemoCard>
      </Section>

      {/* ── Form Controls ──────────────────────────────────────── */}
      <Section title="Biểu mẫu">
        <DemoCard title="Input & Label">
          <div className="space-y-2">
            <Label htmlFor="demo-email">Email</Label>
            <Input id="demo-email" type="email" placeholder="admin@pmtl.vn" />
          </div>
        </DemoCard>

        <DemoCard title="InputTags">
          <InputTags tags={tags} onTagsChange={setTags} placeholder="Thêm thẻ..." />
        </DemoCard>

        <DemoCard title="InputSpin">
          <div className="space-y-2">
            <Label>Số lượng</Label>
            <InputSpin value={spinValue} onChange={setSpinValue} min={0} max={100} />
          </div>
        </DemoCard>

        <DemoCard title="RadioGroup">
          <RadioGroup defaultValue="light">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="light" id="r-light" />
              <Label htmlFor="r-light">Giao diện sáng</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="dark" id="r-dark" />
              <Label htmlFor="r-dark">Giao diện tối</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="system" id="r-system" />
              <Label htmlFor="r-system">Theo hệ thống</Label>
            </div>
          </RadioGroup>
        </DemoCard>

        <DemoCard title="Slider">
          <div className="space-y-2">
            <Label>Giá trị: {sliderValue[0]}</Label>
            <Slider value={sliderValue} onValueChange={setSliderValue} max={100} step={1} />
          </div>
        </DemoCard>
      </Section>

      {/* ── Data Display ───────────────────────────────────────── */}
      <Section title="Hiển thị dữ liệu">
        <DemoCard title="Badge">
          <div className="flex flex-wrap gap-2">
            <Badge>Mặc định</Badge>
            <Badge variant="secondary">Phụ</Badge>
            <Badge variant="destructive">Cảnh báo</Badge>
            <Badge variant="outline">Viền</Badge>
          </div>
        </DemoCard>

        <DemoCard title="Accordion">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Phật pháp là gì?</AccordionTrigger>
              <AccordionContent>
                Phật pháp là những lời dạy của Đức Phật Thích Ca Mâu Ni, hướng dẫn chúng sanh
                tu tập để giải thoát khỏi khổ đau.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Niệm Phật như thế nào?</AccordionTrigger>
              <AccordionContent>
                Niệm Phật là phương pháp tu tập bằng cách nhất tâm xưng niệm danh hiệu Phật,
                phổ biến nhất là "Nam Mô A Di Đà Phật".
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </DemoCard>

        <DemoCard title="HoverCard">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="link" className="p-0 h-auto">@admin</Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-64">
              <div className="flex gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                  <UserIcon className="size-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">Quản trị viên</h4>
                  <p className="text-xs text-muted-foreground">
                    Quản lý nội dung và hệ thống PMTL.
                  </p>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </DemoCard>

        <DemoCard title="ShowMoreText">
          <ShowMoreText
            text="Phật pháp vi diệu khó nghĩ bàn. Trăm ngàn vạn kiếp khó gặp được. Con nay thấy nghe được thọ trì. Nguyện hiểu nghĩa chân thật của Như Lai. Đây là bài kệ khai kinh thường được tụng đọc trước khi bắt đầu tìm hiểu kinh điển Phật giáo."
            maxLength={80}
          />
        </DemoCard>

        <DemoCard title="AspectRatio (16:9)">
          <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-md bg-muted">
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              16:9 Placeholder
            </div>
          </AspectRatio>
        </DemoCard>

        <DemoCard title="Tooltip">
          <div className="flex gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon"><InfoIcon className="size-4" /></Button>
              </TooltipTrigger>
              <TooltipContent>Thông tin chi tiết</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon"><SettingsIcon className="size-4" /></Button>
              </TooltipTrigger>
              <TooltipContent>Cài đặt</TooltipContent>
            </Tooltip>
          </div>
        </DemoCard>
      </Section>

      {/* ── Feedback & Dialogs ─────────────────────────────────── */}
      <Section title="Phản hồi & Hộp thoại">
        <DemoCard title="Alert variants">
          <div className="space-y-2">
            <Alert>
              <InfoIcon className="size-4" />
              <AlertTitle>Thông báo</AlertTitle>
              <AlertDescription>Hệ thống sẽ bảo trì vào cuối tuần.</AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertCircleIcon className="size-4" />
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>Không thể kết nối cơ sở dữ liệu.</AlertDescription>
            </Alert>
          </div>
        </DemoCard>

        <DemoCard title="AlertDialog">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <TrashIcon className="me-1.5 size-3.5" />
                Xoá bài viết
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận xoá?</AlertDialogTitle>
                <AlertDialogDescription>
                  Hành động này không thể hoàn tác. Bài viết sẽ bị xoá vĩnh viễn khỏi hệ thống.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Huỷ</AlertDialogCancel>
                <AlertDialogAction>Xác nhận xoá</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DemoCard>
      </Section>

      {/* ── Navigation ─────────────────────────────────────────── */}
      <Section title="Điều hướng">
        <DemoCard title="Breadcrumb">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">
                  <HomeIcon className="size-3.5" />
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/noi-dung/bai-viet">Nội dung</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Bài viết</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </DemoCard>

        <DemoCard title="Pagination">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </DemoCard>
      </Section>

      {/* ── Layout ─────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Bố cục</h2>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">ResizablePanel</CardTitle>
            <CardDescription>Kéo thanh phân cách để thay đổi kích thước.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResizablePanelGroup className="min-h-[120px] rounded-lg border">
              <ResizablePanel defaultSize={50}>
                <div className="flex h-full items-center justify-center p-4">
                  <span className="text-sm font-medium">Bảng trái</span>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={50}>
                <div className="flex h-full items-center justify-center p-4">
                  <span className="text-sm font-medium">Bảng phải</span>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">ScrollArea</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-40 rounded-md border p-4">
              {Array.from({ length: 20 }, (_, i) => (
                <div key={i} className="py-1.5 text-sm">
                  Mục {i + 1} — Nội dung mẫu trong vùng cuộn
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </section>

      {/* ── Timeline ───────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Dòng thời gian</h2>
        <Card>
          <CardContent className="pt-6">
            <Timeline>
              <TimelineItem status="done">
                <TimelineHeading>Tạo bài viết mới</TimelineHeading>
                <TimelineContent>Bài viết "Ý nghĩa niệm Phật" đã được tạo thành công.</TimelineContent>
                <TimelineLine done />
              </TimelineItem>
              <TimelineItem status="done">
                <TimelineHeading>Duyệt nội dung</TimelineHeading>
                <TimelineContent>Quản trị viên đã phê duyệt bài viết.</TimelineContent>
                <TimelineLine done />
              </TimelineItem>
              <TimelineItem status="default">
                <TimelineHeading>Xuất bản</TimelineHeading>
                <TimelineContent>Đang chờ lên lịch xuất bản.</TimelineContent>
                <TimelineLine />
              </TimelineItem>
            </Timeline>
          </CardContent>
        </Card>
      </section>

      {/* ── Charts / Sparklines ─────────────────────────────────── */}
      <Section title="Biểu đồ thu nhỏ">
        <DemoCard title="SparklineAreaChart">
          <div className="h-20 overflow-hidden rounded-md">
            <SparklineAreaChart data={sparkData} dataKey="v" color="var(--color-primary)" />
          </div>
        </DemoCard>

        <DemoCard title="SparklineBarChart">
          <div className="h-20 overflow-hidden rounded-md">
            <SparklineBarChart data={sparkData} dataKey="v" color="var(--color-primary)" />
          </div>
        </DemoCard>

        <DemoCard title="SparklineLineChart">
          <div className="h-20 overflow-hidden rounded-md">
            <SparklineLineChart data={sparkData} dataKey="v" color="var(--color-primary)" />
          </div>
        </DemoCard>
      </Section>

      {/* ── Color Palette ──────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Bảng màu OKLCH</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: "Primary", var: "bg-primary text-primary-foreground" },
            { name: "Secondary", var: "bg-secondary text-secondary-foreground" },
            { name: "Accent", var: "bg-accent text-accent-foreground" },
            { name: "Muted", var: "bg-muted text-muted-foreground" },
            { name: "Destructive", var: "bg-destructive text-destructive-foreground" },
            { name: "Success", var: "bg-success text-success-foreground" },
            { name: "Warning", var: "bg-warning text-warning-foreground" },
            { name: "Info", var: "bg-info text-info-foreground" },
          ].map((swatch) => (
            <div key={swatch.name} className={`flex items-center justify-center rounded-lg p-4 ${swatch.var}`}>
              <span className="text-sm font-medium">{swatch.name}</span>
            </div>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-5">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="flex items-center justify-center rounded-lg p-4 text-white"
              style={{ backgroundColor: `var(--color-chart-${n})` }}
            >
              <span className="text-sm font-medium">Chart {n}</span>
            </div>
          ))}
        </div>
      </section>

      <Separator />
      <p className="text-center text-xs text-muted-foreground pb-8">
        PMTL Admin Design System — {Object.keys({ Accordion: 1, Alert: 1, AlertDialog: 1, AspectRatio: 1, Badge: 1, Breadcrumb: 1, Button: 1, Card: 1, HoverCard: 1, Input: 1, InputSpin: 1, InputTags: 1, Label: 1, Pagination: 1, RadioGroup: 1, Resizable: 1, ScrollArea: 1, Separator: 1, ShowMoreText: 1, Slider: 1, Sparklines: 1, Timeline: 1, Toggle: 1, ToggleGroup: 1, Tooltip: 1 }).length}+ component trình diễn
      </p>
    </div>
  );
}
