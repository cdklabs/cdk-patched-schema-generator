import { getTypeDefinition } from '../src/database';
import { TypeDecider } from '../src/type-decider';

jest.mock('../src/database');
const mockGetTypeDefinition = getTypeDefinition as jest.MockedFunction<typeof getTypeDefinition>;

describe('TypeDecider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getType', () => {
    test('should handle unknown type', () => {
      const result = TypeDecider.getType('AWS::Test::Resource', { type: 'unknown' } as any);
      expect(result.type.primitive).toBe('any');
    });

    test('should handle null type', () => {
      const result = TypeDecider.getType('AWS::Test::Resource', { type: 'null' } as any);
      expect(result.type.primitive).toBe('undefined');
    });

    test('should handle union with previous types', () => {
      const currentType = { type: 'string' } as any;
      const previousTypes = [{ type: 'number' } as any];

      const result = TypeDecider.getType('AWS::Test::Resource', currentType, previousTypes);
      expect(result.type.unionOf).toHaveLength(2);
      expect(result.type.unionOf[0].primitive).toBe('string');
      expect(result.type.unionOf[1].primitive).toBe('number');
    });

    test('should handle ref type with missing reference', () => {
      mockGetTypeDefinition.mockReturnValue(null as any);

      expect(() => {
        TypeDecider.getType('AWS::Test::Resource', {
          type: 'ref',
          reference: { $ref: 'test' },
        } as any);
      }).toThrow('Reference type name not found');
    });

    test('should handle array type without element', () => {
      expect(() => {
        TypeDecider.getType('AWS::Test::Resource', { type: 'array' } as any);
      }).toThrow('Expected array type with element');
    });

    test('should handle map type without element', () => {
      expect(() => {
        TypeDecider.getType('AWS::Test::Resource', { type: 'map' } as any);
      }).toThrow('Expected map type with element');
    });

    test('should handle union type without types', () => {
      expect(() => {
        TypeDecider.getType('AWS::Test::Resource', { type: 'union' } as any);
      }).toThrow('Expected union type with types');
    });
  });
});
