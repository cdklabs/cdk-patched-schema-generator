import { Attribute, Property } from '@aws-cdk/service-spec-types';

export type Attributes = Record<string, Attribute>;
export type Properties = Record<string, Property>;

export type AttributeSpec = {
  name: string;
  valueType: unknown;
};

export type PropertySpec = AttributeSpec & {
  required?: boolean;
};

export interface Bindings {
  typescript: { module: string; name: string };
  csharp: { namespace: string; name: string };
  golang: { module: string; package: string; name: string };
  java: { package: string; name: string };
  python: { module: string; name: string };
}

export interface PropertyType {
  name: Bindings;
  properties: Record<string, PropertySpec>;
}

export interface ResourceType {
  construct: Bindings;
  attributes?: Record<string, AttributeSpec>;
  properties: Record<string, PropertySpec>;
}

export type ResourceSchema = Record<string, ResourceType>;
export type PropertyTypeSchema = Record<string, PropertyType>;
