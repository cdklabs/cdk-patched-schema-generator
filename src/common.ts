import { Attribute, Property } from '@aws-cdk/service-spec-types';
import fs from 'fs-extra';
import { TypeDecider } from './type-decider';

const fill = (
  items: Record<string, Attribute | Property>,
  cloudFormationType: string,
  isAttribute: boolean
) => {
  let itemList: Record<string, any> = {};
  Object.entries(items).forEach(([id, item]): any => {
    let type = TypeDecider.getType(cloudFormationType, item.type, item.previousTypes);

    itemList[id] = {
      name: `${isAttribute ? 'attr' : ''}${id}`,
      valueType: type.type,
      required: isAttribute ? undefined : (item as Property).required,
    };
  });
  return sort(itemList);
};

export const sort = (unsorted: Record<string, any>) => {
  const sortedKeys: string[] = Object.keys(unsorted).sort();
  return sortedKeys.reduce((acc: any, key: string) => {
    acc[key] = unsorted[key];
    return acc;
  }, {});
};

export const fillAttributes = (items: Record<string, Attribute>, cloudFormationType: string) => {
  return fill(items, cloudFormationType, true);
};

export const fillProperties = (items: Record<string, Property>, cloudFormationType: string) => {
  return fill(items, cloudFormationType, false);
};

export const writeFile = (schema: any, outputPath: string) => {
  console.log(`Generating ${outputPath}`);

  fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2), {
    encoding: 'utf-8',
  });
};
