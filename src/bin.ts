#! /usr/bin/env node
import { resolve } from 'path';
import { promisify } from 'util';
import { readFile as fsReadFile, writeFile as fsWriteFile } from 'fs';

import * as yargs from 'yargs';
import { stripIndent } from 'common-tags';
import { Logger } from 'eazy-logger';
import got from 'got';

import parse, {
  ParsingOptions,
  isWebContent,
  updateRelativeLinksFromBase,
} from './index';

const logger = Logger();
const readFile = promisify(fsReadFile);
const writeFile = promisify(fsWriteFile);

interface CommandLineOptions extends yargs.Arguments {
  html: boolean;
  input: string;
  output: string;
  pretty: boolean;
  fixUrl: boolean;
}

const usage = stripIndent`
  Turns a markdown file into a JSON. Opinionated based on the about-me file format.
  Usage: $0 -i <filePathOrUrl>
`;

const opts = yargs
  .usage(usage)
  .option('input', {
    alias: 'i',
    demandOption: true,
    describe: 'File path or URL to load markdown',
    type: 'string',
  })
  .option('output', {
    alias: 'o',
    demandOption: false,
    describe: 'File path to write output. Will write to stdout otherwise.',
    default: undefined,
    type: 'string',
  })
  .option('html', {
    demandOption: false,
    describe:
      'Output inline content (such as links) as HTML rather than Markdown',
    default: false,
    type: 'boolean',
  })
  .option('pretty', {
    demandOption: false,
    describe:
      'Prints the resulting JSON in an indented way instead of condensed',
    default: false,
    type: 'boolean',
  })
  .option('fixUrl', {
    alias: 'u',
    demandOption: false,
    describe:
      'If the content is fetched from the web, it will update the relative links to absolute URLs',
    default: true,
    type: 'boolean',
  })
  .showHelpOnFail(true)
  .help('help')
  .strict()
  .version()
  .parse() as CommandLineOptions;

run(opts).catch(err => {
  console.error(err);
});

async function run(opts: CommandLineOptions) {
  let content: string;
  let isFromWeb = isWebContent(opts.input);
  if (isFromWeb) {
    const resp = await got(opts.input);
    if (resp.statusCode !== 200 || !resp.body) {
      logger.error('Could not fetch file');
      process.exit(1);
    }
    content = resp.body;
  } else {
    const path = resolve(process.cwd(), opts.input);
    content = await readFile(path, 'utf8');
  }

  const parseOptions: ParsingOptions = {
    asHtml: opts.html,
  };
  if (isFromWeb && opts.fixUrl) {
    parseOptions.updateRelativeLinks = (url: string) =>
      updateRelativeLinksFromBase(opts.input, url);
  }
  const result = parse(content, parseOptions);
  const outputData = opts.pretty
    ? JSON.stringify(result, null, 4)
    : JSON.stringify(result);

  if (!opts.output) {
    process.stdout.write(outputData);
    process.exit(0);
  }

  const path = resolve(process.cwd(), opts.output);
  await writeFile(path, outputData, 'utf8');
  logger.log('Wrote output to {cyan:%s} 🎉', path);
}
