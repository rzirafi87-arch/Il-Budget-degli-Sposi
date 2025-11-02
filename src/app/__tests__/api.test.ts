// Mock next/server to avoid edge runtime globals
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => (
      { json: async () => body, status: init?.status ?? 200 } as { json: () => Promise<unknown>; status: number }
    ),
  },
}));

// Build a tiny chainable query mock that is awaitable
type Query<T> = {
  _data: T;
  select: (..._args: unknown[]) => Query<T>;
  eq: (..._args: unknown[]) => Query<T>;
  is: (..._args: unknown[]) => Query<T>;
  order: (..._args: unknown[]) => Query<T>;
  limit: (..._args: unknown[]) => Query<T>;
  single: () => Promise<{ data: T; error: null }>;
  maybeSingle?: () => Promise<{ data: T | null; error: null }>;
  then: (res: (value: { data: T; error: null }) => void) => Promise<void>;
  insert?: (payload: unknown) => { select: () => { data: unknown } };
};

function createQuery<T>(data: T): Query<T> {
  const self: Query<T> = {
    _data: data,
    select: () => self,
    eq: () => self,
    is: () => self,
    order: () => self,
    limit: () => self,
    single: () => Promise.resolve({ data, error: null }),
    maybeSingle: () => Promise.resolve({ data, error: null }),
    then: (res) => { res({ data, error: null }); return Promise.resolve(); },
  };
  return self;
}

describe('API routes', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('GET /api/traditions returns traditions for country', async () => {
    // Mock both the view (schema/app) and legacy table access; return empty view to trigger fallback
    jest.doMock('@/lib/supabaseServer', () => ({
      getServiceClient: () => ({
        schema: () => ({ from: () => createQuery([]) }),
        from: () => createQuery([{ id: 't1', country_code: 'mx' }]),
      }),
    }));

    const traditionsRoute = await import('../api/traditions/route');
    const req = { nextUrl: new URL('http://localhost/api/traditions?country=mx') };
  const res = await traditionsRoute.GET(req as unknown as import('next/server').NextRequest);
    const json = await (res as { json: () => Promise<unknown> }).json() as { traditions: unknown[] };
    expect(Array.isArray(json.traditions) ? json.traditions.length : 0).toBe(1);
  });

  it('GET /api/checklist-modules returns modules', async () => {
    jest.doMock('@/lib/supabaseServer', () => ({
      getServiceClient: () => ({ from: () => createQuery([{ id: 'c1' }]) }),
    }));

    const checklistRoute = await import('../api/checklist-modules/route');
    const req = { nextUrl: new URL('http://localhost/api/checklist-modules?country=mx') };
  const res = await checklistRoute.GET(req as unknown as import('next/server').NextRequest);
    const json = await (res as { json: () => Promise<unknown> }).json() as { modules: unknown[] };
    expect(Array.isArray(json.modules) ? json.modules.length : 0).toBe(1);
  });

  it('GET /api/budget-items (public) returns items template', async () => {
    jest.doMock('@/lib/supabaseServer', () => ({
      getServiceClient: () => ({ from: () => createQuery([{ id: 'b1' }]) }),
    }));

    const budgetItemsRoute = await import('../api/budget-items/route');
    const req = { nextUrl: new URL('http://localhost/api/budget-items?country=mx'), headers: new Headers() };
  const res = await budgetItemsRoute.GET(req as unknown as import('next/server').NextRequest);
    const json = await (res as { json: () => Promise<unknown> }).json() as { items: unknown[] };
    expect(Array.isArray(json.items) ? json.items.length : 0).toBe(1);
  });

  it('POST /api/budget-items inserts for authenticated user', async () => {
    const fromMock = (table: string) => {
      if (table === 'events') {
        return createQuery({ id: 'evt-1' });
      }
      if (table === 'budget_items') {
        const query = createQuery([] as unknown[]);
        query.insert = (payload: unknown) => ({ select: () => ({ data: (payload as Record<string, unknown>[]).map((p, i) => ({ id: 'new-' + i, ...p })) }) });
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
    const budgetItemsRoute = await import('../api/budget-items/route');
    const body = { name: 'Item', country_code: 'it' };
    const req = { headers: new Headers({ authorization: 'Bearer token' }), json: async () => body };
  const res = await budgetItemsRoute.POST(req as unknown as import('next/server').NextRequest);
    const json = await (res as { json: () => Promise<unknown> }).json() as { item: { event_id: string } };
    expect(json.item).toBeTruthy();
    expect(json.item.event_id).toBe('evt-1');
  });
});
