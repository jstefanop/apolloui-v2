const nextJest = require('next/jest');

// Uses Next's SWC transform so JSX/ESM/CSS/asset imports work out of the box.
const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const customConfig = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Co-located tests only (avoid picking up the backend's tests/ dir if nested).
  testMatch: ['<rootDir>/src/**/*.test.js'],
  clearMocks: true,
};

module.exports = createJestConfig(customConfig);
