import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Grid,
  Paper,
  IconButton,
  Collapse,
  Chip,
  Fade,
  Tooltip,
  Snackbar,
  Alert,
  Divider,
  Stack,
  Tabs,
  Tab
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as ErrorIcon,
  ExpandMore as ExpandIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Speed as SpeedIcon,
  Search as SearchIcon,
  BugReport as BugIcon,
  Add as AddIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const PageContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  minHeight: '100vh',
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3)
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.palette.primary.dark,
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1, 2),
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  borderRadius: theme.spacing(1),
  display: 'inline-block'
}));

const TestCard = styled(Card)(({ status }) => ({
  marginBottom: '16px',
  border: '2px solid',
  borderColor: status === 'success' ? '#4caf50' :
               status === 'failed' ? '#f44336' :
               status === 'warning' ? '#ff9800' : '#e0e0e0',
  backgroundColor: status === 'success' ? '#f1f8e9' :
                   status === 'failed' ? '#ffebee' :
                   status === 'warning' ? '#fff3e0' : '#fafafa',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
  }
}));

const ExpandButton = styled(IconButton)(({ expanded }) => ({
  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
  transition: 'transform 0.3s'
}));

const CodeBlock = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: '#1e1e1e',
  color: '#d4d4d4',
  fontFamily: 'Monaco, Consolas, "Courier New", monospace',
  fontSize: '0.875rem',
  overflow: 'auto',
  borderRadius: theme.spacing(1),
  position: 'relative',
  marginTop: theme.spacing(2),
  maxHeight: '400px'
}));

const CopyButton = styled(IconButton)({
  position: 'absolute',
  top: 8,
  right: 8,
  color: '#888',
  '&:hover': {
    color: '#fff'
  }
});

const CategoryIcon = ({ category }) => {
  switch(category) {
    case 'Critical':
      return <ErrorIcon sx={{ color: '#f44336', fontSize: 20 }} />;
    case 'Search':
      return <SearchIcon sx={{ color: '#2196f3', fontSize: 20 }} />;
    case 'Error Handling':
      return <BugIcon sx={{ color: '#ff5722', fontSize: 20 }} />;
    case 'Edge Case':
      return <WarningIcon sx={{ color: '#ff9800', fontSize: 20 }} />;
    case 'Performance':
      return <SpeedIcon sx={{ color: '#9c27b0', fontSize: 20 }} />;
    default:
      return null;
  }
};

const StatusIcon = ({ status }) => {
  if (status === 'success') {
    return <CheckIcon sx={{ color: '#4caf50', fontSize: 28 }} />;
  }
  if (status === 'failed') {
    return <ErrorIcon sx={{ color: '#f44336', fontSize: 28 }} />;
  }
  if (status === 'warning') {
    return <WarningIcon sx={{ color: '#ff9800', fontSize: 28 }} />;
  }
  return <PlayIcon sx={{ color: '#2196f3', fontSize: 28 }} />;
};

