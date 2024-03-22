module.exports = {
  packagerConfig: {
    // osxSign: {
    //   identity: process.env.APPLE_IDENTITY
    // },
    // osxNotarize: {
    //   tool: 'notarytool',
    //   appleApiKey: process.env.APPLE_API_KEY,
    //   appleApiKeyId: process.env.APPLE_API_KEY_ID,
    //   appleApiIssuer: process.env.APPLE_API_ISSUER
    // },
    ignore: [
      /\.git/,
      /\.vscode/,
      // do allow minimist, express, and cors
      // minimist is used to parse command line arguments
      // express is used to to serve files to niivue 
      // cors is used to allow cross origin requests (not strictly necessary since this code was taken from another app)
      /node_modules\/(?!(minimist|express|cors)).*/,
      /docs/,
      /dist/,
      /\.gitignore/,
      /README\.md/,
      /LICENSE\.md/
    ],
    icon: "./niivue",
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'linux'],
    },
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'niivue',
          name: 'desktop'
        },
        prerelease: true
      }
    }
  ]
};
