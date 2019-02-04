const fs = require('fs');
const glob = require('glob');

/**
 * Aggregates themes from specified locations and nested dependencies.
 */
class ThemeAggregator {
  static aggregate(options = {}) {
    const { theme, exclude, include = [] } = options;

    if (!theme) {
      throw new Error('A theme must be specified.');
    }

    const themeDirs = glob.sync(`**/themes/${theme}/`, { ignore: exclude });

    const customPatterns = [];
    include.forEach((pattern) => {
      customPatterns.push(...glob.sync(pattern, { ignore: exclude }));
    });

    const themeFiles = ThemeAggregator.filter(themeDirs.concat(customPatterns), options);

    if (fs.existsSync(`node_modules/${theme}/`)) {
      themeFiles.unshift(theme);
    }

    ThemeAggregator.writeFile(themeFiles, options);
  }

  static filter(patterns, options = {}) {
    const themeFiles = [];
    patterns.forEach((pattern) => {
      if (fs.lstatSync(pattern).isDirectory()) {
        themeFiles.push(...ThemeAggregator.filterDir(pattern, options));
      } else {
        themeFiles.push(pattern);
      }
    });

    return themeFiles;
  }

  static filterDir(dir, options = {}) {
    const { exclude } = options;

    const themeFiles = [];
    // Include only the root file if one exists and it is not excluded.
    const rootFile = glob.sync(`${dir}root.scss`, { ignore: exclude }).pop();

    if (rootFile) {
      themeFiles.push(rootFile);
    } else {
      themeFiles.push(...glob.sync(`${dir}*.scss`, { ignore: exclude }));
    }

    return themeFiles;
  }

  static writeFile(imports) {
    const file = imports.reduce((acc, s) => `${acc}@import '${s}';\n`, '');

    if (!fs.existsSync('aggregated-themes/')) {
      fs.mkdirSync('aggregated-themes/');
    }

    fs.writeFileSync('aggregated-themes/theme.scss', file);
  }
}

module.exports = options => ThemeAggregator.aggregate(options);
