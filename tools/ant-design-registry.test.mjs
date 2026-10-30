import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { componentExportNames, coverage, inspectRegistry, publicExports, renderReport, validateRegistry } from './ant-design-registry-core.mjs';
import { projectPath, registryFile } from './ant-design-common.mjs';

const revision = 'a'.repeat(40);
function sample() {
  return { schemaVersion: 2, upstream: { version: '6.6.8', revision, archiveUrl: 'https://registry.npmjs.org/antd/-/antd-6.6.8.tgz', archiveSha256: 'b'.repeat(64) }, supportingExports: [], components: [{ id: 'avatar', name: 'Avatar', category: 'data-display', scope: 'target', scopeReason: 'Reviewed example', upstreamPath: 'components/avatar', reviewedRevision: revision, exports: [{ upstream: 'Avatar', local: ['Avatar'] }], dependencies: [], upstreamPackages: [], priority: 'unassigned', effort: 'unknown', fixtures: [], evidence: [], features: [{ id: 'image', title: 'Image fallback', state: 'supported', requiredForV1: true, evidence: ['src/lib/Avatar.svelte'], note: '' }] }] };
}
const roots = [];
afterEach(async () => { await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true }))); });

describe('Ant Design registry', () => {
  it('counts component exports separately from types and named rune model factories', () => {
    const source = "export { default as Avatar } from './Avatar.svelte'; export { createForm, type FormInstance } from './form.model.svelte'; export type { AvatarProps } from './avatar.types';";
    expect([...publicExports(source).keys()]).toEqual(['Avatar', 'createForm']); expect(componentExportNames(source)).toEqual(['Avatar']);
  });
  it('keeps v1 readiness separate from future capabilities and forces review on revision changes', () => {
    const item = sample().components[0]; item.features.push({ ...item.features[0], id: 'responsive', requiredForV1: false, state: 'missing', evidence: [] });
    expect(coverage(item, revision)).toBe('v1-ready'); expect(coverage(item, 'c'.repeat(40))).toBe('needs-review'); item.features[0].state = 'partial'; expect(coverage(item, revision)).toBe('partial'); item.features[0].state = 'unreviewed'; expect(coverage(item, revision)).toBe('needs-review'); item.exports = []; expect(coverage(item, revision)).toBe('not-started');
  });
  it('rejects unsupported completion claims without implementation review or evidence', () => {
    const data = sample(); data.components[0].reviewedRevision = null; data.components[0].features[0].evidence = [];
    expect(validateRegistry(data)).toContain('avatar/image: supported requires exports, review revision and evidence');
  });
  it('rejects duplicate component and feature identities and unknown states', () => {
    const data = sample(); data.components[0].features.push({ ...data.components[0].features[0], state: 'done' }); data.components.push(structuredClone(data.components[0]));
    expect(validateRegistry(data)).toContain('Duplicate component id: avatar'); expect(validateRegistry(data)).toContain('avatar: duplicate or invalid feature id'); expect(validateRegistry(data)).toContain('avatar/image: invalid feature state');
  });
  it('rejects missing and circular dependencies', () => {
    const data = sample(); data.components[0].dependencies = ['missing']; expect(validateRegistry(data)).toContain('avatar: invalid dependency missing');
    const second = { ...structuredClone(data.components[0]), id: 'popover', exports: [], dependencies: ['avatar'], features: [{ ...data.components[0].features[0], state: 'missing', evidence: [] }] }; data.components[0].dependencies = ['popover']; data.components.push(second); expect(validateRegistry(data)).toContain('Dependency cycle: avatar');
  });
  it('returns diagnostics for malformed records and rejects paths outside the project', () => {
    const data = sample(); data.components.push(null); data.components[0].dependencies = {};
    expect(validateRegistry(data)).toContain('Component must be an object'); expect(validateRegistry(data)).toContain('avatar: dependencies must be an array');
    data.components[0].exports = [null, { upstream: 'Avatar', local: 1 }];
    data.components[0].features.push([]);
    expect(validateRegistry(data)).toContain('avatar: invalid export mapping'); expect(validateRegistry(data)).toContain('avatar: invalid feature');
    data.supportingExports = ['enUS', 'enUS', null];
    expect(validateRegistry(data)).toContain('Duplicate supporting export'); expect(validateRegistry(data)).toContain('supportingExports must contain nonempty strings');
    for (const path of ['/tmp/file', '../file', 'src/../file', '..\\file']) expect(() => projectPath('/project', path)).toThrow();
  });
  it('generates deterministic reports without claiming a test run passed', () => {
    const data = sample(); const result = renderReport(data, 1);
    expect(result).toBe(renderReport(structuredClone(data), 1)); expect(result).toContain('покрыт у **1**'); expect(result).toContain('результаты тестов учитываются отдельно'); expect(result).toContain(`/tree/${revision}/components/avatar`);
  });
  it('validates offline without a clone and detects missing files and unregistered exports', async () => {
    const root = await mkdtemp(join(tmpdir(), 'antd-registry-')); roots.push(root);
    const put = async (path, content) => { const target = join(root, path); await mkdir(dirname(target), { recursive: true }); await writeFile(target, content); };
    const data = sample(); data.supportingExports = ['createForm'];
    await put(registryFile, JSON.stringify(data)); await put('src/lib/index.ts', "export { default as Avatar } from './Avatar.svelte'; export { createForm } from './form.model.svelte.js';"); await put('src/lib/Avatar.svelte', '<span />'); await put('src/lib/form.model.svelte.ts', 'export function createForm() {}');
    expect((await inspectRegistry(root)).errors).toEqual([]); expect((await inspectRegistry(root, { requireUpstream: true })).errors).toContain('Pinned upstream checkout is required but absent');
    await put('src/lib/index.ts', "export { default as Avatar } from './Avatar.svelte'; export { createForm } from './form.model.svelte.js'; export { extra } from './missing';");
    const result = await inspectRegistry(root); expect(result.errors).toContain('Unregistered local export: extra'); expect(result.errors).toContain('Missing source for export: extra');
  });
  it('keeps integration evidence separate from local files without requiring a consuming checkout', async () => {
    const root = await mkdtemp(join(tmpdir(), 'antd-registry-')); roots.push(root);
    const put = async (path, content) => { const target = join(root, path); await mkdir(dirname(target), { recursive: true }); await writeFile(target, content); };
    const data = sample();
    data.components[0].evidence = ['integration:avatar'];
    data.components[0].features[0].evidence = ['integration:avatar/image'];
    await put(registryFile, JSON.stringify(data));
    await put('src/lib/index.ts', "export { default as Avatar } from './Avatar.svelte';");
    await put('src/lib/Avatar.svelte', '<span />');
    const result = await inspectRegistry(root);
    expect(result.errors).toEqual([]);
    expect(result.integrationEvidence).toEqual(['avatar', 'avatar/image']);
    for (const ref of ['integration:other/image', 'integration:avatar/missing', 'integration:avatar/image/extra']) {
      data.components[0].features[0].evidence = [ref];
      await put(registryFile, JSON.stringify(data));
      expect((await inspectRegistry(root)).errors).toContain(`avatar: invalid integration evidence ${ref}`);
    }
  });
});
