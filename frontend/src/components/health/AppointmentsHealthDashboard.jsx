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
      if (test.status === 'success' && test.method === 'GET' && parsed.data?.appointments) {
        return JSON.stringify({
          success: parsed.success,
          data: {
            appointments: `[${parsed.data.appointments.length} appointments]`,
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

const AppointmentsHealthDashboard = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [testAppointmentId, setTestAppointmentId] = useState(null);
  const [testAppointmentIds, setTestAppointmentIds] = useState([]);
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
    let createdAppointmentId = null;
    const createdAppointmentIds = [];

    // ========================================
    // GET REQUESTS - Run these first
    // ========================================

    // GET Test 1: Get all appointments
    const getAllTest = {
      name: 'List All Appointments',
      description: 'Retrieve all appointments from the database',
      method: 'GET',
      endpoint: '/appointments',
      status: 'pending',
      curl: `curl -X GET "${API_URL}/appointments" -H "Authorization: Bearer ${token}"`,
      response: null,
      error: null,
      responseTime: null
    };

    const startTime1 = Date.now();
    try {
      const response = await fetch(`${API_URL}/appointments`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      getAllTest.responseTime = Date.now() - startTime1;
      getAllTest.status = response.ok && data.success ? 'success' : 'failed';
      getAllTest.response = data;
      if (!response.ok || !data.success) {
        getAllTest.error = data.error?.message || 'Failed to fetch appointments';
      }
    } catch (error) {
      getAllTest.status = 'failed';
      getAllTest.error = error.message;
      getAllTest.responseTime = Date.now() - startTime1;
    }
    grouped.GET.push(getAllTest);
    allTests.push(getAllTest);
    setGroupedTests({...grouped});

    // GET Test 2: Get appointments with date range
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const dateRangeTest = {
      name: 'List with Date Range',
      description: 'Test filtering by date range (next 7 days)',
      method: 'GET',
      endpoint: `/appointments?startDate=${today}&endDate=${nextWeek}`,
      status: 'pending',
      curl: `curl -X GET "${API_URL}/appointments?startDate=${today}&endDate=${nextWeek}" -H "Authorization: Bearer ${token}"`,
      response: null,
      error: null,
      responseTime: null
    };

    const startTime2 = Date.now();
    try {
      const response = await fetch(`${API_URL}/appointments?startDate=${today}&endDate=${nextWeek}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      dateRangeTest.responseTime = Date.now() - startTime2;
      dateRangeTest.status = response.ok && data.success ? 'success' : 'failed';
      dateRangeTest.response = data;
      if (!response.ok || !data.success) {
        dateRangeTest.error = data.error?.message || 'Failed to fetch appointments with date range';
      }
    } catch (error) {
      dateRangeTest.status = 'failed';
      dateRangeTest.error = error.message;
      dateRangeTest.responseTime = Date.now() - startTime2;
    }
    grouped.GET.push(dateRangeTest);
    allTests.push(dateRangeTest);
    setGroupedTests({...grouped});

    // ========================================
    // POST REQUESTS - Create test appointments
    // ========================================

    // POST Test 1: Create Property Showing Appointment (Minimal)
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const minimalAppointmentData = {
      title: `Test Showing ${Date.now()}`,
      appointmentType: 'Property Showing',
      date: tomorrow.toISOString(),
      startTime: '14:00',
      duration: 60
    };

    const createMinimalTest = {
      name: 'Create Appointment (Minimal)',
      description: 'Test with only required fields (property showing)',
      method: 'POST',
      endpoint: '/appointments',
      status: 'pending',
      curl: `curl -X POST "${API_URL}/appointments" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(minimalAppointmentData, null, 2)}'`,
      requestBody: minimalAppointmentData,
      response: null,
      error: null,
      responseTime: null
    };

    if (token) {
      const startTimeMinimal = Date.now();
      try {
        const response = await fetch(`${API_URL}/appointments`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(minimalAppointmentData)
        });
        const data = await response.json();
        createMinimalTest.responseTime = Date.now() - startTimeMinimal;
        createMinimalTest.status = response.ok && data.success ? 'success' : 'failed';
        createMinimalTest.response = data;
        if (data.success && data.data) {
          createdAppointmentIds.push(data.data.id || data.data._id);
        } else {
          createMinimalTest.error = data.error?.message || 'Failed to create minimal appointment';
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

    // POST Test 2: Create Listing Presentation (Basic)
    const basicAppointmentData = {
      title: `Listing Presentation ${Date.now()}`,
      appointmentType: 'Listing Presentation',
      date: tomorrow.toISOString(),
      startTime: '10:00',
      duration: 90,
      location: '123 Main St, Los Angeles, CA 90001',
      notes: 'Potential new listing, prepare CMA'
    };

    const createBasicTest = {
      name: 'Create Appointment (Basic)',
      description: 'Test with essential fields (listing presentation)',
      method: 'POST',
      endpoint: '/appointments',
      status: 'pending',
      curl: `curl -X POST "${API_URL}/appointments" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(basicAppointmentData, null, 2)}'`,
      requestBody: basicAppointmentData,
      response: null,
      error: null,
      responseTime: null
    };

    if (token) {
      const startTimeBasic = Date.now();
      try {
        const response = await fetch(`${API_URL}/appointments`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(basicAppointmentData)
        });
        const data = await response.json();
        createBasicTest.responseTime = Date.now() - startTimeBasic;
        createBasicTest.status = response.ok && data.success ? 'success' : 'failed';
        createBasicTest.response = data;
        if (data.success && data.data) {
          createdAppointmentIds.push(data.data.id || data.data._id);
        } else {
          createBasicTest.error = data.error?.message || 'Failed to create basic appointment';
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

    // POST Test 3: Create Closing Appointment (Full)
    const fullAppointmentData = {
      title: `Closing Appointment ${Date.now()}`,
      appointmentType: 'Closing',
      date: tomorrow.toISOString(),
      startTime: '15:00',
      duration: 120,
      location: '456 Title Company Blvd, Beverly Hills, CA 90210',
      notes: 'Final closing for property sale',
      reminder: true,
      reminderMinutes: 60,
      attendees: ['John Buyer', 'Jane Seller', 'Title Officer']
    };

    const createFullTest = {
      name: 'Create Appointment (Full)',
      description: 'Test with all available fields (closing)',
      method: 'POST',
      endpoint: '/appointments',
      status: 'pending',
      curl: `curl -X POST "${API_URL}/appointments" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(fullAppointmentData, null, 2)}'`,
      requestBody: fullAppointmentData,
      response: null,
      error: null,
      responseTime: null
    };

    if (token) {
      const startTimeFull = Date.now();
      try {
        const response = await fetch(`${API_URL}/appointments`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(fullAppointmentData)
        });
        const data = await response.json();
        createFullTest.responseTime = Date.now() - startTimeFull;
        createFullTest.status = response.ok && data.success ? 'success' : 'failed';
        createFullTest.response = data;
        if (data.success && data.data) {
          createdAppointmentIds.push(data.data.id || data.data._id);
        } else {
          createFullTest.error = data.error?.message || 'Failed to create full appointment';
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
    // PUT REQUESTS - Update appointments
    // ========================================

    // Store created IDs for cleanup
    setTestAppointmentIds(createdAppointmentIds);

    // PUT Test 1: Update appointment time
    const updateData = {
      startTime: '16:00',
      duration: 45
    };

    const updateTest = {
      name: 'Update Appointment by ID',
      description: 'Update appointment time and duration',
      method: 'PUT',
      endpoint: `/appointments/${createdAppointmentIds[0]}`,
      status: 'pending',
      curl: `curl -X PUT "${API_URL}/appointments/${createdAppointmentIds[0]}" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(updateData, null, 2)}'`,
      requestBody: updateData,
      response: null,
      error: null,
      responseTime: null
    };

    if (createdAppointmentIds[0]) {
      const startTime5 = Date.now();
      try {
        const response = await fetch(`${API_URL}/appointments/${createdAppointmentIds[0]}`, {
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
          updateTest.error = data.error?.message || 'Failed to update appointment';
        }
      } catch (error) {
        updateTest.status = 'failed';
        updateTest.error = error.message;
        updateTest.responseTime = Date.now() - startTime5;
      }
    } else {
      updateTest.status = 'failed';
      updateTest.error = 'No appointment ID available for update';
    }
    grouped.PUT.push(updateTest);
    allTests.push(updateTest);
    setGroupedTests({...grouped});

    // POST Test: Cancel appointment
    const cancelTest = {
      name: 'Cancel Appointment',
      description: 'Test cancelling an appointment',
      method: 'POST',
      endpoint: `/appointments/${createdAppointmentIds[1]}/cancel`,
      status: 'pending',
      curl: `curl -X POST "${API_URL}/appointments/${createdAppointmentIds[1]}/cancel" -H "Authorization: Bearer ${token}"`,
      response: null,
      error: null,
      responseTime: null
    };

    if (createdAppointmentIds[1]) {
      const startTime6 = Date.now();
      try {
        const response = await fetch(`${API_URL}/appointments/${createdAppointmentIds[1]}/cancel`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        cancelTest.responseTime = Date.now() - startTime6;
        cancelTest.status = response.ok && data.success ? 'success' : 'failed';
        cancelTest.response = data;
        if (!response.ok || !data.success) {
          cancelTest.error = data.error?.message || 'Failed to cancel appointment';
        }
      } catch (error) {
        cancelTest.status = 'failed';
        cancelTest.error = error.message;
        cancelTest.responseTime = Date.now() - startTime6;
      }
    } else {
      cancelTest.status = 'failed';
      cancelTest.error = 'No appointment ID available for cancel';
    }
    grouped.POST.push(cancelTest);
    allTests.push(cancelTest);
    setGroupedTests({...grouped});

    // POST Test: Mark complete
    const completeTest = {
      name: 'Complete Appointment',
      description: 'Test marking appointment as complete',
      method: 'POST',
      endpoint: `/appointments/${createdAppointmentIds[2]}/complete`,
      status: 'pending',
      curl: `curl -X POST "${API_URL}/appointments/${createdAppointmentIds[2]}/complete" -H "Authorization: Bearer ${token}"`,
      response: null,
      error: null,
      responseTime: null
    };

    if (createdAppointmentIds[2]) {
      const startTime7 = Date.now();
      try {
        const response = await fetch(`${API_URL}/appointments/${createdAppointmentIds[2]}/complete`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        completeTest.responseTime = Date.now() - startTime7;
        completeTest.status = response.ok && data.success ? 'success' : 'failed';
        completeTest.response = data;
        if (!response.ok || !data.success) {
          completeTest.error = data.error?.message || 'Failed to complete appointment';
        }
      } catch (error) {
        completeTest.status = 'failed';
        completeTest.error = error.message;
        completeTest.responseTime = Date.now() - startTime7;
      }
    } else {
      completeTest.status = 'failed';
      completeTest.error = 'No appointment ID available for complete';
    }
    grouped.POST.push(completeTest);
    allTests.push(completeTest);
    setGroupedTests({...grouped});

    // ========================================
    // DELETE REQUESTS - Clean up test appointments
    // ========================================

    // Archive and delete all created test appointments
    for (let i = 0; i < createdAppointmentIds.length; i++) {
      const appointmentId = createdAppointmentIds[i];
      if (!appointmentId) continue;

      // Archive appointment (using cancel as archive)
      const archiveTest = {
        name: `Archive Test Appointment ${i + 1}`,
        description: `Archive ${i === 0 ? 'showing' : i === 1 ? 'presentation' : 'closing'} appointment`,
        method: 'PUT',
        endpoint: `/appointments/${appointmentId}/archive`,
        status: 'pending',
        curl: `curl -X PUT "${API_URL}/appointments/${appointmentId}/archive" -H "Authorization: Bearer ${token}"`,
        response: null,
        error: null,
        responseTime: null
      };

      const startTimeArchive = Date.now();
      try {
        const response = await fetch(`${API_URL}/appointments/${appointmentId}/archive`, {
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
          archiveTest.error = data.error?.message || 'Failed to archive appointment';
        }
      } catch (error) {
        archiveTest.status = 'failed';
        archiveTest.error = error.message;
        archiveTest.responseTime = Date.now() - startTimeArchive;
      }
      grouped.PUT.push(archiveTest);
      allTests.push(archiveTest);
      setGroupedTests({...grouped});

      // Delete archived appointment
      const deleteTest = {
        name: `Delete Archived Appointment ${i + 1}`,
        description: `Delete archived ${i === 0 ? 'showing' : i === 1 ? 'presentation' : 'closing'} appointment`,
        method: 'DELETE',
        endpoint: `/appointments/${appointmentId}`,
        status: 'pending',
        curl: `curl -X DELETE "${API_URL}/appointments/${appointmentId}" -H "Authorization: Bearer ${token}"`,
        response: null,
        error: null,
        responseTime: null
      };

      const startTimeDelete = Date.now();
      try {
        const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
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
          deleteTest.error = data.error?.message || 'Failed to delete appointment';
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
      description: 'Confirm all test appointments no longer exist (should return 404)',
      method: 'GET',
      endpoint: `/appointments/${createdAppointmentIds[0]}`,
      status: 'pending',
      curl: `curl -X GET "${API_URL}/appointments/${createdAppointmentIds[0]}" -H "Authorization: Bearer ${token}"`,
      response: null,
      error: null,
      responseTime: null
    };

    if (createdAppointmentIds[0]) {
      const startTime10 = Date.now();
      try {
        const response = await fetch(`${API_URL}/appointments/${createdAppointmentIds[0]}`, {
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
          verifyTest.error = 'Appointment still exists after deletion';
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

  // Cleanup function for test appointments
  const cleanupTestAppointments = async () => {
    const appointmentsToDelete = testAppointmentIds.length > 0 ? testAppointmentIds : (testAppointmentId ? [testAppointmentId] : []);

    if (appointmentsToDelete.length > 0) {
      const token = localStorage.getItem('crm_auth_token') ||
                   localStorage.getItem('authToken') ||
                   localStorage.getItem('token');

      let API_URL = process.env.REACT_APP_API_URL || 'https://api.jaydenmetz.com';
      if (!API_URL.endsWith('/v1')) {
        API_URL = API_URL.replace(/\/$/, '') + '/v1';
      }

      for (const appointmentId of appointmentsToDelete) {
        if (!appointmentId) continue;

        try {
          // First archive/cancel
          await fetch(`${API_URL}/appointments/${appointmentId}/cancel`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          });

          // Then delete
          await fetch(`${API_URL}/appointments/${appointmentId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } catch (error) {
          console.error('Error cleaning up test appointment:', error);
        }
      }

      setSnackbarMessage(`Cleaned up ${appointmentsToDelete.length} test appointment(s)`);
      setSnackbarOpen(true);
      setTestAppointmentIds([]);
      setTestAppointmentId(null);
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
                  Appointments API Health Check
                </Typography>
                {lastRefresh && (
                  <Typography variant="caption" color="textSecondary">
                    Last refresh: {lastRefresh}
                  </Typography>
                )}
              </Box>
              <Stack direction="row" spacing={2}>
                {testAppointmentIds.length > 0 && (
                  <Tooltip title="Clean Up Test Appointments">
                    <IconButton
                      onClick={cleanupTestAppointments}
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

export default AppointmentsHealthDashboard;