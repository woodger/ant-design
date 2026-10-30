import { readFile } from 'node:fs/promises';
import { projectPath, reportFile, writeAtomic } from './ant-design-common.mjs';
import { inspectRegistry, renderReport, coverage } from './ant-design-registry-core.mjs';

export async function runRegistry(command, { component, upstream }, { root, stdout }) {
  const result = await inspectRegistry(root, { requireUpstream: upstream === true });
  if (result.errors.length) throw new Error(result.errors.join('\n'));
  const report = renderReport(result.data, result.componentExports);
  if (command === 'report') {
    await writeAtomic(projectPath(root, reportFile), report);
    stdout.write(`Updated ${reportFile}\n`);
  } else if (command === 'show') {
    const item = result.data.components.find(item => item.id === component);
    if (!item) throw new Error(`Unknown component: ${component}`);
    stdout.write(`${JSON.stringify({ ...item, coverage: coverage(item, result.data.upstream.revision) }, null, 2)}\n`);
  } else {
    const actual = await readFile(projectPath(root, reportFile), 'utf8').catch(() => '');
    if (actual !== report) throw new Error('Registry report is stale. Run npm run cli -- registry report');
    stdout.write(`Local registry valid: ${result.data.components.length} families, ${result.componentExports} Svelte component exports. Upstream: ${result.upstream}. Integration evidence (${result.integrationEvidence.length} contracts) must be checked by the consuming project. Test execution was not checked.\n`);
  }
}
