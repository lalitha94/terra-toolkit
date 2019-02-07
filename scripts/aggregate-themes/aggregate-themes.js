const fs = require('fs');
const glob = require('glob');
const path = require('path');

/**
 * Aggregates a theme from nested dependencies and specified locations.
 *
 * By default the theme will recursively search all dependencies.
 * If a theme directory contains a root-theme.scss only that single file will be aggregated.
 */
class ThemeAggregator {
  /**
   * Aggregates a theme.
   * @param {Object} options - The aggregation options.
   */
  static aggregate(options = {}) {
    const {
      theme,
      include = [],
    } = options;

    if (!theme) {
      throw new Error('A theme must be specified.');
    }

    const patterns = [];
    // Find the custom include patterns.
    include.forEach((pattern) => {
      patterns.push(...ThemeAggregator.find(pattern, options));
    });

    // Find all directories that match the default pattern. /theme/theme-name/
    patterns.push(...ThemeAggregator.find(`**/themes/${theme}/`, options));

    // Filter the included theme files. Removing duplicates and filtering root and scoped files.
    ThemeAggregator.writeFile(ThemeAggregator.filter(patterns, options), options);
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

    return ThemeAggregator.resolve(themeFiles, options);// themeFiles.map(file => file.replace('node_modules/', ''));
  }

  /**
   * Filters a directory theme files.
   * @param {string} dir - The directory path.
   * @param {Object} options - The aggregation options.
   * @returns {array} - An array of filtered file names.
   */
  static filterDir(dir, options) {
    const { scoped } = options;

    // Include only the scoped-theme file if one exists and it is not excluded.
    const scopedFile = ThemeAggregator.find(`${dir}scoped-theme.scss`, options);
    if (scoped && scopedFile.length === 1) {
      return scopedFile;
    }

    // Include only the root file if one exists and it is not excluded.
    const rootFile = ThemeAggregator.find(`${dir}root-theme.scss`, options);
    if (rootFile.length === 1) {
      return rootFile;
    }

    return ThemeAggregator.find(`${dir}*.scss`, options);
  }

  /**
   * Determines the file paths relative to the expected output directory.
   * @param {array} paths - An array of file paths.
   * @param {Object} options - The aggregation options.
   * @returns {array} - An array of relative file paths.
   */
  static resolve(paths, options) {
    const { baseDir, outputDir } = options;
    const outputPath = path.resolve(baseDir, outputDir);

    return paths.map(file => path.relative(outputPath, path.resolve(baseDir, file)));
  }

  /**
   * Writes a file containing theme imports.
   * @param {array} imports - An array of files to import.
   * @param {Object} options - The aggregation options.
   */
  static writeFile(imports, options) {
    const { outputDir, theme } = options;
    const file = imports.reduce((acc, s) => `${acc}import '${s}';\n`, '');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    fs.writeFileSync(`${path.resolve(outputDir, theme)}.js`, file);
  }
}

module.exports = options => ThemeAggregator.aggregate(options);
