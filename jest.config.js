export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleFileExtensions: ['js'],
  testMatch: ['**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/', '/genesis/', '/evolutionary-optimization/'],
  collectCoverageFrom: [
    'js/**/*.js',
    '!js/**/*.test.js',
    '!js/app.js',
    '!js/router.js', // Exclude router (tested via E2E)
    '!js/views.js', // Exclude views (tested via E2E)
    '!js/project-view.js', // Exclude project view (tested via E2E)
    '!**/node_modules/**',
    '!**/genesis/**',
    '!**/evolutionary-optimization/**'
  ],
  coverageThreshold: {
    global: {
      statements: 60,
      branches: 45,
      functions: 60,
      lines: 60
    }
  },
  coverageReporters: ['text', 'lcov', 'html'],
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};

