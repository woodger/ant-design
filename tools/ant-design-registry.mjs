import { readFile } from 'node:fs/promises';
import { projectRoot, projectPath, reportFile, writeAtomic, runCli } from './ant-design-common.mjs';
import { inspectRegistry, renderReport, coverage } from './ant-design-registry-core.mjs';

await runCli(async () => {
  const [command = 'check', ...args] = process.argv.slice(2);
  if (!['check', 'report', 'show'].includes(command)) throw new Error('Usage: antd:registry:{check|report|show} [component] [--upstream]');
  if (args.some(arg => arg.startsWith('--') && arg !== '--upstream')) throw new Error('Unknown registry option');
  if (args.filter(arg => !arg.startsWith('--')).length !== (command === 'show' ? 1 : 0)) throw new Error('Only show accepts a single component identifier');
  const result = await inspectRegistry(projectRoot, { requireUpstream: args.includes('--upstream') });
  if (result.errors.length) throw new Error(result.errors.join('\n'));
  const report = renderReport(result.data, result.componentExports);
  if (command === 'report') {
    await writeAtomic(projectPath(projectRoot, reportFile), report);
    process.stdout.write(`Updated ${reportFile}\n`);
  } else if (command === 'show') {
    const id = args.find(arg => !arg.startsWith('--'));
    const item = result.data.components.find(component => component.id === id);
    if (!item) throw new Error(`Unknown component: ${id}`);
    process.stdout.write(`${JSON.stringify({ ...item, coverage: coverage(item, result.data.upstream.revision) }, null, 2)}\n`);
  } else {
    const actual = await readFile(projectPath(projectRoot, reportFile), 'utf8').catch(() => '');
    if (actual !== report) throw new Error('Registry report is stale. Run npm run antd:registry:report');
    process.stdout.write(`Registry valid: ${result.data.components.length} families, ${result.componentExports} Svelte component exports. Upstream: ${result.upstream}. Test execution was not checked.\n`);
  }
});
