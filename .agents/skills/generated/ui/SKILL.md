---
name: ui
description: "Skill for the Ui area of PMTL_VN. 193 symbols across 67 files."
---

# Ui

193 symbols | 67 files | Cohesion: 87%

## When to Use

- Working with code in `apps/`
- Understanding how cn, useIsMobile, RichTextEditor work
- Modifying ui-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `apps/admin/src/components/ui/sidebar.tsx` | SidebarProvider, SidebarInset, SidebarInput, SidebarHeader, SidebarFooter (+15) |
| `apps/admin/src/components/ui/dropdown-menu.tsx` | DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuCheckboxItem (+4) |
| `apps/admin/src/components/ui/alert-dialog.tsx` | AlertDialogTrigger, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogFooter (+4) |
| `apps/admin/src/components/ui/command.tsx` | Command, CommandDialog, CommandInput, CommandList, CommandGroup (+3) |
| `apps/admin/src/components/ui/select.tsx` | SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator (+2) |
| `apps/admin/src/components/ui/drawer.tsx` | DrawerTrigger, DrawerOverlay, DrawerContent, DrawerHeader, DrawerFooter (+2) |
| `apps/admin/src/components/ui/dialog.tsx` | clearRadixBodyLocks, DialogOverlay, DialogContent, DialogHeader, DialogFooter (+2) |
| `apps/admin/src/components/ui/card.tsx` | Card, CardHeader, CardTitle, CardDescription, CardAction (+2) |
| `apps/admin/src/components/ui/timeline.tsx` | Timeline, TimelineItem, TimelineDot, TimelineContent, TimelineHeading (+1) |
| `apps/admin/src/components/ui/table.tsx` | Table, TableHeader, TableBody, TableRow, TableHead (+1) |

## Entry Points

Start here when exploring this area:

- **`cn`** (Function) — `apps/admin/src/lib/utils.ts:3`
- **`useIsMobile`** (Function) — `apps/admin/src/hooks/use-mobile.ts:4`
- **`RichTextEditor`** (Function) — `apps/admin/src/features/content/rich-text-editor.tsx:18`
- **`WorkspaceDetailSection`** (Function) — `apps/admin/src/components/workspace/workspace-detail-sheet.tsx:167`
- **`WorkspaceDetailField`** (Function) — `apps/admin/src/components/workspace/workspace-detail-sheet.tsx:200`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `cn` | Function | `apps/admin/src/lib/utils.ts` | 3 |
| `useIsMobile` | Function | `apps/admin/src/hooks/use-mobile.ts` | 4 |
| `RichTextEditor` | Function | `apps/admin/src/features/content/rich-text-editor.tsx` | 18 |
| `WorkspaceDetailSection` | Function | `apps/admin/src/components/workspace/workspace-detail-sheet.tsx` | 167 |
| `WorkspaceDetailField` | Function | `apps/admin/src/components/workspace/workspace-detail-sheet.tsx` | 200 |
| `WorkspaceDetailDivider` | Function | `apps/admin/src/components/workspace/workspace-detail-sheet.tsx` | 235 |
| `AdminDetailField` | Function | `apps/admin/src/components/workspace/admin-detail-page.tsx` | 243 |
| `AdminFormField` | Function | `apps/admin/src/components/workspace/admin-detail-page.tsx` | 281 |
| `TooltipContent` | Function | `apps/admin/src/components/ui/tooltip.tsx` | 34 |
| `Toggle` | Function | `apps/admin/src/components/ui/toggle.tsx` | 30 |
| `ToggleGroup` | Function | `apps/admin/src/components/ui/toggle-group.tsx` | 18 |
| `ToggleGroupItem` | Function | `apps/admin/src/components/ui/toggle-group.tsx` | 43 |
| `Timeline` | Function | `apps/admin/src/components/ui/timeline.tsx` | 40 |
| `TimelineItem` | Function | `apps/admin/src/components/ui/timeline.tsx` | 74 |
| `TimelineDot` | Function | `apps/admin/src/components/ui/timeline.tsx` | 116 |
| `TimelineContent` | Function | `apps/admin/src/components/ui/timeline.tsx` | 163 |
| `TimelineHeading` | Function | `apps/admin/src/components/ui/timeline.tsx` | 204 |
| `TimelineLine` | Function | `apps/admin/src/components/ui/timeline.tsx` | 228 |
| `Textarea` | Function | `apps/admin/src/components/ui/textarea.tsx` | 4 |
| `Tabs` | Function | `apps/admin/src/components/ui/tabs.tsx` | 5 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `WisdomCreateDialog → Cn` | cross_community | 3 |
| `VolunteerDetailPage → Cn` | cross_community | 3 |
| `GuideEditDialog → Cn` | cross_community | 3 |
| `DownloadCreateDialog → Cn` | cross_community | 3 |
| `DownloadEditDialog → Cn` | cross_community | 3 |
| `PostCreatePage → Cn` | cross_community | 3 |
| `GuideCreateDialog → Cn` | cross_community | 3 |

## How to Explore

1. `gitnexus_context({name: "cn"})` — see callers and callees
2. `gitnexus_query({query: "ui"})` — find related execution flows
3. Read key files listed above for implementation details
