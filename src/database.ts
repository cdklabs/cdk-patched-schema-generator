import { loadAwsServiceSpecSync } from '@aws-cdk/aws-service-spec';
import {
  DefinitionReference,
  Resource,
  Service,
  TypeDefinition,
} from '@aws-cdk/service-spec-types';

let DATABASE: any;
let SORTED_RESOURCES: Resource[];
let SORTED_TYPES: TypeDefinition[];
let initialized = false;

const initDatabase = () => {
  if (!initialized) {
    DATABASE = loadAwsServiceSpecSync();
    const RESOURCES = DATABASE.all('resource');
    const TYPES = DATABASE.all('typeDefinition');
    SORTED_RESOURCES = Object.values(RESOURCES).sort() as Resource[];
    SORTED_TYPES = Object.values(TYPES).sort() as TypeDefinition[];
    initialized = true;
  }
};

export const getTypeDefinition = (propertyType: DefinitionReference) => {
  initDatabase();
  const ref = DATABASE.get('typeDefinition', propertyType.reference.$ref);
  return ref.name;
};

export const getService = (cloudFormationType: string): Service => {
  initDatabase();
  const serviceType = cloudFormationType.split('::').slice(0, 2).join('::');
  const results = DATABASE.lookup('service', 'cloudFormationNamespace', 'equals', serviceType);

  try {
    return results.only();
  } catch (error) {
    throw new Error(`Service not found for type ${serviceType}: ${error}`);
  }
};

export const getResources = (): Resource[] => {
  initDatabase();
  return SORTED_RESOURCES;
};

export const getTypes = (): TypeDefinition[] => {
  initDatabase();
  return SORTED_TYPES;
};

export const getParentResource = (type: TypeDefinition): Resource => {
  initDatabase();
  const results = DATABASE.incoming('usesType', type);

  try {
    return results.only().entity;
  } catch (error) {
    throw new Error(`Parent resource not found for type ${type.name}: ${error}`);
  }
};
