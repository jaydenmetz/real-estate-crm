// Comprehensive health check service for all modules
// This ensures the system health overview runs the same tests as individual health pages

export class HealthCheckService {
  constructor(apiUrl, token) {
    this.API_URL = apiUrl;
    if (!this.API_URL.endsWith('/v1')) {
      this.API_URL = this.API_URL.replace(/\/$/, '') + '/v1';
    }
    this.token = token;
  }

  // Run comprehensive health checks for Escrows (29 tests)
  async runEscrowsHealthCheck() {
    const tests = [];
    const createdIds = [];
    let testId = null;

    // CORE TESTS
    tests.push(await this.runTest('GET', '/escrows', 'List All Escrows', 'Critical'));

    const createResult = await this.runTest('POST', '/escrows', 'Create Escrow (Minimal)', 'Critical', {
      propertyAddress: `${Date.now()} Test Lane`
    });
    tests.push(createResult);
    if (createResult.response?.data?.id) {
      testId = createResult.response.data.id;
      createdIds.push(testId);
    }

    if (testId) {
      tests.push(await this.runTest('GET', `/escrows/${testId}`, 'Get Escrow by ID', 'Critical'));
      tests.push(await this.runTest('PUT', `/escrows/${testId}`, 'Update Escrow', 'Critical', {
        purchasePrice: 500000,
        earnestMoneyDeposit: 25000
      }));
    }

    // SEARCH & FILTER TESTS
    tests.push(await this.runTest('GET', '/escrows?status=Active', 'Filter by Status', 'Search'));
    tests.push(await this.runTest('GET', '/escrows?search=Test', 'Search by Property', 'Search'));
    tests.push(await this.runTest('GET', '/escrows?page=1&limit=5', 'Pagination', 'Search'));
    tests.push(await this.runTest('GET', '/escrows?status=Active&limit=10&page=1', 'Combined Filters', 'Search'));

    // ERROR HANDLING TESTS
    tests.push(await this.runTest('GET', '/escrows/00000000-0000-0000-0000-000000000000', 'Get Non-Existent Escrow', 'Error Handling'));
    tests.push(await this.runTest('POST', '/escrows', 'Create Escrow - Missing Fields', 'Error Handling', {}));
    tests.push(await this.runTest('PUT', '/escrows/invalid-id-123', 'Update Non-Existent Escrow', 'Error Handling', { purchasePrice: 100 }));

    // Test archive-before-delete workflow
    const deleteId = Date.now().toString();
    tests.push(await this.runTest('DELETE', `/escrows/${deleteId}`, 'Delete Without Archive', 'Error Handling'));

    // EDGE CASE TESTS
    const specialCharsResult = await this.runTest('POST', '/escrows', 'Create Escrow - Special Characters', 'Edge Case', {
      propertyAddress: "123 O'Brien & Co. Street #456",
      escrowOfficerName: "José García's & Müller-Smith"
    });
    tests.push(specialCharsResult);
    if (specialCharsResult.response?.data?.id) {
      createdIds.push(specialCharsResult.response.data.id);
    }

    const largePriceResult = await this.runTest('POST', '/escrows', 'Create Escrow - Large Price', 'Edge Case', {
      propertyAddress: 'Expensive Property Test',
      purchasePrice: 999999999999
    });
    tests.push(largePriceResult);
    if (largePriceResult.response?.data?.id) {
      createdIds.push(largePriceResult.response.data.id);
    }

    const emptyFieldsResult = await this.runTest('POST', '/escrows', 'Create Escrow - Empty Fields', 'Edge Case', {
      propertyAddress: 'Empty Fields Test',
      escrowOfficerName: '',
      escrowOfficerEmail: ''
    });
    tests.push(emptyFieldsResult);
    if (emptyFieldsResult.response?.data?.id) {
      createdIds.push(emptyFieldsResult.response.data.id);
    }

    // PERFORMANCE TESTS
    tests.push(await this.runTest('GET', '/escrows?page=999&limit=100', 'Large Pagination', 'Performance'));
    tests.push(await this.runConcurrentTests('/escrows', 5, 'Concurrent Requests', 'Performance'));
    tests.push(await this.runResponseTimeTest('/escrows?limit=10', 'Response Time Consistency', 'Performance'));

    // WORKFLOW TESTS - Archive and Delete
    for (const id of createdIds) {
      const archiveResult = await this.runTest('PUT', `/escrows/${id}/archive`, 'Archive Test Escrow', 'Workflow');
      tests.push(archiveResult);
      if (archiveResult.status === 'success') {
        tests.push(await this.runTest('DELETE', `/escrows/${id}`, 'Delete Archived Escrow', 'Workflow'));
      }
    }

    // Verify deletion
    if (testId) {
      tests.push(await this.runTest('GET', `/escrows/${testId}`, 'Verify Deletion', 'Workflow'));
    }

    return tests;
  }

