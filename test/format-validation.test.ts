import { generatePropertyTypesSchema } from '../src/property-types';
import { generateResourceSchema } from '../src/resources';

describe('Output Format Validation', () => {
  let propertyTypesSchema: ReturnType<typeof generatePropertyTypesSchema>;
  let resourceSchema: ReturnType<typeof generateResourceSchema>;

  beforeAll(() => {
    propertyTypesSchema = generatePropertyTypesSchema();
    resourceSchema = generateResourceSchema();
  });

  describe('Property Types Schema Format', () => {
    test('should have correct top-level structure', () => {
      expect(typeof propertyTypesSchema).toBe('object');
      expect(propertyTypesSchema).not.toBeNull();
      expect(Array.isArray(propertyTypesSchema)).toBe(false);
    });

    test('should have alphabetically sorted keys', () => {
      const keys = Object.keys(propertyTypesSchema);
      const sortedKeys = [...keys].sort();
      expect(keys).toEqual(sortedKeys);
    });

    test('should have CfnTag property type', () => {
      expect(propertyTypesSchema).toHaveProperty('CfnTag');
      expect(propertyTypesSchema.CfnTag).toEqual({
        name: 'CfnTag',
        properties: {
          Key: {
            name: 'Key',
            valueType: { primitive: 'string' },
            required: true,
          },
          Value: {
            name: 'Value',
            valueType: { primitive: 'string' },
            required: true,
          },
        },
      });
    });

    test('should have valid property type structure', () => {
      const sampleKey = Object.keys(propertyTypesSchema).find((key) => key !== 'CfnTag');
      if (sampleKey) {
        const propertyType = propertyTypesSchema[sampleKey];

        expect(propertyType).toHaveProperty('name');
        expect(propertyType).toHaveProperty('properties');
        expect(typeof propertyType.name).toBe('string');
        expect(typeof propertyType.properties).toBe('object');

        // Check property structure
        const properties = Object.keys(propertyType.properties);
        expect(properties.length).toBeGreaterThan(0);

        const firstProperty = propertyType.properties[properties[0]];
        expect(firstProperty).toHaveProperty('name');
        expect(firstProperty).toHaveProperty('valueType');
        expect(typeof firstProperty.name).toBe('string');
        expect(typeof firstProperty.valueType).toBe('object');
      }
    });

    test('should have sorted property keys within each type', () => {
      Object.values(propertyTypesSchema).forEach((propertyType) => {
        const propertyKeys = Object.keys(propertyType.properties);
        const sortedPropertyKeys = [...propertyKeys].sort();
        expect(propertyKeys).toEqual(sortedPropertyKeys);
      });
    });

    test('should have valid valueType formats', () => {
      Object.values(propertyTypesSchema).forEach((propertyType) => {
        Object.values(propertyType.properties).forEach((property: any) => {
          expect(property.valueType).toBeDefined();

          // Should have one of: primitive, listOf, mapOf, named, unionOf
          const hasValidType =
            property.valueType.primitive ||
            property.valueType.listOf ||
            property.valueType.mapOf ||
            property.valueType.named ||
            property.valueType.unionOf;

          expect(hasValidType).toBeTruthy();
        });
      });
    });
  });

  describe('Resources Schema Format', () => {
    test('should have correct top-level structure', () => {
      expect(typeof resourceSchema).toBe('object');
      expect(resourceSchema).not.toBeNull();
      expect(Array.isArray(resourceSchema)).toBe(false);
    });

    test('should have alphabetically sorted keys', () => {
      const keys = Object.keys(resourceSchema);
      const sortedKeys = [...keys].sort();
      expect(keys).toEqual(sortedKeys);
    });

    test('should have valid resource structure', () => {
      const sampleKey = Object.keys(resourceSchema)[0];
      const resource = resourceSchema[sampleKey];

      expect(resource).toHaveProperty('name');
      expect(resource).toHaveProperty('attributes');
      expect(resource).toHaveProperty('properties');

      expect(typeof resource.name).toBe('string');
      expect(typeof resource.attributes).toBe('object');
      expect(typeof resource.properties).toBe('object');
    });

    test('should have sorted attribute and property keys within each resource', () => {
      Object.values(resourceSchema).forEach((resource) => {
        const attributeKeys = Object.keys(resource.attributes || {});
        const propertyKeys = Object.keys(resource.properties || {});

        const sortedAttributeKeys = [...attributeKeys].sort();
        const sortedPropertyKeys = [...propertyKeys].sort();

        expect(attributeKeys).toEqual(sortedAttributeKeys);
        expect(propertyKeys).toEqual(sortedPropertyKeys);
      });
    });

    test('should have valid attribute structure', () => {
      const resourcesWithAttributes = Object.values(resourceSchema).filter(
        (resource) => resource.attributes && Object.keys(resource.attributes).length > 0
      );

      expect(resourcesWithAttributes.length).toBeGreaterThan(0);

      resourcesWithAttributes.forEach((resource) => {
        Object.values(resource.attributes!).forEach((attribute: any) => {
          expect(attribute).toHaveProperty('name');
          expect(attribute).toHaveProperty('valueType');
          expect(typeof attribute.name).toBe('string');
          expect(typeof attribute.valueType).toBe('object');
        });
      });
    });

    test('should have valid property structure', () => {
      Object.values(resourceSchema).forEach((resource) => {
        Object.values(resource.properties).forEach((property: any) => {
          expect(property).toHaveProperty('name');
          expect(property).toHaveProperty('valueType');
          expect(typeof property.name).toBe('string');
          expect(typeof property.valueType).toBe('object');

          // required field is optional
          if (property.required !== undefined) {
            expect(typeof property.required).toBe('boolean');
          }
        });
      });
    });

    test('should have consistent naming patterns', () => {
      Object.entries(resourceSchema).forEach(([key, resource]) => {
        // Resource keys should follow AWS::Service::Resource or Alexa::Service::Resource pattern
        expect(key).toMatch(/^(AWS|Alexa)::[A-Za-z0-9]+::[A-Za-z0-9]+$/);

        // Resource names should start with Cfn
        expect(resource.name).toMatch(/^Cfn[A-Za-z0-9]+$/);

        // Attribute names should start with attr
        Object.values(resource.attributes || {}).forEach((attribute: any) => {
          expect(attribute.name).toMatch(/^attr[A-Za-z0-9.]+$/);
        });
      });
    });
  });

  describe('Cross-Schema Consistency', () => {
    test('should have consistent primitive types', () => {
      const validPrimitives = [
        'string',
        'number',
        'boolean',
        'date-time',
        'json',
        'any',
        'undefined',
      ];

      // Check property types schema
      Object.values(propertyTypesSchema).forEach((propertyType) => {
        Object.values(propertyType.properties).forEach((property: any) => {
          if (property.valueType.primitive) {
            expect(validPrimitives).toContain(property.valueType.primitive);
          }
        });
      });

      // Check resources schema
      Object.values(resourceSchema).forEach((resource) => {
        [
          ...Object.values(resource.attributes || {}),
          ...Object.values(resource.properties),
        ].forEach((item: any) => {
          if (item.valueType.primitive) {
            expect(validPrimitives).toContain(item.valueType.primitive);
          }
        });
      });
    });

    test('should have valid named type references', () => {
      // Collect all available type names
      const propertyTypeNames = new Set(Object.keys(propertyTypesSchema));
      const resourceTypeNames = new Set(Object.keys(resourceSchema));

      // Check that named references exist
      Object.values(propertyTypesSchema).forEach((propertyType) => {
        Object.values(propertyType.properties).forEach((property: any) => {
          if (property.valueType.named) {
            const namedType = property.valueType.named;
            const isValidReference =
              propertyTypeNames.has(namedType) ||
              resourceTypeNames.has(namedType) ||
              namedType === 'CfnTag' ||
              namedType.includes('.'); // Allow nested type references

            expect(isValidReference).toBeTruthy();
          }
        });
      });
    });
  });
});
