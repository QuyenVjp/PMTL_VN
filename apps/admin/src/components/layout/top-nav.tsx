import { Link } from "@tanstack/react-router";
import { MenuIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type TopNavLink = {
  title: string;
  href: string;
  isActive: boolean;
  disabled?: boolean;
};

export function TopNav({
  links,
  className,
}: {
  links: TopNavLink[];
  className?: string;
}) {
  return (
    <>
      <div className="lg:hidden">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="outline" className="size-8">
              <MenuIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="start">
            {links.map((link) => (
              <DropdownMenuItem
                key={`${link.title}-${link.href}`}
                disabled={link.disabled}
                asChild={!link.disabled}
              >
                {link.disabled ? (
                  <span className="text-muted-foreground">{link.title}</span>
                ) : (
                  <Link
                    to={link.href}
                    className={link.isActive ? "text-foreground" : "text-muted-foreground"}
                  >
                    {link.title}
                  </Link>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav className={cn("hidden items-center gap-4 lg:flex xl:gap-6", className)}>
        {links.map((link) =>
          link.disabled ? (
            <span
              key={`${link.title}-${link.href}`}
              className="text-sm font-medium text-muted-foreground"
            >
              {link.title}
            </span>
          ) : (
            <Link
              key={`${link.title}-${link.href}`}
              to={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                link.isActive ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {link.title}
            </Link>
          ),
        )}
      </nav>
    </>
  );
}
