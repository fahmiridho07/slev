const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Gradle/Kotlin build output under node_modules is ephemeral on Windows and can
// disappear while Metro's file watcher is crawling it (ENOENT on watch).
const gradleBuildBlockList = [
  /[\\/]node_modules[\\/].*[\\/]android[\\/]build[\\/].*/,
  /[\\/]node_modules[\\/].*[\\/]expo-module-gradle-plugin[\\/]build[\\/].*/,
  /[\\/]node_modules[\\/].*[\\/]\.gradle[\\/].*/
];

config.resolver.blockList = [...(config.resolver.blockList ?? []), ...gradleBuildBlockList];

config.watchFolders = [path.resolve(__dirname)];

module.exports = config;