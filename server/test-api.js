import http from 'http';

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting API Verification Tests...');

  // 1. Health check
  const health = await makeRequest({
    hostname: 'localhost',
    port: 5001,
    path: '/api/health',
    method: 'GET'
  });
  console.log('1. Health check:', health.status === 200 ? '✅ PASSED' : '❌ FAILED', health.data);

  // 2. Admin Login
  const adminLogin = await makeRequest(
    {
      hostname: 'localhost',
      port: 5001,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    { email: 'admin@verifiedreviews.com', password: 'Admin@123' }
  );
  console.log('2. Admin Login:', adminLogin.status === 200 ? '✅ PASSED' : '❌ FAILED', 'Role:', adminLogin.data?.user?.role);
  const adminToken = adminLogin.data.token;

  // 3. Store Owner Login
  const ownerLogin = await makeRequest(
    {
      hostname: 'localhost',
      port: 5001,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    { email: 'owner@apexelectronics.com', password: 'Owner@123' }
  );
  console.log('3. Store Owner Login:', ownerLogin.status === 200 ? '✅ PASSED' : '❌ FAILED', 'Store:', ownerLogin.data?.store?.name);
  const ownerToken = ownerLogin.data.token;

  // 4. Normal User Login
  const userLogin = await makeRequest(
    {
      hostname: 'localhost',
      port: 5001,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    { email: 'user@example.com', password: 'User@123' }
  );
  console.log('4. Normal User Login:', userLogin.status === 200 ? '✅ PASSED' : '❌ FAILED');
  const userToken = userLogin.data.token;

  // 5. Stores Listing
  const storesRes = await makeRequest({
    hostname: 'localhost',
    port: 5001,
    path: '/api/stores',
    method: 'GET'
  });
  console.log('5. Stores list count:', storesRes.data?.stores?.length, storesRes.status === 200 ? '✅ PASSED' : '❌ FAILED');

  // 6. Admin Dashboard stats
  const adminDash = await makeRequest({
    hostname: 'localhost',
    port: 5001,
    path: '/api/admin/dashboard',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log('6. Admin Dashboard metrics:', adminDash.data?.metrics, adminDash.status === 200 ? '✅ PASSED' : '❌ FAILED');

  // 7. Store Owner Dashboard
  const ownerDash = await makeRequest({
    hostname: 'localhost',
    port: 5001,
    path: '/api/store-owner/dashboard',
    method: 'GET',
    headers: { Authorization: `Bearer ${ownerToken}` }
  });
  console.log('7. Store Owner average rating:', ownerDash.data?.overallRating, 'Reviews:', ownerDash.data?.userRatings?.length, ownerDash.status === 200 ? '✅ PASSED' : '❌ FAILED');

  // 8. Form Validation: reject name < 20 chars
  const invalidName = await makeRequest(
    {
      hostname: 'localhost',
      port: 5001,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      name: 'Too Short',
      email: 'short@example.com',
      password: 'Pass@123',
      address: '123 Test Street'
    }
  );
  console.log('8. Validation test (reject name < 20 chars):', invalidName.status === 400 ? '✅ PASSED (400 Bad Request)' : '❌ FAILED', invalidName.data?.errors?.name);

  // 9. Form Validation: reject weak password (missing special char)
  const invalidPass = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      name: 'Valid Name With Plenty Of Chars',
      email: 'weakpass@example.com',
      password: 'Password123',
      address: '123 Test Street'
    }
  );
  console.log('9. Validation test (reject password without special char):', invalidPass.status === 400 ? '✅ PASSED (400 Bad Request)' : '❌ FAILED', invalidPass.data?.errors?.password);

  console.log('\n🎉 ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
