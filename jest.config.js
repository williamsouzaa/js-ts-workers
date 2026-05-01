module.exports = {
  preset: 'ts-jest',
  roots: ['<rootDir>/app'],
  collectCoverageFrom: [
    '<rootDir>/app/**/*.ts',
    '!<rootDir>/app/**/*-protocols.ts',
    '!<rootDir>/app/**/*Mock.ts',
    '!<rootDir>/app/**/*Mocks.ts',
    '!<rootDir>/app/**/*STUB.ts',
    '!**/protocols/**',
    '!**/test/**',
    '!**/tests/**',
  ],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  transform: {
    '.+\\.ts$': 'ts-jest'
  }
}