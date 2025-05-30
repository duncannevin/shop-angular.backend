/**
 * This file contains utility functions for working with AWS API Gateway resources
 * in a CDK stack. These utilities help with mapping parameters, resource paths,
 * and query parameters for API Gateway integrations.
 */

import * as apiGateway from 'aws-cdk-lib/aws-apigateway';

/**
 * Maps a list of path segments to a record of API Gateway request parameters.
 * @param path - An array of path segments, where parameters are enclosed in curly braces (e.g., `{id}`).
 * @returns A record mapping parameter names to their corresponding `$input.params` expressions.
 */
export function mapParams(path: string[]): Record<string, string> {
  return path.reduce<Record<string, string>>((mapped, param) => {
    if (!isParameter(param)) {
      return mapped;
    }

    mapped[stripCurlyBraces(param)] = `$input.params('${stripCurlyBraces(param)}')`;
    return mapped;
  }, {});
}

export function mapQueryStringParams(queryParams: string[]): Record<string, string> {
  return queryParams.reduce<Record<string, string>>((mapped, param) => {
    mapped[stripCurlyBraces(param)] = `$input.params('${stripCurlyBraces(param)}')`;
    return mapped;
  }, {});
}

export function mapBody(bodyParts: string[]): Record<string, string> {
  return bodyParts.reduce<Record<string, string>>((mapped, param) => {
    mapped[param] = `$input.path('$.${param}')`;
    return mapped;
  }, {});
}

/**
 * Checks if a string is a parameter enclosed in curly braces.
 * @param str - The string to check.
 * @returns `true` if the string is a parameter, otherwise `false`.
 */
export function isParameter(str: string): boolean {
  return /^\{.+\}$/.test(str);
}

/**
 * Removes the curly braces from a parameter string.
 * @param str - The parameter string (e.g., `{id}`).
 * @returns The string without curly braces (e.g., `id`).
 */
export function stripCurlyBraces(str: string): string {
  return str.replace(/^\{|\}$/g, '');
}

/**
 * Maps a resource path to an API Gateway resource.
 * @param root - The root resource of the API Gateway.
 * @param path - An array of path segments to map.
 * @returns The final `IResource` object corresponding to the mapped path.
 */
export function mapResourcePath(root: apiGateway.IResource, path: string[]): apiGateway.IResource {
  if (path.length === 0) {
    return root;
  }

  return path.reduce((parent, segment, index) => {
    return index === 0
      ? root.addResource(segment)
      : parent.addResource(segment);
  }, root);
}
