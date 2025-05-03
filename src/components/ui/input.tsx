import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-[#D9D9D9] bg-white px-3 py-2 text-sm text-[#12131C] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#12131C]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9EA8FB] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
