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
      if (test.status === 'success' && test.method === 'GET' && parsed.data?.leads) {
        return JSON.stringify({
          success: parsed.success,
          data: {
            leads: `[${parsed.data.leads.length} leads]`,
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
                fontWeight: 'bold',
                backgroundColor: test.status === 'success' ? '#4caf50' :
                                test.status === 'failed' ? '#f44336' : '#9e9e9e',
                color: 'white'
              }}
            />
            {test.responseTime && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {test.responseTime}ms
              </Typography>
            )}
            <ExpandButton expanded={expanded}>
              <ExpandIcon />
            </ExpandButton>
          </Box>
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

const LeadsHealthDashboard = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [testLeadId, setTestLeadId] = useState(null);
  const [testLeadIds, setTestLeadIds] = useState([]);
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
    let createdLeadId = null;
    const createdLeadIds = [];

    // ========================================
    // GET REQUESTS - Run these first
    // ========================================

    // GET Test 1: Get all leads
    const getAllTest = {
      name: 'List All Leads',
      description: 'Retrieve all leads from the database',
      method: 'GET',
      endpoint: '/leads',
      status: 'pending',
      curl: `curl -X GET "${API_URL}/leads" -H "Authorization: Bearer ${token}"`,
      response: null,
      error: null,
      responseTime: null
    };

    const startTime1 = Date.now();
    try {
      const response = await fetch(`${API_URL}/leads`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      getAllTest.responseTime = Date.now() - startTime1;
      getAllTest.status = response.ok && data.success ? 'success' : 'failed';
      getAllTest.response = data;
      if (!response.ok || !data.success) {
        getAllTest.error = data.error?.message || 'Failed to fetch leads';
      }
    } catch (error) {
      getAllTest.status = 'failed';
      getAllTest.error = error.message;
      getAllTest.responseTime = Date.now() - startTime1;
    }
    grouped.GET.push(getAllTest);
    allTests.push(getAllTest);
    setGroupedTests({...grouped});

    // GET Test 2: Get leads with filtering
    const filterTest = {
      name: 'List with Filters',
      description: 'Test filtering by lead status (New)',
      method: 'GET',
      endpoint: '/leads?leadStatus=New&leadType=Buyer',
      status: 'pending',
      curl: `curl -X GET "${API_URL}/leads?leadStatus=New&leadType=Buyer" -H "Authorization: Bearer ${token}"`,
      response: null,
      error: null,
      responseTime: null
    };

    const startTime2 = Date.now();
    try {
      const response = await fetch(`${API_URL}/leads?leadStatus=New&leadType=Buyer`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      filterTest.responseTime = Date.now() - startTime2;
      filterTest.status = response.ok && data.success ? 'success' : 'failed';
      filterTest.response = data;
      if (!response.ok || !data.success) {
        filterTest.error = data.error?.message || 'Failed to fetch filtered leads';
      }
    } catch (error) {
      filterTest.status = 'failed';
      filterTest.error = error.message;
      filterTest.responseTime = Date.now() - startTime2;
    }
    grouped.GET.push(filterTest);
    allTests.push(filterTest);
    setGroupedTests({...grouped});

    // ========================================
    // POST REQUESTS - Create test leads
    // ========================================

    // POST Test 1: Create Buyer Lead (Minimal)
    const minimalLeadData = {
      firstName: 'Test',
      lastName: `BuyerLead_${Date.now()}`,
      leadSource: 'Website',
      leadType: 'Buyer',
      email: `testbuyer_${Date.now()}@test.com`,
      phone: '555-1001'
    };

    const createMinimalTest = {
      name: 'Create Lead (Minimal)',
      description: 'Test with only required fields (buyer lead)',
      method: 'POST',
      endpoint: '/leads',
      status: 'pending',
      curl: `curl -X POST "${API_URL}/leads" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(minimalLeadData, null, 2)}'`,
      requestBody: minimalLeadData,
      response: null,
      error: null,
      responseTime: null
    };

    if (token) {
      const startTimeMinimal = Date.now();
      try {
        const response = await fetch(`${API_URL}/leads`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(minimalLeadData)
        });
        const data = await response.json();
        createMinimalTest.responseTime = Date.now() - startTimeMinimal;
        createMinimalTest.status = response.ok && data.success ? 'success' : 'failed';
        createMinimalTest.response = data;
        if (data.success && data.data) {
          createdLeadIds.push(data.data.id || data.data._id);
        } else {
          createMinimalTest.error = data.error?.message || 'Failed to create minimal lead';
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

    // POST Test 2: Create Seller Lead (Basic)
    const basicLeadData = {
      firstName: 'Test',
      lastName: `SellerLead_${Date.now()}`,
      leadSource: 'Referral',
      leadType: 'Seller',
      leadStatus: 'New',
      email: `testseller_${Date.now()}@test.com`,
      phone: '555-1002',
      propertyInterest: 'Looking to sell primary residence',
      notes: 'Referred by existing client'
    };

    const createBasicTest = {
      name: 'Create Lead (Basic)',
      description: 'Test with essential fields (seller lead)',
      method: 'POST',
      endpoint: '/leads',
      status: 'pending',
      curl: `curl -X POST "${API_URL}/leads" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(basicLeadData, null, 2)}'`,
      requestBody: basicLeadData,
      response: null,
      error: null,
      responseTime: null
    };

    if (token) {
      const startTimeBasic = Date.now();
      try {
        const response = await fetch(`${API_URL}/leads`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(basicLeadData)
        });
        const data = await response.json();
        createBasicTest.responseTime = Date.now() - startTimeBasic;
        createBasicTest.status = response.ok && data.success ? 'success' : 'failed';
        createBasicTest.response = data;
        if (data.success && data.data) {
          createdLeadIds.push(data.data.id || data.data._id);
        } else {
          createBasicTest.error = data.error?.message || 'Failed to create basic lead';
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

    // POST Test 3: Create Investor Lead (Full)
    const fullLeadData = {
      firstName: 'Test',
      lastName: `InvestorLead_${Date.now()}`,
      leadSource: 'Open House',
      leadType: 'Investor',
      leadStatus: 'New',
      email: `testinvestor_${Date.now()}@test.com`,
      phone: '555-1003',
      propertyInterest: 'Investment properties, multi-family units',
      budget: '1000000-2000000',
      timeframe: '3-6 months',
      preQualified: true,
      notes: 'Cash buyer, interested in distressed properties',
      preferredContactMethod: 'email',
      assignedAgent: 'Top Producer'
    };

    const createFullTest = {
      name: 'Create Lead (Full)',
      description: 'Test with all available fields (investor lead)',
      method: 'POST',
      endpoint: '/leads',
      status: 'pending',
      curl: `curl -X POST "${API_URL}/leads" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(fullLeadData, null, 2)}'`,
      requestBody: fullLeadData,
      response: null,
      error: null,
      responseTime: null
    };

    if (token) {
      const startTimeFull = Date.now();
      try {
        const response = await fetch(`${API_URL}/leads`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(fullLeadData)
        });
        const data = await response.json();
        createFullTest.responseTime = Date.now() - startTimeFull;
        createFullTest.status = response.ok && data.success ? 'success' : 'failed';
        createFullTest.response = data;
        if (data.success && data.data) {
          createdLeadIds.push(data.data.id || data.data._id);
        } else {
          createFullTest.error = data.error?.message || 'Failed to create full lead';
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
    // PUT REQUESTS - Update leads
    // ========================================

    // Store created IDs for cleanup
    setTestLeadIds(createdLeadIds);

    // PUT Test 1: Update lead status
    const updateData = {
      status: 'contacted',
      notes: 'Initial contact made, scheduled follow-up'
    };

    const updateTest = {
      name: 'Update Lead by ID',
      description: 'Update lead status to Contacted',
      method: 'PUT',
      endpoint: `/leads/${createdLeadIds[0]}`,
      status: 'pending',
      curl: `curl -X PUT "${API_URL}/leads/${createdLeadIds[0]}" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(updateData, null, 2)}'`,
      requestBody: updateData,
      response: null,
      error: null,
      responseTime: null
    };

    if (createdLeadIds[0]) {
      const startTime5 = Date.now();
      try {
        const response = await fetch(`${API_URL}/leads/${createdLeadIds[0]}`, {
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
          updateTest.error = data.error?.message || 'Failed to update lead';
        }
      } catch (error) {
        updateTest.status = 'failed';
        updateTest.error = error.message;
        updateTest.responseTime = Date.now() - startTime5;
      }
    } else {
      updateTest.status = 'failed';
      updateTest.error = 'No lead ID available for update';
    }
    grouped.PUT.push(updateTest);
    allTests.push(updateTest);
    setGroupedTests({...grouped});

    // PUT Test 2: Qualify lead
    const qualifyData = {
      status: 'qualified',
      notes: 'Lead qualified - budget confirmed at 500k-750k'
    };

    const qualifyTest = {
      name: 'Qualify Lead',
      description: 'Update lead status to Qualified with budget',
      method: 'PUT',
      endpoint: `/leads/${createdLeadIds[1]}`,
      status: 'pending',
      curl: `curl -X PUT "${API_URL}/leads/${createdLeadIds[1]}" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(qualifyData, null, 2)}'`,
      requestBody: qualifyData,
      response: null,
      error: null,
      responseTime: null
    };

    if (createdLeadIds[1]) {
      const startTime6 = Date.now();
      try {
        const response = await fetch(`${API_URL}/leads/${createdLeadIds[1]}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(qualifyData)
        });
        const data = await response.json();
        qualifyTest.responseTime = Date.now() - startTime6;
        qualifyTest.status = response.ok && data.success ? 'success' : 'failed';
        qualifyTest.response = data;
        if (!response.ok || !data.success) {
          qualifyTest.error = data.error?.message || 'Failed to qualify lead';
        }
      } catch (error) {
        qualifyTest.status = 'failed';
        qualifyTest.error = error.message;
        qualifyTest.responseTime = Date.now() - startTime6;
      }
    } else {
      qualifyTest.status = 'failed';
      qualifyTest.error = 'No lead ID available for qualify';
    }
    grouped.PUT.push(qualifyTest);
    allTests.push(qualifyTest);
    setGroupedTests({...grouped});

    // POST Test: Convert lead to client
    const convertTest = {
      name: 'Convert Lead to Client',
      description: 'Test converting qualified lead to client',
      method: 'POST',
      endpoint: `/leads/${createdLeadIds[2]}/convert`,
      status: 'pending',
      curl: `curl -X POST "${API_URL}/leads/${createdLeadIds[2]}/convert" -H "Authorization: Bearer ${token}"`,
      response: null,
      error: null,
      responseTime: null
    };

    if (createdLeadIds[2]) {
      const startTime7 = Date.now();
      try {
        const response = await fetch(`${API_URL}/leads/${createdLeadIds[2]}/convert`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        convertTest.responseTime = Date.now() - startTime7;
        convertTest.status = response.ok && data.success ? 'success' : 'failed';
        convertTest.response = data;
        if (!response.ok || !data.success) {
          convertTest.error = data.error?.message || 'Failed to convert lead';
        }
      } catch (error) {
        convertTest.status = 'failed';
        convertTest.error = error.message;
        convertTest.responseTime = Date.now() - startTime7;
      }
    } else {
      convertTest.status = 'failed';
      convertTest.error = 'No lead ID available for convert';
    }
    grouped.POST.push(convertTest);
    allTests.push(convertTest);
    setGroupedTests({...grouped});

    // POST Test: Record activity
    const activityData = {
      activityType: 'phone',
      notes: 'Follow-up call completed',
      nextAction: 'Schedule property showing'
    };

    const activityTest = {
      name: 'Record Lead Activity',
      description: 'Test recording activity on lead',
      method: 'POST',
      endpoint: `/leads/${createdLeadIds[0]}/activities`,
      status: 'pending',
      curl: `curl -X POST "${API_URL}/leads/${createdLeadIds[0]}/activities" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(activityData, null, 2)}'`,
      requestBody: activityData,
      response: null,
      error: null,
      responseTime: null
    };

    if (createdLeadIds[0]) {
      const startTime8 = Date.now();
      try {
        const response = await fetch(`${API_URL}/leads/${createdLeadIds[0]}/activities`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(activityData)
        });
        const data = await response.json();
        activityTest.responseTime = Date.now() - startTime8;
        activityTest.status = response.ok && data.success ? 'success' : 'failed';
        activityTest.response = data;
        if (!response.ok || !data.success) {
          activityTest.error = data.error?.message || 'Failed to record activity';
        }
      } catch (error) {
        activityTest.status = 'failed';
        activityTest.error = error.message;
        activityTest.responseTime = Date.now() - startTime8;
      }
    } else {
      activityTest.status = 'failed';
      activityTest.error = 'No lead ID available for activity';
    }
    grouped.POST.push(activityTest);
    allTests.push(activityTest);
    setGroupedTests({...grouped});

    // ========================================
    // DELETE REQUESTS - Clean up test leads
    // ========================================

    // Archive and delete all created test leads (skip the converted one)
    for (let i = 0; i < Math.min(2, createdLeadIds.length); i++) {
      const leadId = createdLeadIds[i];
      if (!leadId) continue;

      // Archive lead
      const archiveTest = {
        name: `Archive Test Lead ${i + 1}`,
        description: `Archive ${i === 0 ? 'buyer' : 'seller'} lead`,
        method: 'PUT',
        endpoint: `/leads/${leadId}/archive`,
        status: 'pending',
        curl: `curl -X PUT "${API_URL}/leads/${leadId}/archive" -H "Authorization: Bearer ${token}"`,
        response: null,
        error: null,
        responseTime: null
      };

      const startTimeArchive = Date.now();
      try {
        const response = await fetch(`${API_URL}/leads/${leadId}/archive`, {
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
          archiveTest.error = data.error?.message || 'Failed to archive lead';
        }
      } catch (error) {
        archiveTest.status = 'failed';
        archiveTest.error = error.message;
        archiveTest.responseTime = Date.now() - startTimeArchive;
      }
      grouped.PUT.push(archiveTest);
      allTests.push(archiveTest);
      setGroupedTests({...grouped});

      // Delete archived lead
      const deleteTest = {
        name: `Delete Archived Lead ${i + 1}`,
        description: `Delete archived ${i === 0 ? 'buyer' : 'seller'} lead`,
        method: 'DELETE',
        endpoint: `/leads/${leadId}`,
        status: 'pending',
        curl: `curl -X DELETE "${API_URL}/leads/${leadId}" -H "Authorization: Bearer ${token}"`,
        response: null,
        error: null,
        responseTime: null
      };

      const startTimeDelete = Date.now();
      try {
        const response = await fetch(`${API_URL}/leads/${leadId}`, {
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
          deleteTest.error = data.error?.message || 'Failed to delete lead';
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
      description: 'Confirm deleted test leads no longer exist (should return 404)',
      method: 'GET',
      endpoint: `/leads/${createdLeadIds[0]}`,
      status: 'pending',
      curl: `curl -X GET "${API_URL}/leads/${createdLeadIds[0]}" -H "Authorization: Bearer ${token}"`,
      response: null,
      error: null,
      responseTime: null
    };

    if (createdLeadIds[0]) {
      const startTime10 = Date.now();
      try {
        const response = await fetch(`${API_URL}/leads/${createdLeadIds[0]}`, {
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
          verifyTest.error = 'Lead still exists after deletion';
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

  const copyAllData = () => {
    const testData = {
      timestamp: new Date().toISOString(),
      endpoint: 'leads',
      summary: {
        total: tests.length,
        passed: tests.filter(t => t.status === 'success').length,
        failed: tests.filter(t => t.status === 'failed').length
      },
      tests: tests.map(test => ({
        name: test.name,
        method: test.method,
        endpoint: test.endpoint,
        status: test.status,
        responseTime: test.responseTime,
        response: test.response,
        error: test.error
      }))
    };

    navigator.clipboard.writeText(JSON.stringify(testData, null, 2));
    setSnackbarMessage('Test data copied to clipboard');
    setSnackbarOpen(true);
  };

  // Cleanup function for test leads
  const cleanupTestLeads = async () => {
    const leadsToDelete = testLeadIds.length > 0 ? testLeadIds : (testLeadId ? [testLeadId] : []);

    if (leadsToDelete.length > 0) {
      const token = localStorage.getItem('crm_auth_token') ||
                   localStorage.getItem('authToken') ||
                   localStorage.getItem('token');

      let API_URL = process.env.REACT_APP_API_URL || 'https://api.jaydenmetz.com';
      if (!API_URL.endsWith('/v1')) {
        API_URL = API_URL.replace(/\/$/, '') + '/v1';
      }

      for (const leadId of leadsToDelete) {
        if (!leadId) continue;

        try {
          // Delete with archive flag
          await fetch(`${API_URL}/leads/${leadId}?archive=true`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } catch (error) {
          console.error('Error cleaning up test lead:', error);
        }
      }

      setSnackbarMessage(`Cleaned up ${leadsToDelete.length} test lead(s)`);
      setSnackbarOpen(true);
      setTestLeadIds([]);
      setTestLeadId(null);
      await runAllTests();
    }
  };

  useEffect(() => {
    runAllTests();
  }, [runAllTests]);

  const successCount = tests.filter(t => t.status === 'success').length;
  const failedCount = tests.filter(t => t.status === 'failed').length;

  return (
    <PageContainer>
      <Container maxWidth="lg">
        <Fade in timeout={800}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3, background: 'rgba(255,255,255,0.98)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Box>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  Leads API Health Dashboard
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Comprehensive testing of all lead endpoints • Last refresh: {lastRefresh || 'Loading...'}
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
                {testLeadId && (
                  <Tooltip title="Clean Up Test Lead">
                    <IconButton
                      onClick={cleanupTestLeads}
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

            {loading && <LinearProgress sx={{ mb: 2 }} />}

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

export default LeadsHealthDashboard;