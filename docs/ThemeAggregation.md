# Theme Aggregation

The Terra Toolkit provides a built in mechanism for aggregating themes.

## Getting started

To get started create a theme configuration file within the same directory as your webpack configuration file.

The theme file must be named `theme.config.js`.

By default the terra-toolkit webpack configuration will enable theme aggregation.

To utilize the theme aggregation create a file 

## Configuration

### theme.config.js

```js
const themeConfig = {
  exclude: [], // Glob patterns to exclude from the aggregated file.
  theme: 'example-theme-name', // The theme name to aggregate.
};

module.exports = themeConfig;
```