import { PropertyType } from '@aws-cdk/service-spec-types';
import { PrimitiveType } from '@cdklabs/typewriter';
import { CFN_TAG } from './common';
import { getTypeDefinition } from './database';

export class TypeDecider {
  public static getType(
    cloudFormationType: string,
    currentType: PropertyType,
    previousTypes: PropertyType[] = []
  ) {
    const propertyType: PropertyType =
      previousTypes.length > 0
        ? {
            type: 'union',
            types: [currentType, ...previousTypes],
          }
        : currentType;
    return { type: this.doGetType(propertyType, cloudFormationType) };
  }

  private static doGetType(propertyType: PropertyType, cloudFormationType: string): any {
    switch (propertyType.type) {
      case 'string':
        return this.handleStringType();
      case 'boolean':
        return this.handleBooleanType();
      case 'number':
      case 'integer':
        return this.handleNumberType();
      case 'date-time':
        return this.handleDateTimeType();
      case 'ref':
        return this.handleRefType(propertyType, cloudFormationType);
      case 'array':
        return this.handleArrayType(propertyType, cloudFormationType);
      case 'json':
        return this.handleJsonType();
      case 'map':
        return this.handleMapType(propertyType, cloudFormationType);
      case 'tag':
        return this.handleTagType();
      case 'union':
        return this.handleUnionType(propertyType, cloudFormationType);
      case 'null':
        return this.handleNullType();
      default:
        return this.handleDefaultType();
    }
  }

  private static handleStringType() {
    return { primitive: PrimitiveType.String };
  }

  private static handleBooleanType() {
    return { primitive: PrimitiveType.Boolean };
  }

  private static handleNumberType() {
    return { primitive: PrimitiveType.Number };
  }

  private static handleDateTimeType() {
    return { primitive: PrimitiveType.DateTime };
  }

  private static handleRefType(propertyType: PropertyType, cloudFormationType: string) {
    if (propertyType.type !== 'ref') {
      throw new Error('Expected ref type');
    }
    const referenceTypeName = getTypeDefinition(propertyType);
    if (!referenceTypeName) {
      throw new Error('Reference type name not found');
    }
    // Remove 'Property' suffix from reference name for the named type
    // const cleanTypeName = referenceTypeName.replace(/Property$/, '');
    return { named: `${cloudFormationType}.${referenceTypeName}` };
  }

  private static handleArrayType(propertyType: PropertyType, cloudFormationType: string) {
    if (propertyType.type !== 'array' || !propertyType.element) {
      throw new Error('Expected array type with element');
    }
    const elementType = this.doGetType(propertyType.element, cloudFormationType);
    return { listOf: elementType };
  }

  private static handleJsonType() {
    return { primitive: PrimitiveType.Json };
  }

  private static handleMapType(propertyType: PropertyType, cloudFormationType: string) {
    if (propertyType.type !== 'map' || !propertyType.element) {
      throw new Error('Expected map type with element');
    }
    const mapElementType = this.doGetType(propertyType.element, cloudFormationType);
    return { mapOf: mapElementType };
  }

  private static handleTagType() {
    return { named: CFN_TAG };
  }

  private static handleUnionType(propertyType: PropertyType, cloudFormationType: string) {
    if (propertyType.type !== 'union' || !propertyType.types) {
      throw new Error('Expected union type with types');
    }
    const unionTypes = propertyType.types.map((t: PropertyType) =>
      this.doGetType(t, cloudFormationType)
    );
    return { unionOf: unionTypes };
  }

  private static handleNullType() {
    return { primitive: PrimitiveType.Undefined };
  }

  private static handleDefaultType() {
    return { primitive: PrimitiveType.Any };
  }
}