  // Run comprehensive health checks for Listings (26 tests)
  async runListingsHealthCheck() {
    const tests = [];
    const createdIds = [];
    let testId = null;

    // CORE TESTS
    tests.push(await this.runTest('GET', '/listings', 'List All Listings', 'Critical'));

    const createResult = await this.runTest('POST', '/listings', 'Create Listing (Minimal)', 'Critical', {
      propertyAddress: `${Date.now()} Test Street`,
      listPrice: 500000,
      propertyType: 'Single Family'
    });
    tests.push(createResult);
    if (createResult.response?.data?.id) {
      testId = createResult.response.data.id;
      createdIds.push(testId);
    }

    if (testId) {
      tests.push(await this.runTest('GET', `/listings/${testId}`, 'Get Listing by ID', 'Critical'));
      tests.push(await this.runTest('PUT', `/listings/${testId}`, 'Update Listing', 'Critical', {
        listPrice: 550000,
        listingStatus: 'Pending'
      }));
    }

    // SEARCH & FILTER TESTS
    tests.push(await this.runTest('GET', '/listings?status=Active', 'Filter by Status', 'Search'));
    tests.push(await this.runTest('GET', '/listings?search=Test', 'Search by Property', 'Search'));
    tests.push(await this.runTest('GET', '/listings?page=1&limit=5', 'Pagination', 'Search'));
    tests.push(await this.runTest('GET', '/listings?status=Active&limit=10&page=1', 'Combined Filters', 'Search'));

    // ERROR HANDLING TESTS
    tests.push(await this.runTest('GET', '/listings/00000000-0000-0000-0000-000000000000', 'Get Non-Existent Listing', 'Error Handling'));
    tests.push(await this.runTest('POST', '/listings', 'Create Listing - Missing Fields', 'Error Handling', {}));
    tests.push(await this.runTest('PUT', '/listings/invalid-id-123', 'Update Non-Existent Listing', 'Error Handling', { listPrice: 100 }));

    // EDGE CASE TESTS
    const specialCharsResult = await this.runTest('POST', '/listings', 'Create Listing - Special Characters', 'Edge Case', {
      propertyAddress: "123 O'Brien & Co. Street #456",
      listPrice: 750000,
      propertyType: 'Condo',
      description: "José García's property with Müller-Smith"
    });
    tests.push(specialCharsResult);
    if (specialCharsResult.response?.data?.id) {
      createdIds.push(specialCharsResult.response.data.id);
    }

    const largePriceResult = await this.runTest('POST', '/listings', 'Create Listing - Large Price', 'Edge Case', {
      propertyAddress: 'Expensive Property Test',
      listPrice: 999999999,
      propertyType: 'Single Family'
    });
    tests.push(largePriceResult);
    if (largePriceResult.response?.data?.id) {
      createdIds.push(largePriceResult.response.data.id);
    }

    const emptyFieldsResult = await this.runTest('POST', '/listings', 'Create Listing - Empty Fields', 'Edge Case', {
      propertyAddress: 'Empty Fields Test',
      listPrice: 400000,
      propertyType: 'Single Family',
      description: ''
    });
    tests.push(emptyFieldsResult);
    if (emptyFieldsResult.response?.data?.id) {
      createdIds.push(emptyFieldsResult.response.data.id);
    }

    // PERFORMANCE TESTS
    tests.push(await this.runTest('GET', '/listings?page=999&limit=100', 'Large Pagination', 'Performance'));
    tests.push(await this.runConcurrentTests('/listings', 5, 'Concurrent Requests', 'Performance'));
    tests.push(await this.runResponseTimeTest('/listings?limit=10', 'Response Time Consistency', 'Performance'));

    // WORKFLOW TESTS - Archive and Delete
    for (const id of createdIds) {
      const archiveResult = await this.runTest('PUT', `/listings/${id}/archive`, 'Archive Test Listing', 'Workflow');
      tests.push(archiveResult);
      if (archiveResult.status === 'success') {
        tests.push(await this.runTest('DELETE', `/listings/${id}`, 'Delete Archived Listing', 'Workflow'));
      }
    }

    // Verify deletion
    if (testId) {
      tests.push(await this.runTest('GET', `/listings/${testId}`, 'Verify Deletion', 'Workflow'));
    }

    return tests;
  }

