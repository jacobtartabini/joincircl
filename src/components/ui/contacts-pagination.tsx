
import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface ContactsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalContacts: number;
  itemsPerPage: number;
}

export function ContactsPagination({
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPreviousPage,
  totalContacts,
  itemsPerPage,
}: ContactsPaginationProps) {
  // Don't show pagination if there are no contacts or only one page
  if (totalContacts === 0 || totalPages <= 1) {
    return null;
  }

  const generatePageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if we have few pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 4) {
        // Show pages 2-5 and ellipsis before last page
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Show ellipsis after first page and last 4 pages
        pages.push('ellipsis');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show ellipsis, current page with neighbors, ellipsis, last page
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="text-sm text-muted-foreground">
        Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalContacts)} to{' '}
        {Math.min(currentPage * itemsPerPage, totalContacts)} of {totalContacts} contacts
      </div>
      
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={(e) => {
                e.preventDefault();
                if (hasPreviousPage) {
                  onPageChange(currentPage - 1);
                }
              }}
              className={!hasPreviousPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>

          {pageNumbers.map((pageNumber, index) => (
            <PaginationItem key={index}>
              {pageNumber === 'ellipsis' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(pageNumber);
                  }}
                  isActive={pageNumber === currentPage}
                  className="cursor-pointer"
                >
                  {pageNumber}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={(e) => {
                e.preventDefault();
                if (hasNextPage) {
                  onPageChange(currentPage + 1);
                }
              }}
              className={!hasNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
