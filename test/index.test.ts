import * as core from '@actions/core';
import * as fs from 'fs-extra';
import { run } from '../src/index';
import { generatePropertyTypesSchema } from '../src/property-types';
import { generateResourceSchema } from '../src/resources';

jest.mock('@actions/core');
jest.mock('fs-extra');
jest.mock('../src/property-types');
jest.mock('../src/resources');

const mockCore = core as jest.Mocked<typeof core>;
const mockFs = fs as jest.Mocked<typeof fs>;
const mockGeneratePropertyTypesSchema = generatePropertyTypesSchema as jest.MockedFunction<
  typeof generatePropertyTypesSchema
>;
const mockGenerateResourceSchema = generateResourceSchema as jest.MockedFunction<
  typeof generateResourceSchema
>;

describe('Index', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should handle core.getInput error', () => {
    mockCore.getInput.mockImplementation(() => {
      throw new Error('Input error');
    });

    expect(() => run()).toThrow('Input error');
  });

  test('should handle empty output path', () => {
    mockCore.getInput.mockReturnValue('');

    expect(() => run()).toThrow('output-path is required and cannot be empty');
  });

  test('should handle whitespace-only output path', () => {
    mockCore.getInput.mockReturnValue('   ');

    expect(() => run()).toThrow('output-path is required and cannot be empty');
  });

  test('should handle null output path', () => {
    mockCore.getInput.mockReturnValue(null as any);

    expect(() => run()).toThrow('output-path is required and cannot be empty');
  });

  test('should handle path traversal attack', () => {
    mockCore.getInput.mockReturnValue('../malicious/path');

    expect(() => run()).toThrow('Invalid output-path: path traversal detected');
  });

  test('should handle path with double dots', () => {
    mockCore.getInput.mockReturnValue('valid/path/../../../etc/passwd');

    expect(() => run()).toThrow('Invalid output-path: path traversal detected');
  });

  test('should handle schema generation error', () => {
    mockCore.getInput.mockReturnValue('/valid/path');
    mockGeneratePropertyTypesSchema.mockImplementation(() => {
      throw new Error('Schema generation failed');
    });

    expect(() => run()).toThrow('Failed to generate schemas: Schema generation failed');
  });

  test('should handle resource schema generation error', () => {
    mockCore.getInput.mockReturnValue('/valid/path');
    mockGeneratePropertyTypesSchema.mockReturnValue({} as any);
    mockGenerateResourceSchema.mockImplementation(() => {
      throw new Error('Resource schema failed');
    });

    expect(() => run()).toThrow('Failed to generate schemas: Resource schema failed');
  });

  test('should successfully generate schemas and write files', () => {
    const mockPropertyTypes = { test: 'property' };
    const mockResources = { test: 'resource' };

    mockCore.getInput.mockReturnValue('/valid/path');
    mockGeneratePropertyTypesSchema.mockReturnValue(mockPropertyTypes as any);
    mockGenerateResourceSchema.mockReturnValue(mockResources as any);
    mockFs.writeFileSync.mockImplementation(() => {});

    expect(() => run()).not.toThrow();
    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      '/valid/path/cdk-types.json',
      JSON.stringify(mockPropertyTypes, null, 2),
      { encoding: 'utf-8' }
    );
    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      '/valid/path/cdk-resources.json',
      JSON.stringify(mockResources, null, 2),
      { encoding: 'utf-8' }
    );
  });
});