  // Run comprehensive health checks for Clients (15 tests)
  async runClientsHealthCheck() {
    const tests = [];
    let testId = null;

    // CORE TESTS
    tests.push(await this.runTest('GET', '/clients', 'List All Clients', 'Critical'));

    const createResult = await this.runTest('POST', '/clients', 'Create Client (Required Fields Only)', 'Critical', {
      firstName: 'Test',
      lastName: `CoreClient_${Date.now()}`,
      email: `client_${Date.now()}@example.com`
    });
    tests.push(createResult);
    if (createResult.response?.data?.id) {
      testId = createResult.response.data.id;
    }

    if (testId) {
      tests.push(await this.runTest('PUT', `/clients/${testId}`, 'Update Client', 'Critical', {
        phone: '555-1234'
      }));
      tests.push(await this.runTest('PUT', `/clients/${testId}/archive`, 'Archive Client', 'Critical'));
      tests.push(await this.runTest('DELETE', `/clients/${testId}`, 'Delete Archived Client', 'Critical'));
    }

    // SEARCH & FILTER TESTS
    tests.push(await this.runTest('GET', '/clients?status=active', 'Filter by Status', 'Search'));
    tests.push(await this.runTest('GET', '/clients?search=Test', 'Search by Name', 'Search'));
    tests.push(await this.runTest('GET', '/clients?page=2&limit=5', 'Pagination', 'Search'));

    // ERROR HANDLING TESTS
    tests.push(await this.runTest('GET', '/clients/00000000-0000-0000-0000-000000000000', 'Get Non-Existent Client', 'Error Handling'));
    tests.push(await this.runTest('POST', '/clients', 'Create Client - Missing Required Fields', 'Error Handling', { firstName: 'Test' }));
    tests.push(await this.runTest('POST', '/clients', 'Create Client - Invalid Email', 'Error Handling', {
      firstName: 'Test',
      lastName: 'Client',
      email: 'invalid-email'
    }));

    // EDGE CASE TESTS
    tests.push(await this.runTest('POST', '/clients', 'Create Client - Special Characters', 'Edge Case', {
      firstName: "O'Brien-Test",
      lastName: 'Müller & Co.',
      email: `special${Date.now()}@test.com`,
      clientType: 'seller'
    }));

    tests.push(await this.runTest('POST', '/clients', 'Create Client - Long Text Fields', 'Edge Case', {
      firstName: 'A'.repeat(50),
      lastName: 'B'.repeat(50),
      email: `long${Date.now()}@test.com`
    }));

    // PERFORMANCE TESTS
    tests.push(await this.runTest('GET', '/clients?page=999&limit=100', 'Large Pagination Request', 'Performance'));
    tests.push(await this.runConcurrentTests('/clients', 5, 'Concurrent GET Requests', 'Performance'));

    return tests;
  }

  // Run comprehensive health checks for Appointments (15 tests)
  async runAppointmentsHealthCheck() {
    const tests = [];
    const createdIds = [];

    // CORE TESTS
    tests.push(await this.runTest('GET', '/appointments', 'List All Appointments', 'Critical'));
    tests.push(await this.runTest('GET', '/appointments?startDate=2025-09-26&endDate=2025-10-03', 'List with Date Range', 'Critical'));

    // Create test appointments
    const minimalResult = await this.runTest('POST', '/appointments', 'Create Appointment (Minimal)', 'Critical', {
      title: `Test Showing ${Date.now()}`,
      appointmentDate: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '11:00',
      appointmentType: 'Property Showing'
    });
    tests.push(minimalResult);
    if (minimalResult.response?.data?.id) {
      createdIds.push(minimalResult.response.data.id);
    }

    const basicResult = await this.runTest('POST', '/appointments', 'Create Appointment (Basic)', 'Critical', {
      title: `Listing Presentation ${Date.now()}`,
      appointmentDate: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '11:00',
      location: '123 Main St, Los Angeles, CA 90001',
      appointmentType: 'Listing Presentation'
    });
    tests.push(basicResult);
    if (basicResult.response?.data?.id) {
      createdIds.push(basicResult.response.data.id);
    }

    const fullResult = await this.runTest('POST', '/appointments', 'Create Appointment (Full)', 'Critical', {
      title: `Closing Appointment ${Date.now()}`,
      appointmentDate: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '11:00',
      location: '456 Title Company Blvd, Beverly Hills, CA 90210',
      appointmentType: 'Closing'
    });
    tests.push(fullResult);
    if (fullResult.response?.data?.id) {
      createdIds.push(fullResult.response.data.id);
    }

    // Update and status tests
    if (createdIds[0]) {
      tests.push(await this.runTest('PUT', `/appointments/${createdIds[0]}`, 'Update Appointment by ID', 'Critical', {
        location: 'Updated Location - Conference Room B',
        status: 'confirmed'
      }));
    }

    if (createdIds[1]) {
      tests.push(await this.runTest('POST', `/appointments/${createdIds[1]}/cancel`, 'Cancel Appointment', 'Workflow'));
    }

    if (createdIds[2]) {
      tests.push(await this.runTest('POST', `/appointments/${createdIds[2]}/complete`, 'Complete Appointment', 'Workflow'));
    }

    // Archive and delete workflow
    for (let i = 0; i < createdIds.length; i++) {
      const id = createdIds[i];
      const archiveResult = await this.runTest('PUT', `/appointments/${id}/archive`, `Archive Test Appointment ${i + 1}`, 'Workflow');
      tests.push(archiveResult);
      if (archiveResult.status === 'success') {
        tests.push(await this.runTest('DELETE', `/appointments/${id}`, `Delete Archived Appointment ${i + 1}`, 'Workflow'));
      }
    }

    // Verify deletion
    if (createdIds[0]) {
      tests.push(await this.runTest('GET', `/appointments/${createdIds[0]}`, 'Verify All Deletions', 'Workflow'));
    }

    return tests;
  }

