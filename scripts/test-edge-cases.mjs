async function runTests() {
  console.log('--- STARTING EDGE CASE AUTOMATED VERIFICATION ---');

  const BASE_URL = 'https://meta-memory-album.vercel.app';

  // Test 1: Register validation - missing fields
  console.log('\n[Test 1] POST /api/auth/register - Missing fields');
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '', password: '' }),
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`, data);
    if (res.status === 400 && data.error) {
      console.log('✅ PASS: Correctly rejected missing fields');
    } else {
      console.error('❌ FAIL: Expected 400');
    }
  } catch (e) {
    console.error('Test 1 error:', e);
  }

  // Test 2: Register validation - short password (< 6 chars)
  console.log('\n[Test 2] POST /api/auth/register - Short password (< 6 chars)');
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: '123', name: 'Test User' }),
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`, data);
    if (res.status === 400 && data.error.includes('6 characters')) {
      console.log('✅ PASS: Correctly rejected short password');
    } else {
      console.error('❌ FAIL: Expected 400 with short password error');
    }
  } catch (e) {
    console.error('Test 2 error:', e);
  }

  // Test 3: Unauthenticated API access protection
  console.log('\n[Test 3] GET Protected APIs without session (expect 401)');
  const endpoints = ['/api/memories', '/api/photos', '/api/flashback', '/api/memories/2026/8'];
  for (const ep of endpoints) {
    try {
      const res = await fetch(`${BASE_URL}${ep}`);
      console.log(`${ep} -> Status: ${res.status}`);
      if (res.status === 401) {
        console.log(`✅ PASS: ${ep} blocked unauthenticated access`);
      } else {
        console.error(`❌ FAIL: ${ep} returned ${res.status}, expected 401`);
      }
    } catch (e) {
      console.error(`Test 3 error on ${ep}:`, e);
    }
  }

  // Test 4: New User Registration Flow
  const uniqueEmail = `test_archivist_${Date.now()}@example.com`;
  console.log(`\n[Test 4] POST /api/auth/register - Valid new user: ${uniqueEmail}`);
  let jwtToken = '';
  let cookieHeader = '';
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueEmail,
        password: 'SecureArchivalPassword2026!',
        name: 'Automated Tester',
      }),
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`, data);
    const rawCookies = res.headers.get('set-cookie');
    console.log('Set-Cookie header present:', !!rawCookies);
    if (res.status === 200 && data.success && data.token) {
      console.log('✅ PASS: Registration succeeded with JWT token');
      jwtToken = data.token;
      cookieHeader = rawCookies || `meta_jwt=${data.token}`;
    } else {
      console.error('❌ FAIL: Registration did not return 200 + token');
    }
  } catch (e) {
    console.error('Test 4 error:', e);
  }

  // Test 5: Login with newly created credentials
  console.log(`\n[Test 5] POST /api/auth/login - Login with registered credentials`);
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueEmail,
        password: 'SecureArchivalPassword2026!',
      }),
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`, data);
    if (res.status === 200 && data.success && data.token) {
      console.log('✅ PASS: Login succeeded and returned valid JWT token');
    } else {
      console.error('❌ FAIL: Login failed');
    }
  } catch (e) {
    console.error('Test 5 error:', e);
  }

  // Test 6: Login with wrong password
  console.log(`\n[Test 6] POST /api/auth/login - Login with wrong password`);
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueEmail,
        password: 'WrongPassword!',
      }),
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`, data);
    if (res.status === 401 && data.error) {
      console.log('✅ PASS: Correctly rejected invalid password');
    } else {
      console.error('❌ FAIL: Expected 401 on wrong password');
    }
  } catch (e) {
    console.error('Test 6 error:', e);
  }

  // Test 7: Verify Session with JWT Cookie
  console.log(`\n[Test 7] GET /api/auth/session with meta_jwt cookie`);
  try {
    const res = await fetch(`${BASE_URL}/api/auth/session`, {
      headers: {
        Cookie: `meta_jwt=${jwtToken}`,
      },
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`, data);
    if (res.status === 200 && data.authenticated && data.user) {
      console.log(`✅ PASS: Authenticated as ${data.user.name} (${data.user.email})`);
    } else {
      console.error('❌ FAIL: Session check failed with JWT');
    }
  } catch (e) {
    console.error('Test 7 error:', e);
  }

  console.log('\n--- ALL AUTOMATED EDGE CASE TESTS COMPLETED ---');
}

runTests();
