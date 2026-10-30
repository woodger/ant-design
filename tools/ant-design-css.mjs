import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { projectPath, readJson, writeAtomic, registryFile } from './ant-design-common.mjs';
import { verifyArchive, archiveEntry, extractCss } from './ant-design-css-core.mjs';

export async function runCss(
  { recipe: id, list, check, write, fetch: allowFetch, archive: supplied },
  { root, stdout, stderr, fetch: fetchArchive }
) {
  const recipes = await readJson(projectPath(root, 'tools/ant-design-css-recipes.json'));
  if (list) {
    stdout.write(`${recipes.map(item => item.id).join('\n')}\n`);
    return;
  }
  const selected = id === 'all' ? recipes : recipes.filter(item => item.id === id);
  if (!selected.length) throw new Error(`Unknown CSS recipe: ${id}`);
  if (check && write) throw new Error('Choose --check or --write');
  const { upstream } = await readJson(projectPath(root, registryFile));
  if (upstream
    .archiveUrl !== `https://registry.npmjs.org/antd/-/antd-${upstream
      .version}.tgz`) throw new Error(
        'CSS source must be the pinned official archive'
      );
  const path = supplied
    ? resolve(root, supplied)
    : projectPath(root, `.upstream/artifacts/antd-${upstream.version}.tgz`);
  let bytes = await readFile(path).catch(error => {
    if (error.code !== 'ENOENT') throw error;
  });
  if (!bytes) {
    if (!allowFetch
      || supplied) throw new Error(
        `Missing archive ${path}. Use --fetch or --archive=path`
      );
    const response = await fetchArchive(
      upstream.archiveUrl,
      { signal: AbortSignal.timeout(30000) }
    );
    if (!response.ok) throw new Error(`Archive download failed: HTTP ${response.status}`);
    bytes = Buffer.from(await response.arrayBuffer());
    verifyArchive(bytes, upstream.archiveSha256);
    await writeAtomic(path, bytes);
  }
  verifyArchive(bytes, upstream.archiveSha256);
  const css = archiveEntry(bytes, 'package/dist/antd.css').toString('utf8');
  const outputs = selected.map(recipe => {
    if (!recipe.output.startsWith('src/lib/vendor/')
      || !recipe.output.endsWith('.css')) throw new Error(
        'CSS output must stay in the component vendor directory'
      );
    if (!recipe.header.includes(`Ant Design ${upstream.version}`)
      || !recipe.header.includes(
        upstream.archiveSha256
      )) throw new Error(
        `Recipe provenance is stale: ${recipe.id}`
      );
    return { recipe, result: extractCss(css, recipe), output: projectPath(root, recipe.output) };
  });
  for (const { recipe, result, output } of outputs) {
    if (write)
      await writeAtomic(output, result.content);
    else if (check) {
      const actual = await readFile(output, 'utf8');
      if (actual !== result.content) throw new Error(
        `CSS differs: ${recipe.output}. Review the recipe before --write`
      );
    } else stdout.write(result.content);
    stderr.write(
      `${recipe
        .id}: ${result
          .rules} rules, ${result
            .keyframes
            .length} keyframes; SHA-256 verified${write
              ? '; written'
              : check ? '; matches' : '; preview only'}\n`
    );
  }
}
