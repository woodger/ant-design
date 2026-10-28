import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { projectRoot, projectPath, readJson, writeAtomic, registryFile, runCli } from './ant-design-common.mjs';
import { verifyArchive, archiveEntry, extractCss } from './ant-design-css-core.mjs';

await runCli(async () => {
  const args = process.argv.slice(2);
  const recipes = await readJson(projectPath(projectRoot, 'tools/ant-design-css-recipes.json'));
  if (args.length === 1 && args[0] === '--list') { process.stdout.write(`${recipes.map(item => item.id).join('\n')}\n`); return; }
  const id = args[0];
  const selected = id === 'all' ? recipes : recipes.filter(item => item.id === id);
  if (!selected.length) throw new Error('Usage: npm run antd:css -- <recipe|all> [--check|--write] [--fetch] [--archive=path]');
  if (args.slice(1).some(arg => !['--check', '--write', '--fetch'].includes(arg) && !arg.startsWith('--archive='))) throw new Error('Unknown CSS option');
  if (args.includes('--check') && args.includes('--write')) throw new Error('Choose --check or --write');
  const { upstream } = await readJson(projectPath(projectRoot, registryFile));
  if (upstream.archiveUrl !== `https://registry.npmjs.org/antd/-/antd-${upstream.version}.tgz`) throw new Error('CSS source must be the pinned official archive');
  const supplied = args.find(arg => arg.startsWith('--archive='))?.slice('--archive='.length);
  const path = supplied ? resolve(projectRoot, supplied) : projectPath(projectRoot, `.upstream/artifacts/antd-${upstream.version}.tgz`);
  let bytes = await readFile(path).catch(error => { if (error.code !== 'ENOENT') throw error; });
  if (!bytes) {
    if (!args.includes('--fetch') || supplied) throw new Error(`Missing archive ${path}. Use --fetch or --archive=path`);
    const response = await fetch(upstream.archiveUrl, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`Archive download failed: HTTP ${response.status}`);
    bytes = Buffer.from(await response.arrayBuffer());
    verifyArchive(bytes, upstream.archiveSha256);
    await writeAtomic(path, bytes);
  }
  verifyArchive(bytes, upstream.archiveSha256);
  const css = archiveEntry(bytes, 'package/dist/antd.css').toString('utf8');
  const outputs = selected.map(recipe => {
    if (!recipe.output.startsWith('src/lib/components/ant-design/vendor/') || !recipe.output.endsWith('.css')) throw new Error('CSS output must stay in the component vendor directory');
    if (!recipe.header.includes(`Ant Design ${upstream.version}`) || !recipe.header.includes(upstream.archiveSha256)) throw new Error(`Recipe provenance is stale: ${recipe.id}`);
    return { recipe, result: extractCss(css, recipe), output: projectPath(projectRoot, recipe.output) };
  });
  for (const { recipe, result, output } of outputs) {
    if (args.includes('--write')) await writeAtomic(output, result.content);
    else if (args.includes('--check')) {
      const actual = await readFile(output, 'utf8');
      if (actual !== result.content) throw new Error(`CSS differs: ${recipe.output}. Review the recipe before --write`);
    } else process.stdout.write(result.content);
    process.stderr.write(`${recipe.id}: ${result.rules} rules, ${result.keyframes.length} keyframes; SHA-256 verified${args.includes('--write') ? '; written' : args.includes('--check') ? '; matches' : '; preview only'}\n`);
  }
});
