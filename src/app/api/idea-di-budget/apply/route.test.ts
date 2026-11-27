jest.mock('next/server', () => ({ NextResponse: { json: (body: unknown, init?: { status?: number }) => ({ status: init?.status ?? 200, json: async () => body }) } }));
const mockRpc = jest.fn();
const mockFrom = jest.fn();
const mockGetUser = jest.fn();
jest.mock('@/lib/supabaseServer', () => ({ getServiceClient: () => ({ auth: { getUser: mockGetUser }, from: mockFrom, rpc: mockRpc }) }));
jest.mock('@/lib/currentEvent', () => ({ requireServerCurrentEvent: async () => ({ eventId: 'event-a' }) }));
import type { NextRequest } from 'next/server';
import { POST } from './route';
const rows = [{ name: 'Custom', custom: true, amount: 100, spendType: 'common' }];
function request(body: unknown, token = 'test') {
 return { headers: new Headers(token ? { authorization: `Bearer ${token}` } : {}), nextUrl: new URL('http://localhost/api/idea-di-budget/apply'), json: async () => body } as unknown as NextRequest;
}
beforeEach(() => {
 jest.clearAllMocks();
 mockGetUser.mockResolvedValue({ data: { user: { id: 'actor' } }, error: null });
 mockRpc.mockResolvedValue({ data: { success: true, inserted: 1 }, error: null });
});
it('uses the server actor/event and a single transactional RPC', async () => {
 const response = await POST(request({ country: 'IT', rows, event_id: 'foreign-event', actor_id: 'stranger' }));
 expect(response.status).toBe(200);
 expect(await response.json()).toEqual({ success: true, inserted: 1 });
 expect(mockRpc).toHaveBeenCalledWith('apply_budget_idea_atomic', { p_event_id: 'event-a', p_actor_id: 'actor', p_country: 'it', p_items: [{ name: 'Custom', amount: 100, spend_type: 'common', canonical_key: null }] });
 expect(mockFrom).not.toHaveBeenCalled();
});
it.each(['23514','PGRST202','42501'])('never falls back to destructive queries when RPC returns %s', async code => {
 mockRpc.mockResolvedValue({ data: null, error: { code, message: 'private detail' } });
 const response = await POST(request({ country: 'it', rows }));
 expect(response.status).toBe(500);
 expect(await response.json()).toEqual({ error: 'BUDGET_IDEA_APPLY_FAILED' });
 expect(mockFrom).not.toHaveBeenCalled();
});
it('does not read or replace data without a token', async () => {
 expect((await POST(request({ rows }, ''))).status).toBe(401);
 expect(mockRpc).not.toHaveBeenCalled();
 expect(mockFrom).not.toHaveBeenCalled();
});
it('does not replace data for an invalid session', async () => {
 mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'invalid' } });
 expect((await POST(request({ rows }))).status).toBe(401);
 expect(mockRpc).not.toHaveBeenCalled();
});
it('passes an explicit all-disabled replacement as an empty array', async () => {
 await POST(request({ rows: [{ ...rows[0], enabled: false }] }));
 expect(mockRpc.mock.calls[0][1].p_items).toEqual([]);
});

it.each(['common','bride','groom'])('preserves the selected contributor %s', async spendType => {
 await POST(request({ rows: [{ ...rows[0], spendType }] }));
 expect(mockRpc.mock.calls[0][1].p_items[0].spend_type).toBe(spendType);
});
