import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const sourceRoot = fileURLToPath(new URL('.', import.meta.url));

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(?:ts|svelte)$/.test(entry.name) && !entry.name.endsWith('.test.ts') ? [path] : [];
  });
}

describe('Library dependencies', () => {
  it('keeps runtime imports independent of the homepage and SvelteKit', () => {
    const violations = sourceFiles(sourceRoot).flatMap(file => {
      const imports = readFileSync(file, 'utf8').matchAll(
        /(?:from\s+|import\s*)['"]([^'"]+)['"]/g
      );
      return [...imports].flatMap(([, dependency]) => {
        const frameworkAlias = /^(?:\$(?:app|env|lib)|@sveltejs\/kit)(?:\/|$)/.test(dependency);
        const outsideLibrary = dependency.startsWith('.')
          && relative(sourceRoot, resolve(dirname(file), dependency)).startsWith(
            '..'
          );
        return frameworkAlias || outsideLibrary
          ? [`${relative(sourceRoot, file)} imports ${dependency}`]
          : [];
      });
    });

    expect(violations).toEqual([]);
  });
});
