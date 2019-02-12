const fs = require('fs');
const glob = require('glob');
const path = require('path');

const DISCLAIMER = fs.readFileSync(path.resolve(__dirname, 'disclaimer.txt'), 'utf8');
const NODE_MODULES = 'node_modules/';
const OUTPUT = 'aggregated-themes';
const OUTPUT_DIR = 'aggregated-themes';
const OUTPUT_PATH = path.resolve(process.cwd(), OUTPUT_DIR);

/**
 * Aggregates theme assets into a single file.
 *
 * By default the theme will recursively search all dependencies.
 * If a theme directory contains a root-theme.scss only that single file will be aggregated unless
 * the theme is scoped.
 *
 * Default search patterns are expected to be structured as follows: /themes/theme-name/*
 */
class ThemeAggregator {
  /**
   * Aggregates a theme.
   * @param {Object} options - The aggregation options.
   */
  static aggregate(options = {}) {
    const {
      theme,
      scoped = [],
      include = [],
    } = options;

    ThemeAggregator.validate(options);

    const assets = ThemeAggregator.find(`**/themes/${theme}/`, options);

    include.forEach((pattern) => {
      assets.push(...ThemeAggregator.find(pattern, options));
    });

    scoped.forEach((name) => {
      assets.push(...ThemeAggregator.find(`**/themes/${name}/scoped-theme.scss`, options));
    });

    ThemeAggregator.writeFile(ThemeAggregator.filter(assets, options), options);
  }

  /**
   * Filters theme files.
   * @param {array} patterns
   * @param {Object} options
   * @returns {array} - An array of filtered file names.
   */
  static filter(patterns, options) {
    const themeFiles = [];
    patterns.forEach((pattern) => {
      if (fs.lstatSync(pattern).isDirectory()) {
        themeFiles.push(...ThemeAggregator.filterDir(pattern, options));
      } else {
        themeFiles.push(pattern);
      }
    });

    return themeFiles.map(filePath => ThemeAggregator.resolve(filePath, options));
  }


  /**
   * Filters a directory theme files.
   * @param {string} dir - The directory path.
   * @param {Object} options - The aggregation options.
   * @returns {array} - An array of filtered file names.
   */
  static filterDir(dir, options) {
    // Include only the root file if one exists and it is not excluded.
    const rootFile = ThemeAggregator.find(`${dir}root-theme.scss`, options);
    if (rootFile.length === 1) {
      return rootFile;
    }

    return ThemeAggregator.find(`${dir}*.scss`, options);
  }

  /**
   * Finds files and directories matching a pattern.
   * @param {string} pattern - A regex pattern.
   * @param {Object} options - The aggregation options.
   * @returns {array} - An array of matching file names and directories.
   */
  static find(pattern, options) {
    const { exclude = [] } = options;

    return glob.sync(pattern, { ignore: exclude });
  }

  /**
   * Resolves a file path.
   * Dependency files will resolve to the node_modules directory.
   * Local files will resolve relative to the expected output directory.
   * @param {string} filePath - A file path.
   * @returns {string} - A resolved file path.
   */
  static resolve(filePath) {
    if (filePath.indexOf(NODE_MODULES) > -1) {
      return filePath.substring(filePath.indexOf(NODE_MODULES) + NODE_MODULES.length);
    }

    // Constructs the relative path.
    const outputPath = path.resolve(process.cwd(), OUTPUT_DIR);
    return path.relative(outputPath, path.resolve(process.cwd(), filePath));
  }

  /**
   * Validates the aggregated options.
   * @param {Object} options - The aggregated options.
   */
  static validate(options) {
    const { theme, scoped } = options;

    if (!theme && scoped) {
      /* eslint-disable-next-line no-console */
      console.warn('No default theme as been specified. Aggregating scoped themes.');
    } else if (!theme && !scoped) {
      /* eslint-disable-next-line no-console */
      console.warn('No theme provided.\nExiting process...');
      process.exit();
    }
  }

  /**
   * Writes a file containing theme imports.
   * @param {array} imports - An array of files to import.
   */
  static writeFile(imports) {
    const file = imports.reduce((acc, s) => `${acc}import '${s}';\n`, '');

    if (!fs.existsSync(OUTPUT_PATH)) {
      fs.mkdirSync(OUTPUT_PATH);
    }

    fs.writeFileSync(`${path.resolve(OUTPUT_PATH, OUTPUT)}.js`, `${DISCLAIMER}${file}`);
  }
}

module.exports = options => ThemeAggregator.aggregate(options);
