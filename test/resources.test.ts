import { getResources } from '../src/database';
import { generateResourceSchema } from '../src/resources';

describe('Resource Tests', () => {
  const resourcesFromDb = getResources();
  const resourcesFromGenerated = generateResourceSchema();
  const resourceKeysFromGenerated: string[] = Object.keys(resourcesFromGenerated);

  test('correct number of generated resources', () => {
    expect(resourceKeysFromGenerated.length).toEqual(resourcesFromDb.length);
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
    const sortedResourceProperties = Object.entries(resourcesFromGenerated).map((entry: any) => {
      return { name: entry[0], props: Object.keys(entry[1].properties).sort() };
    });

    expect(sortedResourceProperties).toEqual(expect.arrayContaining(propertiesFromDb));
    expect(propertiesFromDb).toEqual(expect.arrayContaining(sortedResourceProperties));
  });
});
