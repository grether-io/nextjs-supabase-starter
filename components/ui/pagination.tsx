import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  itemsPerPage: number;
  baseUrl?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalCount,
  itemsPerPage,
  baseUrl = "",
}: SimplePaginationProps) {
  const startItem = totalCount > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  const hasMultiplePages = totalPages > 1;
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="text-sm text-muted-foreground">
        {totalCount > 0 ? (
          <>
            Showing <span className="font-medium text-foreground">{startItem}</span> to{" "}
            <span className="font-medium text-foreground">{endItem}</span> of{" "}
            <span className="font-medium text-foreground">{totalCount}</span> result
            {totalCount !== 1 ? "s" : ""}
          </>
        ) : (
          "No results found"
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          asChild={hasMultiplePages && hasPrevious}
          disabled={!hasMultiplePages || !hasPrevious}
        >
          {hasMultiplePages && hasPrevious ? (
            <Link href={`${baseUrl}?page=${currentPage - 1}`}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Link>
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </>
          )}
        </Button>

        <div className="flex items-center gap-1 text-sm">
          <span className="text-muted-foreground">Page</span>
          <span className="font-medium">{currentPage}</span>
          <span className="text-muted-foreground">of</span>
          <span className="font-medium">{Math.max(1, totalPages)}</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          asChild={hasMultiplePages && hasNext}
          disabled={!hasMultiplePages || !hasNext}
        >
          {hasMultiplePages && hasNext ? (
            <Link href={`${baseUrl}?page=${currentPage + 1}`}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

