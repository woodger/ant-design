import { readFile, writeFile, rename, mkdir, rm } from 'node:fs/promises';
import { resolve, relative, isAbsolute, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot = fileURLToPath(new URL('../', import.meta.url));
export const registryFile = 'docs/reference/ant-design-porting/registry.json';
export const reportFile = 'docs/reference/ant-design-porting/status.md';

export function projectPath(root, path) {
  if (typeof path !== 'string'
    || !path
    || isAbsolute(path)
    || path.includes('\\')
    || path.split('/').includes(
      '..'
    )) throw new Error(
      `Invalid project path: ${path}`
    );
  const target = resolve(root, path);
  if (relative(root, target).startsWith('..')) throw new Error(`Path outside project: ${path}`);
  return target;
}

export async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  }
  catch (error) {
    throw new Error(`Cannot read JSON ${path}: ${error.message}`);
  }
}

export async function writeAtomic(path, content) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.tmp`;
  try {
    await writeFile(temporary, content);
    await rename(temporary, path);
  }
  catch (error) {
    await rm(temporary, { force: true });
    throw error;
  }
}

export function runCli(main) {
  return main().catch(error => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
