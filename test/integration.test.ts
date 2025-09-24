import * as path from 'path';
import * as core from '@actions/core';
import * as fs from 'fs-extra';
import { run } from '../src/index';

jest.mock('@actions/core');
const mockCore = core as jest.Mocked<typeof core>;

describe('Integration Test', () => {
  const testOutputDir = path.join(__dirname, '..', 'test-output');

  beforeAll(() => {
    fs.emptyDirSync(testOutputDir);
  });

  test('should generate actual schema files', () => {
    fs.ensureDirSync(testOutputDir);
    mockCore.getInput.mockReturnValue(testOutputDir);
    mockCore.setFailed.mockImplementation(() => {});

    expect(() => run()).not.toThrow();

    const typesFile = path.join(testOutputDir, 'cdk-types.json');
    const resourcesFile = path.join(testOutputDir, 'cdk-resources.json');

    expect(fs.existsSync(typesFile)).toBe(true);
    expect(fs.existsSync(resourcesFile)).toBe(true);

    const typesContent = fs.readJsonSync(typesFile);
    const resourcesContent = fs.readJsonSync(resourcesFile);

    expect(typesContent).toHaveProperty('CfnTag');

    // Not exact numbers, but there should be lots in each
    expect(Object.keys(typesContent).length).toBeGreaterThan(7500);
    expect(Object.keys(resourcesContent).length).toBeGreaterThan(1000);
  });

  test('should handle file write permission error', () => {
    const readOnlyDir = path.join(testOutputDir, 'readonly');
    fs.ensureDirSync(readOnlyDir);
    fs.chmodSync(readOnlyDir, 0o444);

    mockCore.getInput.mockReturnValue(readOnlyDir);
    mockCore.setFailed.mockImplementation(() => {});

    expect(() => run()).toThrow('Failed to write file');

    fs.chmodSync(readOnlyDir, 0o755);
    fs.removeSync(readOnlyDir);
  });
});
