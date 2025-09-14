import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  moduleFileExtensions: ['js', 'json', 'ts'],
  testMatch: ['**/?(*.)+(spec|test).ts'],
  coverageDirectory: './coverage',
  collectCoverageFrom: ['src/**/*.ts', '!src/main.ts'],
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
};
export default config;
