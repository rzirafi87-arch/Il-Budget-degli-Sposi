import { NextRequest } from 'next/server';
import { GET } from './route';

describe('/api/my/dashboard API', () => {
  it('restituisce demo data se non autenticato', async () => {
  const req = new NextRequest('http://localhost/api/my/dashboard', { method: 'GET', headers: new Headers() });
    const response = await GET(req);
    const json = await response.json();
    expect(json).toHaveProperty('rows');
    expect(Array.isArray(json.rows)).toBe(true);
    expect(json).toHaveProperty('totalBudget');
  });
});
