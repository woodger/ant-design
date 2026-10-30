import { runCli } from './ant-design-common.mjs';
import { runCommands } from './cli-core.mjs';

await runCli(() => runCommands(process.argv.slice(2)));
