
import { useMemo } from 'react';
import { Contact } from '@/types/contact';
import { Filter, FilterType, FilterOperator, DateRange } from '@/components/ui/filters';

export function useAdvancedContactFilters(contacts: Contact[], filters: Filter[], searchQuery: string) {
  return useMemo(() => {
    if (!contacts) return [];

    let result = contacts.filter(contact => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          contact.name?.toLowerCase().includes(query) || 
          contact.personal_email?.toLowerCase().includes(query) || 
          contact.company_name?.toLowerCase().includes(query) || 
          contact.job_title?.toLowerCase().includes(query) ||
          contact.location?.toLowerCase().includes(query) ||
          contact.university?.toLowerCase().includes(query) ||
          contact.industry?.toLowerCase().includes(query) ||
          contact.tags?.some(tag => tag.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Apply each filter
      for (const filter of filters) {
        if (!filter.value?.length) continue;

        const matchesFilter = applyFilter(contact, filter);
        if (!matchesFilter) return false;
      }

      return true;
    });

    return result;
  }, [contacts, filters, searchQuery]);
}

function applyFilter(contact: Contact, filter: Filter): boolean {
  const { type, operator, value } = filter;

  switch (type) {
    case FilterType.CIRCLE:
      return applyStringFilter(contact.circle, operator, value);
    
    case FilterType.COMPANY:
      return applyStringFilter(contact.company_name, operator, value);
    
    case FilterType.INDUSTRY:
      return applyStringFilter(contact.industry, operator, value);
    
    case FilterType.UNIVERSITY:
      return applyStringFilter(contact.university, operator, value);
    
    case FilterType.LOCATION:
      return applyStringFilter(contact.location, operator, value);
    
    case FilterType.TAGS:
      return applyArrayFilter(contact.tags, operator, value);
    
    case FilterType.LAST_CONTACT:
      return applyDateFilter(contact.last_contact, operator, value);
    
    case FilterType.CREATED_DATE:
      return applyDateFilter(contact.created_at, operator, value);
    
    case FilterType.UPDATED_DATE:
      return applyDateFilter(contact.updated_at, operator, value);
    
    default:
      return true;
  }
}

function applyStringFilter(fieldValue: string | null | undefined, operator: FilterOperator, filterValues: string[]): boolean {
  if (!fieldValue) return false;

  switch (operator) {
    case FilterOperator.IS:
      return filterValues.includes(fieldValue);
    case FilterOperator.IS_NOT:
      return !filterValues.includes(fieldValue);
    case FilterOperator.IS_ANY_OF:
      return filterValues.includes(fieldValue);
    default:
      return true;
  }
}

function applyArrayFilter(fieldValue: string[] | null | undefined, operator: FilterOperator, filterValues: string[]): boolean {
  if (!fieldValue || !Array.isArray(fieldValue)) return false;

  switch (operator) {
    case FilterOperator.INCLUDE:
      return filterValues.some(val => fieldValue.includes(val));
    case FilterOperator.DO_NOT_INCLUDE:
      return !filterValues.some(val => fieldValue.includes(val));
    case FilterOperator.INCLUDE_ALL_OF:
      return filterValues.every(val => fieldValue.includes(val));
    case FilterOperator.INCLUDE_ANY_OF:
      return filterValues.some(val => fieldValue.includes(val));
    case FilterOperator.EXCLUDE_ALL_OF:
      return !filterValues.every(val => fieldValue.includes(val));
    case FilterOperator.EXCLUDE_IF_ANY_OF:
      return !filterValues.some(val => fieldValue.includes(val));
    default:
      return true;
  }
}

function applyDateFilter(fieldValue: string | null | undefined, operator: FilterOperator, filterValues: string[]): boolean {
  if (!fieldValue || !filterValues.length) return false;

  const fieldDate = new Date(fieldValue);
  const now = new Date();
  const filterValue = filterValues[0];

  // Handle relative date ranges
  if (filterValue === DateRange.IN_THE_PAST) {
    return operator === FilterOperator.IS ? fieldDate < now : fieldDate >= now;
  }

  // Calculate target date based on filter value
  let targetDate = new Date();
  switch (filterValue) {
    case DateRange.IN_24_HOURS:
      targetDate.setHours(targetDate.getHours() + 24);
      break;
    case DateRange.IN_3_DAYS:
      targetDate.setDate(targetDate.getDate() + 3);
      break;
    case DateRange.IN_1_WEEK:
      targetDate.setDate(targetDate.getDate() + 7);
      break;
    case DateRange.IN_1_MONTH:
      targetDate.setMonth(targetDate.getMonth() + 1);
      break;
    case DateRange.IN_3_MONTHS:
      targetDate.setMonth(targetDate.getMonth() + 3);
      break;
    default:
      return true;
  }

  switch (operator) {
    case FilterOperator.BEFORE:
      return fieldDate < targetDate;
    case FilterOperator.AFTER:
      return fieldDate > targetDate;
    case FilterOperator.IS:
      return fieldDate <= targetDate && fieldDate >= now;
    case FilterOperator.IS_NOT:
      return fieldDate > targetDate || fieldDate < now;
    default:
      return true;
  }
}
