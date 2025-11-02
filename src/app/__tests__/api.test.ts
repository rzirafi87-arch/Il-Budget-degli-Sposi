// Mock next/server to avoid edge runtime globals
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: any, init?: any) => ({ json: async () => body, status: init?.status ?? 200 }),
  },
}));

// Build a tiny chainable query mock that is awaitable
function createQuery(data: any) {
  const q: any = {
    _data: data,
    select() { return this; },
    eq() { return this; },
    is() { return this; },
    order() { return this; },
    limit() { return this; },
    single() { return Promise.resolve({ data: this._data, error: null }); },
    then(res: any) { res({ data: this._data, error: null }); return Promise.resolve(); },
  };
  return q;
}

describe('API routes', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('GET /api/traditions returns traditions for country', async () => {
    jest.doMock('@/lib/supabaseServer', () => ({
      getServiceClient: () => ({ from: () => createQuery([{ id: 't1', country_code: 'mx' }]) }),
    }));

    const traditionsRoute = require('../api/traditions/route');
    const req: any = { nextUrl: new URL('http://localhost/api/traditions?country=mx') };
    const res = await traditionsRoute.GET(req as any);
    const json = await (res as any).json();
    expect(json.traditions).toHaveLength(1);
  });

  it('GET /api/checklist-modules returns modules', async () => {
    jest.doMock('@/lib/supabaseServer', () => ({
      getServiceClient: () => ({ from: () => createQuery([{ id: 'c1' }]) }),
    }));

    const checklistRoute = require('../api/checklist-modules/route');
    const req: any = { nextUrl: new URL('http://localhost/api/checklist-modules?country=mx') };
    const res = await checklistRoute.GET(req as any);
    const json = await (res as any).json();
    expect(json.modules).toHaveLength(1);
  });

  it('GET /api/budget-items (public) returns items template', async () => {
    jest.doMock('@/lib/supabaseServer', () => ({
      getServiceClient: () => ({ from: () => createQuery([{ id: 'b1' }]) }),
    }));

    const budgetItemsRoute = require('../api/budget-items/route');
    const req: any = { nextUrl: new URL('http://localhost/api/budget-items?country=mx'), headers: new Headers() };
    const res = await budgetItemsRoute.GET(req as any);
    const json = await (res as any).json();
    expect(json.items).toHaveLength(1);
  });

  it('POST /api/budget-items inserts for authenticated user', async () => {
    const fromMock = (table: string) => {
      if (table === 'events') {
        return createQuery({ id: 'evt-1' });
      }
      if (table === 'budget_items') {
        const query: any = createQuery([]);
        query.insert = (payload: any) => ({ select: () => ({ data: payload.map((p: any, i: number) => ({ id: 'new-' + i, ...p })) }) });
        return query;
      }
      return createQuery([]);
    };
    jest.doMock('@/lib/supabaseServer', () => ({
      getServiceClient: () => ({
        auth: { getUser: jest.fn(async () => ({ data: { user: { id: 'u1' } } })) },
        from: fromMock,
      }),
    }));

    const budgetItemsRoute = require('../api/budget-items/route');
    const body = { name: 'Item', country_code: 'it' };
    const req: any = { headers: new Headers({ authorization: 'Bearer token' }), json: async () => body };
    const res = await budgetItemsRoute.POST(req as any);
    const json = await (res as any).json();
    expect(json.item).toBeTruthy();
    expect(json.item.event_id).toBe('evt-1');
  });
});
