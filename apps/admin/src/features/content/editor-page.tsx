import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/features/content/rich-text-editor";

export function EditorPage({
  title,
  description,
  initialContent,
}: {
  title: string;
  description: string;
  initialContent: string;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge variant="outline">Tiptap editor</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
          <CardDescription>Giữ structure của editorial workspace thay vì để route trống.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label htmlFor="content-title" className="text-sm font-medium">
              Tiêu đề
            </label>
            <Input id="content-title" defaultValue={title} />
          </div>
          <div className="grid gap-2">
            <label htmlFor="content-slug" className="text-sm font-medium">
              Slug
            </label>
            <Input id="content-slug" defaultValue={title.toLowerCase().replace(/\s+/g, "-")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nội dung dài</CardTitle>
          <CardDescription>CKEditor-style lane đã được thay bằng Tiptap để dễ custom hơn.</CardDescription>
        </CardHeader>
        <CardContent>
          <RichTextEditor initialContent={initialContent} />
        </CardContent>
      </Card>
    </div>
  );
}
