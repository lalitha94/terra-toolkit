const commander = require('commander');
const aggregate = require('./aggregate-themes');
const parseList = require('../utils/parse-cli-list');
const { version } = require('../../package.json');

commander
  .version(version)
  .option('-e, --exclude [exclude]', 'Directories and files to exclude', parseList)
  .option('-i, --include [include]', 'Directories and files to include', parseList)
  .option('-t, --theme <theme>', 'The theme name to be aggregated')
  .parse(process.argv);

const options = {
  exclude: commander.exclude,
  include: commander.include,
  theme: commander.theme,
};

aggregate(options);
