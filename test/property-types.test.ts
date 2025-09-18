import { getParentResource, getTypes } from '../src/database';
import { generatePropertyTypesSchema } from '../src/property-types';

describe('Properties Tests', () => {
  let propertyTypesFromDb: ReturnType<typeof getTypes>;
  let propertyTypesFromGenerated: ReturnType<typeof generatePropertyTypesSchema>;
  let propertyTypeKeysFromGenerated: string[];
  let sortedPropertyTypeKeysFromDb: string[];

  beforeAll(() => {
    propertyTypesFromDb = getTypes();
    propertyTypesFromGenerated = generatePropertyTypesSchema();
    propertyTypeKeysFromGenerated = Object.keys(propertyTypesFromGenerated);
    sortedPropertyTypeKeysFromDb = propertyTypesFromDb
      .map((type) => `${getParentResource(type).cloudFormationType}.${type.name}Property`)
      .sort();
  });

  test('correct number of generated resources', () => {
    // Add one because we add in CfnTag
    expect(propertyTypeKeysFromGenerated.length).toEqual(propertyTypesFromDb.length + 1);
  });

  test('cfnTag exists in schema', () => {
    expect(propertyTypesFromGenerated).toHaveProperty('CfnTag');
  });

  test('CloudFormation property type keys match generated property type keys', () => {
    const generatedKeysWithoutCfnTag = propertyTypeKeysFromGenerated.filter(
      (key) => key !== 'CfnTag'
    );
    expect(generatedKeysWithoutCfnTag).toEqual(sortedPropertyTypeKeysFromDb);
  });

  test('property structures match between DB and generated', () => {
    const dbPropertyMap = new Map(
      propertyTypesFromDb.map((type) => [
        `${getParentResource(type).cloudFormationType}.${type.name}Property`,
        Object.keys(type.properties).sort(),
      ])
    );

    for (const [key, value] of Object.entries(propertyTypesFromGenerated)) {
      if (key === 'CfnTag') continue;
      const dbProps = dbPropertyMap.get(key);
      const generatedProps = Object.keys(value.properties).sort();
      expect(generatedProps).toEqual(dbProps);
    }
  });
});
