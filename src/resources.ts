import { fillAttributes, fillProperties, sort, TypeMap } from './common';
import { getResources } from './database';

export const generateResourceSchema = (): TypeMap => {
  const resourceTypes: TypeMap = {};
  for (const resource of getResources()) {
    const cloudFormationType = resource.cloudFormationType;

    resourceTypes[cloudFormationType] = {
      name: `Cfn${resource.name}`,
      attributes: fillAttributes(resource.attributes, cloudFormationType),
      properties: fillProperties(resource.properties, cloudFormationType),
    };
  }

  // TODO: Maybe Add Custom Resources as well, something like this:

  // resourceTypes['AWS::CloudFormation::CfnCustomResource'] = {
  //   name: 'CfnCustomResource',
  //   attributes: {},
  //   properties: {
  //     ServiceToken: {
  //       name: 'ServiceToken',
  //       valueType: {
  //         primitive: 'string',
  //       },
  //     },
  //   },
  // };

  return sort(resourceTypes);
};
