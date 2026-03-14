import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

import { clsx } from "clsx";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary";
  }
>;

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx("ui-button", `ui-button--${variant}`, className)}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

