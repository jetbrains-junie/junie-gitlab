import {Command, Option} from 'commander';
import {createRequire} from 'module';
import {execute} from "./executor.js";
import {initialize} from "./initializer.js";
import {logger} from "./utils/logging.js";
import {extractGitLabContext} from "./context.js";

const require = createRequire(import.meta.url);
const pkg: { version?: string } = require('../package.json');

const program = new Command();

program
    .name('gitlab-cli-wrapper')
    .description('Wrapper for Junie CLI for GitLab environment')
    .version(pkg.version ?? '0.0.0');

program
    .command('init')
    .description('Initialize Junie CLI')
    .option('-V, --verbose', 'Enable verbose logging', false)
    .action(async (opts) => {
        const verbose: boolean = opts.verbose ?? false;
        if (verbose) {
            logger.level = 'debug';
        }
        await initialize();
    });

program
    .command('run')
    .description('Run Junie CLI')
    .option('-C, --cleanup', 'Auto clean-up after idle run', false)
    .option('-V, --verbose', 'Enable verbose logging', false)
    .option('-p, --prompt <prompt>', 'Custom prompt for Junie execution')
    .addOption(
        new Option('-M --mr-mode <mode>', 'Merge requests processing mode ("append" or "new")')
            .choices(['append', 'new'])
            .default('new')
    )
    .action(async (opts) => {
        const cleanUp: boolean = opts.cleanup ?? false;
        const verbose: boolean = opts.verbose ?? false;
        const mrMode: 'append' | 'new' = opts.mrMode ?? 'new';
        const customPrompt: string | undefined = opts.prompt;
        if (verbose) {
            logger.level = 'debug';
        }

        // Extract GitLab context from environment and CLI options
        const context = extractGitLabContext({
            cleanupAfterIdleRun: cleanUp,
            mrMode: mrMode,
            customPrompt: customPrompt ?? null,
        });

        execute(context).then(() => {
            logger.info('Execution finished successfully');
        });
    });

program.parseAsync(process.argv);
