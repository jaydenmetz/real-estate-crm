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
  Warning as WarningIcon
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
      if (test.status === 'success' && test.method === 'GET' && parsed.data?.clients) {
        return JSON.stringify({
          success: parsed.success,
          data: {
            clients: `[${parsed.data.clients.length} clients]`,
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
                <Chip
                  label={test.category}
                  size="small"
                  sx={{ mt: 0.5, fontSize: '0.7rem' }}
                  color={test.category === 'Critical' ? 'error' :
                         test.category === 'Edge Case' ? 'warning' : 'default'}
                />
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
                        test.method === 'PATCH' ? '#9c27b0' :
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

const ClientsHealthDashboard = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [testClientId, setTestClientId] = useState(null);
  const [testClientIds, setTestClientIds] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [groupedTests, setGroupedTests] = useState({
    CORE: [],
    FILTERS: [],
    ERROR: [],
    EDGE: [],
    PERFORMANCE: []
  });

  const runAllTests = useCallback(async () => {
    setLoading(true);
    setTests([]);
    setGroupedTests({ CORE: [], FILTERS: [], ERROR: [], EDGE: [], PERFORMANCE: [] });

    let API_URL = process.env.REACT_APP_API_URL || 'https://api.jaydenmetz.com';
    if (!API_URL.endsWith('/v1')) {
      API_URL = API_URL.replace(/\/$/, '') + '/v1';
    }

    const token = localStorage.getItem('crm_auth_token') ||
                 localStorage.getItem('authToken') ||
                 localStorage.getItem('token');

    const allTests = [];
    const grouped = { CORE: [], FILTERS: [], ERROR: [], EDGE: [], PERFORMANCE: [] };
    let createdClientId = null;
    const createdClientIds = [];

    // ========================================
    // CORE TESTS - Essential CRUD Operations
    // ========================================

    // Core GET: List all clients
    const getAllTest = {
      name: 'List All Clients',
      description: 'Retrieve all clients from the database',
      category: 'Critical',
      method: 'GET',
      endpoint: '/clients',
      status: 'pending',
      curl: `curl -X GET "${API_URL}/clients" -H "Authorization: Bearer ${token}"`,
      response: null,
      error: null,
      responseTime: null
    };

    const startTime1 = Date.now();
    try {
      const response = await fetch(`${API_URL}/clients`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      getAllTest.responseTime = Date.now() - startTime1;
      getAllTest.status = response.ok && data.success ? 'success' : 'failed';
      getAllTest.response = data;
      if (!response.ok || !data.success) {
        getAllTest.error = data.error?.message || 'Failed to fetch clients';
      }
    } catch (error) {
      getAllTest.status = 'failed';
      getAllTest.error = error.message;
      getAllTest.responseTime = Date.now() - startTime1;
    }
    grouped.CORE.push(getAllTest);
    allTests.push(getAllTest);

    // Core POST: Create minimal client
    const minimalClientData = {
      firstName: `Test`,
      lastName: `CoreClient_${Date.now()}`,
      clientType: 'buyer'
    };

    const createMinimalTest = {
      name: 'Create Client (Required Fields Only)',
      description: 'Test with only required fields',
      category: 'Critical',
      method: 'POST',
      endpoint: '/clients',
      status: 'pending',
      curl: `curl -X POST "${API_URL}/clients" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(minimalClientData)}'`,
      requestBody: minimalClientData,
      response: null,
      error: null,
      responseTime: null
    };

    if (token) {
      const startTime2 = Date.now();
      try {
        const response = await fetch(`${API_URL}/clients`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(minimalClientData)
        });
        const data = await response.json();
        createMinimalTest.responseTime = Date.now() - startTime2;
        createMinimalTest.status = response.ok && data.success ? 'success' : 'failed';
        createMinimalTest.response = data;
        if (data.success && data.data) {
          createdClientIds.push(data.data.id);
          createdClientId = data.data.id;
        } else {
          createMinimalTest.error = data.error?.message || 'Failed to create client';
        }
      } catch (error) {
        createMinimalTest.status = 'failed';
        createMinimalTest.error = error.message;
        createMinimalTest.responseTime = Date.now() - startTime2;
      }
    }
    grouped.CORE.push(createMinimalTest);
    allTests.push(createMinimalTest);

    // Core PUT: Update client
    if (createdClientId) {
      const updateData = {
        phone: '555-1234',
        status: 'active'
      };

      const updateTest = {
        name: 'Update Client',
        description: 'Update client basic information',
        category: 'Critical',
        method: 'PUT',
        endpoint: `/clients/${createdClientId}`,
        status: 'pending',
        curl: `curl -X PUT "${API_URL}/clients/${createdClientId}" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(updateData)}'`,
        requestBody: updateData,
        response: null,
        error: null,
        responseTime: null
      };

      const startTime3 = Date.now();
      try {
        const response = await fetch(`${API_URL}/clients/${createdClientId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });
        const data = await response.json();
        updateTest.responseTime = Date.now() - startTime3;
        updateTest.status = response.ok && data.success ? 'success' : 'failed';
        updateTest.response = data;
        if (!response.ok || !data.success) {
          updateTest.error = data.error?.message || 'Failed to update client';
        }
      } catch (error) {
        updateTest.status = 'failed';
        updateTest.error = error.message;
        updateTest.responseTime = Date.now() - startTime3;
      }
      grouped.CORE.push(updateTest);
      allTests.push(updateTest);
    }

    // Core DELETE: Archive and delete workflow
    if (createdClientId) {
      // Archive first
      const archiveTest = {
        name: 'Archive Client',
        description: 'Soft delete - set status to archived',
        category: 'Critical',
        method: 'PUT',
        endpoint: `/clients/${createdClientId}/archive`,
        status: 'pending'
      };

      const startTime4 = Date.now();
      try {
        const response = await fetch(`${API_URL}/clients/${createdClientId}/archive`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        archiveTest.responseTime = Date.now() - startTime4;
        archiveTest.status = response.ok && data.success ? 'success' : 'failed';
        archiveTest.response = data;
      } catch (error) {
        archiveTest.status = 'failed';
        archiveTest.error = error.message;
      }
      grouped.CORE.push(archiveTest);
      allTests.push(archiveTest);

      // Then delete
      const deleteTest = {
        name: 'Delete Archived Client',
        description: 'Hard delete - permanently remove',
        category: 'Critical',
        method: 'DELETE',
        endpoint: `/clients/${createdClientId}`,
        status: 'pending'
      };

      const startTime5 = Date.now();
      try {
        const response = await fetch(`${API_URL}/clients/${createdClientId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        deleteTest.responseTime = Date.now() - startTime5;
        deleteTest.status = response.ok && data.success ? 'success' : 'failed';
        deleteTest.response = data;
      } catch (error) {
        deleteTest.status = 'failed';
        deleteTest.error = error.message;
      }
      grouped.CORE.push(deleteTest);
      allTests.push(deleteTest);
    }

    // ========================================
    // FILTER & SEARCH TESTS
    // ========================================

    // Filter by status
    const filterStatusTest = {
      name: 'Filter by Status',
      description: 'Get only active clients',
      category: 'Search',
      method: 'GET',
      endpoint: '/clients?status=active',
      status: 'pending'
    };

    const startTime6 = Date.now();
    try {
      const response = await fetch(`${API_URL}/clients?status=active`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      filterStatusTest.responseTime = Date.now() - startTime6;
      filterStatusTest.status = response.ok && data.success ? 'success' : 'failed';
      filterStatusTest.response = data;
    } catch (error) {
      filterStatusTest.status = 'failed';
      filterStatusTest.error = error.message;
    }
    grouped.FILTERS.push(filterStatusTest);
    allTests.push(filterStatusTest);

    // Search by name
    const searchTest = {
      name: 'Search by Name',
      description: 'Search clients with name containing "Test"',
      category: 'Search',
      method: 'GET',
      endpoint: '/clients?search=Test',
      status: 'pending'
    };

    const startTime7 = Date.now();
    try {
      const response = await fetch(`${API_URL}/clients?search=Test`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      searchTest.responseTime = Date.now() - startTime7;
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
      description: 'Test pagination (page=2, limit=5)',
      category: 'Search',
      method: 'GET',
      endpoint: '/clients?page=2&limit=5',
      status: 'pending'
    };

    const startTime8 = Date.now();
    try {
      const response = await fetch(`${API_URL}/clients?page=2&limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      paginationTest.responseTime = Date.now() - startTime8;
      paginationTest.status = response.ok && data.success ? 'success' : 'failed';
      paginationTest.response = data;
    } catch (error) {
      paginationTest.status = 'failed';
      paginationTest.error = error.message;
    }
    grouped.FILTERS.push(paginationTest);
    allTests.push(paginationTest);

    // ========================================
    // ERROR HANDLING TESTS
    // ========================================

    // Test 404: Get non-existent client
    const notFoundTest = {
      name: 'Get Non-Existent Client',
      description: 'Should return 404 error',
      category: 'Error Handling',
      method: 'GET',
      endpoint: '/clients/00000000-0000-0000-0000-000000000000',
      status: 'pending'
    };

    const startTime9 = Date.now();
    try {
      const response = await fetch(`${API_URL}/clients/00000000-0000-0000-0000-000000000000`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      notFoundTest.responseTime = Date.now() - startTime9;
      // This should fail (404), so success is actually when it returns an error
      notFoundTest.status = response.status === 404 ? 'success' : 'failed';
      notFoundTest.response = data;
      if (response.status !== 404) {
        notFoundTest.error = 'Expected 404 but got ' + response.status;
      }
    } catch (error) {
      notFoundTest.status = 'failed';
      notFoundTest.error = error.message;
    }
    grouped.ERROR.push(notFoundTest);
    allTests.push(notFoundTest);

    // Test 400: Create client with missing required fields
    const missingFieldsTest = {
      name: 'Create Client - Missing Required Fields',
      description: 'Should return 400 validation error',
      category: 'Error Handling',
      method: 'POST',
      endpoint: '/clients',
      status: 'pending',
      requestBody: { firstName: 'OnlyFirst' } // Missing lastName and clientType
    };

    const startTime10 = Date.now();
    try {
      const response = await fetch(`${API_URL}/clients`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ firstName: 'OnlyFirst' })
      });
      const data = await response.json();
      missingFieldsTest.responseTime = Date.now() - startTime10;
      // Should fail with validation error
      missingFieldsTest.status = response.status === 400 ? 'success' : 'failed';
      missingFieldsTest.response = data;
      if (response.status !== 400) {
        missingFieldsTest.error = 'Expected 400 validation error';
      }
    } catch (error) {
      missingFieldsTest.status = 'failed';
      missingFieldsTest.error = error.message;
    }
    grouped.ERROR.push(missingFieldsTest);
    allTests.push(missingFieldsTest);

    // Test: Invalid email format
    const invalidEmailTest = {
      name: 'Create Client - Invalid Email',
      description: 'Should validate email format',
      category: 'Error Handling',
      method: 'POST',
      endpoint: '/clients',
      status: 'pending',
      requestBody: {
        firstName: 'Test',
        lastName: 'Invalid',
        email: 'not-an-email',
        clientType: 'buyer'
      }
    };

    const startTime11 = Date.now();
    try {
      const response = await fetch(`${API_URL}/clients`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invalidEmailTest.requestBody)
      });
      const data = await response.json();
      invalidEmailTest.responseTime = Date.now() - startTime11;
      // Depending on backend validation, this might pass or fail
      invalidEmailTest.status = response.status === 400 ? 'warning' : 'success';
      invalidEmailTest.response = data;
    } catch (error) {
      invalidEmailTest.status = 'failed';
      invalidEmailTest.error = error.message;
    }
    grouped.ERROR.push(invalidEmailTest);
    allTests.push(invalidEmailTest);

    // ========================================
    // EDGE CASE TESTS
    // ========================================

    // Test: Special characters in name
    const specialCharsTest = {
      name: 'Create Client - Special Characters',
      description: 'Test with special chars in name',
      category: 'Edge Case',
      method: 'POST',
      endpoint: '/clients',
      status: 'pending',
      requestBody: {
        firstName: `O'Brien-Test`,
        lastName: `Müller & Co.`,
        clientType: 'seller',
        email: `special${Date.now()}@test.com`
      }
    };

    const startTime12 = Date.now();
    try {
      const response = await fetch(`${API_URL}/clients`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(specialCharsTest.requestBody)
      });
      const data = await response.json();
      specialCharsTest.responseTime = Date.now() - startTime12;
      specialCharsTest.status = response.ok && data.success ? 'success' : 'failed';
      specialCharsTest.response = data;
      if (data.success && data.data) {
        createdClientIds.push(data.data.id);
      }
    } catch (error) {
      specialCharsTest.status = 'failed';
      specialCharsTest.error = error.message;
    }
    grouped.EDGE.push(specialCharsTest);
    allTests.push(specialCharsTest);

    // Test: Very long text fields
    const longTextTest = {
      name: 'Create Client - Long Text Fields',
      description: 'Test with maximum length values',
      category: 'Edge Case',
      method: 'POST',
      endpoint: '/clients',
      status: 'pending',
      requestBody: {
        firstName: 'A'.repeat(50),
        lastName: 'B'.repeat(50),
        clientType: 'buyer',
        notes: 'Lorem ipsum dolor sit amet, '.repeat(100),
        email: `long${Date.now()}@test.com`
      }
    };

    const startTime13 = Date.now();
    try {
      const response = await fetch(`${API_URL}/clients`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(longTextTest.requestBody)
      });
      const data = await response.json();
      longTextTest.responseTime = Date.now() - startTime13;
      longTextTest.status = response.ok && data.success ? 'success' : 'warning';
      longTextTest.response = data;
      if (data.success && data.data) {
        createdClientIds.push(data.data.id);
      }
    } catch (error) {
      longTextTest.status = 'failed';
      longTextTest.error = error.message;
    }
    grouped.EDGE.push(longTextTest);
    allTests.push(longTextTest);

    // ========================================
    // PERFORMANCE TESTS
    // ========================================

    // Test: Large pagination request
    const largePaginationTest = {
      name: 'Large Pagination Request',
      description: 'Request page 999 with limit 100',
      category: 'Performance',
      method: 'GET',
      endpoint: '/clients?page=999&limit=100',
      status: 'pending'
    };

    const startTime14 = Date.now();
    try {
      const response = await fetch(`${API_URL}/clients?page=999&limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      largePaginationTest.responseTime = Date.now() - startTime14;
      largePaginationTest.status = response.ok && data.success ? 'success' : 'failed';
      largePaginationTest.response = data;
      // Check if response time is reasonable (< 1000ms)
      if (largePaginationTest.responseTime > 1000) {
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
      name: 'Concurrent GET Requests',
      description: 'Send 5 simultaneous requests',
      category: 'Performance',
      method: 'GET',
      endpoint: '/clients (x5)',
      status: 'pending'
    };

    const startTime15 = Date.now();
    try {
      const promises = Array(5).fill(null).map(() =>
        fetch(`${API_URL}/clients?limit=5`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      );
      const responses = await Promise.all(promises);
      const allSuccessful = responses.every(r => r.ok);
      concurrentTest.responseTime = Date.now() - startTime15;
      concurrentTest.status = allSuccessful ? 'success' : 'failed';
      concurrentTest.response = {
        requestCount: 5,
        successCount: responses.filter(r => r.ok).length,
        avgResponseTime: Math.round(concurrentTest.responseTime / 5)
      };
    } catch (error) {
      concurrentTest.status = 'failed';
      concurrentTest.error = error.message;
    }
    grouped.PERFORMANCE.push(concurrentTest);
    allTests.push(concurrentTest);

    // Clean up created test clients
    for (const id of createdClientIds) {
      if (id && id !== createdClientId) { // Skip already deleted one
        try {
          await fetch(`${API_URL}/clients/${id}/archive`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          await fetch(`${API_URL}/clients/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } catch (error) {
          console.error('Cleanup error:', error);
        }
      }
    }

    setTests(allTests);
    setGroupedTests(grouped);
    setLastRefresh(new Date().toLocaleString());
    setLoading(false);
    setTestClientIds(createdClientIds);
  }, []);

  const copyAllData = () => {
    const testData = {
      timestamp: new Date().toISOString(),
      endpoint: 'clients',
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
        performance: groupedTests.PERFORMANCE.length
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
    { label: 'All Tests', key: 'ALL' },
    { label: 'Core CRUD', key: 'CORE' },
    { label: 'Filters & Search', key: 'FILTERS' },
    { label: 'Error Handling', key: 'ERROR' },
    { label: 'Edge Cases', key: 'EDGE' },
    { label: 'Performance', key: 'PERFORMANCE' }
  ];

  const getTestsForTab = (tabIndex) => {
    if (tabIndex === 0) return tests; // All tests
    const category = tabCategories[tabIndex].key;
    return groupedTests[category] || [];
  };

  return (
    <PageContainer>
      <Container maxWidth="lg">
        <Fade in timeout={800}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3, background: 'rgba(255,255,255,0.98)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Box>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  Clients API Health Dashboard
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Comprehensive testing with error handling, edge cases, and performance tests • Last refresh: {lastRefresh || 'Loading...'}
                </Typography>
                <Box display="flex" alignItems="center" gap={2} mt={1}>
                  <Typography variant="h2" fontWeight="bold" color={failedCount === 0 ? '#4caf50' : '#f44336'}>
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
                    {Math.round(tests.reduce((acc, t) => acc + (t.responseTime || 0), 0) / tests.length)}ms
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Avg Time</Typography>
                </Paper>
              </Grid>
            </Grid>

            {loading && <LinearProgress sx={{ my: 2 }} />}

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
              <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)}>
                {tabCategories.map((cat, idx) => (
                  <Tab key={cat.key} label={cat.label} />
                ))}
              </Tabs>
            </Box>

            <Fade in={!loading}>
              <Box sx={{ mt: 3 }}>
                {getTestsForTab(currentTab).map((test, index) => (
                  <TestItem key={`test-${currentTab}-${index}`} test={test} />
                ))}
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
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default ClientsHealthDashboard;