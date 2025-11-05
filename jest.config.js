module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(t|j)sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  setupFilesAfterEnv: [
    '<rootDir>/node_modules/@testing-library/jest-dom',
    '<rootDir>/jest.setup.js',
  ],
  moduleNameMapper: {
    '^\.\./dashboard/page$': '<rootDir>/__mocks__/dashboardPage.tsx',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/lib/supabaseServer$': '<rootDir>/__mocks__/supabaseServer.ts',
  },
};