const TestItem = ({ test }) => {
  const [expanded, setExpanded] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const formatCurl = () => {
    if (!test.curl) return '';
    let formatted = test.curl;
    formatted = formatted
      .replace(' -X ', ' \\\n  -X ')
      .replace(' -H ', ' \\\n  -H ')
      .replace(/ -H /g, ' \\\n  -H ')
      .replace(' -d ', ' \\\n  -d ');
    return formatted;
  };

  const formatResponse = () => {
    if (!test.response) return 'No response';
    try {
      const parsed = typeof test.response === 'string'
        ? JSON.parse(test.response)
        : test.response;
      if (test.status === 'success' && test.method === 'GET' && parsed.data?.listings) {
        return JSON.stringify({
          success: parsed.success,
          data: {
            listings: `[${parsed.data.listings.length} listings]`,
            pagination: parsed.data.pagination
          }
        }, null, 2);
      }
      return JSON.stringify(parsed, null, 2);
    } catch {
      return test.response;
    }
  };

  const formatRequestBody = () => {
    if (!test.requestBody) return null;
    try {
      const parsed = typeof test.requestBody === 'string'
        ? JSON.parse(test.requestBody)
        : test.requestBody;
      return JSON.stringify(parsed, null, 2);
    } catch {
      return test.requestBody;
    }
  };

  return (
    <TestCard status={test.status}>
      <CardContent onClick={() => setExpanded(!expanded)} sx={{ cursor: 'pointer' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <StatusIcon status={test.status} />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {test.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {test.description}
              </Typography>
              {test.category && (
                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                  <CategoryIcon category={test.category} />
                  <Chip
                    label={test.category}
                    size="small"
                    sx={{ fontSize: '0.7rem' }}
                    color={test.category === 'Critical' ? 'error' :
                           test.category === 'Edge Case' ? 'warning' : 'default'}
                  />
                </Box>
              )}
              {test.method && test.endpoint && (
                <Box display="flex" gap={1} mt={0.5}>
                  <Chip
                    label={test.method}
                    size="small"
                    sx={{
                      fontWeight: 'bold',
                      backgroundColor:
                        test.method === 'GET' ? '#2196f3' :
                        test.method === 'POST' ? '#4caf50' :
                        test.method === 'PUT' ? '#ff9800' :
                        test.method === 'DELETE' ? '#f44336' : '#9e9e9e',
                      color: 'white'
                    }}
                  />
                  <Typography variant="caption" sx={{ alignSelf: 'center', fontFamily: 'monospace' }}>
                    {test.endpoint}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label={test.status === 'success' ? 'PASSED' :
                     test.status === 'failed' ? 'FAILED' :
                     test.status === 'warning' ? 'WARNING' : 'PENDING'}
              size="small"
              sx={{
                backgroundColor: test.status === 'success' ? '#4caf50' :
                               test.status === 'failed' ? '#f44336' :
                               test.status === 'warning' ? '#ff9800' : '#9e9e9e',
                color: 'white',
                fontWeight: 'bold'
              }}
            />
            {test.responseTime && (
              <Chip
                label={`${test.responseTime}ms`}
                size="small"
                variant="outlined"
                color={test.responseTime > 1000 ? 'warning' : 'default'}
              />
            )}
            <ExpandButton expanded={expanded}>
              <ExpandIcon />
            </ExpandButton>
          </Box>
        </Box>
      </CardContent>

      <Collapse in={expanded}>
        <Box sx={{ px: 2, pb: 2 }}>
          {test.expectedStatus && (
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: '#666' }}>
              Expected Status: {test.expectedStatus}
            </Typography>
          )}

          {test.curl && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                CURL Request:
              </Typography>
              <CodeBlock>
                <CopyButton size="small" onClick={() => copyToClipboard(test.curl)}>
                  <CopyIcon fontSize="small" />
                </CopyButton>
                <pre style={{ margin: 0 }}>{formatCurl()}</pre>
              </CodeBlock>
            </>
          )}

          {test.requestBody && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                Request Body:
              </Typography>
              <CodeBlock>
                <CopyButton size="small" onClick={() => copyToClipboard(formatRequestBody())}>
                  <CopyIcon fontSize="small" />
                </CopyButton>
                <pre style={{ margin: 0 }}>{formatRequestBody()}</pre>
              </CodeBlock>
            </>
          )}

          {test.response && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                Response:
              </Typography>
              <CodeBlock>
                <CopyButton size="small" onClick={() => copyToClipboard(formatResponse())}>
                  <CopyIcon fontSize="small" />
                </CopyButton>
                <pre style={{ margin: 0 }}>{formatResponse()}</pre>
              </CodeBlock>
            </>
          )}

          {test.error && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold', color: '#f44336' }}>
                Error:
              </Typography>
              <Typography variant="body2" color="error">
                {test.error}
              </Typography>
            </>
          )}
        </Box>
      </Collapse>
    </TestCard>
  );
};

