import { createCommand, CliUsageError } from 'icore';
import { projectRoot } from './ant-design-common.mjs';
import { runRegistry } from './ant-design-registry.mjs';
import { runCss } from './ant-design-css.mjs';

const command = createCommand();
const helpOption = { type: 'boolean', alias: 'h', syntax: 'flag' };
const flag = { type: 'boolean', syntax: 'flag' };

function writeHelp(context, prefix = []) {
  const definitions = commands.definitions.filter(definition => prefix.every((part, index) => definition.path[index] === part));
  const lines = ['Usage: npm run cli -- <command> [options]', ''];
  for (const definition of definitions) {
    const usage = `${definition.path.join(' ')}${definition.metadata.argument ? ` ${definition.metadata.argument}` : ''}`;
    lines.push(`  ${usage.padEnd(32)}${definition.metadata.description}`);
    for (const [name, schema] of Object.entries(definition.options)) {
      if (name === 'help') continue;
      lines.push(`    --${name}${schema.type === 'string' ? ' <path>' : ''}`);
    }
  }
  lines.push('', '  -h, --help                     Show command help', '');
  context.stdout.write(lines.join('\n'));
}

function registryCommand(action, description) {
  return command.define({
    path: ['registry', action],
    options: { upstream: flag, help: helpOption },
    allowExtraPositionals: action === 'show',
    metadata: { description, argument: action === 'show' ? '<component>' : '' },
    handle({ options, positionals, context }) {
      if (options.help) { writeHelp(context, ['registry', action]); return; }
      if (action === 'show' && positionals.length !== 1) throw new CliUsageError('registry show requires exactly one component identifier');
      return runRegistry(action, { component: positionals[0], upstream: options.upstream }, context);
    }
  });
}

const commands = command.registry([
  command.define({
    path: ['help'],
    options: {},
    metadata: { description: 'Show all commands' },
    handle({ context }) { writeHelp(context); }
  }),
  command.define({
    path: ['registry'],
    options: { help: helpOption },
    metadata: { description: 'Show registry commands' },
    handle({ context }) { writeHelp(context, ['registry']); }
  }),
  registryCommand('check', 'Validate local coverage and the generated report'),
  registryCommand('report', 'Regenerate the coverage report'),
  registryCommand('show', 'Print a component record as JSON'),
  command.define({
    path: ['css'],
    options: { list: flag, check: flag, write: flag, fetch: flag, archive: { type: 'string' }, help: helpOption },
    allowExtraPositionals: true,
    metadata: { description: 'Extract, compare or write pinned upstream CSS', argument: '[recipe|all]' },
    handle({ options, provided, positionals, context }) {
      if (options.help) { writeHelp(context, ['css']); return; }
      if (options.list) {
        if (positionals.length || ['check', 'write', 'fetch', 'archive'].some(name => provided[name])) throw new CliUsageError('css --list cannot be combined with a recipe or extraction options');
      } else if (positionals.length !== 1) throw new CliUsageError('css requires exactly one recipe or all; use --list to list recipes');
      return runCss({ ...options, recipe: positionals[0] }, context);
    }
  })
]);

export async function runCommands(args, { root = projectRoot, stdout = process.stdout, stderr = process.stderr, fetch = globalThis.fetch } = {}) {
  const input = !args.length || args.length === 1 && ['--help', '-h'].includes(args[0]) ? ['help'] : args;
  await commands.runFromArgs(input, { root, stdout, stderr, fetch }, { strict: true });
}
