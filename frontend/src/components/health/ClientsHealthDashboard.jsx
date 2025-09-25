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
      <CardContent sx={{ pb: expanded ? 2 : 2, '&:last-child': { pb: 2 } }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box display="flex" alignItems="flex-start" gap={2}>
            <StatusIcon status={test.status} />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {test.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" mb={1}>
                {test.description}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={test.method}
                  size="small"
                  color={
                    test.method === 'GET' ? 'info' :
                    test.method === 'POST' ? 'success' :
                    test.method === 'PUT' ? 'warning' :
                    test.method === 'DELETE' ? 'error' :
                    'default'
                  }
                />
                <Chip
                  label={test.endpoint}
                  size="small"
                  variant="outlined"
                />
                {test.responseTime && (
                  <Chip
                    label={`${test.responseTime}ms`}
                    size="small"
                    variant="outlined"
                    color={test.responseTime < 200 ? 'success' : 'warning'}
                  />
                )}
              </Stack>
            </Box>
          </Box>
          <ExpandButton expanded={expanded} onClick={() => setExpanded(!expanded)}>
            <ExpandIcon />
          </ExpandButton>
        </Box>
      </CardContent>

      <Collapse in={expanded}>
        <Divider />
        <Box p={3} bgcolor="background.default">
          {test.curl && (
            <>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                cURL Command:
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
                <pre style={{ margin: 0, color: '#9cdcfe' }}>{formatRequestBody()}</pre>
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
                <pre style={{ margin: 0, color: test.status === 'success' ? '#b5cea8' : '#f48771' }}>
                  {formatResponse()}
                </pre>
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

    // Get auth token - check multiple possible keys
    const token = localStorage.getItem('crm_auth_token') ||
                 localStorage.getItem('authToken') ||
                 localStorage.getItem('token');

    const allTests = [];
    const grouped = { GET: [], POST: [], PUT: [], DELETE: [] };
    let createdClientId = null;
    const createdClientIds = [];

    // ========================================
    // GET REQUESTS - Run these first
    // ========================================

    // GET Test 1: Get all clients
    const getAllTest = {
      name: 'List All Clients',
      description: 'Retrieve all clients from the database',
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
    grouped.GET.push(getAllTest);
    allTests.push(getAllTest);
    setGroupedTests({...grouped});

    // GET Test 2: Get clients with pagination
    const paginationTest = {
      name: 'List with Pagination',
      description: 'Test pagination parameters (page=1, limit=5)',
      method: 'GET',
      endpoint: '/clients?page=1&limit=5',
      status: 'pending',
      curl: `curl -X GET "${API_URL}/clients?page=1&limit=5" -H "Authorization: Bearer ${token}"`,
      response: null,
      error: null,
      responseTime: null
    };

    const startTime2 = Date.now();
    try {
      const response = await fetch(`${API_URL}/clients?page=1&limit=5`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      paginationTest.responseTime = Date.now() - startTime2;
      paginationTest.status = response.ok && data.success ? 'success' : 'failed';
      paginationTest.response = data;
      if (!response.ok || !data.success) {
        paginationTest.error = data.error?.message || 'Failed to fetch clients with pagination';
      }
    } catch (error) {
      paginationTest.status = 'failed';
      paginationTest.error = error.message;
      paginationTest.responseTime = Date.now() - startTime2;
    }
    grouped.GET.push(paginationTest);
    allTests.push(paginationTest);
    setGroupedTests({...grouped});

    // ========================================
    // POST REQUESTS - Create test clients
    // ========================================

    // POST Test 1: Create Buyer Client (Minimal)
    const minimalClientData = {
      firstName: 'Test',
      lastName: `Buyer_${Date.now()}`,
      email: `testbuyer_${Date.now()}@test.com`,
      clientType: 'Buyer',
      phone: '555-0001'
    };

    const createMinimalTest = {
      name: 'Create Client (Minimal)',
      description: 'Test with only required fields (buyer)',
      method: 'POST',
      endpoint: '/clients',
      status: 'pending',
      curl: `curl -X POST "${API_URL}/clients" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(minimalClientData, null, 2)}'`,
      requestBody: minimalClientData,
      response: null,
      error: null,
      responseTime: null
    };

    if (token) {
      const startTimeMinimal = Date.now();
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
        createMinimalTest.responseTime = Date.now() - startTimeMinimal;
        createMinimalTest.status = response.ok && data.success ? 'success' : 'failed';
        createMinimalTest.response = data;
        if (data.success && data.data) {
          createdClientIds.push(data.data.id || data.data._id);
        } else {
          createMinimalTest.error = data.error?.message || 'Failed to create minimal client';
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

    // POST Test 2: Create Seller Client (Basic)
    const basicClientData = {
      firstName: 'Test',
      lastName: `Seller_${Date.now()}`,
      email: `testseller_${Date.now()}@test.com`,
      clientType: 'Seller',
      clientStatus: 'Active',
      phone: '555-0002',
      address: '123 Main St, Los Angeles, CA 90001'
    };

    const createBasicTest = {
      name: 'Create Client (Basic)',
      description: 'Test with essential fields (seller)',
      method: 'POST',
      endpoint: '/clients',
      status: 'pending',
      curl: `curl -X POST "${API_URL}/clients" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(basicClientData, null, 2)}'`,
      requestBody: basicClientData,
      response: null,
      error: null,
      responseTime: null
    };

    if (token) {
      const startTimeBasic = Date.now();
      try {
        const response = await fetch(`${API_URL}/clients`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(basicClientData)
        });
        const data = await response.json();
        createBasicTest.responseTime = Date.now() - startTimeBasic;
        createBasicTest.status = response.ok && data.success ? 'success' : 'failed';
        createBasicTest.response = data;
        if (data.success && data.data) {
          createdClientIds.push(data.data.id || data.data._id);
        } else {
          createBasicTest.error = data.error?.message || 'Failed to create basic client';
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

    // POST Test 3: Create Both Type Client (Full)
    const fullClientData = {
      firstName: 'Test',
      lastName: `Both_${Date.now()}`,
      email: `testboth_${Date.now()}@test.com`,
      clientType: 'Both',
      clientStatus: 'Active',
      phone: '555-0003',
      address: '456 Oak Ave, Beverly Hills, CA 90210',
      notes: 'VIP client looking to sell current home and buy new property'
    };

    const createFullTest = {
      name: 'Create Client (Full)',
      description: 'Test with all available fields (buyer & seller)',
      method: 'POST',
      endpoint: '/clients',
      status: 'pending',
      curl: `curl -X POST "${API_URL}/clients" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(fullClientData, null, 2)}'`,
      requestBody: fullClientData,
      response: null,
      error: null,
      responseTime: null
    };

    if (token) {
      const startTimeFull = Date.now();
      try {
        const response = await fetch(`${API_URL}/clients`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(fullClientData)
        });
        const data = await response.json();
        createFullTest.responseTime = Date.now() - startTimeFull;
        createFullTest.status = response.ok && data.success ? 'success' : 'failed';
        createFullTest.response = data;
        if (data.success && data.data) {
          createdClientIds.push(data.data.id || data.data._id);
        } else {
          createFullTest.error = data.error?.message || 'Failed to create full client';
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

    // ========================================
    // PUT REQUESTS - Update clients
    // ========================================

    // Store created IDs for cleanup
    setTestClientIds(createdClientIds);

    // PUT Test 1: Update client status
    const updateData = {
      clientStatus: 'Past Client'
    };

    const updateTest = {
      name: 'Update Client by ID',
      description: 'Update client status',
      method: 'PUT',
      endpoint: `/clients/${createdClientIds[0]}`,
      status: 'pending',
      curl: `curl -X PUT "${API_URL}/clients/${createdClientIds[0]}" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(updateData, null, 2)}'`,
      requestBody: updateData,
      response: null,
      error: null,
      responseTime: null
    };

    if (createdClientIds[0]) {
      const startTime5 = Date.now();
      try {
        const response = await fetch(`${API_URL}/clients/${createdClientIds[0]}`, {
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
          updateTest.error = data.error?.message || 'Failed to update client';
        }
      } catch (error) {
        updateTest.status = 'failed';
        updateTest.error = error.message;
        updateTest.responseTime = Date.now() - startTime5;
      }
    } else {
      updateTest.status = 'failed';
      updateTest.error = 'No client ID available for update';
    }
    grouped.PUT.push(updateTest);
    allTests.push(updateTest);
    setGroupedTests({...grouped});

    // PUT Test 2: Update contact info
    const contactUpdateData = {
      phone: '555-9999',
      address: '789 New Address, Updated City, CA 90210'
    };

    const contactUpdateTest = {
      name: 'Update Contact Info',
      description: 'Test updating phone and address',
      method: 'PUT',
      endpoint: `/clients/${createdClientIds[0]}`,
      status: 'pending',
      curl: `curl -X PUT "${API_URL}/clients/${createdClientIds[0]}" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(contactUpdateData, null, 2)}'`,
      requestBody: contactUpdateData,
      response: null,
      error: null,
      responseTime: null
    };

    if (createdClientIds[0]) {
      const startTime6 = Date.now();
      try {
        const response = await fetch(`${API_URL}/clients/${createdClientIds[0]}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(contactUpdateData)
        });
        const data = await response.json();
        contactUpdateTest.responseTime = Date.now() - startTime6;
        contactUpdateTest.status = response.ok && data.success ? 'success' : 'failed';
        contactUpdateTest.response = data;
        if (!response.ok || !data.success) {
          contactUpdateTest.error = data.error?.message || 'Failed to update contact info';
        }
      } catch (error) {
        contactUpdateTest.status = 'failed';
        contactUpdateTest.error = error.message;
        contactUpdateTest.responseTime = Date.now() - startTime6;
      }
    } else {
      contactUpdateTest.status = 'failed';
      contactUpdateTest.error = 'No client ID available for update';
    }
    grouped.PUT.push(contactUpdateTest);
    allTests.push(contactUpdateTest);
    setGroupedTests({...grouped});

    // POST Test: Add notes
    const noteData = {
      note: 'Test note from health dashboard',
      type: 'general'
    };

    const addNoteTest = {
      name: 'Add Client Note',
      description: 'Test adding a note to client record',
      method: 'POST',
      endpoint: `/clients/${createdClientIds[1]}/notes`,
      status: 'pending',
      curl: `curl -X POST "${API_URL}/clients/${createdClientIds[1]}/notes" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(noteData, null, 2)}'`,
      requestBody: noteData,
      response: null,
      error: null,
      responseTime: null
    };

    if (createdClientIds[1]) {
      const startTime7 = Date.now();
      try {
        const response = await fetch(`${API_URL}/clients/${createdClientIds[1]}/notes`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(noteData)
        });
        const data = await response.json();
        addNoteTest.responseTime = Date.now() - startTime7;
        addNoteTest.status = response.ok && data.success ? 'success' : 'failed';
        addNoteTest.response = data;
        if (!response.ok || !data.success) {
          addNoteTest.error = data.error?.message || 'Failed to add note';
        }
      } catch (error) {
        addNoteTest.status = 'failed';
        addNoteTest.error = error.message;
        addNoteTest.responseTime = Date.now() - startTime7;
      }
    } else {
      addNoteTest.status = 'failed';
      addNoteTest.error = 'No client ID available for note';
    }
    grouped.POST.push(addNoteTest);
    allTests.push(addNoteTest);
    setGroupedTests({...grouped});

    // ========================================
    // DELETE REQUESTS - Clean up test clients
    // ========================================

    // Archive and delete all created test clients
    for (let i = 0; i < createdClientIds.length; i++) {
      const clientId = createdClientIds[i];
      if (!clientId) continue;

      // Archive client
      const archiveTest = {
        name: `Archive Test Client ${i + 1}`,
        description: `Archive ${i === 0 ? 'buyer' : i === 1 ? 'seller' : 'both'} client`,
        method: 'PUT',
        endpoint: `/clients/${clientId}/archive`,
        status: 'pending',
        curl: `curl -X PUT "${API_URL}/clients/${clientId}/archive" -H "Authorization: Bearer ${token}"`,
        response: null,
        error: null,
        responseTime: null
      };

      const startTimeArchive = Date.now();
      try {
        const response = await fetch(`${API_URL}/clients/${clientId}/archive`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        archiveTest.responseTime = Date.now() - startTimeArchive;
        archiveTest.status = response.ok && data.success ? 'success' : 'failed';
        archiveTest.response = data;
        if (!response.ok || !data.success) {
          archiveTest.error = data.error?.message || 'Failed to archive client';
        }
      } catch (error) {
        archiveTest.status = 'failed';
        archiveTest.error = error.message;
        archiveTest.responseTime = Date.now() - startTimeArchive;
      }
      grouped.PUT.push(archiveTest);
      allTests.push(archiveTest);
      setGroupedTests({...grouped});

      // Delete archived client
      const deleteTest = {
        name: `Delete Archived Client ${i + 1}`,
        description: `Delete archived ${i === 0 ? 'buyer' : i === 1 ? 'seller' : 'both'} client`,
        method: 'DELETE',
        endpoint: `/clients/${clientId}`,
        status: 'pending',
        curl: `curl -X DELETE "${API_URL}/clients/${clientId}" -H "Authorization: Bearer ${token}"`,
        response: null,
        error: null,
        responseTime: null
      };

      const startTimeDelete = Date.now();
      try {
        const response = await fetch(`${API_URL}/clients/${clientId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        deleteTest.responseTime = Date.now() - startTimeDelete;
        deleteTest.status = response.ok && data.success ? 'success' : 'failed';
        deleteTest.response = data;
        if (!response.ok || !data.success) {
          deleteTest.error = data.error?.message || 'Failed to delete client';
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

    // Final verification test
    const verifyTest = {
      name: 'Verify All Deletions',
      description: 'Confirm all test clients no longer exist (should return 404)',
      method: 'GET',
      endpoint: `/clients/${createdClientIds[0]}`,
      status: 'pending',
      curl: `curl -X GET "${API_URL}/clients/${createdClientIds[0]}" -H "Authorization: Bearer ${token}"`,
      response: null,
      error: null,
      responseTime: null
    };

    if (createdClientIds[0]) {
      const startTime10 = Date.now();
      try {
        const response = await fetch(`${API_URL}/clients/${createdClientIds[0]}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        verifyTest.responseTime = Date.now() - startTime10;
        // Should fail with 404
        verifyTest.status = !response.ok && response.status === 404 ? 'success' : 'failed';
        verifyTest.response = data;
        if (response.ok) {
          verifyTest.error = 'Client still exists after deletion';
        }
      } catch (error) {
        verifyTest.status = 'failed';
        verifyTest.error = error.message;
        verifyTest.responseTime = Date.now() - startTime10;
      }
    }
    grouped.GET.push(verifyTest);
    allTests.push(verifyTest);

    setTests(allTests);
    setGroupedTests(grouped);
    setLastRefresh(new Date().toLocaleString());
    setLoading(false);
  }, []);

  // Cleanup function for test clients
  const cleanupTestClients = async () => {
    const clientsToDelete = testClientIds.length > 0 ? testClientIds : (testClientId ? [testClientId] : []);

    if (clientsToDelete.length > 0) {
      const token = localStorage.getItem('crm_auth_token') ||
                   localStorage.getItem('authToken') ||
                   localStorage.getItem('token');

      let API_URL = process.env.REACT_APP_API_URL || 'https://api.jaydenmetz.com';
      if (!API_URL.endsWith('/v1')) {
        API_URL = API_URL.replace(/\/$/, '') + '/v1';
      }

      for (const clientId of clientsToDelete) {
        if (!clientId) continue;

        try {
          // First archive
          await fetch(`${API_URL}/clients/${clientId}/archive`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
          });

          // Then delete
          await fetch(`${API_URL}/clients/${clientId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } catch (error) {
          console.error('Error cleaning up test client:', error);
        }
      }

      setSnackbarMessage(`Cleaned up ${clientsToDelete.length} test client(s)`);
      setSnackbarOpen(true);
      setTestClientIds([]);
      setTestClientId(null);
      await runAllTests();
    }
  };

  useEffect(() => {
    runAllTests();
  }, [runAllTests]);

  const totalTests = tests.length;
  const passedTests = tests.filter(t => t.status === 'success').length;
  const failedTests = tests.filter(t => t.status === 'failed').length;

  return (
    <PageContainer>
      <Container maxWidth="lg">
        <Fade in timeout={800}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3, background: 'rgba(255,255,255,0.98)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
              <Box>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  Clients API Health Check
                </Typography>
                {lastRefresh && (
                  <Typography variant="caption" color="textSecondary">
                    Last refresh: {lastRefresh}
                  </Typography>
                )}
              </Box>
              <Stack direction="row" spacing={2}>
                {testClientIds.length > 0 && (
                  <Tooltip title="Clean Up Test Clients">
                    <IconButton
                      onClick={cleanupTestClients}
                      sx={{
                        bgcolor: 'error.light',
                        color: 'error.dark',
                        '&:hover': { bgcolor: 'error.main', color: 'white' }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Refresh Tests">
                  <IconButton
                    onClick={runAllTests}
                    disabled={loading}
                    sx={{
                      bgcolor: 'primary.light',
                      color: 'primary.dark',
                      '&:hover': { bgcolor: 'primary.main', color: 'white' }
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>

            {loading && <LinearProgress sx={{ mb: 3 }} />}

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h3" fontWeight="bold" color="primary.main">
                      {totalTests}
                    </Typography>
                    <Typography variant="subtitle2" color="textSecondary">
                      Total Tests
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: passedTests > 0 ? '#e8f5e9' : undefined }}>
                  <CardContent>
                    <Typography variant="h3" fontWeight="bold" color="success.main">
                      {passedTests}
                    </Typography>
                    <Typography variant="subtitle2" color="textSecondary">
                      Passed
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: failedTests > 0 ? '#ffebee' : undefined }}>
                  <CardContent>
                    <Typography variant="h3" fontWeight="bold" color="error.main">
                      {failedTests}
                    </Typography>
                    <Typography variant="subtitle2" color="textSecondary">
                      Failed
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {Object.entries(groupedTests).map(([method, methodTests]) => (
              methodTests.length > 0 && (
                <Box key={method} mb={3}>
                  <SectionHeader variant="h6">
                    {method} Requests ({methodTests.filter(t => t.status === 'success').length}/{methodTests.length})
                  </SectionHeader>
                  {methodTests.map((test, index) => (
                    <TestItem key={`${method}-${index}`} test={test} />
                  ))}
                </Box>
              )
            ))}
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