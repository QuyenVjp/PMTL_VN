import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent text-sm font-medium tracking-[0.01em] ring-offset-background transition-[background-color,border-color,color,transform,box-shadow] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-primary/70 bg-primary text-primary-foreground shadow-ant hover:border-primary/80 hover:bg-primary/92",
        destructive:
          "border-destructive/70 bg-destructive text-destructive-foreground shadow-ant hover:bg-destructive/92",
        outline:
          "border-border/80 bg-card/92 text-foreground shadow-[inset_0_1px_0_hsl(var(--background)/0.7)] hover:border-primary/35 hover:bg-muted/35",
        secondary:
          "border-border/70 bg-secondary/88 text-secondary-foreground hover:border-border hover:bg-secondary",
        ghost: "border-transparent bg-transparent hover:bg-muted/60 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        sacred:
          "border-gold/50 bg-gold text-zen-dark shadow-gold hover:border-gold/60 hover:bg-gold-glow",
        outlineGlow:
          "border-gold/35 bg-card/92 text-foreground hover:border-gold/60 hover:bg-gold/10 hover:text-gold",
        glass:
          "border-white/15 bg-white/10 text-white shadow-none backdrop-blur-xl hover:border-white/25 hover:bg-white/15 hover:text-white",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-6 text-[0.95rem]",
        icon: "size-10",
        pill: "h-11 rounded-full px-5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
