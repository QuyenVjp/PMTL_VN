import type { LinkProps } from "@tanstack/react-router";

export type NavBaseItem = {
  title: string;
  badge?: string;
  icon?: React.ElementType;
  disabled?: boolean;
};

export type NavLink = NavBaseItem & {
  url: LinkProps["to"] | (string & {});
  items?: never;
};

export type NavCollapsible = NavBaseItem & {
  items: Array<NavBaseItem & { url: LinkProps["to"] | (string & {}) }>;
  url?: never;
};

export type NavItem = NavLink | NavCollapsible;

export type NavGroup = {
  title: string;
  items: NavItem[];
};
