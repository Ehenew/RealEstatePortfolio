import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

async function jsonFetch(path: string, options: FetchOptions = {}): Promise<any> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  let body: any;
  try { 
    body = await res.json(); 
  } catch { 
    body = null; 
  }
  if (!res.ok) {
    const msg = body?.message || res.statusText;
    throw new Error(`${res.status} ${msg}`);
  }
  return body;
}

(async (): Promise<void> => {
  try {
    // Health
    const health = await jsonFetch('/api/health');
    console.log('HEALTH:', health.message);

    // Login
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';
    const login = await jsonFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    const token = login?.data?.token;
    if (!token) throw new Error('No token in login response');
    const authHeader = { Authorization: `Bearer ${token}` };
    console.log('LOGIN: ok');

    // List properties (flat)
    const props = await jsonFetch('/api/properties?flat=true');
    console.log(`PROPERTIES: ${props.length} found`);

    // Create property
    const newProp = await jsonFetch('/api/properties', {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({
        title: 'Smoke Test Property',
        price: '100000 ETB',
        location: 'Smoke City',
        type: 'apartment',
        featured: false,
        status: 'active'
      })
    });
    const createdId = newProp.data._id || newProp.data.id;
    console.log('CREATE PROPERTY: ok', createdId);

    // Delete property
    await jsonFetch(`/api/properties/${createdId}`, {
      method: 'DELETE',
      headers: authHeader
    });
    console.log('DELETE PROPERTY: ok');

    // List content (flat)
    const content = await jsonFetch('/api/content?flat=true');
    console.log(`CONTENT: ${content.length} found`);

    // Update settings via POST
    const settings = await jsonFetch('/api/settings?flat=true');
    const updated = await jsonFetch('/api/settings', {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({ ...settings, phone: settings.phone || '+251 000 000 000' })
    });
    console.log('UPDATE SETTINGS: ok');

    console.log('SMOKE: PASS');
    process.exit(0);
  } catch (err: any) {
    console.error('SMOKE: FAIL ->', err.message);
    process.exit(1);
  }
})();

