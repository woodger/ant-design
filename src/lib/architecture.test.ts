import {
  readFileSync,
  readdirSync
} from 'node:fs';
import {
  dirname,
  extname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep
} from 'node:path';
import { describe, expect, it } from 'vitest';

type Layer = 'domain' | 'application' | 'infrastructure' | 'presentation' | 'bootstrap';

const sourceRoot = join(process.cwd(), 'src', 'lib');
const presentationRoots = new Set([
  'components',
  'layout',
  'presentation',
  'utils'
]);
const sourceExtensions = new Set(['.ts', '.svelte']);
const importPattern = /(?:from\s+|import\s*)['"]([^'"]+)['"]/g;

describe('UI architecture dependencies', () => {
  it('keeps compile-time dependencies directed inward', () => {
    const violations = getSourceFiles(sourceRoot).flatMap((file) =>
      validateFile(file)
    );

    expect(violations).toEqual([]);
  });
});

function validateFile(file: string) {
  const layer = getLayer(file);

  if (file.endsWith('.test.ts')) {
    return [];
  }

  if (!layer) {
    return [`${relative(process.cwd(), file)} is not assigned to an architecture layer`];
  }

  const source = readFileSync(file, 'utf8');
  const imports = Array.from(source.matchAll(importPattern), (match) => match[1]);
  const violations: string[] = [];

  for (const dependency of imports) {
    const dependencyLayer = getImportedLayer(file, dependency);

    if (isForbiddenDependency(layer, dependencyLayer)) {
      violations.push(formatViolation(file, dependency));
    }

    if (
      (layer === 'domain' || layer === 'application') &&
      (dependency === 'svelte' || dependency.startsWith('svelte/'))
    ) {
      violations.push(formatViolation(file, dependency));
    }
  }

  if (
    (layer === 'domain' || layer === 'application') &&
    (/\$(?:state|derived|effect)\b/.test(source) || file.includes('.svelte.'))
  ) {
    violations.push(`${relative(process.cwd(), file)} uses Svelte reactivity`);
  }

  return violations;
}

function isForbiddenDependency(layer: Layer, dependency: Layer | null) {
  if (!dependency) {
    return false;
  }

  switch (layer) {
    case 'domain':
      return dependency !== 'domain';
    case 'application':
      return dependency !== 'application' && dependency !== 'domain';
    case 'infrastructure':
      return dependency === 'presentation' || dependency === 'bootstrap';
    case 'presentation':
      return dependency === 'infrastructure' || dependency === 'bootstrap';
    default:
      return false;
  }
}

function getImportedLayer(file: string, dependency: string): Layer | null {
  if (dependency.startsWith('$lib/')) {
    const root = dependency.slice('$lib/'.length).split('/')[0];

    return getRootLayer(root);
  }

  if (!dependency.startsWith('.')) {
    return null;
  }

  const resolvedDependency = resolve(dirname(file), dependency);
  const relativeDependency = relative(sourceRoot, resolvedDependency);

  if (relativeDependency.startsWith('..') || isAbsolute(relativeDependency)) {
    return null;
  }

  return getLayer(resolvedDependency);
}

function getLayer(file: string): Layer | null {
  const root = relative(sourceRoot, file).split(sep)[0];

  return getRootLayer(root);
}

function getRootLayer(root: string): Layer | null {
  if (
    root === 'domain' ||
    root === 'application' ||
    root === 'infrastructure' ||
    root === 'bootstrap'
  ) {
    return root;
  }

  return presentationRoots.has(root) ? 'presentation' : null;
}

function getSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      return getSourceFiles(path);
    }

    return sourceExtensions.has(extname(entry.name)) ? [path] : [];
  });
}

function formatViolation(file: string, dependency: string) {
  return `${relative(process.cwd(), file)} imports ${dependency}`;
}
