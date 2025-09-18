import { getResources } from '../src/database';
import { generateResourceSchema } from '../src/resources';

describe('Resource Tests', () => {
  const resourcesFromDb = getResources();
  const resourcesFromGenerated = generateResourceSchema();
  const resourceKeysFromGenerated: string[] = Object.keys(resourcesFromGenerated);

  test('correct number of generated resources', () => {
    // Check that we are pulling in all the resources (plus one because we add CfnTag)
    expect(resourceKeysFromGenerated.length).toEqual(resourcesFromDb.length);
    expect(resourcesFromGenerated).toEqual(resourcesFromGenerated);
  });

  test('CloudFormation resource keys match generated resource keys', () => {
    const sortedResourceKeysFromDb = resourcesFromDb
      .map((resource) => resource.cloudFormationType)
      .sort();

    expect(resourceKeysFromGenerated).toEqual(sortedResourceKeysFromDb);
  });

  test('CloudFormation resource property names match generated', () => {
    const propertiesFromDb = resourcesFromDb.map((resource) => {
      return {
        name: resource.cloudFormationType,
        props: Object.keys(resource.properties).sort(),
      };
    });
    const sortedResourceProperties = Object.entries(resourcesFromGenerated).map((key: any) => {
      return { name: key[0], props: Object.keys(key[1].properties).sort() };
    });

    expect(sortedResourceProperties).toEqual(expect.arrayContaining(propertiesFromDb));
    expect(propertiesFromDb).toEqual(expect.arrayContaining(sortedResourceProperties));
  });
});
