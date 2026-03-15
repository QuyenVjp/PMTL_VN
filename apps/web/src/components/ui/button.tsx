import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-primary/80 bg-primary text-primary-foreground shadow-ant hover:bg-primary/92",
        destructive:
          "border-destructive/70 bg-destructive text-destructive-foreground shadow-ant hover:bg-destructive/92",
        outline:
          "border-input bg-background text-foreground hover:border-gold/40 hover:bg-muted/40",
        secondary:
          "border-border bg-secondary text-secondary-foreground hover:bg-secondary/85",
        ghost: "border-transparent hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        sacred:
          "border-gold/50 bg-gold text-zen-dark shadow-gold hover:bg-gold-glow",
        outlineGlow:
          "border-gold/35 bg-background text-foreground hover:border-gold/60 hover:bg-gold/10 hover:text-gold",
        glass:
          "border-white/15 bg-white/10 text-white backdrop-blur-xl hover:border-white/25 hover:bg-white/15 hover:text-white",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-6",
        icon: "size-10",
        pill: "h-11 px-5 text-sm",
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
