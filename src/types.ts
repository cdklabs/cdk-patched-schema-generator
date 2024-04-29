import { PrimitiveType } from '@cdklabs/typewriter';

/**
 * A representation of a CDK Construct naming conventions for a resource.
 */
export interface Construct {
  class: string;
  service: string;
  fullyQualifiedName: string;
  typescriptModule: string;
  csharpNamespace: string;
  golangModule: string;
  javaPackage: string;
  pythonModule: string;
}

/**
 * Represents a single property or attribute for both resources and property types.
 */
export interface Property {
  name: string;
  valueType: ValueType;
}

/**
 * A single resource
 */
export interface ResourceType {
  name: string;
  attributes?: Record<string, any>;
  properties: Record<string, any>;
}

/**
 * A map of all CloudFormation resources types
 */
export interface TypeMap {
  [name: string]: ResourceType;
}

/**
 * The potential types that a property or attribute may be
 */
export type ValueType =
  | { readonly primitive: PrimitiveType }
  | { readonly listOf: { readonly elementType: Type } }
  | { readonly mapOf: { readonly elementType: Type } }
  | { readonly named: string }
  | { readonly unionOf: Type[] };

export class Type {
  public static readonly ANY = new Type({ primitive: PrimitiveType.Any });
  public static readonly DATE_TIME = new Type({ primitive: PrimitiveType.DateTime });
  public static readonly STRING = new Type({ primitive: PrimitiveType.String });
  public static readonly NUMBER = new Type({ primitive: PrimitiveType.Number });
  public static readonly BOOLEAN = new Type({ primitive: PrimitiveType.Boolean });
  public static readonly UNDEFINED = new Type({ primitive: PrimitiveType.Undefined });
  public static readonly JSON = new Type({ primitive: PrimitiveType.Json });

  public static listOf(elementType: Type) {
    return new Type({ listOf: { elementType } });
  }

  public static mapOf(elementType: Type) {
    return new Type({ mapOf: { elementType } });
  }

  public static unionOf(...types: Type[]) {
    // Sort by string representation to get to a stable order
    return new Type({ unionOf: types.sort((a, b) => a.toString().localeCompare(b.toString())) });
  }

  /**
   * A union that only contains distinct elements
   *
   * Flattens any unions of unions into a single flat union.
   * Type distinctiveness is determined based on its string representation.
   * 
   * TODO: This doesn't seem to be working as expected. For now we'll use
   * unionOf while we figure this out
   */
  public static distinctUnionOf(...types: Type[]) {
    const unique = (xs: Type[]) => {
      var seen: Record<string, Type> = {};
      return xs.filter((x) => {
        const key = x.toString();
        return !(key in seen) && (seen[key] = x);
      });
    };

    return Type.unionOf(...unique(types.flatMap((x) => (x.unionOfTypes ? x.unionOfTypes : x))));
  }

  public static named(name: string) {
    return new Type({ named: name });
  }

  public get unionOfTypes(): Type[] | undefined {
    return isUnionSpec(this.spec) ? this.spec.unionOf : undefined;
  }

  private constructor(public readonly spec: ValueType) {}
}

function isUnionSpec(x: ValueType): x is Extract<ValueType, { unionOf: Type[] }> {
  return !!(x as any).unionOf;
}
