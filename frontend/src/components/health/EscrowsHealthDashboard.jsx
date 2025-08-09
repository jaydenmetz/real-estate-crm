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
  Divider
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
    
    // Format curl command for readability
    const parts = test.curl.split(' ');
    let formatted = 'curl';
    
    for (let i = 1; i < parts.length; i++) {
      if (parts[i].startsWith('-')) {
        formatted += ' \\\n  ' + parts[i];
      } else {
        formatted += ' ' + parts[i];
      }
    }
    
    return formatted;
  };

  const formatResponse = () => {
    if (!test.response) return 'No response';
    
    try {
      const parsed = typeof test.response === 'string' 
        ? JSON.parse(test.response) 
        : test.response;
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

const EscrowsHealthDashboard = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [testEscrowId, setTestEscrowId] = useState(null);

  const runAllTests = useCallback(async () => {
    setLoading(true);
    setTests([]);
    let API_URL = process.env.REACT_APP_API_URL || 'https://api.jaydenmetz.com';
    // Ensure API URL has /v1 suffix
    if (!API_URL.endsWith('/v1')) {
      API_URL = API_URL.replace(/\/$/, '') + '/v1';
    }
    
    // Get auth token
    const token = localStorage.getItem('crm_auth_token') || 
                 localStorage.getItem('authToken') ||
                 localStorage.getItem('token');

    const testSuite = [];
    let createdEscrowId = null;

    // Test 1: GET all escrows
    const getAllTest = {
      name: 'Get All Escrows',
      description: 'Fetch all escrows from the database',
      method: 'GET',
      endpoint: '/escrows',
      status: 'pending',
      curl: `curl -X GET "${API_URL}/escrows" -H "Authorization: Bearer ${token || 'YOUR_JWT_TOKEN'}"`,
      response: null,
      error: null,
      responseTime: null
    };

    const startTime1 = Date.now();
    try {
      const response = await fetch(`${API_URL}/escrows`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      getAllTest.responseTime = Date.now() - startTime1;
      getAllTest.status = response.ok && data.success ? 'success' : 'failed';
      getAllTest.response = data;
      if (!response.ok || !data.success) {
        getAllTest.error = data.error?.message || 'Failed to fetch escrows';
      }
    } catch (error) {
      getAllTest.status = 'failed';
      getAllTest.error = error.message;
      getAllTest.responseTime = Date.now() - startTime1;
    }
    testSuite.push(getAllTest);
    setTests([...testSuite]);

    // Test 2: GET escrows with pagination
    const getPaginatedTest = {
      name: 'Get Escrows with Pagination',
      description: 'Test pagination parameters (page=1, limit=5)',
      method: 'GET',
      endpoint: '/escrows?page=1&limit=5',
      status: 'pending',
      curl: `curl -X GET "${API_URL}/escrows?page=1&limit=5" -H "Authorization: Bearer ${token || 'YOUR_JWT_TOKEN'}"`,
      response: null,
      error: null,
      responseTime: null
    };

    const startTime2 = Date.now();
    try {
      const response = await fetch(`${API_URL}/escrows?page=1&limit=5`, {
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
    testSuite.push(getPaginatedTest);
    setTests([...testSuite]);

    // Test 3: POST - Create test escrow
    const testEscrowData = {
      property_address: `Test Property ${Date.now()}`,
      city: 'Test City',
      state: 'CA',
      zip_code: '90210',
      purchase_price: 500000,
      escrow_status: 'Active',
      acceptance_date: new Date().toISOString().split('T')[0],
      closing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      net_commission: 12500,
      commission_percentage: 2.5,
      property_type: 'Single Family',
      escrow_company: 'Test Escrow Company',
      escrow_officer_name: 'Test Officer',
      escrow_officer_email: 'test@escrow.com'
    };

    const createTest = {
      name: 'Create Test Escrow',
      description: 'Create a new test escrow record',
      method: 'POST',
      endpoint: '/escrows',
      status: 'pending',
      curl: `curl -X POST "${API_URL}/escrows" -H "Authorization: Bearer ${token || 'YOUR_JWT_TOKEN'}" -H "Content-Type: application/json" -d '${JSON.stringify(testEscrowData)}'`,
      requestBody: testEscrowData,
      response: null,
      error: null,
      responseTime: null
    };

    const startTime3 = Date.now();
    if (token) {
      try {
        const response = await fetch(`${API_URL}/escrows`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(testEscrowData)
        });
        const data = await response.json();
        createTest.responseTime = Date.now() - startTime3;
        createTest.status = response.ok && data.success ? 'success' : 'failed';
        createTest.response = data;
        if (data.success && data.data) {
          createdEscrowId = data.data.id;
          setTestEscrowId(createdEscrowId);
        } else {
          createTest.error = data.error?.message || 'Failed to create escrow';
        }
      } catch (error) {
        createTest.status = 'failed';
        createTest.error = error.message;
        createTest.responseTime = Date.now() - startTime3;
      }
    } else {
      createTest.status = 'failed';
      createTest.error = 'No authentication token available';
    }
    testSuite.push(createTest);
    setTests([...testSuite]);

    // Continue with tests if we created an escrow
    if (createdEscrowId) {
      // Test 4: GET single escrow
      const getSingleTest = {
        name: 'Get Single Escrow',
        description: 'Fetch the test escrow by ID',
        method: 'GET',
        endpoint: `/escrows/${createdEscrowId}`,
        status: 'pending',
        curl: `curl -X GET "${API_URL}/escrows/${createdEscrowId}" -H "Authorization: Bearer ${token || 'YOUR_JWT_TOKEN'}"`,
        response: null,
        error: null,
        responseTime: null
      };

      const startTime4 = Date.now();
      try {
        const response = await fetch(`${API_URL}/escrows/${createdEscrowId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        getSingleTest.responseTime = Date.now() - startTime4;
        getSingleTest.status = response.ok && data.success ? 'success' : 'failed';
        getSingleTest.response = data;
        if (!response.ok || !data.success) {
          getSingleTest.error = data.error?.message || 'Failed to fetch escrow';
        }
      } catch (error) {
        getSingleTest.status = 'failed';
        getSingleTest.error = error.message;
        getSingleTest.responseTime = Date.now() - startTime4;
      }
      testSuite.push(getSingleTest);
      setTests([...testSuite]);

      // Test 5: PUT - Update escrow
      const updateData = {
        purchase_price: 550000,
        escrow_status: 'Pending',
        escrow_officer_name: 'Updated Officer Name'
      };

      const updateTest = {
        name: 'Update Escrow',
        description: 'Update the test escrow with new data',
        method: 'PUT',
        endpoint: `/escrows/${createdEscrowId}`,
        status: 'pending',
        curl: `curl -X PUT "${API_URL}/escrows/${createdEscrowId}" -H "Authorization: Bearer ${token || 'YOUR_JWT_TOKEN'}" -H "Content-Type: application/json" -d '${JSON.stringify(updateData)}'`,
        requestBody: updateData,
        response: null,
        error: null,
        responseTime: null
      };

      const startTime5 = Date.now();
      try {
        const response = await fetch(`${API_URL}/escrows/${createdEscrowId}`, {
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
          updateTest.error = data.error?.message || 'Failed to update escrow';
        }
      } catch (error) {
        updateTest.status = 'failed';
        updateTest.error = error.message;
        updateTest.responseTime = Date.now() - startTime5;
      }
      testSuite.push(updateTest);
      setTests([...testSuite]);

      // Test 6: PUT - Update checklists
      const checklistData = {
        loan: {
          preApproval: { checked: true, date: new Date().toISOString() },
          loanApplication: { checked: true, date: new Date().toISOString() }
        },
        house: {
          inspection: { checked: false },
          appraisal: { checked: false }
        }
      };

      const updateChecklistTest = {
        name: 'Update Escrow Checklists',
        description: 'Update the test escrow checklists',
        method: 'PUT',
        endpoint: `/escrows/${createdEscrowId}/checklists`,
        status: 'pending',
        curl: `curl -X PUT "${API_URL}/escrows/${createdEscrowId}/checklists" -H "Authorization: Bearer ${token || 'YOUR_JWT_TOKEN'}" -H "Content-Type: application/json" -d '${JSON.stringify(checklistData)}'`,
        requestBody: checklistData,
        response: null,
        error: null,
        responseTime: null
      };

      const startTime6 = Date.now();
      try {
        const response = await fetch(`${API_URL}/escrows/${createdEscrowId}/checklists`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(checklistData)
        });
        const data = await response.json();
        updateChecklistTest.responseTime = Date.now() - startTime6;
        updateChecklistTest.status = response.ok && data.success ? 'success' : 'failed';
        updateChecklistTest.response = data;
        if (!response.ok || !data.success) {
          updateChecklistTest.error = data.error?.message || 'Failed to update checklists';
        }
      } catch (error) {
        updateChecklistTest.status = 'failed';
        updateChecklistTest.error = error.message;
        updateChecklistTest.responseTime = Date.now() - startTime6;
      }
      testSuite.push(updateChecklistTest);
      setTests([...testSuite]);

      // Test 7: PUT - Update people
      const peopleData = {
        buyers: [
          { name: 'Test Buyer', email: 'buyer@test.com', phone: '555-0001' }
        ],
        sellers: [
          { name: 'Test Seller', email: 'seller@test.com', phone: '555-0002' }
        ],
        agents: [
          { name: 'Listing Agent', email: 'listing@test.com', role: 'listing' }
        ]
      };

      const updatePeopleTest = {
        name: 'Update Escrow People',
        description: 'Update buyers, sellers, and agents',
        method: 'PUT',
        endpoint: `/escrows/${createdEscrowId}/people`,
        status: 'pending',
        curl: `curl -X PUT "${API_URL}/escrows/${createdEscrowId}/people" -H "Authorization: Bearer ${token || 'YOUR_JWT_TOKEN'}" -H "Content-Type: application/json" -d '${JSON.stringify(peopleData)}'`,
        requestBody: peopleData,
        response: null,
        error: null,
        responseTime: null
      };

      const startTime7 = Date.now();
      try {
        const response = await fetch(`${API_URL}/escrows/${createdEscrowId}/people`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(peopleData)
        });
        const data = await response.json();
        updatePeopleTest.responseTime = Date.now() - startTime7;
        updatePeopleTest.status = response.ok && data.success ? 'success' : 'failed';
        updatePeopleTest.response = data;
        if (!response.ok || !data.success) {
          updatePeopleTest.error = data.error?.message || 'Failed to update people';
        }
      } catch (error) {
        updatePeopleTest.status = 'failed';
        updatePeopleTest.error = error.message;
        updatePeopleTest.responseTime = Date.now() - startTime7;
      }
      testSuite.push(updatePeopleTest);
      setTests([...testSuite]);

      // Test 8: DELETE - Delete test escrow
      const deleteTest = {
        name: 'Delete Test Escrow',
        description: 'Clean up by deleting the test escrow',
        method: 'DELETE',
        endpoint: `/escrows/${createdEscrowId}`,
        status: 'pending',
        curl: `curl -X DELETE "${API_URL}/escrows/${createdEscrowId}" -H "Authorization: Bearer ${token || 'YOUR_JWT_TOKEN'}"`,
        response: null,
        error: null,
        responseTime: null
      };

      const startTime8 = Date.now();
      try {
        const response = await fetch(`${API_URL}/escrows/${createdEscrowId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        deleteTest.responseTime = Date.now() - startTime8;
        deleteTest.status = response.ok && data.success ? 'success' : 'failed';
        deleteTest.response = data;
        if (!response.ok || !data.success) {
          deleteTest.error = data.error?.message || 'Failed to delete escrow';
        } else {
          setTestEscrowId(null);
        }
      } catch (error) {
        deleteTest.status = 'failed';
        deleteTest.error = error.message;
        deleteTest.responseTime = Date.now() - startTime8;
      }
      testSuite.push(deleteTest);
      setTests([...testSuite]);

      // Test 9: Verify deletion
      const verifyDeleteTest = {
        name: 'Verify Deletion',
        description: 'Confirm the test escrow no longer exists',
        method: 'GET',
        endpoint: `/escrows/${createdEscrowId}`,
        status: 'pending',
        curl: `curl -X GET "${API_URL}/escrows/${createdEscrowId}" -H "Authorization: Bearer ${token || 'YOUR_JWT_TOKEN'}"`,
        response: null,
        error: null,
        responseTime: null
      };

      const startTime9 = Date.now();
      try {
        const response = await fetch(`${API_URL}/escrows/${createdEscrowId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        verifyDeleteTest.responseTime = Date.now() - startTime9;
        // This should fail (404) for the test to pass
        verifyDeleteTest.status = response.status === 404 || (data.success === false && data.error?.code === 'NOT_FOUND') ? 'success' : 'failed';
        verifyDeleteTest.response = data;
        if (response.ok && data.success) {
          verifyDeleteTest.error = 'Escrow still exists after deletion';
        }
      } catch (error) {
        verifyDeleteTest.status = 'failed';
        verifyDeleteTest.error = error.message;
        verifyDeleteTest.responseTime = Date.now() - startTime9;
      }
      testSuite.push(verifyDeleteTest);
      setTests([...testSuite]);
    }

    setLoading(false);
    setLastRefresh(new Date().toLocaleString());
  }, []);

  // Clean up any test escrow on unmount
  useEffect(() => {
    return () => {
      if (testEscrowId) {
        const token = localStorage.getItem('crm_auth_token') || 
                     localStorage.getItem('authToken') ||
                     localStorage.getItem('token');
        
        let API_URL = process.env.REACT_APP_API_URL || 'https://api.jaydenmetz.com';
        if (!API_URL.endsWith('/v1')) {
          API_URL = API_URL.replace(/\/$/, '') + '/v1';
        }
        
        // Clean up test escrow if it exists
        fetch(`${API_URL}/escrows/${testEscrowId}`, {
          method: 'DELETE',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        }).catch(() => {
          // Ignore cleanup errors
        });
      }
    };
  }, [testEscrowId]);

  // Run tests on mount
  useEffect(() => {
    runAllTests();
  }, [runAllTests]);

  const successCount = tests.filter(t => t.status === 'success').length;
  const failedCount = tests.filter(t => t.status === 'failed').length;

  const copyAllData = () => {
    const allData = {
      dashboard: 'Escrows API Health Check',
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
                Escrows API Health Check
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Comprehensive testing of all escrow endpoints • Last refresh: {lastRefresh || 'Loading...'}
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
              {testEscrowId && (
                <Tooltip title="Clean Up Test Escrow">
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
                        await fetch(`${API_URL}/escrows/${testEscrowId}`, {
                          method: 'DELETE',
                          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                        });
                        setTestEscrowId(null);
                        setSnackbarMessage('Test escrow cleaned up');
                        setSnackbarOpen(true);
                      } catch (error) {
                        setSnackbarMessage('Failed to clean up test escrow');
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
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#ffebee' }}>
                <Typography variant="h4" fontWeight="bold" color="#f44336">
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
            {tests.map((test, index) => (
              <TestItem key={index} test={test} />
            ))}
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

export default EscrowsHealthDashboard;