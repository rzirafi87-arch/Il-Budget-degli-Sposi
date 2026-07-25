// Simple Next.js router mock for testing
type MockRouter = {
  basePath: string;
  pathname: string;
  route: string;
  asPath: string;
  query: Record<string, string | string[]>;
  push: jest.Mock;
  replace: jest.Mock;
  reload: jest.Mock;
  back: jest.Mock;
  prefetch: jest.Mock;
  beforePopState: jest.Mock;
  events: { on: jest.Mock; off: jest.Mock; emit: jest.Mock };
  isFallback: boolean;
};

export function createMockRouter(overrides: Partial<MockRouter> = {}): MockRouter {
  return {
    basePath: "",
    pathname: "/",
    route: "/",
    asPath: "/",
    query: {},
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn().mockResolvedValue(undefined),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isFallback: false,
    ...overrides,
  };
}
