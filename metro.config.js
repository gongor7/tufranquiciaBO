const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite (web): incluye wa-sqlite.wasm como asset para la vista en navegador
config.resolver.assetExts.push('wasm');

module.exports = config;