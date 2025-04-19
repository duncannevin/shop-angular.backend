import * as apiGateway from 'aws-cdk-lib/aws-apigateway';

import {isParameter, mapParams, mapResourcePath, stripCurlyBraces} from './utils';

describe('utils', () => {
  describe('mapParams', () => {
    it('should only map actual parameters', () => {
      const path = ['{param1}', '{param2}', 'not-a-param'];
      const expected = {
        param1: "$input.params('{param1}')",
        param2: "$input.params('{param2}')",
      };
      expect(mapParams(path)).toEqual(expected);
    });

    it('should return an empty object for an empty path', () => {
      const path: string[] = [];
      const expected: Record<string, string> = {};
      expect(mapParams(path)).toEqual(expected);
    });
  });

  describe('isParameter', () => {
    it('should return true for a parameter', () => {
      expect(isParameter('{param}')).toBe(true);
    });

    it('should return false for a non-parameter', () => {
      expect(isParameter('not-a-param')).toBe(false);
    });

    it('should return false for a non-parameter with odd curly', () => {
      expect(isParameter('not{-a-}param')).toBe(false);
    });
  });

  describe('stripCurlyBraces', () => {
    it('should strip curly braces from a parameter', () => {
      expect(stripCurlyBraces('{param}')).toBe('param');
    });

    it('should return the same string if no curly braces', () => {
      expect(stripCurlyBraces('not-a-param')).toBe('not-a-param');
    });

    it('should return the same string if odd curly braces', () => {
      expect(stripCurlyBraces('not{-a-}param')).toBe('not{-a-}param');
    });
  });

  describe('mapResourcePath', () => {
    it('should return the root resource if path is empty', () => {
      const root = {ima: 'little root'} as unknown as apiGateway.IResource;
      const path: string[] = [];
      expect(mapResourcePath(root, path)).toBe(root);
    });

    it('should add resources to the root', () => {
      const addResourceMock1 = jest.fn().mockReturnValue({
        addResource: jest.fn(),
      });
      const addResourceMock = jest.fn().mockReturnValue({
        addResource: addResourceMock1,
      });
      const root = {
        ima: 'little root',
        addResource: addResourceMock,
      } as unknown as apiGateway.IResource;
      const path = ['resource1', 'resource2'];

      mapResourcePath(root, path);

      expect(addResourceMock).toHaveBeenCalledWith('resource1');
      expect(addResourceMock1).toHaveBeenCalledWith('resource2');
    });
  });
});