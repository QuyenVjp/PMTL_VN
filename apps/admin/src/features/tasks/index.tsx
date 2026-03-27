import { useMemo, useState } from "react";
import { CheckCircle2Icon, Clock3Icon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type TaskStatus = "Todo" | "In Progress" | "Done";

type TaskRow = {
  id: string;
  title: string;
  owner: string;
  status: TaskStatus;
  priority: "Low" | "Medium" | "High";
};

const initialTasks: TaskRow[] = [
  { id: "PMTL-101", title: "Graft admin users table", owner: "QA Operator", status: "Done", priority: "High" },
  { id: "PMTL-102", title: "Open auth routes", owner: "QA Operator", status: "Done", priority: "High" },
  { id: "PMTL-103", title: "Wire feature flags page", owner: "Ops", status: "In Progress", priority: "Medium" },
  { id: "PMTL-104", title: "Moderation decision flow", owner: "Community", status: "Todo", priority: "High" },
  { id: "PMTL-105", title: "Search command palette", owner: "Platform", status: "In Progress", priority: "Medium" },
  { id: "PMTL-106", title: "Audit log filters", owner: "Platform", status: "Todo", priority: "Low" },
];

function statusVariant(status: TaskStatus): "secondary" | "outline" | "default" {
  if (status === "Done") return "secondary";
  if (status === "In Progress") return "outline";
  return "default";
}

export function TasksPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | TaskStatus>("All");
  const [tasks, setTasks] = useState(initialTasks);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesQuery =
        task.id.toLowerCase().includes(query.toLowerCase()) ||
        task.title.toLowerCase().includes(query.toLowerCase()) ||
        task.owner.toLowerCase().includes(query.toLowerCase());

      const matchesStatus = statusFilter === "All" ? true : task.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter, tasks]);

  const markDone = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, status: "Done" } : task)),
    );
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Here&apos;s a list of your tasks for this month.
          </p>
        </div>
        <Button>
          <PlusIcon />
          Create Task
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative max-w-xs flex-1">
              <SearchIcon className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter by title or ID..."
                className="ps-9"
              />
            </div>
            <Button variant={statusFilter === "All" ? "secondary" : "outline"} onClick={() => setStatusFilter("All")}>
              All
            </Button>
            <Button variant={statusFilter === "Todo" ? "secondary" : "outline"} onClick={() => setStatusFilter("Todo")}>
              Todo
            </Button>
            <Button
              variant={statusFilter === "In Progress" ? "secondary" : "outline"}
              onClick={() => setStatusFilter("In Progress")}
            >
              In Progress
            </Button>
            <Button variant={statusFilter === "Done" ? "secondary" : "outline"} onClick={() => setStatusFilter("Done")}>
              Done
            </Button>
          </div>

          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No results.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.id}</TableCell>
                      <TableCell>{task.title}</TableCell>
                      <TableCell>{task.owner}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(task.status)}>{task.status}</Badge>
                      </TableCell>
                      <TableCell>{task.priority}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => markDone(task.id)}>
                            <CheckCircle2Icon />
                            Done
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => removeTask(task.id)}>
                            <Trash2Icon />
                            Remove
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock3Icon className="size-4" />
            <span>{filteredTasks.length} task hiển thị. State đã tương tác được thay vì placeholder chết.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
