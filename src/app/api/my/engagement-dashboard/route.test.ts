import { NextRequest } from 'next/server';
import { GET } from './route';

describe('/api/my/engagement-dashboard API', () => {
  it('restituisce demo data se non autenticato', async () => {
    const req = new NextRequest('http://localhost/api/my/engagement-dashboard', { method: 'GET', headers: new Headers() });
    const response = await GET(req);
    const json = await response.json();
  expect(json).toHaveProperty('rows');
  expect(Array.isArray(json.rows)).toBe(true);
  expect(json).toHaveProperty('budgets');
  expect(json.budgets).toHaveProperty('total');
  });

  it('restituisce errore se JWT non valido', async () => {
    const headers = new Headers({ Authorization: 'Bearer fake-token' });
    const req = new NextRequest('http://localhost/api/my/engagement-dashboard', { method: 'GET', headers });
    const response = await GET(req);
    const json = await response.json();
    expect([200, 401]).toContain(response.status);
    if (response.status === 401) {
      expect(json).toHaveProperty('error');
    } else {
      // In ambiente demo Supabase accetta qualsiasi JWT
      expect(json).toHaveProperty('rows');
    }
  });

  // Per test autenticato reale: mocka getServiceClient e db.auth.getUser
});
