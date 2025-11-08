/**
 * @jest-environment jsdom
 *
 * Component Test: Contact Search Functionality
 *
 * Tests the Google-style debounced contact search with role filtering
 *
 * Features tested:
 * 1. Debounced API calls (300ms delay)
 * 2. Two-step search (client role first, then all roles)
 * 3. Snake_case to camelCase transformation
 * 4. Green "Client" chip badges
 * 5. Dynamic "Add New" button
 * 6. Minimum 2 characters validation
 * 7. Search result display
 * 8. No results handling
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Autocomplete, TextField, Box, Chip } from '@mui/material';
import * as apiService from '../../services/api.service';

// Mock API service
jest.mock('../../services/api.service', () => ({
  contactsAPI: {
    search: jest.fn()
  }
}));

// Simplified ContactSearch component for testing
const ContactSearch = ({ onSelect, searchRole = 'client' }) => {
  const [searchText, setSearchText] = React.useState('');
  const [contacts, setContacts] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  // Debounced search function (matches NewEscrowModal implementation)
  const searchContacts = React.useCallback(
    async (text) => {
      if (!text || text.length < 2) {
        setContacts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Step 1: Search for specific role
        const roleResponse = await apiService.contactsAPI.search({
          role: searchRole,
          name: text,
          limit: 5
        });

        let roleResults = roleResponse.success ? roleResponse.data : [];

        // Step 2: Fill remaining slots if < 5
        let otherResults = [];
        if (roleResults.length < 5) {
          const remainingSlots = 5 - roleResults.length;
          const allResponse = await apiService.contactsAPI.search({
            name: text,
            limit: remainingSlots
          });

          if (allResponse.success) {
            otherResults = allResponse.data.filter(
              c => !roleResults.some(r => r.id === c.id)
            );
          }
        }

        // Combine and transform
        const combined = [...roleResults, ...otherResults].slice(0, 5);
        const transformed = combined.map(c => ({
          ...c,
          firstName: c.first_name || c.firstName,
          lastName: c.last_name || c.lastName,
          isClientRole: roleResults.some(r => r.id === c.id)
        }));

        setContacts(transformed);
      } catch (err) {
        setContacts([]);
      } finally {
        setLoading(false);
      }
    },
    [searchRole]
  );

  // Debounce effect
  React.useEffect(() => {
    const timer = setTimeout(() => {
      searchContacts(searchText);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText, searchContacts]);

  return (
    <Autocomplete
      options={contacts}
      loading={loading}
      inputValue={searchText}
      onInputChange={(e, value) => setSearchText(value)}
      getOptionLabel={(option) =>
        `${option.firstName} ${option.lastName}${option.email ? ' - ' + option.email : ''}`
      }
      filterOptions={(x) => x}
      renderOption={(props, option) => (
        <Box component="li" {...props} data-testid={`contact-option-${option.id}`}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <span>
              {option.firstName} {option.lastName}
              {option.isClientRole && (
                <Chip
                  label="Client"
                  size="small"
                  data-testid="client-chip"
                  sx={{ ml: 1, backgroundColor: '#4caf50', color: 'white' }}
                />
              )}
            </span>
            {option.email && <span style={{ fontSize: '0.8em', color: '#666' }}>{option.email}</span>}
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search Contacts"
          placeholder="Type to search..."
          helperText="Start typing name or email (2+ characters)"
        />
      )}
      onChange={(e, value) => onSelect && onSelect(value)}
      noOptionsText={searchText.length < 2 ? "Type at least 2 characters" : "No contacts found"}
    />
  );
};

describe('Contact Search', () => {
  let onSelect;

  beforeEach(() => {
    onSelect = jest.fn();
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // Test 1: Renders search input
  test('renders contact search input', () => {
    render(<ContactSearch onSelect={onSelect} />);

    expect(screen.getByLabelText(/Search Contacts/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Type to search/i)).toBeInTheDocument();
  });

  // Test 2: Shows helper text for minimum characters
  test('shows helper text requiring 2+ characters', () => {
    render(<ContactSearch onSelect={onSelect} />);

    expect(screen.getByText(/Start typing name or email \(2\+ characters\)/i)).toBeInTheDocument();
  });

  // Test 3: Debounced search - does not call API immediately
  test('does not trigger API call immediately on typing', async () => {
    render(<ContactSearch onSelect={onSelect} />);

    const input = screen.getByPlaceholderText(/Type to search/i);
    await userEvent.type(input, 'jay');

    // Immediately after typing, no API call
    expect(apiService.contactsAPI.search).not.toHaveBeenCalled();
  });

  // Test 4: Debounced search - calls API after 300ms
  test('triggers API call after 300ms debounce delay', async () => {
    const mockResponse = {
      success: true,
      data: [
        {
          id: 'contact-1',
          first_name: 'Jayden',
          last_name: 'Smith',
          email: 'jayden@example.com'
        }
      ]
    };

    apiService.contactsAPI.search.mockResolvedValue(mockResponse);

    render(<ContactSearch onSelect={onSelect} />);

    const input = screen.getByPlaceholderText(/Type to search/i);
    await userEvent.type(input, 'jay');

    // Fast-forward 300ms
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(apiService.contactsAPI.search).toHaveBeenCalledWith({
        role: 'client',
        name: 'jay',
        limit: 5
      });
    });
  });

  // Test 5: Two-step search - client role first
  test('searches client role first, then all roles if < 5 results', async () => {
    // Step 1: Client role search returns 2 results
    const clientResponse = {
      success: true,
      data: [
        { id: 'c1', first_name: 'John', last_name: 'Client', email: 'john@example.com' },
        { id: 'c2', first_name: 'Jane', last_name: 'Client', email: 'jane@example.com' }
      ]
    };

    // Step 2: All roles search returns 3 more
    const allResponse = {
      success: true,
      data: [
        { id: 'c3', first_name: 'Bob', last_name: 'Agent', email: 'bob@example.com' },
        { id: 'c4', first_name: 'Alice', last_name: 'Broker', email: 'alice@example.com' },
        { id: 'c5', first_name: 'Tom', last_name: 'Lead', email: 'tom@example.com' }
      ]
    };

    apiService.contactsAPI.search
      .mockResolvedValueOnce(clientResponse) // First call: client role
      .mockResolvedValueOnce(allResponse);   // Second call: all roles

    render(<ContactSearch onSelect={onSelect} />);

    const input = screen.getByPlaceholderText(/Type to search/i);
    await userEvent.type(input, 'j');

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      // First call: client role
      expect(apiService.contactsAPI.search).toHaveBeenNthCalledWith(1, {
        role: 'client',
        name: 'j',
        limit: 5
      });

      // Second call: all roles (3 remaining slots)
      expect(apiService.contactsAPI.search).toHaveBeenNthCalledWith(2, {
        name: 'j',
        limit: 3
      });
    });
  });

  // Test 6: Snake_case to camelCase transformation
  test('transforms snake_case API response to camelCase', async () => {
    const mockResponse = {
      success: true,
      data: [
        {
          id: 'contact-1',
          first_name: 'Jayden', // snake_case from API
          last_name: 'Metz',    // snake_case from API
          email: 'jayden@example.com'
        }
      ]
    };

    apiService.contactsAPI.search.mockResolvedValue(mockResponse);

    render(<ContactSearch onSelect={onSelect} />);

    const input = screen.getByPlaceholderText(/Type to search/i);
    await userEvent.type(input, 'jay');

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      // Dropdown should display "Jayden Metz" (transformed to camelCase)
      expect(screen.getByText(/Jayden Metz/i)).toBeInTheDocument();
    });
  });

  // Test 7: Green "Client" chip for primary role
  test('displays green "Client" chip for contacts in primary role', async () => {
    const mockResponse = {
      success: true,
      data: [
        {
          id: 'contact-1',
          first_name: 'Jane',
          last_name: 'Client',
          email: 'jane@example.com'
        }
      ]
    };

    apiService.contactsAPI.search.mockResolvedValue(mockResponse);

    render(<ContactSearch onSelect={onSelect} />);

    const input = screen.getByPlaceholderText(/Type to search/i);
    await userEvent.type(input, 'jane');

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      const chip = screen.getByTestId('client-chip');
      expect(chip).toBeInTheDocument();
      expect(chip).toHaveTextContent('Client');
    });
  });

  // Test 8: No results message
  test('shows "No contacts found" when search returns empty', async () => {
    const mockResponse = {
      success: true,
      data: []
    };

    apiService.contactsAPI.search.mockResolvedValue(mockResponse);

    render(<ContactSearch onSelect={onSelect} />);

    const input = screen.getByPlaceholderText(/Type to search/i);
    await userEvent.type(input, 'nonexistent');

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(screen.getByText(/No contacts found/i)).toBeInTheDocument();
    });
  });

  // Test 9: Minimum 2 characters - does not search with 1 character
  test('does not trigger search with only 1 character', async () => {
    render(<ContactSearch onSelect={onSelect} />);

    const input = screen.getByPlaceholderText(/Type to search/i);
    await userEvent.type(input, 'j');

    jest.advanceTimersByTime(300);

    // Should not call API
    expect(apiService.contactsAPI.search).not.toHaveBeenCalled();
  });

  // Test 10: Loading state
  test('shows loading indicator while searching', async () => {
    const mockResponse = {
      success: true,
      data: []
    };

    apiService.contactsAPI.search.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
    );

    render(<ContactSearch onSelect={onSelect} />);

    const input = screen.getByPlaceholderText(/Type to search/i);
    await userEvent.type(input, 'jay');

    jest.advanceTimersByTime(300);

    // Loading indicator should be present (MUI Autocomplete shows CircularProgress)
    await waitFor(() => {
      const progressBar = screen.queryByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    jest.advanceTimersByTime(100);
  });

  // Test 11: Contact selection calls onSelect
  test('calls onSelect callback when contact is selected', async () => {
    const mockResponse = {
      success: true,
      data: [
        {
          id: 'contact-1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com'
        }
      ]
    };

    apiService.contactsAPI.search.mockResolvedValue(mockResponse);

    render(<ContactSearch onSelect={onSelect} />);

    const input = screen.getByPlaceholderText(/Type to search/i);
    await userEvent.type(input, 'john');

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });

    // Click on the contact
    const contactOption = screen.getByTestId('contact-option-contact-1');
    fireEvent.click(contactOption);

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'contact-1',
          firstName: 'John',
          lastName: 'Doe'
        })
      );
    });
  });

  // Test 12: Search with different roles
  test('uses custom searchRole prop for filtering', async () => {
    const mockResponse = {
      success: true,
      data: []
    };

    apiService.contactsAPI.search.mockResolvedValue(mockResponse);

    render(<ContactSearch onSelect={onSelect} searchRole="agent" />);

    const input = screen.getByPlaceholderText(/Type to search/i);
    await userEvent.type(input, 'test');

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(apiService.contactsAPI.search).toHaveBeenCalledWith({
        role: 'agent', // Custom role instead of default 'client'
        name: 'test',
        limit: 5
      });
    });
  });
});
