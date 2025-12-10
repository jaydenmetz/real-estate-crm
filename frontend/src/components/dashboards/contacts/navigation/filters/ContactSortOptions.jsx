/**
 * Contact Sort Options Configuration
 *
 * Defines the available sort options for the contacts dashboard.
 */

export const contactSortOptions = [
  { value: 'last_name', label: 'Last Name' },
  { value: 'first_name', label: 'First Name' },
  { value: 'created_at', label: 'Date Added' },
  { value: 'updated_at', label: 'Last Updated' },
  { value: 'lifetime_value', label: 'Lifetime Value' },
  { value: 'total_portfolio', label: 'Total Portfolio' },
  { value: 'last_follow_up', label: 'Last Follow Up' },
];

export const contactDefaultSort = {
  sortBy: 'last_name',
  sortOrder: 'asc',
};
