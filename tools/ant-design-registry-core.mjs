import { access, readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import ts from 'typescript';
import { projectPath, readJson, registryFile } from './ant-design-common.mjs';

export const featureStates = ['unreviewed', 'missing', 'partial', 'supported'];
const scopes = ['target', 'candidate', 'excluded'];
const exists = path => access(path).then(() => true, () => false);

export function publicExports(source) {
  const ast = ts.createSourceFile('index.ts', source, ts.ScriptTarget.Latest, true);
  const exports = new Map();
  for (const node of ast.statements) {
    if (!ts.isExportDeclaration(node) || node.isTypeOnly || !node.exportClause || !ts.isNamedExports(node.exportClause)) continue;
    for (const item of node.exportClause.elements) {
      if (!item.isTypeOnly) exports.set(item.name.text, node.moduleSpecifier?.text ?? null);
    }
  }
  return exports;
}

export function componentExportNames(source) {
  const ast = ts.createSourceFile('index.ts', source, ts.ScriptTarget.Latest, true);
  return ast.statements.flatMap(node => ts.isExportDeclaration(node) && !node.isTypeOnly && node.moduleSpecifier?.text?.endsWith('.svelte') && node.exportClause && ts.isNamedExports(node.exportClause)
    ? node.exportClause.elements.filter(item => !item.isTypeOnly && item.propertyName?.text === 'default').map(item => item.name.text) : []);
}

export function validateRegistry(data) {
  const errors = [];
  const require = (condition, message) => { if (!condition) errors.push(message); };
  require(data?.schemaVersion === 1, 'schemaVersion must be 1');
  require(typeof data?.upstream?.version === 'string' && /^\d+\.\d+\.\d+$/.test(data.upstream.version), 'Invalid upstream version');
  require(/^[a-f0-9]{40}$/.test(data?.upstream?.revision ?? ''), 'Invalid upstream revision');
  require(/^[a-f0-9]{64}$/.test(data?.upstream?.archiveSha256 ?? ''), 'Invalid archive SHA-256');
  require(data?.upstream?.archiveUrl === `https://registry.npmjs.org/antd/-/antd-${data?.upstream?.version}.tgz`, 'Archive URL must identify the pinned official antd package');
  require(Array.isArray(data?.components), 'components must be an array');
  require(Array.isArray(data?.supportingExports), 'supportingExports must be an array');
  if (errors.length) return errors;
  require(data.supportingExports.every(name => typeof name === 'string' && name.length > 0), 'supportingExports must contain nonempty strings');
  require(new Set(data.supportingExports).size === data.supportingExports.length, 'Duplicate supporting export');
  const ids = new Set();
  const localNames = new Set(data.supportingExports);
  for (const item of data.components) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) { errors.push('Component must be an object'); continue; }
    const label = item?.id ?? '<missing id>';
    require(typeof item?.id === 'string' && /^[a-z][a-z0-9-]*$/.test(item.id), `Invalid component id: ${label}`);
    require(!ids.has(item.id), `Duplicate component id: ${label}`); ids.add(item.id);
    require(typeof item.name === 'string' && item.name.length > 0, `${label}: missing name`);
    require(typeof item.category === 'string' && item.category.length > 0, `${label}: missing category`);
    require(scopes.includes(item.scope), `${label}: invalid scope`);
    require(typeof item.scopeReason === 'string' && item.scopeReason.length > 0, `${label}: missing scope reason`);
    require(item.reviewedRevision === null || /^[a-f0-9]{40}$/.test(item.reviewedRevision), `${label}: invalid reviewed revision`);
    require(['S', 'M', 'L', 'unknown'].includes(item.effort), `${label}: invalid effort`);
    require(['p1', 'p2', 'p3', 'unassigned'].includes(item.priority), `${label}: invalid priority`);
    for (const field of ['exports', 'dependencies', 'features', 'fixtures', 'evidence', 'upstreamPackages']) require(Array.isArray(item[field]), `${label}: ${field} must be an array`);
    for (const field of ['dependencies', 'fixtures', 'evidence']) if (Array.isArray(item[field])) require(item[field].every(value => typeof value === 'string' && value.length > 0), `${label}: ${field} must contain nonempty strings`);
    if (Array.isArray(item.upstreamPackages)) for (const dependency of item.upstreamPackages) require(typeof dependency?.name === 'string' && typeof dependency.range === 'string' && (dependency.referenceVersion === null || /^\d+\.\d+\.\d+(?:[-+].+)?$/.test(dependency.referenceVersion)), `${label}: invalid upstream package reference`);
    try { projectPath('/project', item.upstreamPath); } catch (error) { errors.push(`${label}: ${error.message}`); }
    if (!Array.isArray(item.exports) || !Array.isArray(item.features)) continue;
    for (const entry of item.exports) {
      require(typeof entry?.upstream === 'string' && Array.isArray(entry.local) && entry.local.length > 0, `${label}: invalid export mapping`);
      if (!Array.isArray(entry?.local)) continue;
      for (const name of entry.local) {
        require(typeof name === 'string' && !localNames.has(name), `${label}: duplicate or invalid local export ${name}`); localNames.add(name);
      }
    }
    const featureIds = new Set();
    for (const feature of item.features) {
      if (!feature || typeof feature !== 'object' || Array.isArray(feature)) { errors.push(`${label}: invalid feature`); continue; }
      require(typeof feature?.id === 'string' && feature.id.length > 0 && !featureIds.has(feature.id), `${label}: duplicate or invalid feature id`); featureIds.add(feature.id);
      require(typeof feature.title === 'string' && feature.title.length > 0, `${label}: missing feature title`);
      require(featureStates.includes(feature.state), `${label}/${feature.id}: invalid feature state`);
      require(typeof feature.requiredForV1 === 'boolean', `${label}/${feature.id}: requiredForV1 must be boolean`);
      require(Array.isArray(feature.evidence), `${label}/${feature.id}: evidence must be an array`);
      if (Array.isArray(feature.evidence)) require(feature.evidence.every(value => typeof value === 'string' && value.length > 0), `${label}/${feature.id}: evidence must contain nonempty strings`);
      require(typeof feature.note === 'string', `${label}/${feature.id}: missing note`);
      if (feature.state === 'supported') require(item.exports.length > 0 && feature.evidence?.length > 0 && item.reviewedRevision !== null, `${label}/${feature.id}: supported requires exports, review revision and evidence`);
    }
    require(item.features.some(feature => feature?.requiredForV1), `${label}: missing v1 criteria`);
  }
  for (const item of data.components) if (Array.isArray(item?.dependencies)) for (const dependency of item.dependencies) require(ids.has(dependency) && dependency !== item.id, `${item.id}: invalid dependency ${dependency}`);
  const visiting = new Set(); const visited = new Set();
  function visit(id) {
    if (visiting.has(id)) { errors.push(`Dependency cycle: ${id}`); return; }
    if (visited.has(id)) return;
    visiting.add(id);
    const dependencies = data.components.find(item => item?.id === id)?.dependencies;
    for (const next of Array.isArray(dependencies) ? dependencies : []) if (ids.has(next)) visit(next);
    visiting.delete(id); visited.add(id);
  }
  for (const id of ids) visit(id);
  return errors;
}

