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
  Stack
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as ErrorIcon,
  ExpandMore as ExpandIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayIcon,
  Delete as DeleteIcon
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
               status === 'failed' ? '#f44336' : '#e0e0e0',
  backgroundColor: status === 'success' ? '#f1f8e9' :
                   status === 'failed' ? '#ffebee' : '#fafafa',
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

const StatusIcon = ({ status }) => {
  if (status === 'success') {
    return <CheckIcon sx={{ color: '#4caf50', fontSize: 28 }} />;
  }
  if (status === 'failed') {
    return <ErrorIcon sx={{ color: '#f44336', fontSize: 28 }} />;
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

    // Clean up the curl command for better readability
    let formatted = test.curl;

    // Split into multiple lines for readability
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

      // For successful GET requests, show a simplified version
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
              label={test.status === 'success' ? 'PASSED' : test.status === 'failed' ? 'FAILED' : 'PENDING'}
              size="small"
              sx={{
                backgroundColor: test.status === 'success' ? '#4caf50' :
                               test.status === 'failed' ? '#f44336' : '#9e9e9e',
                color: 'white',
                fontWeight: 'bold'
              }}
            />
            {test.responseTime && (
              <Chip
                label={`${test.responseTime}ms`}
                size="small"
                variant="outlined"
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
  const [groupedTests, setGroupedTests] = useState({
    GET: [],
    POST: [],
    PUT: [],
    DELETE: []
  });

  const runAllTests = useCallback(async () => {
    setLoading(true);
    setTests([]);
    setGroupedTests({ GET: [], POST: [], PUT: [], DELETE: [] });

    let API_URL = process.env.REACT_APP_API_URL || 'https://api.jaydenmetz.com';
    // Ensure API URL has /v1 suffix
    if (!API_URL.endsWith('/v1')) {
      API_URL = API_URL.replace(/\/$/, '') + '/v1';
    }

    // Get auth token
    const token = localStorage.getItem('crm_auth_token') ||
                 localStorage.getItem('authToken') ||
                 localStorage.getItem('token');

    const allTests = [];
    const grouped = { GET: [], POST: [], PUT: [], DELETE: [] };
    let createdListingId = null;

    // ========================================
    // GET REQUESTS - Run these first
    // ========================================

    // GET Test 1: Get all listings
    const getAllTest = {
      name: 'List All Listings',
      description: 'Retrieve all listings from the database',
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
    grouped.GET.push(getAllTest);
    allTests.push(getAllTest);
    setGroupedTests({...grouped});

    // GET Test 2: Get with pagination
    const getPaginatedTest = {
      name: 'List with Pagination',
      description: 'Test pagination parameters (page=1, limit=5)',
      method: 'GET',
      endpoint: '/listings?page=1&limit=5',
      status: 'pending',
      curl: `curl -X GET "${API_URL}/listings?page=1&limit=5" -H "Authorization: Bearer ${token}"`,
      response: null,
      error: null,
      responseTime: null
    };

    const startTime2 = Date.now();
    try {
      const response = await fetch(`${API_URL}/listings?page=1&limit=5`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      getPaginatedTest.responseTime = Date.now() - startTime2;
      getPaginatedTest.status = response.ok && data.success ? 'success' : 'failed';
      getPaginatedTest.response = data;
      if (!response.ok || !data.success) {
        getPaginatedTest.error = data.error?.message || 'Pagination failed';
      }
    } catch (error) {
      getPaginatedTest.status = 'failed';
      getPaginatedTest.error = error.message;
      getPaginatedTest.responseTime = Date.now() - startTime2;
    }
    grouped.GET.push(getPaginatedTest);
    allTests.push(getPaginatedTest);
    setGroupedTests({...grouped});

    // GET Test 3: Get first listing by ID (if any exist)
    let existingListingId = null;
    if (getAllTest.status === 'success' && getAllTest.response?.data?.listings?.length > 0) {
      existingListingId = getAllTest.response.data.listings[0].id;

      const getByIdTest = {
        name: 'Get Listing by ID',
        description: 'Retrieve a specific listing using its ID',
        method: 'GET',
        endpoint: `/listings/${existingListingId}`,
        status: 'pending',
        curl: `curl -X GET "${API_URL}/listings/${existingListingId}" -H "Authorization: Bearer ${token}"`,
        response: null,
        error: null,
        responseTime: null
      };

      const startTime3 = Date.now();
      try {
        const response = await fetch(`${API_URL}/listings/${existingListingId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        getByIdTest.responseTime = Date.now() - startTime3;
        getByIdTest.status = response.ok && data.success ? 'success' : 'failed';
        getByIdTest.response = data;
        if (!response.ok || !data.success) {
          getByIdTest.error = data.error?.message || 'Failed to fetch listing';
        }
      } catch (error) {
        getByIdTest.status = 'failed';
        getByIdTest.error = error.message;
        getByIdTest.responseTime = Date.now() - startTime3;
      }
      grouped.GET.push(getByIdTest);
      allTests.push(getByIdTest);
      setGroupedTests({...grouped});
    }

    // ========================================
    // POST REQUESTS - 3 Different Tests
    // ========================================
    const createdListingIds = [];

    // POST Test 1: Minimal (Address Only)
    const minimalListingData = {
      propertyAddress: `${Date.now()} Minimal Test St, Suite 1`,
      listPrice: 500000,
      sellers: [],
      listingDate: new Date().toISOString(),
      propertyType: 'Single Family'
    };

    const createMinimalTest = {
      name: 'Create Listing (Minimal)',
      description: 'Test with only required field (property_address)',
      method: 'POST',
      endpoint: '/listings',
      status: 'pending',
      curl: `curl -X POST "${API_URL}/listings" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(minimalListingData, null, 2)}'`,
      requestBody: minimalListingData,
      response: null,
      error: null,
      responseTime: null
    };

    if (token) {
      const startTimeMinimal = Date.now();
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
        createMinimalTest.responseTime = Date.now() - startTimeMinimal;
        createMinimalTest.status = response.ok && data.success ? 'success' : 'failed';
        createMinimalTest.response = data;
        if (data.success && data.data) {
          createdListingIds.push(data.data.id);
        } else {
          createMinimalTest.error = data.error?.message || 'Failed to create minimal listing';
        }
      } catch (error) {
        createMinimalTest.status = 'failed';
        createMinimalTest.error = error.message;
        createMinimalTest.responseTime = Date.now() - startTimeMinimal;
      }
    } else {
      createMinimalTest.status = 'failed';
      createMinimalTest.error = 'No authentication token available';
    }
    grouped.POST.push(createMinimalTest);
    allTests.push(createMinimalTest);
    setGroupedTests({...grouped});

    // POST Test 2: Basic (Most Important Fields)
    const basicListingData = {
      propertyAddress: `${Date.now()} Basic Test Ave, Unit 2`,
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      listPrice: 750000,
      bedrooms: 3,
      bathrooms: 2,
      squareFootage: 2000,
      listingStatus: 'Active',
      listingDate: new Date().toISOString(),
      propertyType: 'Condo',
      sellers: [
        { name: 'Test Seller', email: 'seller@test.com' }
      ]
    };

    const createBasicTest = {
      name: 'Create Listing (Basic)',
      description: 'Test with essential fields',
      method: 'POST',
      endpoint: '/listings',
      status: 'pending',
      curl: `curl -X POST "${API_URL}/listings" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(basicListingData, null, 2)}'`,
      requestBody: basicListingData,
      response: null,
      error: null,
      responseTime: null
    };

    if (token) {
      const startTimeBasic = Date.now();
      try {
        const response = await fetch(`${API_URL}/listings`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(basicListingData)
        });
        const data = await response.json();
        createBasicTest.responseTime = Date.now() - startTimeBasic;
        createBasicTest.status = response.ok && data.success ? 'success' : 'failed';
        createBasicTest.response = data;
        if (data.success && data.data) {
          createdListingIds.push(data.data.id);
        } else {
          createBasicTest.error = data.error?.message || 'Failed to create basic listing';
        }
      } catch (error) {
        createBasicTest.status = 'failed';
        createBasicTest.error = error.message;
        createBasicTest.responseTime = Date.now() - startTimeBasic;
      }
    } else {
      createBasicTest.status = 'failed';
      createBasicTest.error = 'No authentication token available';
    }
    grouped.POST.push(createBasicTest);
    allTests.push(createBasicTest);
    setGroupedTests({...grouped});

    // POST Test 3: Full (All Fields)
    const fullListingData = {
      propertyAddress: `${Date.now()} Full Test Blvd, Suite 3`,
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      listPrice: 1250000,
      bedrooms: 4,
      bathrooms: 3,
      squareFootage: 3000,
      lotSize: 0.35,
      yearBuilt: 2020,
      propertyType: 'Single Family',
      listingStatus: 'Active',
      listingDate: new Date().toISOString(),
      mlsNumber: `MLS-${Date.now()}`,
      description: 'Beautiful test property with all amenities',
      commissionPercentage: 2.5,
      propertyAmenities: ['Pool', 'Garage', 'Garden'],
      virtualTourUrl: 'https://example.com/tour',
      source: 'MLS',
      sellers: [
        { name: 'John Doe', email: 'john@test.com', phone: '555-1234' },
        { name: 'Jane Doe', email: 'jane@test.com', phone: '555-5678' }
      ]
    };

    const createFullTest = {
      name: 'Create Listing (Full)',
      description: 'Test with all available fields',
      method: 'POST',
      endpoint: '/listings',
      status: 'pending',
      curl: `curl -X POST "${API_URL}/listings" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(fullListingData, null, 2)}'`,
      requestBody: fullListingData,
      response: null,
      error: null,
      responseTime: null
    };

    if (token) {
      const startTimeFull = Date.now();
      try {
        const response = await fetch(`${API_URL}/listings`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(fullListingData)
        });
        const data = await response.json();
        createFullTest.responseTime = Date.now() - startTimeFull;
        createFullTest.status = response.ok && data.success ? 'success' : 'failed';
        createFullTest.response = data;
        if (data.success && data.data) {
          createdListingIds.push(data.data.id);
        } else {
          createFullTest.error = data.error?.message || 'Failed to create full listing';
        }
      } catch (error) {
        createFullTest.status = 'failed';
        createFullTest.error = error.message;
        createFullTest.responseTime = Date.now() - startTimeFull;
      }
    } else {
      createFullTest.status = 'failed';
      createFullTest.error = 'No authentication token available';
    }
    grouped.POST.push(createFullTest);
    allTests.push(createFullTest);
    setGroupedTests({...grouped});

    // Set the first created listing as the primary one for testing
    if (createdListingIds.length > 0) {
      createdListingId = createdListingIds[0];
      setTestListingId(createdListingId);
      setTestListingIds(createdListingIds);
    }

    // ========================================
    // PUT REQUESTS - Use different test listings for comprehensive testing
    // ========================================

    if (createdListingIds.length > 0) {
      // Use different listings for different tests
      const listingForBasicUpdate = createdListingIds[0] || null;
      const listingForDetailTests = createdListingIds[1] || createdListingIds[0] || null;

      // PUT Test 1: Update listing basic info
      const updateData = {
        listPrice: 695000,
        listingStatus: 'Pending'
      };

      const updateTest = {
        name: 'Update Listing by ID',
        description: 'Update basic listing information',
        method: 'PUT',
        endpoint: `/listings/${listingForBasicUpdate}`,
        status: 'pending',
        curl: `curl -X PUT "${API_URL}/listings/${listingForBasicUpdate}" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(updateData, null, 2)}'`,
        requestBody: updateData,
        response: null,
        error: null,
        responseTime: null
      };

      const startTime5 = Date.now();
      try {
        const response = await fetch(`${API_URL}/listings/${listingForBasicUpdate}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });
        const data = await response.json();
        updateTest.responseTime = Date.now() - startTime5;
        updateTest.status = response.ok && data.success ? 'success' : 'failed';
        updateTest.response = data;
        if (!response.ok || !data.success) {
          updateTest.error = data.error?.message || 'Failed to update listing';
        }
      } catch (error) {
        updateTest.status = 'failed';
        updateTest.error = error.message;
        updateTest.responseTime = Date.now() - startTime5;
      }
      grouped.PUT.push(updateTest);
      allTests.push(updateTest);
      setGroupedTests({...grouped});

      // PUT Test 2: Price reduction
      const priceReductionData = {
        listPrice: 599000
      };

      const priceReductionTest = {
        name: 'Price Reduction',
        description: 'Test price reduction functionality',
        method: 'PUT',
        endpoint: `/listings/${listingForBasicUpdate}`,
        status: 'pending',
        curl: `curl -X PUT "${API_URL}/listings/${listingForBasicUpdate}" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(priceReductionData, null, 2)}'`,
        requestBody: priceReductionData,
        response: null,
        error: null,
        responseTime: null
      };

      const startTime6 = Date.now();
      try {
        const response = await fetch(`${API_URL}/listings/${listingForBasicUpdate}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(priceReductionData)
        });
        const data = await response.json();
        priceReductionTest.responseTime = Date.now() - startTime6;
        priceReductionTest.status = response.ok && data.success ? 'success' : 'failed';
        priceReductionTest.response = data;
        if (!response.ok || !data.success) {
          priceReductionTest.error = data.error?.message || 'Failed to update price';
        }
      } catch (error) {
        priceReductionTest.status = 'failed';
        priceReductionTest.error = error.message;
        priceReductionTest.responseTime = Date.now() - startTime6;
      }
      grouped.PUT.push(priceReductionTest);
      allTests.push(priceReductionTest);
      setGroupedTests({...grouped});

      // PUT Test 3: Add showing
      const showingData = {
        showings: [
          {
            date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            time: '14:00',
            agentName: 'John Smith',
            clientName: 'Jane Doe',
            feedback: 'Client loved the property'
          }
        ]
      };

      const addShowingTest = {
        name: 'Add Showing',
        description: 'Test adding a showing to the listing',
        method: 'PUT',
        endpoint: `/listings/${listingForDetailTests}`,
        status: 'pending',
        curl: `curl -X PUT "${API_URL}/listings/${listingForDetailTests}" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(showingData, null, 2)}'`,
        requestBody: showingData,
        response: null,
        error: null,
        responseTime: null
      };

      const startTime7 = Date.now();
      try {
        const response = await fetch(`${API_URL}/listings/${listingForDetailTests}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(showingData)
        });
        const data = await response.json();
        addShowingTest.responseTime = Date.now() - startTime7;
        addShowingTest.status = response.ok && data.success ? 'success' : 'failed';
        addShowingTest.response = data;
        if (!response.ok || !data.success) {
          addShowingTest.error = data.error?.message || 'Failed to add showing';
        }
      } catch (error) {
        addShowingTest.status = 'failed';
        addShowingTest.error = error.message;
        addShowingTest.responseTime = Date.now() - startTime7;
      }
      grouped.PUT.push(addShowingTest);
      allTests.push(addShowingTest);
      setGroupedTests({...grouped});

      // ========================================
      // DELETE REQUESTS - Clean up ALL test listings
      // ========================================

      // Archive then delete all 3 created test listings
      for (let i = 0; i < createdListingIds.length; i++) {
        const listingId = createdListingIds[i];

        // Step 1: Archive the listing first
        const archiveTest = {
          name: `Archive Test Listing ${i + 1}`,
          description: i === 0 ? 'Archive minimal listing' : i === 1 ? 'Archive basic listing' : 'Archive full listing',
          method: 'PUT',
          endpoint: `/listings/${listingId}/archive`,
          status: 'pending',
          curl: `curl -X PUT "${API_URL}/listings/${listingId}/archive" -H "Authorization: Bearer ${token}"`,
          response: null,
          error: null,
          responseTime: null
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
          if (!response.ok || !data.success) {
            archiveTest.error = data.error?.message || 'Failed to archive listing';
          }
        } catch (error) {
          archiveTest.status = 'failed';
          archiveTest.error = error.message;
          archiveTest.responseTime = Date.now() - startTimeArchive;
        }
        grouped.PUT.push(archiveTest);
        allTests.push(archiveTest);
        setGroupedTests({...grouped});

        // Step 2: Delete the archived listing
        const deleteTest = {
          name: `Delete Archived Listing ${i + 1}`,
          description: i === 0 ? 'Delete archived minimal listing' : i === 1 ? 'Delete archived basic listing' : 'Delete archived full listing',
          method: 'DELETE',
          endpoint: `/listings/${listingId}`,
          status: 'pending',
          curl: `curl -X DELETE "${API_URL}/listings/${listingId}" -H "Authorization: Bearer ${token}"`,
          response: null,
          error: null,
          responseTime: null
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
          if (!response.ok || !data.success) {
            deleteTest.error = data.error?.message || 'Failed to delete listing';
          }
        } catch (error) {
          deleteTest.status = 'failed';
          deleteTest.error = error.message;
          deleteTest.responseTime = Date.now() - startTimeDelete;
        }
        grouped.DELETE.push(deleteTest);
        allTests.push(deleteTest);
        setGroupedTests({...grouped});
      }

      // Clear the test listing IDs after deletion
      setTestListingId(null);
      setTestListingIds([]);

      // Verify all listings were deleted
      if (createdListingIds.length > 0) {
        const verifyDeleteTest = {
          name: 'Verify All Deletions',
          description: 'Confirm all test listings no longer exist (should return 404)',
          method: 'GET',
          endpoint: `/listings/${createdListingIds[0]}`,
          status: 'pending',
          curl: `curl -X GET "${API_URL}/listings/${createdListingIds[0]}" -H "Authorization: Bearer ${token}"`,
          response: null,
          error: null,
          responseTime: null
        };

        const startTimeVerify = Date.now();
        try {
          const response = await fetch(`${API_URL}/listings/${createdListingIds[0]}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          verifyDeleteTest.responseTime = Date.now() - startTimeVerify;
          // This should fail (404) for the test to pass
          verifyDeleteTest.status = response.status === 404 || (data.success === false && data.error?.code === 'NOT_FOUND') ? 'success' : 'failed';
          verifyDeleteTest.response = data;
          if (response.ok && data.success) {
            verifyDeleteTest.error = 'Listing still exists after deletion';
          }
        } catch (error) {
          verifyDeleteTest.status = 'failed';
          verifyDeleteTest.error = error.message;
          verifyDeleteTest.responseTime = Date.now() - startTimeVerify;
        }
        grouped.GET.push(verifyDeleteTest);
        allTests.push(verifyDeleteTest);
        setGroupedTests({...grouped});
      }
    }

    setTests(allTests);
    setLoading(false);
    setLastRefresh(new Date().toLocaleString());
  }, []);

  // Clean up any test listings on unmount
  useEffect(() => {
    return () => {
      const listingsToDelete = testListingIds.length > 0 ? testListingIds : (testListingId ? [testListingId] : []);

      if (listingsToDelete.length > 0) {
        const token = localStorage.getItem('crm_auth_token') ||
                     localStorage.getItem('authToken') ||
                     localStorage.getItem('token');

        let API_URL = process.env.REACT_APP_API_URL || 'https://api.jaydenmetz.com';
        if (!API_URL.endsWith('/v1')) {
          API_URL = API_URL.replace(/\/$/, '') + '/v1';
        }

        // Clean up all test listings
        listingsToDelete.forEach(async listingId => {
          try {
            // Archive first
            await fetch(`${API_URL}/listings/${listingId}/archive`, {
              method: 'PUT',
              headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            // Then delete
            await fetch(`${API_URL}/listings/${listingId}`, {
              method: 'DELETE',
              headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
          } catch (error) {
            // Ignore cleanup errors
          }
        });
      }
    };
  }, [testListingId, testListingIds]);

  // Run tests on mount
  useEffect(() => {
    runAllTests();
  }, [runAllTests]);

  const successCount = tests.filter(t => t.status === 'success').length;
  const failedCount = tests.filter(t => t.status === 'failed').length;

  const copyAllData = () => {
    const allData = {
      dashboard: 'Listings API Health Check',
      lastRefresh: lastRefresh || 'Not yet refreshed',
      summary: {
        totalTests: tests.length,
        passed: successCount,
        failed: failedCount
      },
      tests: tests.map(test => ({
        name: test.name,
        description: test.description,
        method: test.method,
        endpoint: test.endpoint,
        status: test.status,
        responseTime: test.responseTime,
        curl: test.curl,
        requestBody: test.requestBody,
        response: test.response,
        error: test.error
      }))
    };

    const formattedData = JSON.stringify(allData, null, 2);
    navigator.clipboard.writeText(formattedData).then(() => {
      setSnackbarMessage('All test data copied to clipboard!');
      setSnackbarOpen(true);
    }).catch(err => {
      console.error('Failed to copy:', err);
      setSnackbarMessage('Failed to copy data to clipboard');
      setSnackbarOpen(true);
    });
  };

  return (
    <PageContainer>
      <Container maxWidth="lg">
        <Paper sx={{ p: 3, mb: 3, background: 'white' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Listings API Health Check
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Comprehensive testing of all listing endpoints • Last refresh: {lastRefresh || 'Loading...'}
              </Typography>
              <Box display="flex" alignItems="center" gap={2} mt={1}>
                <Typography variant="h2" fontWeight="bold" color={failedCount === 0 ? '#4caf50' : '#f44336'}>
                  {successCount}/{tests.length}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Tests Passing
                </Typography>
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
              {testListingId && (
                <Tooltip title="Clean Up Test Listing">
                  <IconButton
                    onClick={async () => {
                      const token = localStorage.getItem('crm_auth_token') ||
                                   localStorage.getItem('authToken') ||
                                   localStorage.getItem('token');

                      let API_URL = process.env.REACT_APP_API_URL || 'https://api.jaydenmetz.com';
                      if (!API_URL.endsWith('/v1')) {
                        API_URL = API_URL.replace(/\/$/, '') + '/v1';
                      }

                      try {
                        await fetch(`${API_URL}/listings/${testListingId}`, {
                          method: 'DELETE',
                          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                        });
                        setTestListingId(null);
                        setSnackbarMessage('Test listing cleaned up');
                        setSnackbarOpen(true);
                      } catch (error) {
                        setSnackbarMessage('Failed to clean up test listing');
                        setSnackbarOpen(true);
                      }
                    }}
                    sx={{
                      backgroundColor: '#ffebee',
                      color: '#f44336',
                      '&:hover': { backgroundColor: '#ffcdd2' }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                <Typography variant="h4" fontWeight="bold">{tests.length}</Typography>
                <Typography variant="body2" color="textSecondary">Total Tests</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                <Typography variant="h4" fontWeight="bold" color="#4caf50">
                  {successCount}
                </Typography>
                <Typography variant="body2" color="textSecondary">Passed</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: failedCount === 0 ? '#e8f5e9' : '#ffebee' }}>
                <Typography variant="h4" fontWeight="bold" color={failedCount === 0 ? '#4caf50' : '#f44336'}>
                  {failedCount}
                </Typography>
                <Typography variant="body2" color="textSecondary">Failed</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                <Typography variant="h4" fontWeight="bold" color="#2196f3">
                  {tests.reduce((acc, t) => acc + (t.responseTime || 0), 0)}ms
                </Typography>
                <Typography variant="body2" color="textSecondary">Total Time</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        <Fade in={!loading}>
          <Box>
            {/* GET Requests Section */}
            {groupedTests.GET.length > 0 && (
              <>
                <SectionHeader variant="h5">
                  GET Requests ({groupedTests.GET.filter(t => t.status === 'success').length}/{groupedTests.GET.length})
                </SectionHeader>
                {groupedTests.GET.map((test, index) => (
                  <TestItem key={`get-${index}`} test={test} />
                ))}
              </>
            )}

            {/* POST Requests Section */}
            {groupedTests.POST.length > 0 && (
              <>
                <SectionHeader variant="h5">
                  POST Requests ({groupedTests.POST.filter(t => t.status === 'success').length}/{groupedTests.POST.length})
                </SectionHeader>
                {groupedTests.POST.map((test, index) => (
                  <TestItem key={`post-${index}`} test={test} />
                ))}
              </>
            )}

            {/* PUT Requests Section */}
            {groupedTests.PUT.length > 0 && (
              <>
                <SectionHeader variant="h5">
                  PUT Requests ({groupedTests.PUT.filter(t => t.status === 'success').length}/{groupedTests.PUT.length})
                </SectionHeader>
                {groupedTests.PUT.map((test, index) => (
                  <TestItem key={`put-${index}`} test={test} />
                ))}
              </>
            )}

            {/* DELETE Requests Section */}
            {groupedTests.DELETE.length > 0 && (
              <>
                <SectionHeader variant="h5">
                  DELETE Requests ({groupedTests.DELETE.filter(t => t.status === 'success').length}/{groupedTests.DELETE.length})
                </SectionHeader>
                {groupedTests.DELETE.map((test, index) => (
                  <TestItem key={`delete-${index}`} test={test} />
                ))}
              </>
            )}
          </Box>
        </Fade>
      </Container>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default ListingsHealthDashboard;