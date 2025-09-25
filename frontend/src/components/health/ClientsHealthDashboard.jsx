import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  ContentCopy as ContentCopyIcon,
  PlayArrow as PlayArrowIcon,
  Code as CodeIcon
} from '@mui/icons-material';

const ClientsHealthDashboard = () => {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedTests, setExpandedTests] = useState({});
  const [groupedTests, setGroupedTests] = useState({
    GET: [],
    POST: [],
    PUT: [],
    DELETE: []
  });

  const API_URL = process.env.REACT_APP_API_URL || 'https://api.jaydenmetz.com/v1';

  const getStatusIcon = (status) => {
    switch(status) {
      case 'success':
        return <CheckCircleIcon sx={{ color: 'success.main' }} />;
      case 'failed':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
      case 'warning':
        return <WarningIcon sx={{ color: 'warning.main' }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'success':
        return 'success';
      case 'failed':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const runHealthTests = async () => {
    setLoading(true);
    setError(null);
    const grouped = { GET: [], POST: [], PUT: [], DELETE: [] };
    const allTests = [];
    const createdClientIds = [];

    try {
      // First, get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // ========================================
      // GET REQUESTS
      // ========================================

      // GET Test 1: List all clients
      const listTest = {
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
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        listTest.responseTime = Date.now() - startTime1;
        listTest.status = response.ok && data.success ? 'success' : 'failed';
        listTest.response = data;
        if (!response.ok || !data.success) {
          listTest.error = data.error?.message || 'Failed to fetch clients';
        }
      } catch (error) {
        listTest.status = 'failed';
        listTest.error = error.message;
        listTest.responseTime = Date.now() - startTime1;
      }
      grouped.GET.push(listTest);
      allTests.push(listTest);
      setGroupedTests({...grouped});

      // GET Test 2: List with pagination
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
          headers: {
            'Authorization': `Bearer ${token}`
          }
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

      // GET Test 3: Filter by client type
      const filterTest = {
        name: 'Filter by Type',
        description: 'Test filtering clients by type (Buyer)',
        method: 'GET',
        endpoint: '/clients?clientType=Buyer',
        status: 'pending',
        curl: `curl -X GET "${API_URL}/clients?clientType=Buyer" -H "Authorization: Bearer ${token}"`,
        response: null,
        error: null,
        responseTime: null
      };

      const startTime3 = Date.now();
      try {
        const response = await fetch(`${API_URL}/clients?clientType=Buyer`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        filterTest.responseTime = Date.now() - startTime3;
        filterTest.status = response.ok && data.success ? 'success' : 'failed';
        filterTest.response = data;
        if (!response.ok || !data.success) {
          filterTest.error = data.error?.message || 'Failed to filter clients';
        }
      } catch (error) {
        filterTest.status = 'failed';
        filterTest.error = error.message;
        filterTest.responseTime = Date.now() - startTime3;
      }
      grouped.GET.push(filterTest);
      allTests.push(filterTest);
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
        name: 'Create Buyer Client (Minimal)',
        description: 'Test with only required fields for a buyer',
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
        address: '123 Main St, Los Angeles, CA 90001',
        source: 'Referral',
        notes: 'Looking to sell their primary residence'
      };

      const createBasicTest = {
        name: 'Create Seller Client (Basic)',
        description: 'Test with common fields for a seller',
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
        source: 'Website',
        notes: 'Looking to sell current home and buy new property',
        tags: ['VIP', 'Cash Buyer', 'Multiple Properties'],
        priceRangeMin: 500000,
        priceRangeMax: 1500000,
        preApproved: true,
        preApprovalAmount: 1200000,
        preferredLocations: ['Beverly Hills', 'West Hollywood', 'Bel Air'],
        propertyTypes: ['Single Family', 'Condo'],
        timeframe: '3-6 months',
        communicationPreference: 'email'
      };

      const createFullTest = {
        name: 'Create Both Type Client (Full)',
        description: 'Test with all available fields for buyer/seller',
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
      // PUT/UPDATE REQUESTS
      // ========================================

      // Get the created client IDs for update tests
      const clientForBasicUpdate = createdClientIds[0] || null;
      const clientForStatusUpdate = createdClientIds[1] || createdClientIds[0] || null;
      const clientForTagsUpdate = createdClientIds[2] || createdClientIds[0] || null;

      // PUT Test 1: Update client basic info
      const updateData = {
        clientStatus: 'Past Client',
        notes: 'Successfully closed on their dream home!'
      };

      const updateTest = {
        name: 'Update Client Status',
        description: 'Update client to Past Client status',
        method: 'PUT',
        endpoint: `/clients/${clientForBasicUpdate}`,
        status: 'pending',
        curl: `curl -X PUT "${API_URL}/clients/${clientForBasicUpdate}" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(updateData, null, 2)}'`,
        requestBody: updateData,
        response: null,
        error: null,
        responseTime: null
      };

      if (clientForBasicUpdate) {
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
        endpoint: `/clients/${clientForStatusUpdate}`,
        status: 'pending',
        curl: `curl -X PUT "${API_URL}/clients/${clientForStatusUpdate}" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(contactUpdateData, null, 2)}'`,
        requestBody: contactUpdateData,
        response: null,
        error: null,
        responseTime: null
      };

      if (clientForStatusUpdate) {
        const startTime6 = Date.now();
        try {
          const response = await fetch(`${API_URL}/clients/${clientForStatusUpdate}`, {
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

      // POST Test for Notes (Special endpoint)
      const noteData = {
        note: `Test note added at ${new Date().toLocaleString()}`,
        type: 'followup'
      };

      const addNoteTest = {
        name: 'Add Client Note',
        description: 'Test adding a note to client record',
        method: 'POST',
        endpoint: `/clients/${clientForTagsUpdate}/notes`,
        status: 'pending',
        curl: `curl -X POST "${API_URL}/clients/${clientForTagsUpdate}/notes" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(noteData, null, 2)}'`,
        requestBody: noteData,
        response: null,
        error: null,
        responseTime: null
      };

      if (clientForTagsUpdate) {
        const startTime7 = Date.now();
        try {
          const response = await fetch(`${API_URL}/clients/${clientForTagsUpdate}/notes`, {
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
      // DELETE REQUESTS - Clean up ALL test clients
      // ========================================

      // Archive then delete all 3 created test clients
      for (let i = 0; i < createdClientIds.length; i++) {
        const clientId = createdClientIds[i];
        if (!clientId) continue;

        // Archive Test
        const archiveTest = {
          name: `Archive Test Client ${i + 1}`,
          description: `Archive ${i === 0 ? 'buyer' : i === 1 ? 'seller' : 'both type'} client`,
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

        // Delete Test (only if archive succeeded)
        if (archiveTest.status === 'success') {
          const deleteTest = {
            name: `Delete Archived Client ${i + 1}`,
            description: `Delete archived ${i === 0 ? 'buyer' : i === 1 ? 'seller' : 'both type'} client`,
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

      // Calculate summary
      const summary = {
        totalTests: allTests.length,
        passed: allTests.filter(t => t.status === 'success').length,
        failed: allTests.filter(t => t.status === 'failed').length,
        warning: allTests.filter(t => t.status === 'warning').length
      };

      setTestResults({
        dashboard: 'Clients API Health Check',
        lastRefresh: new Date().toLocaleString(),
        summary,
        tests: allTests
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatJson = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  const handleTestExpand = (testName) => {
    setExpandedTests(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
  };

  useEffect(() => {
    runHealthTests();
  }, []);

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Clients API Health Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={runHealthTests}
          disabled={loading}
        >
          Run Tests
        </Button>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {testResults && (
        <>
          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Tests
                  </Typography>
                  <Typography variant="h4">
                    {testResults.summary.totalTests}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ bgcolor: 'success.light' }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Passed
                  </Typography>
                  <Typography variant="h4" color="success.dark">
                    {testResults.summary.passed}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ bgcolor: testResults.summary.failed > 0 ? 'error.light' : 'grey.100' }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Failed
                  </Typography>
                  <Typography variant="h4" color={testResults.summary.failed > 0 ? 'error.dark' : 'text.primary'}>
                    {testResults.summary.failed}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Success Rate
                  </Typography>
                  <Typography variant="h4">
                    {Math.round((testResults.summary.passed / testResults.summary.totalTests) * 100)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Last refresh: {testResults.lastRefresh}
          </Typography>

          {/* Test Results by Method */}
          {Object.entries(groupedTests).map(([method, tests]) => (
            tests.length > 0 && (
              <Box key={method} sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Chip label={method} color="primary" sx={{ mr: 1 }} />
                  {tests.filter(t => t.status === 'success').length}/{tests.length} passed
                </Typography>

                {tests.map((test, index) => (
                  <Accordion
                    key={`${method}-${index}`}
                    expanded={expandedTests[test.name] || false}
                    onChange={() => handleTestExpand(test.name)}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        {getStatusIcon(test.status)}
                        <Box sx={{ ml: 2, flexGrow: 1 }}>
                          <Typography variant="subtitle1">{test.name}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {test.description}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {test.responseTime && (
                            <Chip
                              label={`${test.responseTime}ms`}
                              size="small"
                              color={test.responseTime < 200 ? 'success' : test.responseTime < 500 ? 'warning' : 'error'}
                            />
                          )}
                          <Chip
                            label={test.method}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>Endpoint:</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'monospace',
                              bgcolor: 'grey.100',
                              p: 1,
                              borderRadius: 1,
                              flexGrow: 1
                            }}
                          >
                            {test.endpoint}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(`${API_URL}${test.endpoint}`)}
                            sx={{ ml: 1 }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Box>

                        {test.curl && (
                          <>
                            <Typography variant="subtitle2" gutterBottom>cURL Command:</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: 'monospace',
                                  bgcolor: 'grey.900',
                                  color: 'grey.50',
                                  p: 2,
                                  borderRadius: 1,
                                  flexGrow: 1,
                                  overflow: 'auto',
                                  fontSize: '0.85rem'
                                }}
                              >
                                {test.curl}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => copyToClipboard(test.curl)}
                                sx={{ ml: 1 }}
                              >
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </>
                        )}

                        {test.requestBody && (
                          <>
                            <Typography variant="subtitle2" gutterBottom>Request Body:</Typography>
                            <Box sx={{ mb: 2 }}>
                              <pre style={{
                                backgroundColor: '#f5f5f5',
                                padding: '12px',
                                borderRadius: '4px',
                                overflow: 'auto',
                                fontSize: '0.85rem'
                              }}>
                                {formatJson(test.requestBody)}
                              </pre>
                            </Box>
                          </>
                        )}

                        {test.response && (
                          <>
                            <Typography variant="subtitle2" gutterBottom>Response:</Typography>
                            <Box sx={{ mb: 2 }}>
                              <pre style={{
                                backgroundColor: test.status === 'success' ? '#e8f5e9' : '#ffebee',
                                padding: '12px',
                                borderRadius: '4px',
                                overflow: 'auto',
                                maxHeight: '400px',
                                fontSize: '0.85rem'
                              }}>
                                {formatJson(test.response)}
                              </pre>
                            </Box>
                          </>
                        )}

                        {test.error && (
                          <Alert severity="error" sx={{ mt: 2 }}>
                            {test.error}
                          </Alert>
                        )}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            )
          ))}
        </>
      )}
    </Paper>
  );
};

export default ClientsHealthDashboard;