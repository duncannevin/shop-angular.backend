import * as apiGateway from 'aws-cdk-lib/aws-apigateway';

export function mapParams(path: string[]): Record<string, string> {
  return path.reduce<Record<string, string>>((mapped, param) => {
    if (!isParameter(param)) {
      return mapped;
    }

    mapped[stripCurlyBraces(param)] = `$input.params('${stripCurlyBraces(param)}')`;
    return mapped;
  }, {});
}

export function isParameter(str: string): boolean {
  return /^\{.+\}$/.test(str);
}

export function stripCurlyBraces(str: string): string {
  return str.replace(/^\{|\}$/g, '');
}

export function mapResourcePath(root: apiGateway.IResource, path: string[]): apiGateway.IResource {
  if (path.length === 0) {
    return root;
  }

  return path.reduce((parent, segment, index) => {
    return index === 0
      ? root.addResource(segment)
      : parent.addResource(segment);
  }, root)
}
