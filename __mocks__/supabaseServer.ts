// __mocks__/supabaseServer.ts
export const getBrowserClient = jest.fn(() => ({
  auth: {
    getSession: jest.fn(() => Promise.resolve({ data: { session: { access_token: 'mock-token' } } })),
    getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'mock-user' } } })),
  },
  from: jest.fn(() => ({ select: jest.fn(() => Promise.resolve({ data: [] })) })),
}));
export const getServiceClient = jest.fn(() => ({
  auth: {
    getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'mock-user' } } })),
  },
  from: jest.fn(() => ({ select: jest.fn(() => Promise.resolve({ data: [] })) })),
}));
