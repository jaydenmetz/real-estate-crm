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

    // Get auth token
    const token = localStorage.getItem('crm_auth_token') ||
                 localStorage.getItem('authToken') ||
                 localStorage.getItem('token');

    const allTests = [];
    const grouped = { GET: [], POST: [], PUT: [], DELETE: [] };
    let createdClientId = null;

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

    // GET Test 2: Get with pagination
    const getPaginatedTest = {
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

    // GET Test 3: Get first client by ID (if any exist)
    let existingClientId = null;
    if (getAllTest.status === 'success' && getAllTest.response?.data?.clients?.length > 0) {
      existingClientId = getAllTest.response.data.clients[0].id;

      const getByIdTest = {
        name: 'Get Client by ID',
        description: 'Retrieve a specific client using its ID',
        method: 'GET',
        endpoint: `/clients/${existingClientId}`,
        status: 'pending',
        curl: `curl -X GET "${API_URL}/clients/${existingClientId}" -H "Authorization: Bearer ${token}"`,
        response: null,
        error: null,
        responseTime: null
      };

      const startTime3 = Date.now();
      try {
        const response = await fetch(`${API_URL}/clients/${existingClientId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        getByIdTest.responseTime = Date.now() - startTime3;
        getByIdTest.status = response.ok && data.success ? 'success' : 'failed';
        getByIdTest.response = data;
        if (!response.ok || !data.success) {
          getByIdTest.error = data.error?.message || 'Failed to fetch client';
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
    const createdClientIds = [];

    // POST Test 1: Minimal (Name Only)
    const minimalClientData = {
      firstName: `Test`,
      lastName: `Client_${Date.now()}`,
      clientType: 'Buyer'
    };

    const createMinimalTest = {
      name: 'Create Client (Minimal)',
      description: 'Test with only required fields (firstName, lastName, clientType)',
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
          createdClientIds.push(data.data.id);
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

    // POST Test 2: Basic (Most Important Fields)
    const basicClientData = {
      firstName: `Basic`,
      lastName: `Test_${Date.now()}`,
      email: `basic${Date.now()}@test.com`,
      phone: '555-0100',
      clientType: 'Seller',
      address: '123 Main St',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      status: 'active'
    };

    const createBasicTest = {
      name: 'Create Client (Basic)',
      description: 'Test with essential fields',
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
          createdClientIds.push(data.data.id);
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

    // POST Test 3: Full (All Fields)
    const fullClientData = {
      firstName: `Full`,
      lastName: `Test_${Date.now()}`,
      email: `full${Date.now()}@test.com`,
      phone: '555-0200',
      alternativePhone: '555-0201',
      clientType: 'Both',
      status: 'active',
      address: '456 Oak Avenue',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      occupation: 'Software Engineer',
      preapprovalAmount: 850000,
      priceRange: '$800,000 - $950,000',
      preferredAreas: ['Mission District', 'SOMA', 'Potrero Hill'],
      propertyTypes: ['Condo', 'Townhouse'],
      source: 'Referral',
      notes: 'Looking for modern condo with home office space',
      tags: ['Tech Professional', 'First Time Buyer', 'Pre-approved']
    };

    const createFullTest = {
      name: 'Create Client (Full)',
      description: 'Test with all available fields',
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
          createdClientIds.push(data.data.id);
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

    // Set the first created client as the primary one for testing
    if (createdClientIds.length > 0) {
      createdClientId = createdClientIds[0];
      setTestClientId(createdClientId);
      setTestClientIds(createdClientIds);
    }

    // ========================================
    // PUT REQUESTS - Use different test clients for comprehensive testing
    // ========================================

    if (createdClientIds.length > 0) {
      // Use different clients for different tests
      const clientForBasicUpdate = createdClientIds[0] || null;
      const clientForDetailTests = createdClientIds[1] || createdClientIds[0] || null;

      // PUT Test 1: Update client basic info
      const updateData = {
        phone: '555-9999',
        status: 'inactive',
        notes: 'Updated contact information'
      };

      const updateTest = {
        name: 'Update Client by ID',
        description: 'Update basic client information',
        method: 'PUT',
        endpoint: `/clients/${clientForBasicUpdate}`,
        status: 'pending',
        curl: `curl -X PUT "${API_URL}/clients/${clientForBasicUpdate}" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(updateData, null, 2)}'`,
        requestBody: updateData,
        response: null,
        error: null,
        responseTime: null
      };

      const startTime5 = Date.now();
      try {
        const response = await fetch(`${API_URL}/clients/${clientForBasicUpdate}`, {
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
      grouped.PUT.push(updateTest);
      allTests.push(updateTest);
      setGroupedTests({...grouped});

      // PUT Test 2: Update client type
      const clientTypeUpdateData = {
        clientType: 'Both'
      };

      const clientTypeUpdateTest = {
        name: 'Update Client Type',
        description: 'Change client from Buyer/Seller to Both',
        method: 'PUT',
        endpoint: `/clients/${clientForBasicUpdate}`,
        status: 'pending',
        curl: `curl -X PUT "${API_URL}/clients/${clientForBasicUpdate}" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(clientTypeUpdateData, null, 2)}'`,
        requestBody: clientTypeUpdateData,
        response: null,
        error: null,
        responseTime: null
      };

      const startTime6 = Date.now();
      try {
        const response = await fetch(`${API_URL}/clients/${clientForBasicUpdate}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(clientTypeUpdateData)
        });
        const data = await response.json();
        clientTypeUpdateTest.responseTime = Date.now() - startTime6;
        clientTypeUpdateTest.status = response.ok && data.success ? 'success' : 'failed';
        clientTypeUpdateTest.response = data;
        if (!response.ok || !data.success) {
          clientTypeUpdateTest.error = data.error?.message || 'Failed to update client type';
        }
      } catch (error) {
        clientTypeUpdateTest.status = 'failed';
        clientTypeUpdateTest.error = error.message;
        clientTypeUpdateTest.responseTime = Date.now() - startTime6;
      }
      grouped.PUT.push(clientTypeUpdateTest);
      allTests.push(clientTypeUpdateTest);
      setGroupedTests({...grouped});

      // POST Test for notes endpoint
      const noteData = {
        note: 'Test note - Client interested in waterfront properties',
        type: 'follow-up'
      };

      const addNoteTest = {
        name: 'Add Client Note',
        description: 'Test adding a note to the client',
        method: 'POST',
        endpoint: `/clients/${clientForDetailTests}/notes`,
        status: 'pending',
        curl: `curl -X POST "${API_URL}/clients/${clientForDetailTests}/notes" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(noteData, null, 2)}'`,
        requestBody: noteData,
        response: null,
        error: null,
        responseTime: null
      };

      const startTime7 = Date.now();
      try {
        const response = await fetch(`${API_URL}/clients/${clientForDetailTests}/notes`, {
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
      grouped.POST.push(addNoteTest);
      allTests.push(addNoteTest);
      setGroupedTests({...grouped});

      // ========================================
      // DELETE REQUESTS - Clean up ALL test clients
      // ========================================

      // Archive then delete all 3 created test clients
      for (let i = 0; i < createdClientIds.length; i++) {
        const clientId = createdClientIds[i];

        // Step 1: Archive the client first
        const archiveTest = {
          name: `Archive Test Client ${i + 1}`,
          description: i === 0 ? 'Archive minimal client' : i === 1 ? 'Archive basic client' : 'Archive full client',
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
            headers: { 'Authorization': `Bearer ${token}` }
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

        // Step 2: Delete the archived client
        const deleteTest = {
          name: `Delete Archived Client ${i + 1}`,
          description: i === 0 ? 'Delete archived minimal client' : i === 1 ? 'Delete archived basic client' : 'Delete archived full client',
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
            headers: { 'Authorization': `Bearer ${token}` }
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

      // Clear the test client IDs after deletion
      setTestClientId(null);
      setTestClientIds([]);

      // Verify all clients were deleted
      if (createdClientIds.length > 0) {
        const verifyDeleteTest = {
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

        const startTimeVerify = Date.now();
        try {
          const response = await fetch(`${API_URL}/clients/${createdClientIds[0]}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          verifyDeleteTest.responseTime = Date.now() - startTimeVerify;
          // This should fail (404) for the test to pass
          verifyDeleteTest.status = response.status === 404 || (data.success === false && data.error?.code === 'NOT_FOUND') ? 'success' : 'failed';
          verifyDeleteTest.response = data;
          if (response.ok && data.success) {
            verifyDeleteTest.error = 'Client still exists after deletion';
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

  // Clean up any test clients on unmount
  useEffect(() => {
    return () => {
      const clientsToDelete = testClientIds.length > 0 ? testClientIds : (testClientId ? [testClientId] : []);

      if (clientsToDelete.length > 0) {
        const token = localStorage.getItem('crm_auth_token') ||
                     localStorage.getItem('authToken') ||
                     localStorage.getItem('token');

        let API_URL = process.env.REACT_APP_API_URL || 'https://api.jaydenmetz.com';
        if (!API_URL.endsWith('/v1')) {
          API_URL = API_URL.replace(/\/$/, '') + '/v1';
        }

        // Clean up all test clients
        clientsToDelete.forEach(async clientId => {
          try {
            // Archive first
            await fetch(`${API_URL}/clients/${clientId}/archive`, {
              method: 'PUT',
              headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            // Then delete
            await fetch(`${API_URL}/clients/${clientId}`, {
              method: 'DELETE',
              headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
          } catch (error) {
            // Ignore cleanup errors
          }
        });
      }
    };
  }, [testClientId, testClientIds]);

  // Run tests on mount
  useEffect(() => {
    runAllTests();
  }, [runAllTests]);

  const successCount = tests.filter(t => t.status === 'success').length;
  const failedCount = tests.filter(t => t.status === 'failed').length;

  const copyAllData = () => {
    const allData = {
      dashboard: 'Clients API Health Check',
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
                Clients API Health Check
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Comprehensive testing of all client endpoints • Last refresh: {lastRefresh || 'Loading...'}
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
              {testClientId && (
                <Tooltip title="Clean Up Test Client">
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
                        await fetch(`${API_URL}/clients/${testClientId}`, {
                          method: 'DELETE',
                          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                        });
                        setTestClientId(null);
                        setSnackbarMessage('Test client cleaned up');
                        setSnackbarOpen(true);
                      } catch (error) {
                        setSnackbarMessage('Failed to clean up test client');
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

export default ClientsHealthDashboard;