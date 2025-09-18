import * as core from '@actions/core';
import { writeFile } from '../src/common';
import { generatePropertyTypesSchema } from '../src/property-types';
import { generateResourceSchema } from '../src/resources';

// Mock the modules
jest.mock('@actions/core');
jest.mock('../src/common');
jest.mock('../src/property-types');
jest.mock('../src/resources');

const mockCore = core as jest.Mocked<typeof core>;
const mockWriteFile = writeFile as jest.MockedFunction<typeof writeFile>;
const mockGeneratePropertyTypesSchema = generatePropertyTypesSchema as jest.MockedFunction<
  typeof generatePropertyTypesSchema
>;
const mockGenerateResourceSchema = generateResourceSchema as jest.MockedFunction<
  typeof generateResourceSchema
>;

describe('run function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCore.getInput.mockReturnValue('/test/output');
    mockGeneratePropertyTypesSchema.mockReturnValue({
      'Test::Type': { name: 'TestType', properties: {} },
    });
    mockGenerateResourceSchema.mockReturnValue({
      'Test::Resource': { name: 'TestResource', properties: {} },
    });
  });

  test('should generate schemas and write files', async () => {
    const { run } = await import('../src/index');

    run();

    expect(mockCore.getInput).toHaveBeenCalledWith('output-path', { required: true });
    expect(mockGeneratePropertyTypesSchema).toHaveBeenCalled();
    expect(mockGenerateResourceSchema).toHaveBeenCalled();
    expect(mockWriteFile).toHaveBeenCalledWith(
      {
        'Test::Type': { name: 'TestType', properties: {} },
      },
      '/test/output/cdk-types.json'
    );
    expect(mockWriteFile).toHaveBeenCalledWith(
      {
        'Test::Resource': { name: 'TestResource', properties: {} },
      },
      '/test/output/cdk-resources.json'
    );
  });

  test('should handle errors and call core.setFailed', async () => {
    mockGeneratePropertyTypesSchema.mockImplementation(() => {
      throw new Error('Generation failed');
    });

    const { run } = await import('../src/index');

    expect(() => run()).toThrow('Generation failed');
  });
});
