import * as React from "react"
import { cn } from "@/lib/utils"

// Ensure we're using proper types
type CompactTableProps = React.HTMLAttributes<HTMLTableElement>
type CompactTableHeaderProps = React.HTMLAttributes<HTMLTableSectionElement>
type CompactTableBodyProps = React.HTMLAttributes<HTMLTableSectionElement>
type CompactTableRowProps = React.HTMLAttributes<HTMLTableRowElement>
type CompactTableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement> & { width?: string }
type CompactTableCellProps = React.TdHTMLAttributes<HTMLTableCellElement> & { width?: string }

const CompactTable = React.forwardRef<
  HTMLTableElement,
  CompactTableProps
>(({ className, ...props }, ref) => (
  <table
    ref={ref}
    className={cn("w-full caption-bottom text-base table-fixed border-collapse", className)}
    style={{ tableLayout: 'fixed' }}
    {...props}
  />
))
CompactTable.displayName = "CompactTable"

const CompactTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  CompactTableHeaderProps
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
CompactTableHeader.displayName = "CompactTableHeader"

const CompactTableBody = React.forwardRef<
  HTMLTableSectionElement,
  CompactTableBodyProps
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
CompactTableBody.displayName = "CompactTableBody"

const CompactTableRow = React.forwardRef<
  HTMLTableRowElement,
  CompactTableRowProps
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
CompactTableRow.displayName = "CompactTableRow"

const CompactTableHead = React.forwardRef<
  HTMLTableCellElement,
  CompactTableHeadProps
>(({ className, width = "150px", ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground text-sm truncate",
      className
    )}
    style={{ width, maxWidth: width }}
    {...props}
  />
))
CompactTableHead.displayName = "CompactTableHead"

const CompactTableCell = React.forwardRef<
  HTMLTableCellElement,
  CompactTableCellProps
>(({ className, width = "150px", ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle text-sm truncate", className)}
    style={{ width, maxWidth: width }}
    {...props}
  />
))
CompactTableCell.displayName = "CompactTableCell"

export {
  CompactTable,
  CompactTableHeader,
  CompactTableBody,
  CompactTableRow,
  CompactTableHead,
  CompactTableCell,
}
