import * as core from '@actions/core';

import { writeFile } from './common';
import { generatePropertyTypesSchema } from './property-types';
import { generateResourceSchema } from './resources';

export function run() {
  let outputPath: string;

  try {
    outputPath = core.getInput('output-path', { required: true });
  } catch (error) {
    throw new Error('Failed to get output-path input');
  }

  if (!outputPath || !outputPath.trim()) {
    throw new Error('output-path is required and cannot be empty');
  }

  const propertyTypes = generatePropertyTypesSchema();
  const resources = generateResourceSchema();

  writeFile(propertyTypes, `${outputPath}/cdk-types.json`);
  writeFile(resources, `${outputPath}/cdk-resources.json`);
}

try {
  run();
} catch (error: any) {
  core.setFailed(error.message);
}
