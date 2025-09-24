import { loadAwsServiceSpecSync } from '@aws-cdk/aws-service-spec';
import {
  DefinitionReference,
  Resource,
  Service,
  SpecDatabase,
  TypeDefinition,
} from '@aws-cdk/service-spec-types';

/**
 * Singleton wrapper for AWS service specification database
 */
class Database {
  private readonly db: SpecDatabase;
  readonly resources: Resource[];
  readonly types: TypeDefinition[];

  constructor() {
    this.db = loadAwsServiceSpecSync();
    this.resources = Object.values(this.db.all('resource')) as Resource[];
    this.types = Object.values(this.db.all('typeDefinition')) as TypeDefinition[];
  }

  /**
   * Gets the type definition name for a property type
   * @param propertyType the property type
   * @returns the type definition
   */
  getTypeDefinition(propertyType: DefinitionReference) {
    return this.db.get('typeDefinition', propertyType.reference.$ref).name;
  }

  /**
   * Gets the service for a resource
   * @param resource the resource
   * @returns the service that resource belongs to
   */
  getService(resource: Resource): Service {
    try {
      return this.db.incoming('hasResource', resource).only().entity;
    } catch (error) {
      throw new Error(`Service not found for resource type ${resource.name}: ${error}`);
    }
  }

  /**
   * Gets the parent resource for a property type
   * @param type the property type
   * @returns the parent resource to the property
   */
  getParentResource(type: TypeDefinition): Resource {
    try {
      return this.db.incoming('usesType', type).only().entity;
    } catch (error) {
      throw new Error(`Parent resource not found for type ${type.name}: ${error}`);
    }
  }
}

let database: Database;
const getDatabase = () => (database ??= new Database());

/**
 * Gets the type definition name for a property type
 * @param propertyType the property type
 * @returns the type definition
 */
export const getTypeDefinition = (propertyType: DefinitionReference) =>
  getDatabase().getTypeDefinition(propertyType);

/**
 * Gets the service for a resource
 * @param resource the resource
 * @returns the service that resource belongs to
 */
export const getService = (resource: Resource) => getDatabase().getService(resource);

/** Gets all resources from the database */
export const getResources = () => getDatabase().resources;

/** Gets all type definitions from the database */
export const getTypes = () => getDatabase().types;

/**
 * Gets the parent resource for a property type
 * @param type the property type
 * @returns the parent resource to the property
 */
export const getParentResource = (type: TypeDefinition) => getDatabase().getParentResource(type);
