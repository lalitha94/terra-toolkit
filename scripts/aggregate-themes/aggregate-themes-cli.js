const commander = require('commander');
const aggregate = require('./aggregate-themes');
const parseList = require('../utils/parse-cli-list');
const { version } = require('../../package.json');

commander
  .version(version)
  .option('-e, --exclude [exclude]', 'An array of glob patterns to exclude', parseList)
  .option('-i, --include [include]', 'An array of glob patterns to include', parseList)
  .option('-s, --scoped [scoped]', 'An array of scoped theme names to aggregate', parseList)
  .option('-t, --theme [theme]', 'The default theme')
  .parse(process.argv);

const options = {
  exclude: commander.exclude,
  include: commander.include,
  scoped: commander.scoped,
  theme: commander.theme,
};

aggregate(options);