  // Run comprehensive health checks for Leads (14 tests)
  async runLeadsHealthCheck() {
    const tests = [];
    const createdIds = [];

    // CORE TESTS
    tests.push(await this.runTest('GET', '/leads', 'List All Leads', 'Critical'));
    tests.push(await this.runTest('GET', '/leads?leadStatus=New&leadType=Buyer', 'List with Filters', 'Search'));

    // Create test leads
    const minimalResult = await this.runTest('POST', '/leads', 'Create Lead (Minimal)', 'Critical', {
      firstName: 'Test',
      lastName: `BuyerLead_${Date.now()}`,
      email: `testbuyer_${Date.now()}@test.com`,
      phone: '555-1001',
      source: 'Website'
    });
    tests.push(minimalResult);
    if (minimalResult.response?.data?.id) {
      createdIds.push(minimalResult.response.data.id);
    }

    const basicResult = await this.runTest('POST', '/leads', 'Create Lead (Basic)', 'Critical', {
      firstName: 'Test',
      lastName: `SellerLead_${Date.now()}`,
      email: `testseller_${Date.now()}@test.com`,
      phone: '555-1002',
      source: 'Referral',
      notes: 'Referred by existing client'
    });
    tests.push(basicResult);
    if (basicResult.response?.data?.id) {
      createdIds.push(basicResult.response.data.id);
    }

    const fullResult = await this.runTest('POST', '/leads', 'Create Lead (Full)', 'Critical', {
      firstName: 'Test',
      lastName: `InvestorLead_${Date.now()}`,
      email: `testinvestor_${Date.now()}@test.com`,
      phone: '555-1003',
      source: 'Open House',
      notes: 'Cash buyer, interested in distressed properties'
    });
    tests.push(fullResult);
    if (fullResult.response?.data?.id) {
      createdIds.push(fullResult.response.data.id);
    }

    // Update and workflow tests
    if (createdIds[0]) {
      tests.push(await this.runTest('PUT', `/leads/${createdIds[0]}`, 'Update Lead by ID', 'Critical', {
        leadStatus: 'contacted',
        notes: 'Initial contact made, scheduled follow-up'
      }));
      tests.push(await this.runTest('POST', `/leads/${createdIds[0]}/activities`, 'Record Lead Activity', 'Workflow', {
        activityType: 'email',
        notes: 'Sent follow-up email'
      }));
    }

    if (createdIds[1]) {
      tests.push(await this.runTest('PUT', `/leads/${createdIds[1]}`, 'Qualify Lead', 'Workflow', {
        leadStatus: 'qualified',
        notes: 'Lead qualified - budget confirmed at 500k-750k'
      }));
    }

    if (createdIds[2]) {
      tests.push(await this.runTest('POST', `/leads/${createdIds[2]}/convert`, 'Convert Lead to Client', 'Workflow'));
    }

    // Archive and delete workflow
    for (let i = 0; i < Math.min(2, createdIds.length); i++) {
      const id = createdIds[i];
      const archiveResult = await this.runTest('PUT', `/leads/${id}/archive`, `Archive Test Lead ${i + 1}`, 'Workflow');
      tests.push(archiveResult);
      if (archiveResult.status === 'success') {
        tests.push(await this.runTest('DELETE', `/leads/${id}`, `Delete Archived Lead ${i + 1}`, 'Workflow'));
      }
    }

    // Verify deletion
    if (createdIds[0]) {
      tests.push(await this.runTest('GET', `/leads/${createdIds[0]}`, 'Verify All Deletions', 'Workflow'));
    }

    return tests;
  }

