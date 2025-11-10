import { createMocks } from 'node-mocks-http';
import { GET } from './route';

describe('/api/my/dashboard API', () => {
  it('restituisce demo data se non autenticato', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: {},
      url: '/api/my/dashboard',
    });
    // Simula NextRequest
    req.headers = {};
    const response = await GET(req);
    const json = await response.json();
    expect(json).toHaveProperty('rows');
    expect(Array.isArray(json.rows)).toBe(true);
    expect(json).toHaveProperty('totalBudget');
  });
});
