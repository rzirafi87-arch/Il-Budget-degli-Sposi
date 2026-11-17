jest.mock('next/server', () => ({ NextResponse: { json: (body: unknown, init?: { status?: number }) => ({ status: init?.status ?? 200, json: async () => body }) } }));
let mockStored = ['previous-budget-idea'];
const mockInsert = jest.fn(() => ({ select: async () => ({ data: null, error: { code: '23514' } }) }));
jest.mock('@/lib/currentEvent', () => ({ requireServerCurrentEvent: async () => ({ eventId: 'event-a' }) }));
jest.mock('@/constants/budgetCategories', () => ({ findWeddingBudgetItem: () => undefined }));
jest.mock('@/lib/budgetCanonical', () => ({ deduplicateCanonicalBudgetItems: (rows: unknown[]) => rows }));
jest.mock('@/lib/supabaseServer', () => ({ getServiceClient: () => ({ auth: { getUser: async () => ({ data: { user: { id: 'owner' } }, error: null }) }, from: () => ({ delete: () => { const chain: { eq: jest.Mock; then: (resolve: (v: unknown) => void) => void } = { eq: jest.fn(() => chain), then: resolve => { mockStored = []; resolve({ error: null }); } }; return chain; }, insert: mockInsert }) }) }));
import type { NextRequest } from 'next/server';
import { POST } from '@/app/api/idea-di-budget/apply/route';
it('retains previous idea-generated budget entries when replacement insert fails', async () => {
 const response = await POST({ headers: new Headers({ authorization: 'Bearer isolated-test' }), nextUrl: new URL('http://localhost/api/idea-di-budget/apply'), json: async () => ({ country: 'it', rows: [{ custom: true, name: 'replacement', amount: 100 }] }) } as NextRequest);
 expect(response.status).toBe(500);
 expect(mockInsert).toHaveBeenCalled();
 expect(mockStored).toEqual(['previous-budget-idea']);
});
