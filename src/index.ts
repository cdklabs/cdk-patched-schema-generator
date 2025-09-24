import * as path from 'path';
import * as core from '@actions/core';
import fs from 'fs-extra';
import { generatePropertyTypesSchema } from './property-types';
import { generateResourceSchema } from './resources';

const OUTPUT_FILES = {
  types: 'cdk-types.json',
  resources: 'cdk-resources.json',
} as const;

export function run() {
  const outputPath = validateOutputPath(core.getInput('output-path', { required: true }));
  const { propertyTypes, resources } = generateSchemas();

  writeFile(propertyTypes, `${outputPath}/${OUTPUT_FILES.types}`);
  writeFile(resources, `${outputPath}/${OUTPUT_FILES.resources}`);
}

try {
  run();
} catch (error: any) {
  core.setFailed(error.message);
}

const validateOutputPath = (outputPath: string) => {
  if (!outputPath?.trim()) {
    throw new Error('output-path is required and cannot be empty');
  }

  const normalizedPath = path.normalize(outputPath).replace(/^(\.[\/\\])+/, '');
  if (normalizedPath !== outputPath || normalizedPath.includes('..')) {
    throw new Error('Invalid output-path: path traversal detected');
  }

  return outputPath;
};

const generateSchemas = () => {
  try {
    return {
      propertyTypes: generatePropertyTypesSchema(),
      resources: generateResourceSchema(),
    };
  } catch (error) {
    throw new Error(`Failed to generate schemas: ${(error as Error).message}`);
  }
};

// File operations
const writeFile = (schema: any, outputPath: string) => {
  console.log(`Generating ${outputPath}`);

  try {
    fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2), { encoding: 'utf-8' });
  } catch (error) {
    throw new Error(`Failed to write file ${outputPath}: ${error}`);
  }
};
