import { loadAwsServiceSpecSync } from '@aws-cdk/aws-service-spec';
import {
  DefinitionReference,
  Resource,
  Service,
  TypeDefinition,
} from '@aws-cdk/service-spec-types';

const DATABASE = loadAwsServiceSpecSync();

const RESOURCES = DATABASE.all('resource');
const TYPES = DATABASE.all('typeDefinition');

export const getTypeDefinition = (propertyType: DefinitionReference) => {
  const ref = DATABASE.get('typeDefinition', propertyType.reference.$ref);
  return ref.name;
};

export const getService = (cloudFormationType: string): Service => {
  const serviceType = cloudFormationType.split('::').slice(0, 2).join('::');
  return DATABASE.lookup('service', 'cloudFormationNamespace', 'equals', serviceType).only();
};

export const getResources = (): Resource[] => {
  return Object.values(RESOURCES).sort();
};

export const getTypes = (): TypeDefinition[] => {
  return Object.values(TYPES).sort();
};

export const getParentResource = (type: TypeDefinition): Resource => {
  return DATABASE.incoming('usesType', type).only().entity;
};
