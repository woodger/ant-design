import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { registryFile, reportFile } from './ant-design-common.mjs';
import { runCommands } from './cli-core.mjs';

const roots = [];
afterEach(async () => { await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true }))); });

function output(root) {
  let stdout = '', stderr = '';
  const fetch = vi.fn(async () => { throw new Error('Unexpected network request'); });
  return {
    context: { root, stdout: { write: chunk => { stdout += chunk; } }, stderr: { write: chunk => { stderr += chunk; } }, fetch },
    get stdout() { return stdout; },
    get stderr() { return stderr; },
    fetch
  };
}

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'antd-cli-')); roots.push(root);
  const put = async (path, content) => { const target = join(root, path); await mkdir(dirname(target), { recursive: true }); await writeFile(target, typeof content === 'string' || Buffer.isBuffer(content) ? content : JSON.stringify(content)); };
  const css = Buffer.from('.ant-avatar{color:red}');
  const header = Buffer.alloc(512); header.write('package/dist/antd.css'); header.write(`${css.length.toString(8).padStart(11, '0')}\0`, 124); header[156] = 48;
  const archive = gzipSync(Buffer.concat([header, css, Buffer.alloc(512 - css.length), Buffer.alloc(1024)]));
  const hash = createHash('sha256').update(archive).digest('hex');
  const revision = 'a'.repeat(40);
  const data = { schemaVersion: 2, upstream: { version: '6.6.8', revision, archiveUrl: 'https://registry.npmjs.org/antd/-/antd-6.6.8.tgz', archiveSha256: hash }, supportingExports: [], components: [{ id: 'avatar', name: 'Avatar', category: 'data-display', scope: 'target', scopeReason: 'CLI test', upstreamPath: 'components/avatar', reviewedRevision: revision, exports: [{ upstream: 'Avatar', local: ['Avatar'] }], dependencies: [], upstreamPackages: [], priority: 'unassigned', effort: 'unknown', evidence: ['src/lib/Avatar.svelte'], features: [{ id: 'appearance', title: 'Appearance', state: 'supported', requiredForV1: true, evidence: ['src/lib/Avatar.svelte'], note: '' }] }] };
  const recipe = { id: 'avatar', include: ['\\.ant-avatar(?![\\w-])'], exclude: [], replacements: [], expectedRules: 1, keyframes: [], header: `/* Ant Design 6.6.8; SHA-256 ${hash} */`, output: 'src/lib/vendor/avatar.css' };
  const expectedCss = `${recipe.header}\n.ant-avatar{color:red}\n`;
  await put(registryFile, data);
  await put('src/lib/index.ts', "export { default as Avatar } from './Avatar.svelte';");
  await put('src/lib/Avatar.svelte', '<span />');
  await put('tools/ant-design-css-recipes.json', [recipe]);
  await put('input.tgz', archive);
  await put(recipe.output, expectedCss);
  return { root, put, data, recipe, archive, expectedCss };
}

