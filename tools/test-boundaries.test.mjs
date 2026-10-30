import { readFileSync, readdirSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'svelte/compiler';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('..', import.meta.url));
const testsRoot = join(root, 'tests');
const metadata = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const dependencies = new Set(Object.keys({ ...metadata.peerDependencies, ...metadata.devDependencies }));
const publicEntries = new Set(Object.keys(metadata.exports).map(entry =>
  entry === '.' ? metadata.name : metadata.name + entry.slice(1)
));

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(file);
    return /\.(?:ts|mjs|svelte)$/.test(entry.name) ? [file] : [];
  });
}

function imports(file) {
  const source = readFileSync(file, 'utf8');
  const scripts = file.endsWith('.svelte')
    ? (() => {
      const component = parse(source, { modern: true });
      return [component.module, component.instance].filter(Boolean).map(block =>
        source.slice(block.content.start, block.content.end)
      );
    })()
    : [source];
  return scripts.flatMap(script => {
    const ast = ts.createSourceFile(file, script, ts.ScriptTarget.Latest, true);
    return ast.statements.flatMap(node =>
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier
        ? [node.moduleSpecifier.text]
        : []
    );
  });
}

describe('Package test import boundaries', () => {
  it('uses owned fixtures, public package entries and declared development dependencies', () => {
    const violations = [];
    for (const file of sourceFiles(testsRoot)) {
      for (const dependency of imports(file)) {
        let allowed;
        if (dependency.startsWith('.')) {
          const target = relative(testsRoot, resolve(dirname(file), dependency));
          allowed = target !== '..' && !target.startsWith('..' + sep) && !isAbsolute(target);
        } else if (dependency === metadata.name || dependency.startsWith(metadata.name + '/')) {
          allowed = publicEntries.has(dependency);
        } else {
          const packageName = dependency.startsWith('@')
            ? dependency.split('/').slice(0, 2).join('/')
            : dependency.split('/')[0];
          allowed = dependency.startsWith('node:') || dependencies.has(packageName);
        }
        if (!allowed) violations.push(`${relative(root, file)} imports ${dependency}`);
      }
    }

    expect(violations).toEqual([]);
  });
});
