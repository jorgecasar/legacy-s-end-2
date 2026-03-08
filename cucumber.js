/**
 * Cucumber Configuration
 *
 * Note on ESM: This project uses Node.js ES Modules (ESM) per the project's Core Technology Stack.
 * Thus, we export the configuration using `export default` rather than CommonJS `module.exports`.
 */
export default {
  parallel: 2,
  paths: ["features/**/*.{feature,feature.md}"],
  import: ["features/steps/**/*.js", "features/support/**/*.js"],
  format: ["summary", "progress"],
};