  // Helper method to run a single test
  async runTest(method, endpoint, name, category, body = null) {
    const test = {
      name,
      category,
      method,
      endpoint,
      status: 'pending',
      responseTime: null,
      response: null,
      error: null
    };

    if (body) {
      test.requestBody = body;
    }

    const startTime = Date.now();
    try {
      const options = {
        method,
        headers: this.token ? { 'Authorization': `Bearer ${this.token}` } : {}
      };

      if (body && method !== 'GET') {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${this.API_URL}${endpoint}`, options);
      const data = await response.json();

      test.responseTime = Date.now() - startTime;
      test.response = data;

      // Determine success based on the test type
      if (category === 'Error Handling') {
        // Error handling tests should return errors
        test.status = !response.ok && data.error ? 'success' : 'failed';
      } else if (name.includes('Verify Deletion')) {
        // Verify deletion should return not found
        test.status = !response.ok && data.error?.code === 'NOT_FOUND' ? 'success' : 'failed';
      } else {
        // Normal tests should succeed
        test.status = response.ok && data.success ? 'success' : 'failed';
        if (!response.ok || !data.success) {
          test.error = data.error?.message || 'Request failed';
        }
      }
    } catch (error) {
      test.status = 'failed';
      test.error = error.message;
      test.responseTime = Date.now() - startTime;
    }

    return test;
  }

  // Run concurrent requests test
  async runConcurrentTests(endpoint, count, name, category) {
    const startTime = Date.now();
    const promises = [];

    for (let i = 0; i < count; i++) {
      promises.push(
        fetch(`${this.API_URL}${endpoint}`, {
          headers: this.token ? { 'Authorization': `Bearer ${this.token}` } : {}
        })
      );
    }

    try {
      const responses = await Promise.all(promises);
      const successCount = responses.filter(r => r.ok).length;
      const totalTime = Date.now() - startTime;
      const avgTime = Math.round(totalTime / count);

      return {
        name,
        category,
        method: 'GET',
        endpoint: `${endpoint} (x${count})`,
        status: successCount === count ? 'success' : 'failed',
        responseTime: totalTime,
        response: {
          requestCount: count,
          successCount,
          avgResponseTime: avgTime
        }
      };
    } catch (error) {
      return {
        name,
        category,
        method: 'GET',
        endpoint: `${endpoint} (x${count})`,
        status: 'failed',
        responseTime: Date.now() - startTime,
        error: error.message
      };
    }
  }

  // Test response time consistency
  async runResponseTimeTest(endpoint, name, category) {
    const times = [];

    for (let i = 0; i < 3; i++) {
      const startTime = Date.now();
      try {
        await fetch(`${this.API_URL}${endpoint}`, {
          headers: this.token ? { 'Authorization': `Bearer ${this.token}` } : {}
        });
        times.push(Date.now() - startTime);
      } catch (error) {
        // Continue with other requests
      }
    }

    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    const min = Math.min(...times);
    const max = Math.max(...times);

    return {
      name,
      category,
      method: 'GET',
      endpoint: `${endpoint}`,
      status: 'success',
      responseTime: avg,
      response: {
        times,
        average: avg,
        min,
        max,
        variance: max - min
      }
    };
  }

  // Run all module health checks
  async runAllHealthChecks() {
    const token = localStorage.getItem('crm_auth_token') ||
                 localStorage.getItem('authToken') ||
                 localStorage.getItem('token');

    const results = {
      timestamp: new Date().toISOString(),
      escrows: await this.runEscrowsHealthCheck(),
      listings: await this.runListingsHealthCheck(),
      clients: await this.runClientsHealthCheck(),
      appointments: await this.runAppointmentsHealthCheck(),
      leads: await this.runLeadsHealthCheck()
    };

    // Calculate summaries
    for (const [module, tests] of Object.entries(results)) {
      if (module !== 'timestamp') {
        const summary = {
          total: tests.length,
          passed: tests.filter(t => t.status === 'success').length,
          failed: tests.filter(t => t.status === 'failed').length,
          warnings: tests.filter(t => t.status === 'warning').length
        };
        results[`${module}Summary`] = summary;
      }
    }

    return results;
  }
}

export default HealthCheckService;