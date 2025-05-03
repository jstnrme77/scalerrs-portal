import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#12131C] text-white hover:opacity-90", // Primary CTA
        destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
        outline: "border border-[#12131C] bg-white text-[#12131C] hover:opacity-90", // Secondary CTA
        secondary: "bg-white text-[#12131C] border border-[#12131C] hover:opacity-90", // Secondary CTA
        accent: "bg-[#9EA8FB] text-white hover:opacity-90", // Dark Background Primary CTA
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-[#9EA8FB] border-b border-[#9EA8FB] rounded-none hover:opacity-90", // Tertiary CTA
      },
      size: {
        default: "h-9 px-3 py-1.5",
        sm: "h-8 px-2 py-1",
        lg: "h-10 px-4 py-2",
        icon: "h-9 w-9",
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
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
