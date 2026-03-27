import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PlaceholderPageProps = {
  title: string;
  description: string;
  primaryAction?: string;
  sections: Array<{
    title: string;
    detail: string;
    state?: string;
  }>;
};

export function PlaceholderPage({
  title,
  description,
  primaryAction,
  sections,
}: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
        {primaryAction ? <Badge className="rounded-md px-3 py-1">{primaryAction}</Badge> : null}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{section.title}</CardTitle>
                  <CardDescription className="mt-2">{section.detail}</CardDescription>
                </div>
                {section.state ? <Badge variant="outline">{section.state}</Badge> : null}
              </div>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">
              Surface này đang được giữ đúng slot của template để không còn cảm giác menu chết hoặc
              route giả.
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