describe('Developer CLI', () => {
  it('shows global and command help without loading project files or starting requests', async () => {
    for (const args of [[], ['--help'], ['-h'], ['registry', '--help'], ['registry', 'show', '--help'], ['css', '--help']]) {
      const capture = output('/missing-cli-project');
      await runCommands(args, capture.context);
      expect(capture.stdout).toContain('Usage: npm run cli --');
      expect(capture.stderr).toBe('');
      expect(capture.fetch).not.toHaveBeenCalled();
    }
  });

  it('generates a deterministic report, checks staleness and prints a record as clean JSON', async () => {
    const { root, put } = await fixture();
    await expect(runCommands(['registry', 'check'], output(root).context)).rejects.toThrow('registry report');
    const generated = output(root);
    await runCommands(['registry', 'report'], generated.context);
    expect(generated.stdout).toBe(`Updated ${reportFile}\n`);
    const report = await readFile(join(root, reportFile), 'utf8');
    await runCommands(['registry', 'report'], output(root).context);
    expect(await readFile(join(root, reportFile), 'utf8')).toBe(report);
    const checked = output(root);
    await runCommands(['registry', 'check'], checked.context);
    expect(checked.stdout).toContain('Local registry valid: 1 families, 1 Svelte component exports.');
    const shown = output(root);
    await runCommands(['registry', 'show', 'avatar'], shown.context);
    expect(JSON.parse(shown.stdout)).toMatchObject({ id: 'avatar', coverage: 'v1-ready' });
    expect(shown.stderr).toBe('');
    await expect(runCommands(['registry', 'show', 'missing'], output(root).context)).rejects.toThrow('Unknown component: missing');
    await expect(runCommands(['registry', 'check', '--upstream'], output(root).context)).rejects.toThrow('Pinned upstream checkout is required');
    await put(reportFile, 'stale');
    await expect(runCommands(['registry', 'check'], output(root).context)).rejects.toThrow('Registry report is stale');
  });

  it('rejects invalid commands, unknown flags, incorrect operands and ambiguous CSS modes before doing work', async () => {
    const { root, recipe } = await fixture();
    const original = await readFile(join(root, recipe.output), 'utf8');
    for (const args of [
      ['missing'], ['registry', 'missing'], ['registry', 'show'], ['registry', 'show', 'avatar', 'extra'],
      ['registry', 'check', 'extra'], ['registry', 'check', '--unknown'], ['registry', '--upstream', 'check'],
      ['css'], ['css', 'avatar', 'extra'], ['css', 'avatar', '--unknown'], ['css', 'avatar', '--check=false'],
      ['css', 'avatar', '--no-write'], ['css', 'avatar', '--archive'], ['css', 'avatar', '--check', '--write'],
      ['css', '--list', '--write'], ['css', 'avatar', '--list']
    ]) {
      const capture = output(root);
      await expect(runCommands(args, capture.context)).rejects.toThrow();
      expect(capture.stdout).toBe('');
      expect(capture.fetch).not.toHaveBeenCalled();
    }
    expect(await readFile(join(root, recipe.output), 'utf8')).toBe(original);
  });

  it('lists recipes and preserves preview, comparison and explicit write modes with both archive syntaxes', async () => {
    const { root, put, recipe, expectedCss } = await fixture();
    const listed = output(root);
    await runCommands(['css', '--list'], listed.context);
    expect(listed.stdout).toBe('avatar\n');
    const preview = output(root);
    await runCommands(['css', 'avatar', '--archive=input.tgz'], preview.context);
    expect(preview.stdout).toBe(expectedCss);
    expect(preview.stderr).toContain('; preview only');
    const checked = output(root);
    await runCommands(['css', 'all', '--archive', 'input.tgz', '--check'], checked.context);
    expect(checked.stdout).toBe('');
    expect(checked.stderr).toContain('; matches');
    await put(recipe.output, 'changed');
    await expect(runCommands(['css', 'all', '--archive=input.tgz', '--check'], output(root).context)).rejects.toThrow('CSS differs');
    expect(await readFile(join(root, recipe.output), 'utf8')).toBe('changed');
    const written = output(root);
    await runCommands(['css', 'avatar', '--archive=input.tgz', '--write'], written.context);
    expect(await readFile(join(root, recipe.output), 'utf8')).toBe(expectedCss);
    expect(written.stdout).toBe('');
    expect(written.stderr).toContain('; written');
  });

  it('requires opt-in to download and verifies fetched bytes before caching or modifying CSS', async () => {
    const { root, archive, recipe, expectedCss } = await fixture();
    const missing = output(root);
    await expect(runCommands(['css', 'avatar', '--write'], missing.context)).rejects.toThrow('Missing archive');
    expect(missing.fetch).not.toHaveBeenCalled();
    const bad = output(root);
    bad.fetch.mockResolvedValue({ ok: true, arrayBuffer: async () => Buffer.from('tampered archive') });
    await expect(runCommands(['css', 'avatar', '--fetch', '--write'], bad.context)).rejects.toThrow('SHA-256 mismatch');
    await expect(readFile(join(root, '.upstream/artifacts/antd-6.6.8.tgz'))).rejects.toThrow();
    expect(await readFile(join(root, recipe.output), 'utf8')).toBe(expectedCss);
    const good = output(root);
    good.fetch.mockResolvedValue({ ok: true, arrayBuffer: async () => archive });
    await runCommands(['css', 'avatar', '--fetch', '--check'], good.context);
    expect(good.fetch).toHaveBeenCalledOnce();
    expect(await readFile(join(root, '.upstream/artifacts/antd-6.6.8.tgz'))).toEqual(archive);
    const offline = output(root);
    await runCommands(['css', 'avatar', '--check'], offline.context);
    expect(offline.fetch).not.toHaveBeenCalled();
  });

  it('does not download a replacement for a missing explicit archive or write on invalid provenance', async () => {
    const { root, put, recipe, expectedCss } = await fixture();
    const explicit = output(root);
    await expect(runCommands(['css', 'avatar', '--archive=missing.tgz', '--fetch'], explicit.context)).rejects.toThrow('Missing archive');
    expect(explicit.fetch).not.toHaveBeenCalled();
    await put('broken.tgz', 'invalid bytes');
    await expect(runCommands(['css', 'avatar', '--archive=broken.tgz', '--write'], output(root).context)).rejects.toThrow('SHA-256 mismatch');
    await put('tools/ant-design-css-recipes.json', [{ ...recipe, header: 'unverified header' }]);
    await expect(runCommands(['css', 'avatar', '--archive=input.tgz', '--write'], output(root).context)).rejects.toThrow('Recipe provenance is stale');
    await put('tools/ant-design-css-recipes.json', [{ ...recipe, output: '../outside.css' }]);
    await expect(runCommands(['css', 'avatar', '--archive=input.tgz', '--write'], output(root).context)).rejects.toThrow('CSS output must stay');
    expect(await readFile(join(root, recipe.output), 'utf8')).toBe(expectedCss);
  });

  it('keeps the executable independent of cwd and returns code 1 for errors without polluting stdout', () => {
    const entry = fileURLToPath(new URL('./cli.mjs', import.meta.url));
    const help = execFileSync(process.execPath, [entry, '--help'], { cwd: tmpdir(), encoding: 'utf8' });
    expect(help).toContain('registry show <component>');
    const shown = execFileSync(process.execPath, [entry, 'registry', 'show', 'avatar'], { cwd: tmpdir(), encoding: 'utf8' });
    expect(JSON.parse(shown).id).toBe('avatar');
    const invalid = spawnSync(process.execPath, [entry, 'registry', 'show'], { cwd: tmpdir(), encoding: 'utf8' });
    expect(invalid.status).toBe(1);
    expect(invalid.stdout).toBe('');
    expect(invalid.stderr).toContain('exactly one component identifier');
  });
});
