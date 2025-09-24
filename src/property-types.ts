import {
  CFN,
  CFN_TAG,
  generateBindings,
  generateCoreBindings,
  mapPropertiesToSchema,
  sortSchema,
} from './common';
import { getParentResource, getService, getTypes } from './database';
import { PropertySpec, PropertyTypeSchema } from './schema-types';

const createStringProperty = (name: string): PropertySpec => ({
  name,
  valueType: { primitive: 'string' },
  required: true,
});

/**
 * Generates the cdk patched schema for property types
 */
export const generatePropertyTypesSchema = (): PropertyTypeSchema => {
  const propertyTypes: PropertyTypeSchema = {};

  for (const type of getTypes()) {
    const parent = getParentResource(type);
    const propertyName = `${type.name}Property`;

    propertyTypes[`${parent.cloudFormationType}.${propertyName}`] = {
      name: generateBindings(getService(parent), `${CFN}${parent.name}.${propertyName}`),
      properties: mapPropertiesToSchema(type.properties, parent.cloudFormationType),
    };
  }

  propertyTypes.CfnTag = {
    name: generateCoreBindings(CFN_TAG),
    properties: {
      Key: createStringProperty('Key'),
      Value: createStringProperty('Value'),
    },
  };

  return sortSchema(propertyTypes);
};
