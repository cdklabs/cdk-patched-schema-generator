import {
  CFN,
  generateBindings,
  mapAttributesToSchema,
  mapPropertiesToSchema,
  sortSchema,
} from './common';
import { getResources, getService } from './database';
import { ResourceSchema } from './schema-types';

/**
 * Generates the cdk patched schema for resources
 */
export const generateResourceSchema = (): ResourceSchema => {
  const resourceTypes: ResourceSchema = {};
  for (const resource of getResources()) {
    const cloudFormationType = resource.cloudFormationType;
    const service = getService(resource);

    resourceTypes[cloudFormationType] = {
      construct: generateBindings(service, `${CFN}${resource.name}`),
      attributes: mapAttributesToSchema(resource.attributes, cloudFormationType),
      properties: mapPropertiesToSchema(resource.properties, cloudFormationType),
    };
  }

  return sortSchema(resourceTypes);
};