export function coverage(item, revision) {
  if (!item.exports.length) return 'not-started';
  const required = item.features.filter(feature => feature.requiredForV1);
  if (item.reviewedRevision !== revision || required.some(feature => feature.state === 'unreviewed')) return 'needs-review';
  return required.every(feature => feature.state === 'supported') ? 'v1-ready' : 'partial';
}

export async function inspectRegistry(root, { requireUpstream = false } = {}) {
  const data = await readJson(projectPath(root, registryFile));
  const errors = validateRegistry(data);
  if (errors.length) return { data, errors, upstream: 'not checked' };
  const index = await readFile(projectPath(root, 'src/lib/components/ant-design/index.ts'), 'utf8');
  const exports = publicExports(index);
  const registered = new Set([...data.supportingExports, ...data.components.flatMap(item => item.exports.flatMap(entry => entry.local))]);
  for (const name of registered) if (!exports.has(name)) errors.push(`Missing local export: ${name}`);
  for (const name of exports.keys()) if (!registered.has(name)) errors.push(`Unregistered local export: ${name}`);
  for (const [name, source] of exports) {
    if (!source?.startsWith('./')) { errors.push(`Export source must be local: ${name}`); continue; }
    const base = `src/lib/components/ant-design/${source.slice(2)}`;
    if (!(await Promise.all(['', '.ts', '.svelte.ts', '/index.ts'].map(suffix => exists(projectPath(root, base + suffix))))).some(Boolean)) errors.push(`Missing source for export: ${name}`);
  }
  const fixtures = await readJson(projectPath(root, 'e2e/fixtures/catalog.json'));
  const fixtureIds = new Set();
  for (const entry of fixtures) {
    if (fixtureIds.has(entry.id)) errors.push(`Duplicate fixture: ${entry.id}`);
    fixtureIds.add(entry.id);
    try { if (!await exists(projectPath(root, `e2e/fixtures/${entry.module.replace(/^\.\//, '')}`))) errors.push(`Missing fixture module: ${entry.id}`); }
    catch (error) { errors.push(error.message); }
  }
  const upstreamRoot = projectPath(root, '.upstream/ant-design');
  let upstream = 'absent (offline local checks only)';
  if (await exists(upstreamRoot)) {
    try {
      const revision = execFileSync('git', ['-C', upstreamRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
      upstream = revision;
      if (revision !== data.upstream.revision) errors.push(`Upstream revision mismatch: ${revision}`);
      const upstreamPackage = await readJson(projectPath(upstreamRoot, 'package.json'));
      if (upstreamPackage.name !== 'antd' || upstreamPackage.version !== data.upstream.version) errors.push('Upstream package version does not match the registry');
      if (requireUpstream && execFileSync('git', ['-C', upstreamRoot, 'status', '--porcelain'], { encoding: 'utf8' }).trim()) errors.push('Upstream checkout has local modifications');
    } catch { errors.push('Cannot verify upstream Git revision'); }
  } else if (requireUpstream) errors.push('Pinned upstream checkout is required but absent');
  for (const item of data.components) {
    for (const id of item.fixtures) if (!fixtureIds.has(id)) errors.push(`${item.id}: unknown fixture ${id}`);
    const refs = [...item.evidence, ...item.features.flatMap(feature => feature.evidence)];
    for (const ref of new Set(refs)) {
      try { if (!await exists(projectPath(root, ref.split('#')[0]))) errors.push(`${item.id}: missing evidence ${ref}`); }
      catch (error) { errors.push(`${item.id}: ${error.message}`); }
    }
    if (upstream !== 'absent (offline local checks only)') {
      try { if (!await exists(projectPath(upstreamRoot, item.upstreamPath))) errors.push(`${item.id}: missing upstream path`); }
      catch (error) { errors.push(error.message); }
    }
  }
  return { data, errors, upstream, componentExports: componentExportNames(index).length };
}

const states = { 'not-started': 'Нет публичной реализации', 'needs-review': 'Требуется аудит v1', 'v1-ready': 'Согласованный v1 покрыт', partial: 'Частично покрыт v1' };
const escape = text => String(text).replaceAll('|', '\\|').replaceAll('\n', ' ');

export function renderReport(data, componentExports) {
  const counts = Object.fromEntries(Object.keys(states).map(state => [state, data.components.filter(item => coverage(item, data.upstream.revision) === state).length]));
  const lines = ['# Покрытие переноса Ant Design', '', '> Type: Reference. Сгенерировано командой `npm run antd:registry:report`.', '> Изменяйте registry.json; результаты запуска тестов здесь не хранятся.', '', `Эталон: Ant Design ${data.upstream.version}, commit \`${data.upstream.revision}\`.`, '', `Каталог: **${data.components.length} семейств**, публичных Svelte-компонентов: **${componentExports}**.`, `Есть публичная реализация у **${data.components.length - counts['not-started']}** семейств; отсутствует у **${counts['not-started']}**.`, `Проверенный объём v1 покрыт у **${counts['v1-ready']}**; требуется аудит у **${counts['needs-review']}**; частично покрыт у **${counts.partial}**.`, '', 'Наличие экспорта, полнота согласованного v1 и результаты тестов учитываются отдельно.', 'Candidate означает запись каталога, для которой целевой объём ещё не согласован.', '', '| Семейство | Категория | Scope | Экспорты Svelte | Аудит v1 | Известные пробелы |', '| --- | --- | --- | --- | --- | --- |'];
  for (const item of data.components) {
    const source = `https://github.com/ant-design/ant-design/tree/${data.upstream.revision}/${item.upstreamPath}`;
    const gaps = item.features.filter(feature => feature.state !== 'supported').map(feature => `${feature.title} (${feature.state})`).join('; ');
    lines.push(`| [${escape(item.name)}](${source}) | ${escape(item.category)} | ${item.scope} | ${item.exports.flatMap(entry => entry.local).join(', ') || '—'} | ${states[coverage(item, data.upstream.revision)]} | ${escape(gaps)} |`);
  }
  return `${lines.join('\n')}\n`;
}
