import * as core from '@actions/core';

import { writeFile } from './common';
import { generatePropertyTypesSchema } from './property-types';
import { generateResourceSchema } from './resources';

async function run() {
  const outputPath: string = core.getInput('output-path');

  writeFile(generatePropertyTypesSchema(), outputPath);
  writeFile(generateResourceSchema(), outputPath);
}

run().catch((error) => {
  core.setFailed(error.message);
});
