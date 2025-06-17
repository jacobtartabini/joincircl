
import { useState, useMemo } from 'react';
import { Contact } from '@/types/contact';

interface UsePaginationProps {
  contacts: Contact[];
  itemsPerPage?: number;
}

export function usePagination({ contacts, itemsPerPage = 100 }: UsePaginationProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(contacts.length / itemsPerPage);
  
  const paginatedContacts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return contacts.slice(startIndex, endIndex);
  }, [contacts, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToPrevious = () => {
    goToPage(currentPage - 1);
  };

  const goToNext = () => {
    goToPage(currentPage + 1);
  };

  // Reset to page 1 when contacts change significantly
  const resetToFirstPage = () => {
    setCurrentPage(1);
  };

  return {
    currentPage,
    totalPages,
    paginatedContacts,
    goToPage,
    goToPrevious,
    goToNext,
    resetToFirstPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    totalContacts: contacts.length,
    itemsPerPage,
  };
}
