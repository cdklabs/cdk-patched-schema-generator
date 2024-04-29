import { PropertyType } from '@aws-cdk/service-spec-types';
import { getTypeDefinition } from './database';
import { Type } from './types';

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

  private static doGetType(propertyType: PropertyType, cloudFormationType: string) {
    const toTypewriterType = ((): any => {
      switch (propertyType.type) {
        case 'string':
          return Type.STRING.spec;
        case 'boolean':
          return Type.BOOLEAN.spec;
        case 'number':
          return Type.NUMBER.spec;
        case 'integer':
          return Type.NUMBER.spec;
        case 'date-time':
          return Type.DATE_TIME.spec;
        case 'ref':
          const referenceTypeName = getTypeDefinition(propertyType);
          return Type.named(`${cloudFormationType}.${referenceTypeName}`).spec;
        case 'array':
          return { listOf: TypeDecider.doGetType(propertyType.element, cloudFormationType) };
        case 'json':
          return Type.JSON.spec;
        case 'map':
          return { mapOf: TypeDecider.doGetType(propertyType.element, cloudFormationType) };
        case 'tag':
          return Type.named('CfnTag').spec;
        case 'union':
          const union: Type[] = propertyType.types.map((t) => {
            return TypeDecider.doGetType(t, cloudFormationType);
          });
          return { unionOf: union };
        case 'null':
          return Type.UNDEFINED.spec;
      }
    })();
    return toTypewriterType;
  }
}
