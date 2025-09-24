import type { Attribute, Property, Service } from '@aws-cdk/service-spec-types';
import type { Attributes, AttributeSpec, Properties, PropertySpec } from './schema-types';
import { TypeDecider } from './type-decider';

// Constants
export const CFN = 'Cfn';
export const CFN_TAG = 'CfnTag';

const CDK_BASES = {
  typescript: 'aws-cdk-lib',
  golang: 'github.com/aws/aws-cdk-go/awscdk/v2',
  java: 'software.amazon.awscdk',
  csharp: 'Amazon.CDK',
  python: 'aws_cdk',
} as const;

// Utility functions
export const sortSchema = (unsorted: Record<string, any>) =>
  Object.keys(unsorted)
    .sort()
    .reduce((acc, key) => ({ ...acc, [key]: unsorted[key] }), {});

// Schema mapping functions
const mapToSchema = <T>(
  items: Record<string, Attribute | Property>,
  cloudFormationType: string,
  mapper: (item: { name: string; valueType: any; required?: boolean }) => T
): Record<string, T> => {
  const mapped = Object.entries(items).reduce(
    (acc, [id, item]) => {
      const type = TypeDecider.getType(cloudFormationType, item.type, item.previousTypes);
      const baseItem = {
        name: id,
        valueType: type.type,
        ...('required' in item && item.required && { required: item.required }),
      };
      acc[id] = mapper(baseItem);
      return acc;
    },
    {} as Record<string, T>
  );

  return sortSchema(mapped);
};

export const mapAttributesToSchema = (
  items: Attributes,
  cloudFormationType: string
): Record<string, AttributeSpec> =>
  mapToSchema(items, cloudFormationType, ({ name, valueType }) => ({ name, valueType }));

export const mapPropertiesToSchema = (
  items: Properties,
  cloudFormationType: string
): Record<string, PropertySpec> => mapToSchema(items, cloudFormationType, (item) => item);

// Language binding generators
const serviceNameTransforms = {
  python: (service: Service) => service.name.replace(/-/, '_'),
  golang: (service: Service) => service.name.replace(/-/, ''),
  java: (service: Service) => service.name.replace('aws-', 'services.').replace(/-/, '.'),
  csharp: (service: Service) => {
    const namespace = service.cloudFormationNamespace.split('::')[0];
    // CSharp stylizes ApiGatewayV2 as APIGatewayV2, the same is not true for ApiGateway
    return `${namespace}.${service.capitalized.replace('ApiGatewayV2', 'APIGatewayV2')}`;
  },
  typescript: (service: Service) => service.name,
};

// CWE warning is not applicable. This is not HTML input or output.
const goPackageNameTransform = (service: Service) => {
  return service.capitalized
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase();
};

export const generateCoreBindings = (name: string) => ({
  typescript: { module: CDK_BASES.typescript, name },
  csharp: { namespace: CDK_BASES.csharp, name },
  golang: { module: CDK_BASES.golang, package: 'awscdk', name },
  java: { package: CDK_BASES.java, name },
  python: { module: CDK_BASES.python, name },
});

export const generateBindings = (service: Service, name: string) => ({
  typescript: {
    module: `${CDK_BASES.typescript}/${serviceNameTransforms.typescript(service)}`,
    name,
  },
  csharp: {
    namespace: `${CDK_BASES.csharp}.${serviceNameTransforms.csharp(service)}`,
    name,
  },
  golang: {
    module: `${CDK_BASES.golang}/${serviceNameTransforms.golang(service)}`,
    package: goPackageNameTransform(service),
    name: name.replace('.', '_'),
  },
  java: {
    package: `${CDK_BASES.java}.${serviceNameTransforms.java(service)}`,
    name,
  },
  python: {
    module: `${CDK_BASES.python}.${serviceNameTransforms.python(service)}`,
    name,
  },
});
