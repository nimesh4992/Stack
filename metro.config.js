const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const frontendRoot = path.join(projectRoot, 'frontend');

const config = getDefaultConfig(projectRoot);

// Tell Metro to look in frontend for the app code
config.watchFolders = [frontendRoot];
config.resolver.nodeModulesPaths = [
  path.join(frontendRoot, 'node_modules'),
  path.join(projectRoot, 'node_modules'),
];

// For EAS builds, ensure we're looking at the right entry point
config.projectRoot = frontendRoot;

module.exports = config;
