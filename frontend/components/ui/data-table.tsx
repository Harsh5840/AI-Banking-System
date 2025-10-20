"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

type SortDirection = "asc" | "desc" | null

interface Column<T> {
  key: string
  header: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchKey?: keyof T
  searchPlaceholder?: string
  pageSize?: number
  className?: string
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchKey,
  searchPlaceholder = "Search...",
  pageSize = 10,
  className,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  // Filter data by search
  const filteredData = searchKey
    ? data.filter((item) =>
        String(item[searchKey]).toLowerCase().includes(search.toLowerCase())
      )
    : data

  // Sort data
  const sortedData = sortKey
    ? [...filteredData].sort((a, b) => {
        const aVal = a[sortKey]
        const bVal = b[sortKey]
        
        if (sortDirection === "asc") {
          return aVal > bVal ? 1 : -1
        } else if (sortDirection === "desc") {
          return aVal < bVal ? 1 : -1
        }
        return 0
      })
    : filteredData

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else if (sortDirection === "desc") {
        setSortDirection(null)
        setSortKey(null)
      }
    } else {
      setSortKey(key)
      setSortDirection("asc")
    }
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const getSortIcon = (columnKey: string) => {
    if (sortKey !== columnKey) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="h-4 w-4" />
    }
    if (sortDirection === "desc") {
      return <ArrowDown className="h-4 w-4" />
    }
    return <ArrowUpDown className="h-4 w-4" />
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      {searchKey && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1) // Reset to first page on search
            }}
            className="pl-10"
          />
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-900">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    column.className,
                    column.sortable && "cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column.header}</span>
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12 text-slate-500">
                  No data found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      {column.render ? column.render(item) : String(item[column.key])}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, sortedData.length)} of{" "}
            {sortedData.length} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
