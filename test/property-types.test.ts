// import fs from 'fs-extra';

import { getParentResource, getTypes } from '../src/database';
import { generatePropertyTypesSchema } from '../src/property-types';

describe('Properties Tests', () => {
  // WHEN
  const propertyTypesFromDb = getTypes();
  const propertyTypesFromGenerated = generatePropertyTypesSchema();

  const propertyTypeKeysFromGenerated = Object.keys(propertyTypesFromGenerated);
  const cfnTag = propertyTypeKeysFromGenerated.pop();
  const sortedPropertyTypeKeysFromDb = propertyTypesFromDb
    .map((type) => {
      const _type = `${type.name}Property`;
      const service = getParentResource(type);
      return `${service.cloudFormationType}.${_type}`;
    })
    .sort();

  // TODO: Delete this. Using for testing/validation purposes
  // fs.writeFileSync('properties.json', JSON.stringify(propertyTypesFromGenerated, null, 2), {
  //   encoding: 'utf-8',
  // });

  test('correct number of generated resources', () => {
    // Check that we are pulling in all the resources
    expect(propertyTypeKeysFromGenerated.length).toEqual(propertyTypesFromDb.length);
    expect(propertyTypeKeysFromGenerated).toEqual(sortedPropertyTypeKeysFromDb);
  });

  test('cfnTag was the last value in the schema', () => {
    expect(cfnTag).toEqual('CfnTag');
  });

  test('CloudFormation property type keys match generated property type keys', () => {
    expect(propertyTypeKeysFromGenerated).toEqual(sortedPropertyTypeKeysFromDb);
  });

  // Giving this test about a million years to complete because there is SO MUCH data
  // to compare in this one. ⏳...
  // Pretty sure this test hurts jest's feelings
  test('CloudFormation property type names match generated', () => {
    const propertiesFromDb = propertyTypesFromDb.map((type) => {
      return {
        name: `${getParentResource(type).cloudFormationType}.${type.name}Property`,
        props: Object.keys(type.properties).sort(),
      };
    });

    const sortedPropertyTypeProperties = Object.entries(propertyTypesFromGenerated).map(
      (key: [string, any]) => {
        const properties = key[1].properties;
        return { name: key[0], props: Object.keys(properties).sort() };
      }
    );
    // Remove CfnTags
    sortedPropertyTypeProperties.pop();
    expect(sortedPropertyTypeProperties).toEqual(expect.arrayContaining(propertiesFromDb));
    expect(propertiesFromDb).toEqual(expect.arrayContaining(sortedPropertyTypeProperties));
  }, 600000);
});
