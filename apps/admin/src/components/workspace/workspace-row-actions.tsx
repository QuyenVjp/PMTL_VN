/**
 * WorkspaceRowActions
 *
 * Generic ⋮ dropdown for table row action menus.
 * Each migrated list page passes its own array of actions — no context coupling here.
 */
import { DotsHorizontalIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type RowAction = {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  /** "destructive" renders red text */
  variant?: "default" | "destructive";
  /** Render a separator BEFORE this item */
  separator?: boolean;
};

type WorkspaceRowActionsProps = {
  actions: RowAction[];
};

export function WorkspaceRowActions({ actions }: WorkspaceRowActionsProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex size-8 p-0 data-[state=open]:bg-muted">
          <DotsHorizontalIcon className="size-4" />
          <span className="sr-only">Mở menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[168px] rounded-xl">
        {actions.map((action, i) => (
          <span key={i}>
            {action.separator && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={action.onClick}
              className={
                action.variant === "destructive"
                  ? "text-destructive focus:text-destructive"
                  : undefined
              }
            >
              {action.label}
              {action.icon && (
                <DropdownMenuShortcut>
                  <action.icon className="size-4" />
                </DropdownMenuShortcut>
              )}
            </DropdownMenuItem>
          </span>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