const ListingsHealthDashboard = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [testListingId, setTestListingId] = useState(null);
  const [testListingIds, setTestListingIds] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [groupedTests, setGroupedTests] = useState({
    CORE: [],
    FILTERS: [],
    ERROR: [],
    EDGE: [],
    PERFORMANCE: [],
    WORKFLOW: []
  });

  const runAllTests = useCallback(async () => {
    setLoading(true);
    setTests([]);
    setGroupedTests({ CORE: [], FILTERS: [], ERROR: [], EDGE: [], PERFORMANCE: [], WORKFLOW: [] });

    let API_URL = process.env.REACT_APP_API_URL || 'https://api.jaydenmetz.com';
    if (!API_URL.endsWith('/v1')) {
      API_URL = API_URL.replace(/\/$/, '') + '/v1';
    }

    const token = localStorage.getItem('crm_auth_token') ||
                 localStorage.getItem('authToken') ||
                 localStorage.getItem('token');

    const allTests = [];
    const grouped = { CORE: [], FILTERS: [], ERROR: [], EDGE: [], PERFORMANCE: [], WORKFLOW: [] };
    let createdListingId = null;
    const createdListingIds = [];

    // ========================================
    // CORE TESTS - Essential CRUD Operations
    // ========================================

    // Core GET: List all listings
    const getAllTest = {
      name: 'List All Listings',
      description: 'Retrieve all listings from the database',
      category: 'Critical',
      method: 'GET',
      endpoint: '/listings',
      status: 'pending',
      curl: `curl -X GET "${API_URL}/listings" -H "Authorization: Bearer ${token}"`,
      response: null,
      error: null,
      responseTime: null
    };

    const startTime1 = Date.now();
    try {
      const response = await fetch(`${API_URL}/listings`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      getAllTest.responseTime = Date.now() - startTime1;
      getAllTest.status = response.ok && data.success ? 'success' : 'failed';
      getAllTest.response = data;
      if (!response.ok || !data.success) {
        getAllTest.error = data.error?.message || 'Failed to fetch listings';
      }
    } catch (error) {
      getAllTest.status = 'failed';
      getAllTest.error = error.message;
      getAllTest.responseTime = Date.now() - startTime1;
    }
    grouped.CORE.push(getAllTest);
    allTests.push(getAllTest);

    // Core POST: Create minimal listing
    const minimalListingData = {
      address: `${Date.now()} Test Street`,
      city: 'Test City',
      state: 'CA',
      zip_code: '90210',
      price: 500000,
      bedrooms: 3,
      bathrooms: 2,
      square_feet: 1500,
      property_type: 'Single Family',
      listing_status: 'active'
    };

    const createMinimalTest = {
      name: 'Create Listing (Minimal)',
      description: 'Test with only required fields',
      category: 'Critical',
      method: 'POST',
      endpoint: '/listings',
      status: 'pending',
      curl: `curl -X POST "${API_URL}/listings" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(minimalListingData)}'`,
      requestBody: minimalListingData,
      response: null,
      error: null,
      responseTime: null
    };

    if (token) {
      const startTime2 = Date.now();
      try {
        const response = await fetch(`${API_URL}/listings`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(minimalListingData)
        });
        const data = await response.json();
        createMinimalTest.responseTime = Date.now() - startTime2;
        createMinimalTest.status = response.ok && data.success ? 'success' : 'failed';
        createMinimalTest.response = data;
        if (data.success && data.data) {
          createdListingIds.push(data.data.id || data.data._id);
          createdListingId = data.data.id || data.data._id;
        } else {
          createMinimalTest.error = data.error?.message || 'Failed to create listing';
        }
      } catch (error) {
        createMinimalTest.status = 'failed';
        createMinimalTest.error = error.message;
        createMinimalTest.responseTime = Date.now() - startTime2;
      }
    }
    grouped.CORE.push(createMinimalTest);
    allTests.push(createMinimalTest);

    // Core GET by ID
    if (createdListingId) {
      const getByIdTest = {
        name: 'Get Listing by ID',
        description: 'Retrieve a specific listing',
        category: 'Critical',
        method: 'GET',
        endpoint: `/listings/${createdListingId}`,
        status: 'pending'
      };

      const startTime3 = Date.now();
      try {
        const response = await fetch(`${API_URL}/listings/${createdListingId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        getByIdTest.responseTime = Date.now() - startTime3;
        getByIdTest.status = response.ok && data.success ? 'success' : 'failed';
        getByIdTest.response = data;
      } catch (error) {
        getByIdTest.status = 'failed';
        getByIdTest.error = error.message;
      }
      grouped.CORE.push(getByIdTest);
      allTests.push(getByIdTest);
    }

    // Core PUT: Update listing
    if (createdListingId) {
      const updateData = {
        price: 550000,
        listing_status: 'pending'
      };

      const updateTest = {
        name: 'Update Listing',
        description: 'Update basic listing information',
        category: 'Critical',
        method: 'PUT',
        endpoint: `/listings/${createdListingId}`,
        status: 'pending',
        requestBody: updateData
      };

      const startTime4 = Date.now();
      try {
        const response = await fetch(`${API_URL}/listings/${createdListingId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });
        const data = await response.json();
        updateTest.responseTime = Date.now() - startTime4;
        updateTest.status = response.ok && data.success ? 'success' : 'failed';
        updateTest.response = data;
      } catch (error) {
        updateTest.status = 'failed';
        updateTest.error = error.message;
      }
      grouped.CORE.push(updateTest);
      allTests.push(updateTest);
    }

    // ========================================
    // FILTER & SEARCH TESTS
    // ========================================

    // Filter by status
    const filterStatusTest = {
      name: 'Filter by Status',
      description: 'Get only active listings',
      category: 'Search',
      method: 'GET',
      endpoint: '/listings?status=Active',
      status: 'pending'
    };

    const startTime5 = Date.now();
    try {
      const response = await fetch(`${API_URL}/listings?status=Active`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      filterStatusTest.responseTime = Date.now() - startTime5;
      filterStatusTest.status = response.ok && data.success ? 'success' : 'failed';
      filterStatusTest.response = data;
    } catch (error) {
      filterStatusTest.status = 'failed';
      filterStatusTest.error = error.message;
    }
    grouped.FILTERS.push(filterStatusTest);
    allTests.push(filterStatusTest);

    // Search by property address
    const searchTest = {
      name: 'Search by Property',
      description: 'Search listings by property address',
      category: 'Search',
      method: 'GET',
      endpoint: '/listings?search=Test',
      status: 'pending'
    };

    const startTime6 = Date.now();
    try {
      const response = await fetch(`${API_URL}/listings?search=Test`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      searchTest.responseTime = Date.now() - startTime6;
      searchTest.status = response.ok && data.success ? 'success' : 'failed';
      searchTest.response = data;
    } catch (error) {
      searchTest.status = 'failed';
      searchTest.error = error.message;
    }
    grouped.FILTERS.push(searchTest);
    allTests.push(searchTest);

    // Pagination test
    const paginationTest = {
      name: 'Pagination',
      description: 'Test pagination parameters',
      category: 'Search',
      method: 'GET',
      endpoint: '/listings?page=1&limit=5',
      status: 'pending'
    };

    const startTime7 = Date.now();
    try {
      const response = await fetch(`${API_URL}/listings?page=1&limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      paginationTest.responseTime = Date.now() - startTime7;
      paginationTest.status = response.ok && data.success ? 'success' : 'failed';
      paginationTest.response = data;
    } catch (error) {
      paginationTest.status = 'failed';
      paginationTest.error = error.message;
    }
    grouped.FILTERS.push(paginationTest);
    allTests.push(paginationTest);

    // Combined filters
    const combinedFilterTest = {
      name: 'Combined Filters',
      description: 'Multiple filter parameters together',
      category: 'Search',
      method: 'GET',
      endpoint: '/listings?status=Active&limit=10&page=1',
      status: 'pending'
    };

    const startTime8 = Date.now();
    try {
      const response = await fetch(`${API_URL}/listings?status=Active&limit=10&page=1`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      combinedFilterTest.responseTime = Date.now() - startTime8;
      combinedFilterTest.status = response.ok && data.success ? 'success' : 'failed';
      combinedFilterTest.response = data;
    } catch (error) {
      combinedFilterTest.status = 'failed';
      combinedFilterTest.error = error.message;
    }
    grouped.FILTERS.push(combinedFilterTest);
    allTests.push(combinedFilterTest);

    // ========================================
    // ERROR HANDLING TESTS
    // ========================================

    // Test 404: Get non-existent listing
    const notFoundTest = {
      name: 'Get Non-Existent Listing',
      description: 'Should return 404 error',
      category: 'Error Handling',
      method: 'GET',
      endpoint: '/listings/00000000-0000-0000-0000-000000000000',
      expectedStatus: 404,
      status: 'pending'
    };

    const startTime9 = Date.now();
    try {
      const response = await fetch(`${API_URL}/listings/00000000-0000-0000-0000-000000000000`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      notFoundTest.responseTime = Date.now() - startTime9;
      // This should fail (404), so success is when it returns error
      notFoundTest.status = (response.status === 404 || !data.success) ? 'success' : 'failed';
      notFoundTest.response = data;
      if (response.status !== 404 && data.success) {
        notFoundTest.error = `Expected 404 but got ${response.status}`;
      }
    } catch (error) {
      notFoundTest.status = 'failed';
      notFoundTest.error = error.message;
    }
    grouped.ERROR.push(notFoundTest);
    allTests.push(notFoundTest);

    // Test 400: Create listing with missing required fields
    const missingFieldsTest = {
      name: 'Create Listing - Missing Fields',
      description: 'Should return validation error',
      category: 'Error Handling',
      method: 'POST',
      endpoint: '/listings',
      expectedStatus: 400,
      status: 'pending',
      requestBody: { address: 'Only Address' } // Missing required fields
    };

    const startTime10 = Date.now();
    try {
      const response = await fetch(`${API_URL}/listings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ address: 'Only Address' })
      });
      const data = await response.json();
      missingFieldsTest.responseTime = Date.now() - startTime10;
      // Should fail with validation error
      missingFieldsTest.status = !data.success ? 'success' : 'failed';
      missingFieldsTest.response = data;
      if (data.success) {
        missingFieldsTest.error = 'Expected validation error but request succeeded';
      }
    } catch (error) {
      missingFieldsTest.status = 'success'; // Network error is expected
      missingFieldsTest.error = error.message;
    }
    grouped.ERROR.push(missingFieldsTest);
    allTests.push(missingFieldsTest);

    // Test: Update non-existent listing
    const updateNonExistentTest = {
      name: 'Update Non-Existent Listing',
      description: 'Should return not found error',
      category: 'Error Handling',
      method: 'PUT',
      endpoint: '/listings/invalid-id-123',
      expectedStatus: 404,
      status: 'pending'
    };

    const startTime11 = Date.now();
    try {
      const response = await fetch(`${API_URL}/listings/invalid-id-123`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ price: 100000 })
      });
      const data = await response.json();
      updateNonExistentTest.responseTime = Date.now() - startTime11;
      updateNonExistentTest.status = !data.success ? 'success' : 'failed';
      updateNonExistentTest.response = data;
    } catch (error) {
      updateNonExistentTest.status = 'success';
      updateNonExistentTest.error = error.message;
    }
    grouped.ERROR.push(updateNonExistentTest);
    allTests.push(updateNonExistentTest);

    // Test: Delete without archiving first
    if (createdListingId) {
      // Create a new listing to test delete without archive
      const tempListingData = {
        address: 'Temp Delete Test',
        city: 'Test City',
        state: 'CA',
        zip_code: '90210',
        price: 300000,
        bedrooms: 2,
        bathrooms: 1,
        square_feet: 1000,
        property_type: 'Condo',
        listing_status: 'active'
      };

      let tempListingId = null;
      try {
        const createResponse = await fetch(`${API_URL}/listings`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(tempListingData)
        });
        const createData = await createResponse.json();
        if (createData.success && createData.data) {
          tempListingId = createData.data.id || createData.data._id;
          createdListingIds.push(tempListingId);
        }
      } catch (error) {
        // Ignore create error
      }

      if (tempListingId) {
        const deleteWithoutArchiveTest = {
          name: 'Delete Without Archive',
          description: 'Should fail - must archive first',
          category: 'Error Handling',
          method: 'DELETE',
          endpoint: `/listings/${tempListingId}`,
          expectedStatus: 400,
          status: 'pending'
        };

        const startTime12 = Date.now();
        try {
          const response = await fetch(`${API_URL}/listings/${tempListingId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          deleteWithoutArchiveTest.responseTime = Date.now() - startTime12;
          // Should fail - expecting error
          deleteWithoutArchiveTest.status = !data.success ? 'success' : 'warning';
          deleteWithoutArchiveTest.response = data;
          if (data.success) {
            deleteWithoutArchiveTest.error = 'Delete succeeded without archiving (unexpected)';
          }
        } catch (error) {
          deleteWithoutArchiveTest.status = 'success';
          deleteWithoutArchiveTest.error = error.message;
        }
        grouped.ERROR.push(deleteWithoutArchiveTest);
        allTests.push(deleteWithoutArchiveTest);
      }
    }

    // ========================================
    // EDGE CASE TESTS
    // ========================================

    // Test: Special characters in property address
    const specialCharsTest = {
      name: 'Create Listing - Special Characters',
      description: 'Test with special chars in address',
      category: 'Edge Case',
      method: 'POST',
      endpoint: '/listings',
      status: 'pending',
      requestBody: {
        address: `123 O'Brien & Co. Street #456`,
        city: 'San Francisco',
        state: 'CA',
        zip_code: '94102',
        price: 750000,
        bedrooms: 2,
        bathrooms: 2,
        square_feet: 1200,
        property_type: 'Condo',
        listing_status: 'active',
        description: `José García's property with Müller-Smith`
      }
    };

    const startTime13 = Date.now();
    try {
      const response = await fetch(`${API_URL}/listings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(specialCharsTest.requestBody)
      });
      const data = await response.json();
      specialCharsTest.responseTime = Date.now() - startTime13;
      specialCharsTest.status = response.ok && data.success ? 'success' : 'warning';
      specialCharsTest.response = data;
      if (data.success && data.data) {
        createdListingIds.push(data.data.id || data.data._id);
      }
    } catch (error) {
      specialCharsTest.status = 'failed';
      specialCharsTest.error = error.message;
    }
    grouped.EDGE.push(specialCharsTest);
    allTests.push(specialCharsTest);

    // Test: Very large purchase price
    const largePriceTest = {
      name: 'Create Listing - Large Price',
      description: 'Test with very high purchase price',
      category: 'Edge Case',
      method: 'POST',
      endpoint: '/listings',
      status: 'pending',
      requestBody: {
        address: 'Expensive Property Test',
        city: 'Beverly Hills',
        state: 'CA',
        zip_code: '90210',
        price: 999999999,
        bedrooms: 10,
        bathrooms: 15,
        square_feet: 25000,
        property_type: 'Mansion',
        listing_status: 'active'
      }
    };

    const startTime14 = Date.now();
    try {
      const response = await fetch(`${API_URL}/listings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(largePriceTest.requestBody)
      });
      const data = await response.json();
      largePriceTest.responseTime = Date.now() - startTime14;
      largePriceTest.status = response.ok && data.success ? 'success' : 'warning';
      largePriceTest.response = data;
      if (data.success && data.data) {
        createdListingIds.push(data.data.id || data.data._id);
      }
    } catch (error) {
      largePriceTest.status = 'failed';
      largePriceTest.error = error.message;
    }
    grouped.EDGE.push(largePriceTest);
    allTests.push(largePriceTest);

    // Test: Empty optional fields
    const emptyFieldsTest = {
      name: 'Create Listing - Empty Fields',
      description: 'Test with empty optional fields',
      category: 'Edge Case',
      method: 'POST',
      endpoint: '/listings',
      status: 'pending',
      requestBody: {
        address: 'Empty Fields Test',
        city: 'Los Angeles',
        state: 'CA',
        zip_code: '90001',
        price: 400000,
        bedrooms: 3,
        bathrooms: 2,
        square_feet: 1500,
        property_type: 'Single Family',
        listing_status: 'active',
        description: '',
        agent_name: '',
        agent_email: ''
      }
    };

    const startTime15 = Date.now();
    try {
      const response = await fetch(`${API_URL}/listings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emptyFieldsTest.requestBody)
      });
      const data = await response.json();
      emptyFieldsTest.responseTime = Date.now() - startTime15;
      emptyFieldsTest.status = response.ok && data.success ? 'success' : 'warning';
      emptyFieldsTest.response = data;
      if (data.success && data.data) {
        createdListingIds.push(data.data.id || data.data._id);
      }
    } catch (error) {
      emptyFieldsTest.status = 'failed';
      emptyFieldsTest.error = error.message;
    }
    grouped.EDGE.push(emptyFieldsTest);
    allTests.push(emptyFieldsTest);

    // ========================================
    // PERFORMANCE TESTS
    // ========================================

    // Test: Large pagination request
    const largePaginationTest = {
      name: 'Large Pagination',
      description: 'Request page 999 with limit 100',
      category: 'Performance',
      method: 'GET',
      endpoint: '/listings?page=999&limit=100',
      status: 'pending'
    };

    const startTime16 = Date.now();
    try {
      const response = await fetch(`${API_URL}/listings?page=999&limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      largePaginationTest.responseTime = Date.now() - startTime16;
      largePaginationTest.status = response.ok && data.success ? 'success' : 'failed';
      largePaginationTest.response = data;
      // Check if response time is reasonable
      if (largePaginationTest.responseTime > 2000) {
        largePaginationTest.status = 'warning';
        largePaginationTest.error = `Slow response: ${largePaginationTest.responseTime}ms`;
      }
    } catch (error) {
      largePaginationTest.status = 'failed';
      largePaginationTest.error = error.message;
    }
    grouped.PERFORMANCE.push(largePaginationTest);
    allTests.push(largePaginationTest);

    // Test: Concurrent requests
    const concurrentTest = {
      name: 'Concurrent Requests',
      description: 'Send 5 simultaneous GET requests',
      category: 'Performance',
      method: 'GET',
      endpoint: '/listings (x5)',
      status: 'pending'
    };

    const startTime17 = Date.now();
    try {
      const promises = Array(5).fill(null).map(() =>
        fetch(`${API_URL}/listings?limit=5`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      );
      const responses = await Promise.all(promises);
      const allSuccessful = responses.every(r => r.ok);
      concurrentTest.responseTime = Date.now() - startTime17;
      concurrentTest.status = allSuccessful ? 'success' : 'failed';
      concurrentTest.response = {
        requestCount: 5,
        successCount: responses.filter(r => r.ok).length,
        avgResponseTime: Math.round(concurrentTest.responseTime / 5)
      };
      // Check average response time
      if (concurrentTest.responseTime / 5 > 1000) {
        concurrentTest.status = 'warning';
        concurrentTest.error = 'High average response time under load';
      }
    } catch (error) {
      concurrentTest.status = 'failed';
      concurrentTest.error = error.message;
    }
    grouped.PERFORMANCE.push(concurrentTest);
    allTests.push(concurrentTest);

    // Test: Response time consistency
    const responseTimeTest = {
      name: 'Response Time Consistency',
      description: 'Check if response times are consistent',
      category: 'Performance',
      method: 'GET',
      endpoint: '/listings?limit=10',
      status: 'pending'
    };

    const responseTimes = [];
    for (let i = 0; i < 3; i++) {
      const startTimeRT = Date.now();
      try {
        const response = await fetch(`${API_URL}/listings?limit=10`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        await response.json();
        responseTimes.push(Date.now() - startTimeRT);
      } catch (error) {
        // Ignore individual errors
      }
    }

    if (responseTimes.length === 3) {
      const avgTime = responseTimes.reduce((a, b) => a + b, 0) / 3;
      const maxTime = Math.max(...responseTimes);
      const minTime = Math.min(...responseTimes);
      const variance = maxTime - minTime;

      responseTimeTest.responseTime = Math.round(avgTime);
      responseTimeTest.response = {
        times: responseTimes,
        average: Math.round(avgTime),
        min: minTime,
        max: maxTime,
        variance: variance
      };

      // Check if variance is too high (>500ms difference)
      if (variance > 500) {
        responseTimeTest.status = 'warning';
        responseTimeTest.error = `High variance in response times: ${variance}ms`;
      } else {
        responseTimeTest.status = 'success';
      }
    } else {
      responseTimeTest.status = 'failed';
      responseTimeTest.error = 'Could not complete all requests';
    }
    grouped.PERFORMANCE.push(responseTimeTest);
    allTests.push(responseTimeTest);

    // ========================================
    // WORKFLOW TESTS - Complete Archive/Delete
    // ========================================

    // Clean up all created test listings
    for (const listingId of createdListingIds) {
      if (listingId) {
        // Archive first
        const archiveTest = {
          name: `Archive Test Listing`,
          description: 'Soft delete test data',
          category: 'Workflow',
          method: 'PUT',
          endpoint: `/listings/${listingId}/archive`,
          status: 'pending'
        };

        const startTimeArchive = Date.now();
        try {
          const response = await fetch(`${API_URL}/listings/${listingId}/archive`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          archiveTest.responseTime = Date.now() - startTimeArchive;
          archiveTest.status = response.ok && data.success ? 'success' : 'failed';
          archiveTest.response = data;
        } catch (error) {
          archiveTest.status = 'failed';
          archiveTest.error = error.message;
        }
        grouped.WORKFLOW.push(archiveTest);
        allTests.push(archiveTest);

        // Then delete
        const deleteTest = {
          name: `Delete Archived Listing`,
          description: 'Permanently remove test data',
          category: 'Workflow',
          method: 'DELETE',
          endpoint: `/listings/${listingId}`,
          status: 'pending'
        };

        const startTimeDelete = Date.now();
        try {
          const response = await fetch(`${API_URL}/listings/${listingId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          deleteTest.responseTime = Date.now() - startTimeDelete;
          deleteTest.status = response.ok && data.success ? 'success' : 'failed';
          deleteTest.response = data;
        } catch (error) {
          deleteTest.status = 'failed';
          deleteTest.error = error.message;
        }
        grouped.WORKFLOW.push(deleteTest);
        allTests.push(deleteTest);
      }
    }

    // Verify deletion
    if (createdListingIds.length > 0 && createdListingIds[0]) {
      const verifyTest = {
        name: 'Verify Deletion',
        description: 'Confirm test data was removed',
        category: 'Workflow',
        method: 'GET',
        endpoint: `/listings/${createdListingIds[0]}`,
        expectedStatus: 404,
        status: 'pending'
      };

      const startTimeVerify = Date.now();
      try {
        const response = await fetch(`${API_URL}/listings/${createdListingIds[0]}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        verifyTest.responseTime = Date.now() - startTimeVerify;
        // Should return 404
        verifyTest.status = !data.success ? 'success' : 'failed';
        verifyTest.response = data;
      } catch (error) {
        verifyTest.status = 'success';
        verifyTest.error = error.message;
      }
      grouped.WORKFLOW.push(verifyTest);
      allTests.push(verifyTest);
    }

    setTests(allTests);
    setGroupedTests(grouped);
    setLastRefresh(new Date().toLocaleString());
    setLoading(false);
    setTestListingIds(createdListingIds);
  }, []);

  const copyAllData = () => {
    const testData = {
      timestamp: new Date().toISOString(),
      endpoint: 'listings',
      summary: {
        total: tests.length,
        passed: tests.filter(t => t.status === 'success').length,
        failed: tests.filter(t => t.status === 'failed').length,
        warnings: tests.filter(t => t.status === 'warning').length
      },
      categories: {
        core: groupedTests.CORE.length,
        filters: groupedTests.FILTERS.length,
        errors: groupedTests.ERROR.length,
        edge: groupedTests.EDGE.length,
        performance: groupedTests.PERFORMANCE.length,
        workflow: groupedTests.WORKFLOW.length
      },
      tests: tests.map(test => ({
        name: test.name,
        category: test.category,
        method: test.method,
        endpoint: test.endpoint,
        status: test.status,
        responseTime: test.responseTime,
        response: test.response,
        error: test.error
      }))
    };

    navigator.clipboard.writeText(JSON.stringify(testData, null, 2));
    setSnackbarMessage('Enhanced test data copied to clipboard');
    setSnackbarOpen(true);
  };

  useEffect(() => {
    runAllTests();
  }, [runAllTests]);

  const successCount = tests.filter(t => t.status === 'success').length;
  const failedCount = tests.filter(t => t.status === 'failed').length;
  const warningCount = tests.filter(t => t.status === 'warning').length;

  const tabCategories = [
    { label: 'All Tests', key: 'ALL', icon: <PlayIcon /> },
    { label: 'GET', key: 'GET', icon: <SearchIcon />, color: '#2196f3' },
    { label: 'POST', key: 'POST', icon: <AddIcon />, color: '#4caf50' },
    { label: 'PUT', key: 'PUT', icon: <EditIcon />, color: '#ff9800' },
    { label: 'DELETE', key: 'DELETE', icon: <DeleteIcon />, color: '#f44336' }
  ];

  const getTestsForTab = (tabIndex) => {
    if (tabIndex === 0) return tests; // All tests
    const method = tabCategories[tabIndex].key;
    return tests.filter(t => t.method === method);
  };

  const getCategoryStats = (category) => {
    const categoryTests = category === 'ALL' ? tests : tests.filter(t => t.method === category);
    return {
      total: categoryTests.length,
      passed: categoryTests.filter(t => t.status === 'success').length,
      failed: categoryTests.filter(t => t.status === 'failed').length,
      warnings: categoryTests.filter(t => t.status === 'warning').length
    };
  };

  return (
    <PageContainer>
      <Container maxWidth="lg">
        <Fade in timeout={800}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3, background: 'rgba(255,255,255,0.98)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Box>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  Listings API Health Dashboard
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Comprehensive testing with error handling, edge cases, and performance tests • Last refresh: {lastRefresh || 'Loading...'}
                </Typography>
                <Box display="flex" alignItems="center" gap={2} mt={1}>
                  <Typography variant="h2" fontWeight="bold" color={failedCount === 0 && warningCount === 0 ? '#4caf50' : failedCount > 0 ? '#f44336' : '#ff9800'}>
                    {successCount}/{tests.length}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Tests Passing
                  </Typography>
                  {warningCount > 0 && (
                    <>
                      <Typography variant="h4" fontWeight="bold" color="#ff9800" sx={{ ml: 2 }}>
                        {warningCount}
                      </Typography>
                      <Typography variant="body1" color="textSecondary">
                        Warnings
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
              <Box display="flex" gap={1}>
                <Tooltip title="Copy All Data">
                  <IconButton
                    onClick={copyAllData}
                    disabled={loading || tests.length === 0}
                    sx={{
                      backgroundColor: '#f5f5f5',
                      '&:hover': { backgroundColor: '#e0e0e0' }
                    }}
                  >
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Refresh Tests">
                  <IconButton
                    onClick={runAllTests}
                    disabled={loading}
                    sx={{
                      backgroundColor: '#f5f5f5',
                      '&:hover': { backgroundColor: '#e0e0e0' }
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={2}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                  <Typography variant="h4" fontWeight="bold">{tests.length}</Typography>
                  <Typography variant="body2" color="textSecondary">Total</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                  <Typography variant="h4" fontWeight="bold" color="#4caf50">
                    {successCount}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Passed</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: failedCount === 0 ? '#e8f5e9' : '#ffebee' }}>
                  <Typography variant="h4" fontWeight="bold" color={failedCount === 0 ? '#4caf50' : '#f44336'}>
                    {failedCount}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Failed</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: warningCount > 0 ? '#fff3e0' : '#f5f5f5' }}>
                  <Typography variant="h4" fontWeight="bold" color={warningCount > 0 ? '#ff9800' : '#666'}>
                    {warningCount}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Warnings</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                  <Typography variant="h4" fontWeight="bold" color="#2196f3">
                    {tests.reduce((acc, t) => acc + (t.responseTime || 0), 0)}ms
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Total Time</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f3e5f5' }}>
                  <Typography variant="h4" fontWeight="bold" color="#9c27b0">
                    {tests.length > 0 ? Math.round(tests.reduce((acc, t) => acc + (t.responseTime || 0), 0) / tests.length) : 0}ms
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Avg Time</Typography>
                </Paper>
              </Grid>
            </Grid>

            {loading && <LinearProgress sx={{ my: 2 }} />}

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
              <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)} variant="scrollable" scrollButtons="auto">
                {tabCategories.map((cat, idx) => {
                  const stats = getCategoryStats(cat.key);
                  return (
                    <Tab
                      key={cat.key}
                      sx={{
                        ...(cat.color && currentTab === idx ? {
                          backgroundColor: `${cat.color}15`,
                          borderBottom: `3px solid ${cat.color}`
                        } : {})
                      }}
                      label={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box sx={{ color: cat.color || 'inherit' }}>
                            {cat.icon}
                          </Box>
                          <span style={{ color: cat.color || 'inherit', fontWeight: currentTab === idx ? 'bold' : 'normal' }}>
                            {cat.label}
                          </span>
                          {stats && stats.total > 0 && (
                            <Chip
                              size="small"
                              label={`${stats.passed}/${stats.total}`}
                              sx={{
                                ml: 1,
                                height: 20,
                                backgroundColor: stats.failed > 0 ? '#f44336' : stats.warnings > 0 ? '#ff9800' : '#4caf50',
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                          )}
                        </Box>
                      }
                    />
                  );
                })}
              </Tabs>
            </Box>

            <Fade in={!loading}>
              <Box sx={{ mt: 3 }}>
                {currentTab === 0 && (
                  <>
                    {/* Show all tests grouped by HTTP method */}
                    {['GET', 'POST', 'PUT', 'DELETE'].map((method) => {
                      const methodTests = tests.filter(t => t.method === method);
                      const methodColor = method === 'GET' ? '#2196f3' :
                                         method === 'POST' ? '#4caf50' :
                                         method === 'PUT' ? '#ff9800' : '#f44336';
                      return methodTests.length > 0 && (
                        <Box key={method} mb={3}>
                          <SectionHeader variant="h6" sx={{ backgroundColor: `${methodColor}15`, borderLeft: `4px solid ${methodColor}` }}>
                            {method} Requests ({methodTests.filter(t => t.status === 'success').length}/{methodTests.length})
                          </SectionHeader>
                          {methodTests.map((test, index) => (
                            <TestItem key={`${method}-${index}`} test={test} />
                          ))}
                        </Box>
                      );
                    })}
                  </>
                )}
                {currentTab > 0 && (
                  <>
                    {getTestsForTab(currentTab).map((test, index) => (
                      <TestItem key={`test-${currentTab}-${index}`} test={test} />
                    ))}
                    {getTestsForTab(currentTab).length === 0 && (
                      <Typography variant="body1" color="textSecondary" sx={{ mt: 3, textAlign: 'center' }}>
                        No tests in this category
                      </Typography>
                    )}
                  </>
                )}
              </Box>
            </Fade>
          </Paper>
        </Fade>
      </Container>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default ListingsHealthDashboard;