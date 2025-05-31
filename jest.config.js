module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/lib'],
  testMatch: ['**/*.spec.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  moduleNameMapper: {
    '^services/(.*)$': '<rootDir>/lib/common/services/$1',
    '^utils/(.*)$': '<rootDir>/lib/common/utils/$1',
  },
};
