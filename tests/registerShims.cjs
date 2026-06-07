const path = require("path");
const Module = require("module");

const reactNativeShim = path.join(__dirname, "..", ".tmp-tests", "tests", "shims", "react-native.js");
const expoHapticsShim = path.join(__dirname, "..", ".tmp-tests", "tests", "shims", "expo-haptics.js");

const originalResolve = Module._resolveFilename;

Module._resolveFilename = function (request, parent, isMain, options) {
  if (request === "react-native") {
    return reactNativeShim;
  }
  if (request === "expo-haptics") {
    return expoHapticsShim;
  }
  return originalResolve.call(this, request, parent, isMain, options);
};