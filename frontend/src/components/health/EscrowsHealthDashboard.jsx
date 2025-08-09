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
      if (test.status === 'success' && test.method === 'GET' && parsed.data?.escrows) {
        return JSON.stringify({
          success: parsed.success,
          data: {
            escrows: `[${parsed.data.escrows.length} escrows]`,
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

const EscrowsHealthDashboard = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [testEscrowId, setTestEscrowId] = useState(null);
  const [testEscrowIds, setTestEscrowIds] = useState([]);
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
    let createdEscrowId = null;

    // ========================================
    // GET REQUESTS - Run these first
    // ========================================

    // GET Test 1: Get all escrows
    const getAllTest = {
      name: 'List All Escrows',
      description: 'Retrieve all escrows from the database',
      method: 'GET',
      endpoint: '/escrows',
      status: 'pending',
      curl: `curl -X GET "${API_URL}/escrows" -H "Authorization: Bearer ${token}"`,
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
    grouped.GET.push(getAllTest);
    allTests.push(getAllTest);
    setGroupedTests({...grouped});

    // GET Test 2: Get with pagination
    const getPaginatedTest = {
      name: 'List with Pagination',
      description: 'Test pagination parameters (page=1, limit=5)',
      method: 'GET',
      endpoint: '/escrows?page=1&limit=5',
      status: 'pending',
      curl: `curl -X GET "${API_URL}/escrows?page=1&limit=5" -H "Authorization: Bearer ${token}"`,
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
    grouped.GET.push(getPaginatedTest);
    allTests.push(getPaginatedTest);
    setGroupedTests({...grouped});

    // GET Test 3: Get first escrow by ID (if any exist)
    let existingEscrowId = null;
    if (getAllTest.status === 'success' && getAllTest.response?.data?.escrows?.length > 0) {
      existingEscrowId = getAllTest.response.data.escrows[0].id;
      
      const getByIdTest = {
        name: 'Get Escrow by ID',
        description: 'Retrieve a specific escrow using its ID',
        method: 'GET',
        endpoint: `/escrows/${existingEscrowId}`,
        status: 'pending',
        curl: `curl -X GET "${API_URL}/escrows/${existingEscrowId}" -H "Authorization: Bearer ${token}"`,
        response: null,
        error: null,
        responseTime: null
      };

      const startTime3 = Date.now();
      try {
        const response = await fetch(`${API_URL}/escrows/${existingEscrowId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        getByIdTest.responseTime = Date.now() - startTime3;
        getByIdTest.status = response.ok && data.success ? 'success' : 'failed';
        getByIdTest.response = data;
        if (!response.ok || !data.success) {
          getByIdTest.error = data.error?.message || 'Failed to fetch escrow';
        }
      } catch (error) {
        getByIdTest.status = 'failed';
        getByIdTest.error = error.message;
        getByIdTest.responseTime = Date.now() - startTime3;
      }
      grouped.GET.push(getByIdTest);
      allTests.push(getByIdTest);
      setGroupedTests({...grouped});

      // ========================================
      // GET SUB-ENDPOINTS - Test all the detail endpoints
      // ========================================

      // Array of sub-endpoints to test
      const subEndpoints = [
        { name: 'Get Details', endpoint: 'details', description: 'Retrieve core escrow information' },
        { name: 'Get People', endpoint: 'people', description: 'Retrieve buyers, sellers, and agents' },
        { name: 'Get Timeline', endpoint: 'timeline', description: 'Retrieve important dates and milestones' },
        { name: 'Get Financials', endpoint: 'financials', description: 'Retrieve commission and financial details' },
        { name: 'Get Loan Checklist', endpoint: 'checklist-loan', description: 'Retrieve loan checklist items' },
        { name: 'Get House Checklist', endpoint: 'checklist-house', description: 'Retrieve house checklist items' },
        { name: 'Get Admin Checklist', endpoint: 'checklist-admin', description: 'Retrieve admin checklist items' },
        { name: 'Get Documents', endpoint: 'documents', description: 'Retrieve associated documents' },
        { name: 'Get Property Details', endpoint: 'property-details', description: 'Retrieve detailed property information' }
      ];

      for (const sub of subEndpoints) {
        const subTest = {
          name: sub.name,
          description: sub.description,
          method: 'GET',
          endpoint: `/escrows/${existingEscrowId}/${sub.endpoint}`,
          status: 'pending',
          curl: `curl -X GET "${API_URL}/escrows/${existingEscrowId}/${sub.endpoint}" -H "Authorization: Bearer ${token}"`,
          response: null,
          error: null,
          responseTime: null
        };

        const startTime = Date.now();
        try {
          const response = await fetch(`${API_URL}/escrows/${existingEscrowId}/${sub.endpoint}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          subTest.responseTime = Date.now() - startTime;
          subTest.status = response.ok && data.success ? 'success' : 'failed';
          subTest.response = data;
          if (!response.ok || !data.success) {
            subTest.error = data.error?.message || `Failed to fetch ${sub.endpoint}`;
          }
        } catch (error) {
          subTest.status = 'failed';
          subTest.error = error.message;
          subTest.responseTime = Date.now() - startTime;
        }
        grouped.GET.push(subTest);
        allTests.push(subTest);
        setGroupedTests({...grouped});
      }
    }

    // ========================================
    // POST REQUESTS - 3 Different Tests
    // ========================================
    const createdEscrowIds = [];

    // POST Test 1: Minimal (Address Only)
    const minimalEscrowData = {
      property_address: `${Date.now()} Minimal Test St, Suite 1`
    };

    const createMinimalTest = {
      name: 'Create Escrow (Minimal)',
      description: 'Test with only required field (property_address)',
      method: 'POST',
      endpoint: '/escrows',
      status: 'pending',
      curl: `curl -X POST "${API_URL}/escrows" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(minimalEscrowData, null, 2)}'`,
      requestBody: minimalEscrowData,
      response: null,
      error: null,
      responseTime: null
    };

    if (token) {
      const startTimeMinimal = Date.now();
      try {
        const response = await fetch(`${API_URL}/escrows`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(minimalEscrowData)
        });
        const data = await response.json();
        createMinimalTest.responseTime = Date.now() - startTimeMinimal;
        createMinimalTest.status = response.ok && data.success ? 'success' : 'failed';
        createMinimalTest.response = data;
        if (data.success && data.data) {
          createdEscrowIds.push(data.data.id);
        } else {
          createMinimalTest.error = data.error?.message || 'Failed to create minimal escrow';
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
    const basicEscrowData = {
      property_address: `${Date.now()} Basic Test Ave, Unit 2`,
      city: 'Los Angeles',
      state: 'CA',
      zip_code: '90001',
      purchase_price: 750000,
      escrow_status: 'Active',
      closing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    const createBasicTest = {
      name: 'Create Escrow (Basic)',
      description: 'Test with essential fields',
      method: 'POST',
      endpoint: '/escrows',
      status: 'pending',
      curl: `curl -X POST "${API_URL}/escrows" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(basicEscrowData, null, 2)}'`,
      requestBody: basicEscrowData,
      response: null,
      error: null,
      responseTime: null
    };

    if (token) {
      const startTimeBasic = Date.now();
      try {
        const response = await fetch(`${API_URL}/escrows`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(basicEscrowData)
        });
        const data = await response.json();
        createBasicTest.responseTime = Date.now() - startTimeBasic;
        createBasicTest.status = response.ok && data.success ? 'success' : 'failed';
        createBasicTest.response = data;
        if (data.success && data.data) {
          createdEscrowIds.push(data.data.id);
        } else {
          createBasicTest.error = data.error?.message || 'Failed to create basic escrow';
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
    const fullEscrowData = {
      property_address: `${Date.now()} Full Test Blvd, Suite 3`,
      city: 'San Francisco',
      state: 'CA',
      zip_code: '94105',
      purchase_price: 1250000,
      earnest_money_deposit: 50000,
      commission_percentage: 2.5,
      net_commission: 31250,
      escrow_status: 'Active',
      acceptance_date: new Date().toISOString().split('T')[0],
      closing_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      property_type: 'Condo',
      escrow_company: 'Premier Escrow Services',
      escrow_officer_name: 'Jane Smith',
      escrow_officer_email: 'jane@premierescrow.com',
      escrow_officer_phone: '(555) 123-4567',
      loan_officer_name: 'John Doe',
      loan_officer_email: 'john@lender.com',
      loan_officer_phone: '(555) 987-6543',
      title_company: 'First American Title',
      transaction_type: 'Purchase',
      lead_source: 'Zillow'
    };

    const createFullTest = {
      name: 'Create Escrow (Full)',
      description: 'Test with all available fields',
      method: 'POST',
      endpoint: '/escrows',
      status: 'pending',
      curl: `curl -X POST "${API_URL}/escrows" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(fullEscrowData, null, 2)}'`,
      requestBody: fullEscrowData,
      response: null,
      error: null,
      responseTime: null
    };

    if (token) {
      const startTimeFull = Date.now();
      try {
        const response = await fetch(`${API_URL}/escrows`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(fullEscrowData)
        });
        const data = await response.json();
        createFullTest.responseTime = Date.now() - startTimeFull;
        createFullTest.status = response.ok && data.success ? 'success' : 'failed';
        createFullTest.response = data;
        if (data.success && data.data) {
          createdEscrowIds.push(data.data.id);
        } else {
          createFullTest.error = data.error?.message || 'Failed to create full escrow';
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

    // Set the first created escrow as the primary one for testing
    if (createdEscrowIds.length > 0) {
      createdEscrowId = createdEscrowIds[0];
      setTestEscrowId(createdEscrowId);
      setTestEscrowIds(createdEscrowIds);
    }

    // ========================================
    // PUT REQUESTS - Use different test escrows for comprehensive testing
    // ========================================

    if (createdEscrowIds.length > 0) {
      // Use different escrows for different tests
      const escrowForBasicUpdate = createdEscrowIds[0] || null;
      const escrowForDetailTests = createdEscrowIds[1] || createdEscrowIds[0] || null;
      const escrowForChecklistTests = createdEscrowIds[2] || createdEscrowIds[0] || null;
      // PUT Test 1: Update escrow basic info
      const updateData = {
        purchase_price: 550000,
        escrow_status: 'Pending',
        escrow_officer_name: 'Updated Officer Name'
      };

      const updateTest = {
        name: 'Update Escrow by ID',
        description: 'Update basic escrow information',
        method: 'PUT',
        endpoint: `/escrows/${escrowForBasicUpdate}`,
        status: 'pending',
        curl: `curl -X PUT "${API_URL}/escrows/${escrowForBasicUpdate}" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(updateData, null, 2)}'`,
        requestBody: updateData,
        response: null,
        error: null,
        responseTime: null
      };

      const startTime5 = Date.now();
      try {
        const response = await fetch(`${API_URL}/escrows/${escrowForBasicUpdate}`, {
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
      grouped.PUT.push(updateTest);
      allTests.push(updateTest);
      setGroupedTests({...grouped});

      // PUT Test 2: Update people
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
        name: 'Update People',
        description: 'Update buyers, sellers, and agents',
        method: 'PUT',
        endpoint: `/escrows/${escrowForBasicUpdate}/people`,
        status: 'pending',
        curl: `curl -X PUT "${API_URL}/escrows/${escrowForBasicUpdate}/people" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(peopleData, null, 2)}'`,
        requestBody: peopleData,
        response: null,
        error: null,
        responseTime: null
      };

      const startTime6 = Date.now();
      try {
        const response = await fetch(`${API_URL}/escrows/${escrowForBasicUpdate}/people`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(peopleData)
        });
        const data = await response.json();
        updatePeopleTest.responseTime = Date.now() - startTime6;
        updatePeopleTest.status = response.ok && data.success ? 'success' : 'failed';
        updatePeopleTest.response = data;
        if (!response.ok || !data.success) {
          updatePeopleTest.error = data.error?.message || 'Failed to update people';
        }
      } catch (error) {
        updatePeopleTest.status = 'failed';
        updatePeopleTest.error = error.message;
        updatePeopleTest.responseTime = Date.now() - startTime6;
      }
      grouped.PUT.push(updatePeopleTest);
      allTests.push(updatePeopleTest);
      setGroupedTests({...grouped});

      // PUT Test 3: Update timeline
      const timelineData = {
        emdDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        inspectionContingencyDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        appraisalContingencyDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        loanContingencyDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      const updateTimelineTest = {
        name: 'Update Timeline',
        description: 'Update escrow timeline dates',
        method: 'PUT',
        endpoint: `/escrows/${escrowForDetailTests}/timeline`,
        status: 'pending',
        curl: `curl -X PUT "${API_URL}/escrows/${escrowForDetailTests}/timeline" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(timelineData, null, 2)}'`,
        requestBody: timelineData,
        response: null,
        error: null,
        responseTime: null
      };

      const startTime7 = Date.now();
      try {
        const response = await fetch(`${API_URL}/escrows/${escrowForDetailTests}/timeline`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(timelineData)
        });
        const data = await response.json();
        updateTimelineTest.responseTime = Date.now() - startTime7;
        updateTimelineTest.status = response.ok && data.success ? 'success' : 'failed';
        updateTimelineTest.response = data;
        if (!response.ok || !data.success) {
          updateTimelineTest.error = data.error?.message || 'Failed to update timeline';
        }
      } catch (error) {
        updateTimelineTest.status = 'failed';
        updateTimelineTest.error = error.message;
        updateTimelineTest.responseTime = Date.now() - startTime7;
      }
      grouped.PUT.push(updateTimelineTest);
      allTests.push(updateTimelineTest);
      setGroupedTests({...grouped});

      // PUT Test 4: Update financials
      const financialsData = {
        commissionPercentage: 3,
        baseCommission: 16500,
        grossCommission: 16500,
        franchiseFeePercentage: 6,
        splitPercentage: 80,
        transactionFee: 395
      };

      const updateFinancialsTest = {
        name: 'Update Financials',
        description: 'Update commission and financial details',
        method: 'PUT',
        endpoint: `/escrows/${escrowForDetailTests}/financials`,
        status: 'pending',
        curl: `curl -X PUT "${API_URL}/escrows/${escrowForDetailTests}/financials" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(financialsData, null, 2)}'`,
        requestBody: financialsData,
        response: null,
        error: null,
        responseTime: null
      };

      const startTime8 = Date.now();
      try {
        const response = await fetch(`${API_URL}/escrows/${escrowForDetailTests}/financials`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(financialsData)
        });
        const data = await response.json();
        updateFinancialsTest.responseTime = Date.now() - startTime8;
        updateFinancialsTest.status = response.ok && data.success ? 'success' : 'failed';
        updateFinancialsTest.response = data;
        if (!response.ok || !data.success) {
          updateFinancialsTest.error = data.error?.message || 'Failed to update financials';
        }
      } catch (error) {
        updateFinancialsTest.status = 'failed';
        updateFinancialsTest.error = error.message;
        updateFinancialsTest.responseTime = Date.now() - startTime8;
      }
      grouped.PUT.push(updateFinancialsTest);
      allTests.push(updateFinancialsTest);
      setGroupedTests({...grouped});

      // PUT Test 5: Update property details
      const propertyDetailsData = {
        bedrooms: 4,
        bathrooms: 2.5,
        squareFeet: 2500,
        yearBuilt: 2015,
        lotSizeSqft: 7500,
        propertyType: 'Single Family',
        pool: true,
        garageSpaces: 2
      };

      const updatePropertyDetailsTest = {
        name: 'Update Property Details',
        description: 'Update property specifications',
        method: 'PUT',
        endpoint: `/escrows/${escrowForDetailTests}/property-details`,
        status: 'pending',
        curl: `curl -X PUT "${API_URL}/escrows/${escrowForDetailTests}/property-details" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(propertyDetailsData, null, 2)}'`,
        requestBody: propertyDetailsData,
        response: null,
        error: null,
        responseTime: null
      };

      const startTime9 = Date.now();
      try {
        const response = await fetch(`${API_URL}/escrows/${escrowForDetailTests}/property-details`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(propertyDetailsData)
        });
        const data = await response.json();
        updatePropertyDetailsTest.responseTime = Date.now() - startTime9;
        updatePropertyDetailsTest.status = response.ok && data.success ? 'success' : 'failed';
        updatePropertyDetailsTest.response = data;
        if (!response.ok || !data.success) {
          updatePropertyDetailsTest.error = data.error?.message || 'Failed to update property details';
        }
      } catch (error) {
        updatePropertyDetailsTest.status = 'failed';
        updatePropertyDetailsTest.error = error.message;
        updatePropertyDetailsTest.responseTime = Date.now() - startTime9;
      }
      grouped.PUT.push(updatePropertyDetailsTest);
      allTests.push(updatePropertyDetailsTest);
      setGroupedTests({...grouped});

      // PUT Test 7: Update Details
      const detailsData = {
        escrowStatus: 'Active',
        purchasePrice: 600000,
        earnestMoneyDeposit: 30000,
        myCommission: 15000,
        escrowCompany: 'Updated Escrow Co',
        titleCompany: 'Updated Title Co'
      };

      const updateDetailsTest = {
        name: 'Update Details',
        description: 'Update core escrow details',
        method: 'PUT',
        endpoint: `/escrows/${escrowForDetailTests}/details`,
        status: 'pending',
        curl: `curl -X PUT "${API_URL}/escrows/${escrowForDetailTests}/details" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(detailsData, null, 2)}'`,
        requestBody: detailsData,
        response: null,
        error: null,
        responseTime: null
      };

      const startTimeDetails = Date.now();
      try {
        const response = await fetch(`${API_URL}/escrows/${escrowForDetailTests}/details`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(detailsData)
        });
        const data = await response.json();
        updateDetailsTest.responseTime = Date.now() - startTimeDetails;
        updateDetailsTest.status = response.ok && data.success ? 'success' : 'failed';
        updateDetailsTest.response = data;
        if (!response.ok || !data.success) {
          updateDetailsTest.error = data.error?.message || 'Failed to update details';
        }
      } catch (error) {
        updateDetailsTest.status = 'failed';
        updateDetailsTest.error = error.message;
        updateDetailsTest.responseTime = Date.now() - startTimeDetails;
      }
      grouped.PUT.push(updateDetailsTest);
      allTests.push(updateDetailsTest);
      setGroupedTests({...grouped});

      // PUT Test 8: Update Loan Checklist
      const loanChecklistData = {
        le: true,
        lockedRate: true,
        appraisalOrdered: true,
        appraisalReceived: false,
        clearToClose: false
      };

      const updateLoanChecklistTest = {
        name: 'Update Loan Checklist',
        description: 'Update loan checklist items',
        method: 'PUT',
        endpoint: `/escrows/${escrowForChecklistTests}/checklist-loan`,
        status: 'pending',
        curl: `curl -X PUT "${API_URL}/escrows/${escrowForChecklistTests}/checklist-loan" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(loanChecklistData, null, 2)}'`,
        requestBody: loanChecklistData,
        response: null,
        error: null,
        responseTime: null
      };

      const startTimeLoan = Date.now();
      try {
        const response = await fetch(`${API_URL}/escrows/${escrowForChecklistTests}/checklist-loan`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(loanChecklistData)
        });
        const data = await response.json();
        updateLoanChecklistTest.responseTime = Date.now() - startTimeLoan;
        updateLoanChecklistTest.status = response.ok && data.success ? 'success' : 'failed';
        updateLoanChecklistTest.response = data;
        if (!response.ok || !data.success) {
          updateLoanChecklistTest.error = data.error?.message || 'Failed to update loan checklist';
        }
      } catch (error) {
        updateLoanChecklistTest.status = 'failed';
        updateLoanChecklistTest.error = error.message;
        updateLoanChecklistTest.responseTime = Date.now() - startTimeLoan;
      }
      grouped.PUT.push(updateLoanChecklistTest);
      allTests.push(updateLoanChecklistTest);
      setGroupedTests({...grouped});

      // PUT Test 9: Update House Checklist
      const houseChecklistData = {
        homeInspectionOrdered: true,
        emd: true,
        sellerDisclosures: false,
        rr: false,
        recorded: false
      };

      const updateHouseChecklistTest = {
        name: 'Update House Checklist',
        description: 'Update house checklist items',
        method: 'PUT',
        endpoint: `/escrows/${escrowForChecklistTests}/checklist-house`,
        status: 'pending',
        curl: `curl -X PUT "${API_URL}/escrows/${escrowForChecklistTests}/checklist-house" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(houseChecklistData, null, 2)}'`,
        requestBody: houseChecklistData,
        response: null,
        error: null,
        responseTime: null
      };

      const startTimeHouse = Date.now();
      try {
        const response = await fetch(`${API_URL}/escrows/${escrowForChecklistTests}/checklist-house`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(houseChecklistData)
        });
        const data = await response.json();
        updateHouseChecklistTest.responseTime = Date.now() - startTimeHouse;
        updateHouseChecklistTest.status = response.ok && data.success ? 'success' : 'failed';
        updateHouseChecklistTest.response = data;
        if (!response.ok || !data.success) {
          updateHouseChecklistTest.error = data.error?.message || 'Failed to update house checklist';
        }
      } catch (error) {
        updateHouseChecklistTest.status = 'failed';
        updateHouseChecklistTest.error = error.message;
        updateHouseChecklistTest.responseTime = Date.now() - startTimeHouse;
      }
      grouped.PUT.push(updateHouseChecklistTest);
      allTests.push(updateHouseChecklistTest);
      setGroupedTests({...grouped});

      // PUT Test 10: Update Admin Checklist
      const adminChecklistData = {
        mlsStatusUpdate: true,
        tcEmail: true,
        tcGlideInvite: false,
        addContactsToPhone: false,
        addContactsToNotion: false
      };

      const updateAdminChecklistTest = {
        name: 'Update Admin Checklist',
        description: 'Update admin checklist items',
        method: 'PUT',
        endpoint: `/escrows/${escrowForChecklistTests}/checklist-admin`,
        status: 'pending',
        curl: `curl -X PUT "${API_URL}/escrows/${escrowForChecklistTests}/checklist-admin" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(adminChecklistData, null, 2)}'`,
        requestBody: adminChecklistData,
        response: null,
        error: null,
        responseTime: null
      };

      const startTimeAdmin = Date.now();
      try {
        const response = await fetch(`${API_URL}/escrows/${escrowForChecklistTests}/checklist-admin`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(adminChecklistData)
        });
        const data = await response.json();
        updateAdminChecklistTest.responseTime = Date.now() - startTimeAdmin;
        updateAdminChecklistTest.status = response.ok && data.success ? 'success' : 'failed';
        updateAdminChecklistTest.response = data;
        if (!response.ok || !data.success) {
          updateAdminChecklistTest.error = data.error?.message || 'Failed to update admin checklist';
        }
      } catch (error) {
        updateAdminChecklistTest.status = 'failed';
        updateAdminChecklistTest.error = error.message;
        updateAdminChecklistTest.responseTime = Date.now() - startTimeAdmin;
      }
      grouped.PUT.push(updateAdminChecklistTest);
      allTests.push(updateAdminChecklistTest);
      setGroupedTests({...grouped});

      // PUT Test 11: Update Documents
      const documentsData = [
        {
          id: 'doc_1',
          name: 'Purchase Agreement',
          type: 'contract',
          uploadedAt: new Date().toISOString(),
          url: 'https://example.com/purchase-agreement.pdf'
        },
        {
          id: 'doc_2',
          name: 'Disclosure Package',
          type: 'disclosure',
          uploadedAt: new Date().toISOString(),
          url: 'https://example.com/disclosures.pdf'
        }
      ];

      const updateDocumentsTest = {
        name: 'Update Documents',
        description: 'Update documents array',
        method: 'PUT',
        endpoint: `/escrows/${escrowForChecklistTests}/documents`,
        status: 'pending',
        curl: `curl -X PUT "${API_URL}/escrows/${escrowForChecklistTests}/documents" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(documentsData, null, 2)}'`,
        requestBody: documentsData,
        response: null,
        error: null,
        responseTime: null
      };

      const startTimeDocs = Date.now();
      try {
        const response = await fetch(`${API_URL}/escrows/${escrowForChecklistTests}/documents`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(documentsData)
        });
        const data = await response.json();
        updateDocumentsTest.responseTime = Date.now() - startTimeDocs;
        updateDocumentsTest.status = response.ok && data.success ? 'success' : 'failed';
        updateDocumentsTest.response = data;
        if (!response.ok || !data.success) {
          updateDocumentsTest.error = data.error?.message || 'Failed to update documents';
        }
      } catch (error) {
        updateDocumentsTest.status = 'failed';
        updateDocumentsTest.error = error.message;
        updateDocumentsTest.responseTime = Date.now() - startTimeDocs;
      }
      grouped.PUT.push(updateDocumentsTest);
      allTests.push(updateDocumentsTest);
      setGroupedTests({...grouped});

      // ========================================
      // DELETE REQUESTS - Clean up ALL test escrows
      // ========================================

      // Delete all 3 created test escrows
      for (let i = 0; i < createdEscrowIds.length; i++) {
        const escrowId = createdEscrowIds[i];
        const deleteTest = {
          name: `Delete Test Escrow ${i + 1}`,
          description: i === 0 ? 'Delete minimal escrow' : i === 1 ? 'Delete basic escrow' : 'Delete full escrow',
          method: 'DELETE',
          endpoint: `/escrows/${escrowId}`,
          status: 'pending',
          curl: `curl -X DELETE "${API_URL}/escrows/${escrowId}" -H "Authorization: Bearer ${token}"`,
          response: null,
          error: null,
          responseTime: null
        };

        const startTimeDelete = Date.now();
        try {
          const response = await fetch(`${API_URL}/escrows/${escrowId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          deleteTest.responseTime = Date.now() - startTimeDelete;
          deleteTest.status = response.ok && data.success ? 'success' : 'failed';
          deleteTest.response = data;
          if (!response.ok || !data.success) {
            deleteTest.error = data.error?.message || 'Failed to delete escrow';
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

      // Clear the test escrow IDs after deletion
      setTestEscrowId(null);
      setTestEscrowIds([]);

      // Verify all escrows were deleted
      if (createdEscrowIds.length > 0) {
        const verifyDeleteTest = {
          name: 'Verify All Deletions',
          description: 'Confirm all test escrows no longer exist (should return 404)',
          method: 'GET',
          endpoint: `/escrows/${createdEscrowIds[0]}`,
          status: 'pending',
          curl: `curl -X GET "${API_URL}/escrows/${createdEscrowIds[0]}" -H "Authorization: Bearer ${token}"`,
          response: null,
          error: null,
          responseTime: null
        };

        const startTimeVerify = Date.now();
        try {
          const response = await fetch(`${API_URL}/escrows/${createdEscrowIds[0]}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          verifyDeleteTest.responseTime = Date.now() - startTimeVerify;
          // This should fail (404) for the test to pass
          verifyDeleteTest.status = response.status === 404 || (data.success === false && data.error?.code === 'NOT_FOUND') ? 'success' : 'failed';
          verifyDeleteTest.response = data;
          if (response.ok && data.success) {
            verifyDeleteTest.error = 'Escrow still exists after deletion';
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

  // Clean up any test escrows on unmount
  useEffect(() => {
    return () => {
      const escrowsToDelete = testEscrowIds.length > 0 ? testEscrowIds : (testEscrowId ? [testEscrowId] : []);
      
      if (escrowsToDelete.length > 0) {
        const token = localStorage.getItem('crm_auth_token') || 
                     localStorage.getItem('authToken') ||
                     localStorage.getItem('token');
        
        let API_URL = process.env.REACT_APP_API_URL || 'https://api.jaydenmetz.com';
        if (!API_URL.endsWith('/v1')) {
          API_URL = API_URL.replace(/\/$/, '') + '/v1';
        }
        
        // Clean up all test escrows
        escrowsToDelete.forEach(escrowId => {
          fetch(`${API_URL}/escrows/${escrowId}`, {
            method: 'DELETE',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          }).catch(() => {
            // Ignore cleanup errors
          });
        });
      }
    };
  }, [testEscrowId, testEscrowIds]);

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

export default EscrowsHealthDashboard;