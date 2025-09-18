import { fillProperties, sort, TypeMap } from './common';
import { getParentResource, getService, getTypes } from './database';

export const generatePropertyTypesSchema = (): TypeMap => {
  const propertyTypes: Record<string, any> = {};
  for (const type of getTypes()) {
    const parent = getParentResource(type);
    const service = getService(parent.cloudFormationType);
    const propertyName = `${type.name}Property`;
    const name = `${parent.cloudFormationType}.${propertyName}`;

    propertyTypes[name] = {
      name: `Cfn${parent.name}.${propertyName}`,
      properties: fillProperties(type.properties, service.cloudFormationNamespace),
    };
  }

  // Add CfnTag since it is not in the schema but we need the type
  propertyTypes.CfnTag = {
    name: 'CfnTag',
    properties: {
      Key: {
        name: 'Key',
        valueType: {
          primitive: 'string',
        },
        required: true,
      },
      Value: {
        name: 'Value',
        valueType: {
          primitive: 'string',
        },
        required: true,
      },
    },
  };

  return sort(propertyTypes);
};
