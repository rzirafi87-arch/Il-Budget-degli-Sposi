import { NextRequest } from 'next/server';
import { GET } from './route';

describe('/api/my/engagement-dashboard API', () => {
  it('restituisce demo data se non autenticato', async () => {
    const req = new NextRequest('http://localhost/api/my/engagement-dashboard', { method: 'GET', headers: new Headers() });
    const response = await GET(req);
    const json = await response.json();
    expect(json).toHaveProperty('rows');
    expect(Array.isArray(json.rows)).toBe(true);
    expect(json).toHaveProperty('totalBudget');
  });

  it('restituisce errore se JWT non valido', async () => {
    const headers = new Headers({ Authorization: 'Bearer fake-token' });
    const req = new NextRequest('http://localhost/api/my/engagement-dashboard', { method: 'GET', headers });
    const response = await GET(req);
    const json = await response.json();
    expect(response.status).toBe(401);
    expect(json).toHaveProperty('error');
  });

  // Per test autenticato reale: mocka getServiceClient e db.auth.getUser
});
