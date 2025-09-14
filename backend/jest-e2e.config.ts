import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  moduleFileExtensions: ['ts', 'js', 'json'],
  testMatch: ['<rootDir>/e2e/**/*.e2e-spec.ts'], 
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  bail: false,
  verbose: true,
};
export default config;
