import { Column } from "@tanstack/react-table"
import { ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting()}
      className={cn("hover:bg-transparent", className)}
    >
      <div className="flex items-center gap-2">
        {title}
        {column.getIsSorted() === "desc" ? (
          <ChevronDown className="h-4 w-4" />
        ) : column.getIsSorted() === "asc" ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronsUpDown className="h-4 w-4" />
        )}
      </div>
    </Button>
  )
} 