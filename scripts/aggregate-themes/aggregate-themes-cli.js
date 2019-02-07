const commander = require('commander');
const aggregate = require('./aggregate-themes');
const parseList = require('../utils/parse-cli-list');
const { version } = require('../../package.json');

commander
  .version(version)
  .option('-b, --baseDir [baseDir]', 'The base directory', process.cwd())
  .option('-e, --exclude [exclude]', 'A list of glob patterns to exclude', parseList)
  .option('-i, --include [include]', 'A list of glob patterns to include', parseList)
  .option('-o, --outputDir [outputDir]', 'The output directory', process.cwd())
  .option('-s, --scoped', 'Enable only scoped theme aggregation')
  .option('-t, --theme <theme>', 'Theme name')
  .parse(process.argv);

const options = {
  baseDir: commander.baseDir,
  exclude: commander.exclude,
  include: commander.include,
  outputDir: commander.outputDir,
  scoped: commander.scoped,
  theme: commander.theme,
};

aggregate(options);
