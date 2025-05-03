import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#9EA8FB]/10 text-[#9EA8FB] hover:bg-[#9EA8FB]/20",
        secondary:
          "border-transparent bg-[#FCDC94]/10 text-[#12131C] hover:bg-[#FCDC94]/20",
        destructive:
          "border-transparent bg-red-100 text-red-800 hover:bg-red-200/80",
        outline: "text-[#12131C] border-[#12131C]",
        success: "border-transparent bg-green-100 text-green-800 hover:bg-green-200/80",
        warning: "border-transparent bg-[#FCDC94]/10 text-[#12131C] hover:bg-[#FCDC94]/20",
        info: "border-transparent bg-[#EADCFF]/10 text-[#12131C] hover:bg-[#EADCFF]/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
