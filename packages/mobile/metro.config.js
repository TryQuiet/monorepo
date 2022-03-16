/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const blacklist = require('metro-config/src/defaults/exclusionList');

const path = require('path');

 const watchFolders = [
   path.resolve(__dirname, '../identity'),
   path.resolve(__dirname, '../nectar'),
   path.resolve(__dirname, '../waggle'),
   path.resolve(__dirname, '../testcafe-browser-provider-electron')
 ]

 const extraNodeModules = {
   '@quiet/identity': path.resolve(__dirname, '../identity'),
   '@quiet/nectar': path.resolve(__dirname, '../nectar'),
   '@quiet/waggle': path.resolve(__dirname, '../waggle'),
   ...require('node-libs-react-native')
 }

module.exports = {
  resolver: {
    blacklistRE: blacklist([
      /\/nodejs-assets\/.*/,
      /\/android\/.*/,
      /\/ios\/.*/,
    ]),
    sourceExts: ['jsx', 'js', 'ts', 'tsx'],
     extraNodeModules: new Proxy(extraNodeModules, {
       get: (target, name) =>
         //redirects dependencies referenced from common packages to local node_modules
         name in target ? target[name] : path.join(process.cwd(), `node_modules/${name}`)
     })
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  watchFolders
};
