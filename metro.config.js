const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Point to the frontend directory for the actual app code
config.projectRoot = __dirname + '/frontend';
config.watchFolders = [__dirname + '/frontend'];

module.exports = config;
