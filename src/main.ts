import { parse } from './parser.js';
import { generate } from './generator.js';
import { Command } from 'commander';
import { write } from './writer.js';

const program = new Command();

program
    .command('generate')
    .option('-f, --file <path>', 'File to parse')
    .action(async options => {
        const parseOutput = parse(options.file);
        const content = await generate(parseOutput);
        write(options.file, content);
    });

program.parse();
